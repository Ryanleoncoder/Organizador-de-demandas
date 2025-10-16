const chat = document.getElementById("chat");
        const input = document.getElementById("mensagem");
        const enviar = document.getElementById("enviar");
        const somEnvio = document.getElementById("somEnvio");
        const somRecebimento = document.getElementById("somRecebimento");


    

        enviar.addEventListener("click", enviarMensagem);
        input.addEventListener("keypress", function(e){
            if(e.key === "Enter") enviarMensagem();
        });

         // Limpa o LocalStorage ao iniciar a página
        window.addEventListener('load', () => {
            localStorage.clear();
        });

       


 async function enviarMensagem() {
    const msg = input.value.trim();
    if (!msg) return;

    
    adicionarMensagem(msg, "user", true);
    input.value = "";


    const typingDiv = document.createElement("div");
    typingDiv.classList.add("typing");
    typingDiv.innerHTML = `<span></span><span></span><span></span>`;
    chat.appendChild(typingDiv);
    chat.scrollTop = chat.scrollHeight;

    try {
    
        const historico = JSON.parse(localStorage.getItem("chatHistorico")) || [];


        const response = await fetch(`${API_URL}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mensagem: msg, historico })
        });

        const data = await response.json();
        chat.removeChild(typingDiv);

        adicionarMensagem("Instrutor Enzo: " + data.resposta, "ia", true);


        localStorage.setItem("chatHistorico", JSON.stringify(data.historico));

    } catch (error) {
        chat.removeChild(typingDiv);
        adicionarMensagem("❌ Erro ao se conectar com a IA.", "ia", true);
        console.error(error);
    }
}



        function adicionarMensagem(texto, tipo, salvar) {
            const msgDiv = document.createElement("div");
            msgDiv.classList.add(tipo === "user" ? "user-msg" : "ia-msg");
            if (tipo === "ia") {
                msgDiv.innerHTML = marked.parse(texto); 
            } else {
                msgDiv.innerText = texto; 
            }
            chat.appendChild(msgDiv);
            chat.scrollTop = chat.scrollHeight;

            if(tipo === "user") somEnvio.play();
            else somRecebimento.play();

            if(salvar) {
                const historico = JSON.parse(localStorage.getItem("chatHistorico")) || [];
                historico.push({ texto, tipo });
                localStorage.setItem("chatHistorico", JSON.stringify(historico));
            }
        }



