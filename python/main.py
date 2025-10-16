import server
import demandasDB


demandasDB.criar_tabela_user()
demandasDB.criar_tabela() 
demandasDB.criar_tabela_demandas_users()
demandasDB.criar_tabela_dealhes()
demandasDB.registrar_rotas(server.app)

server.app.run(debug=True)

