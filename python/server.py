import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from google.generativeai import configure, GenerativeModel
import mysql.connector

load_dotenv()

app = Flask(__name__)
CORS(app)

configure(api_key=os.getenv("GEMINI_API_KEY"))
model = GenerativeModel("gemini-2.5-flash")


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


if __name__ == "__main__":
    app.run(debug=True)
