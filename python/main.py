import server
import demandasDB

demandasDB.criar_tabela()
demandasDB.registrar_rotas(server.app)

server.app.run(debug=True)

