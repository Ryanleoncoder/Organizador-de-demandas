import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import json


app = Flask(__name__)
CORS(app)


load_dotenv()


def connect_db():
    return mysql.connector.connect(
        host=os.getenv("HOST"),
        port=int(os.getenv("PORTA", 3306)),
        user=os.getenv("MYUSER"),
        password=os.getenv("SENHA"),
        database="organizador"
    )


def criar_tabela_demandas():
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS demandas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255),
        dias VARCHAR(100),
        descricao TEXT,
        prioridade VARCHAR(50),
        tempoEstimado VARCHAR(50),
        responsavel VARCHAR(100),
        tags TEXT,
        links TEXT,
        imagem VARCHAR(255),
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    cursor.close()
    conn.close()

def criar_tabela_user():
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        cargo VARCHAR(100),
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    cursor.close()
    conn.close()

def criar_tabela_demandas_users():
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS demandas_usuarios (
        demanda_id INT NOT NULL,
        usuario_id INT NOT NULL,
        PRIMARY KEY(demanda_id, usuario_id),
        FOREIGN KEY(demanda_id) REFERENCES demandas(id) ON DELETE CASCADE,
        FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )
    """)

    conn.commit()
    cursor.close()
    conn.close()


def criar_tabela_dealhes():
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS detalhes_demandas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        demanda_id INT NOT NULL,
        passo_a_passo TEXT,
        anexos TEXT,
        observacoes TEXT,
        comentarios TEXT,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (demanda_id) REFERENCES demandas(id) ON DELETE CASCADE
    )
    """)

    conn.commit()
    cursor.close()
    conn.close()

def controle_demanda():
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS controle_demandas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    demanda_id INT NOT NULL,
    data DATE NOT NULL,
    concluida BOOLEAN DEFAULT FALSE,
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (demanda_id) REFERENCES demandas(id) ON DELETE CASCADE,
    UNIQUE KEY (demanda_id, data)  -- evita duplicidade de registro para o mesmo dia
   )
    """)
    
def registrar_rotas(app):
 @app.route("/importar_demandas", methods=["POST"])
 def importar_demandas():
    try:
      
        if request.files:
            file = request.files["file"]
            data = json.load(file)
        else:
            data = request.get_json()

        if not data:
            return jsonify({"erro": "Nenhum dado enviado"}), 400

        conn = connect_db()
        cursor = conn.cursor()

        count = 0
        for titulo, demanda in data.items():
            cursor.execute("""
                INSERT INTO demandas (titulo, dias, descricao, prioridade, tempoEstimado, responsavel, tags, links, imagem)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                titulo.strip(),  
                demanda.get("dias"),
                demanda.get("descricao"),
                demanda.get("prioridade"),
                demanda.get("tempoEstimado"),
                demanda.get("responsavel"),
                ",".join(demanda.get("tags", [])) if isinstance(demanda.get("tags"), list) else demanda.get("tags"),
                json.dumps(demanda.get("links", [])),
                demanda.get("imagemURL"),
            ))
            count += 1

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"mensagem": f"{count} demanda(s) importada(s) com sucesso!"})

    except Exception as e:
        return jsonify({"erro": str(e)}), 500




 @app.route("/listar_demandas", methods=["GET"])
 def listar_demandas():
    try:
        conn = connect_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM demandas ORDER BY id DESC")
        demandas = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(demandas)
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

 @app.route("/apagardemandas/<int:id>", methods=["DELETE"])
 def apagardemandas(id):
    try:
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM demandas WHERE id = %s", (id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensagem": "Demanda apagada com sucesso"})
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

 @app.route("/editar_demanda/<int:id>", methods=["PUT"])
 def editar_demanda(id):
    try:
        data = request.get_json()
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE demandas
            SET titulo=%s, dias=%s, descricao=%s, prioridade=%s, tempoEstimado=%s, responsavel=%s, tags=%s, links=%s, imagem=%s 
            WHERE id=%s
        """, (
            data.get('titulo'),
            data.get('dias'),
            data.get('descricao'),
            data.get('prioridade'),
            data.get('tempoEstimado'),
            data.get('responsavel'),
            ",".join(data.get('tags', [])),
            json.dumps(data.get('links', [])),
            data.get('imagem'),
            id
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensagem": "Demanda atualizada com sucesso"})
    except Exception as e:
        return jsonify({"erro": str(e)}), 500
    
 @app.route("/criar_demanda", methods=["POST"])
 def criar_demanda():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"erro": "Nenhum dado enviado"}), 400

        conn = connect_db()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO demandas (titulo, dias, descricao, prioridade, tempoEstimado, responsavel, tags, links, imagem)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data.get("titulo"),
            data.get("dias"),
            data.get("descricao"),
            data.get("prioridade"),
            data.get("tempoEstimado"),
            data.get("responsavel"),
            ",".join(data.get("tags", [])) if isinstance(data.get("tags"), list) else data.get("tags"),
            json.dumps(data.get("links", [])),
            data.get("imagem"),
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"mensagem": "Demanda criada com sucesso!"})

    except Exception as e:
        return jsonify({"erro": str(e)}), 500



if __name__ == "__main__":
    app.run(debug=True)
