import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from google.generativeai import configure, GenerativeModel
import mysql.connector
from flask import send_from_directory

load_dotenv()

app = Flask(__name__)
CORS(app)

configure(api_key=os.getenv("GEMINI_API_KEY"))
model = GenerativeModel("gemini-2.5-flash")

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def connect_db():
    return mysql.connector.connect(
        host=os.getenv("HOST"),
        user=os.getenv("MYUSER"),
        password=os.getenv("SENHA"),
        database="organizador" 
    )

prompt = """
Você é um instrutor virtual especializado em ensinar sobre demandas e ferramentas digitais.

Regras de comportamento:
1. Seja educado, claro e objetivo.
2. Use exemplos práticos sempre que possível.
3. Se não souber a resposta, diga que não tem essa informação.
4. Nunca invente informações.
5. Estruture suas respostas com listas, bullets e linguagem natural.
6. Use emojis de forma leve quando fizer sentido.
7. Sempre use os dados do banco MySQL como base para responder perguntas sobre as tarefas.
8. Responda em português.
9. saiba dizer não sei quando não souber a resposta.
10. diga que só sabe informar sobre demandas cadastradas no banco, caso não tenha dados no banco diga que não tem demandas cadastradas.
11. sempre que possível, resuma as demandas em tópicos.
12. seu nome é Enzo, um instrutor de demandas.
13. voce não pode cadastrar demandas, listar demandas, atualizar demandas e deletar demandas.
"""


def buscar_demandas():
    conn = connect_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT titulo, dias, prioridade, tempoEstimado, responsavel, descricao, tags FROM demandas")
    demandas = cursor.fetchall()
    cursor.close()
    conn.close()

   
    texto_demandas = "\n".join([
        f"- {d['titulo']} ({d['prioridade']}) — {d['dias']} — Resp: {d['responsavel']} — Tempo: {d['tempoEstimado']} — Tags: {d['tags']} — Desc: {d['descricao']}"
        for d in demandas
    ])
    return texto_demandas


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    mensagem = data.get("mensagem", "")

    try:
        dados_banco = buscar_demandas()

        full_prompt = f"""
{prompt}

Essas são as tarefas cadastradas no banco:
{dados_banco}

Usuário: {mensagem}
Instrutor:
"""

        resposta = model.generate_content(full_prompt)
        return jsonify({"resposta": resposta.text})

    except Exception as e:
        return jsonify({"resposta": f"Erro: {str(e)}"}), 500
    



# ----------------- UPLOAD DE IMAGEM -----------------
@app.route('/upload/<int:demanda_id>', methods=['POST'])
def upload(demanda_id):
    if 'imagem' not in request.files:
        return jsonify({'erro': 'Nenhuma imagem enviada'}), 400

    imagem = request.files['imagem']
    filename = f"demanda_{demanda_id}_{imagem.filename}"
    caminho = os.path.join(UPLOAD_FOLDER, filename)

 
    try:
        imagem.save(caminho)
    except Exception as e:
        return jsonify({'erro': f'Falha ao salvar a imagem: {str(e)}'}), 500

   
    try:
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE demandas SET imagem=%s WHERE id=%s", (filename, demanda_id))
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        return jsonify({'erro': f'Falha ao atualizar banco: {str(e)}'}), 500

    return jsonify({'caminho': f'/uploads/{filename}'})


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


if __name__ == "__main__":
    app.run(debug=True)