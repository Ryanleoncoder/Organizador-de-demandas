from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)


def connect_db():
    conn = sqlite3.connect('demandas.db')
    conn.row_factory = sqlite3.Row  
    return conn

with connect_db() as conn:
    conn.execute('''
        CREATE TABLE IF NOT EXISTS demandas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT,
    dias TEXT,               
    descricao TEXT,
    prioridade TEXT,
    tempoEstimado TEXT,
    responsavel TEXT,
    tags TEXT,                              
    links TEXT,               
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
 ''')

...
