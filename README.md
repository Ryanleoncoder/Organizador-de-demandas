# Organizador de Demandas

<img src="assets/images/logo.png" alt="Banner" width="100" />


![Badge Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![Badge Flask](https://img.shields.io/badge/Flask-000000?style=flat&logo=flask&logoColor=white)
![Badge JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Badge HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![Badge CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)

## Descrição

O **Organizador de Demandas** é um sistema completo para **gerenciar tarefas, responsabilidades e prioridades** de uma equipe ou projeto.  

Ele integra:

- **Visualização de demandas** com datas de execução, responsáveis, descrições, links e caminhos de cada tarefa.  
- **Matriz de prioridade** para organizar e destacar tarefas críticas.  
- **Cards inteligentes**, que se atualizam automaticamente conforme o dia atual.  
- **Histórico de execuções**, incluindo gravações ou registros de cada demanda.
- **Botões**, é possivel editar, criar, excluir, importar e exportar demandas pelos botões presentes no painel.
- **Instrutor de demandas**, um chat interativo com IA Gemini, capaz de orientar, ensinar e esclarecer dúvidas sobre as tarefas e a organização.

O sistema ajuda a **aumentar a performance e a organização** da equipe, mantendo todas as informações centralizadas e facilmente acessíveis.

---

## Funcionalidades

- Painel de demandas com filtros por **responsável, data e prioridade**  
- **Descrição detalhada** de cada tarefa com links e caminhos  
- **Matriz de prioridade** dinâmica, organizada por urgência e importância  
- **Cards inteligentes** que mudam de acordo com o dia  
- **Histórico e gravações** de cada demanda  
- **Chat de instrutor de demandas** com IA, capaz de responder perguntas, orientar prioridades e indicar próximos passos  
- **Sons de notificação** e feedback visual para ações importantes  

---

## 🛠 Tecnologias Utilizadas

- **Front-end:** HTML5, CSS3, JavaScript  
- **Back-end:** Python + Flask  
- **IA:** Google Gemini (via API generative AI)  
- **localStorage:** para histórico e registros   

---

## 🚀 Como Rodar o Projeto

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/organizador-demandas.git
cd organizador-demandas
```

2. Instale as dependências do Python:
   
```bash
pip install flask flask-cors google-generative-ai python-dotenv
```
3. Crie o arquivo .env com sua chave da API Gemini:

```bash
GEMINI_API_KEY=SUA_CHAVE_AQUI
```
4. Rode o backend:

```bash
python python/server.py
```
organizador-demandas/
## Estrutura do Projeto

```js
organizador-demandas/
├─ python
│ └─ server.py Backend Python/Flask
├─ index.html Front-end do painel e chat
├─ css/
│ └─ style.css Estilo do painel e chat
├─ js/
│ ├─ script.js Lógica do painel
│ └─ chat.js Lógica do chat com IA
├─ seeds/
│ ├─ send.mp3 Som de envio do chat
│ └─ receive.mp3 Som de recebimento do chat
├─ images/
│ └─ logo.png Logo e outras imagens do projeto
├─ .env Variáveis de ambiente (API Key Gemini)
```
🤖 Instrutor de Demandas (Chat)

- O chat é configurado com um prompt inicial forte:

- Responde de forma educada, clara, objetiva e amigável

- Sabe dizer “não sei” quando necessário

- Dá exemplos práticos e sugestões úteis

- Ajuda a priorizar e organizar demandas

Exemplo de interação:🤖 Instrutor de Demandas (Chat)

```bash
Usuário: Quais demandas devo priorizar hoje?
Bot: Hoje você deve focar nas tarefas com **alta prioridade** e prazo para hoje:
1. Revisar relatório financeiro 📊
2. Atualizar cadastro de clientes 📝
3. Confirmar agenda da reunião com fornecedores 📅
```

## 🎬 Demonstração do Chat
![Descrição do GIF](assets/gifs/chatbot.gif)

## 📖 Licença

MIT License © 2025 Ryan Leonel
