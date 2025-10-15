let descricaoDemandas = {}; 

async function carregarDescricaoDemandas() {
    document.getElementById('loadingDemandas').style.display = 'flex';
    try {
        const res = await fetch(`${API_URL}/listar_demandas`);
        if (!res.ok) throw new Error("Erro ao carregar demandas");

        const demandas = await res.json();

        
        descricaoDemandas = {};
        demandas.forEach(d => {
            descricaoDemandas[d.titulo] = {
                dias: d.dias,
                diasArray: d.dias
                    ? d.dias.split(/[,;\/|]| e /i).map(s => s.trim()).filter(Boolean)
                    : [],
                descricao: d.descricao,
                prioridade: d.prioridade,
                tempoEstimado: d.tempoEstimado,
                responsavel: d.responsavel,
                tags: d.tags ? d.tags.split(",") : [],
                imagem: d.imagem || "", 
                links: d.links ? JSON.parse(d.links) : []
            };
        });


        document.getElementById('loadingDemandas').style.display = 'none';
        return true;
    } catch (err) {
       document.getElementById('loadingDemandas').style.display = 'none';
       document.getElementById('erroDemandas').style.display = 'flex';
       console.error("Erro ao carregar demandas:", err);
       return false;
    }
}


carregarDescricaoDemandas();


    
    let fluxoPosicoes = JSON.parse(localStorage.getItem('fluxoPosicoes') || '{}');
    
    let fluxoHistorico = JSON.parse(localStorage.getItem('fluxoHistorico') || '{}');

    function getDiaSemanaAtual() {
      const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const hoje = new Date();
      return dias[hoje.getDay()];
    }

    function atualizarPainelBoasVindas() {
      const diaHoje = getDiaSemanaAtual();
      let demandasAtivas = 0;
      let demandasHoje = [];
      for (const [nome, demanda] of Object.entries(descricaoDemandas)) {
        if (demanda.diasArray && demanda.diasArray.length > 0) {
          demandasAtivas++;
          if (demanda.diasArray.includes(diaHoje)) {
            demandasHoje.push(nome);
          }
        }
      }
      document.querySelector('#demandasAtivas strong').innerText = demandasAtivas;
      document.querySelector('#demandasHoje strong').innerText = demandasHoje.length;
      const lista = document.getElementById('listaDemandasHoje');
      const maxExibir = 3;
      lista.innerHTML = demandasHoje.length > 0
        ? demandasHoje.slice(0, maxExibir).map(nome => `• ${nome}`).join('<br>')
          + (demandasHoje.length > maxExibir
            ? `<br><span style="color:#660099; font-size:0.96em; margin-top:6px; display:inline-block;">
                ...e mais ${demandasHoje.length - maxExibir} demanda${demandasHoje.length - maxExibir > 1 ? 's' : ''}
               </span>`
            : '')
        : '<span style="color:#888;">Nenhuma demanda para hoje</span>';

      
    }

    function preencherResumoSemanal() {
      const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
      const resumo = {};
      diasSemana.forEach(dia => resumo[dia] = []);
      for (const [nome, demanda] of Object.entries(descricaoDemandas)) {
        if (demanda.diasArray) {
          demanda.diasArray.forEach(dia => {
            if (resumo[dia]) resumo[dia].push(nome);
          });
        }
      }
      const ul = document.getElementById('resumoSemanal');
      ul.innerHTML = '';
      diasSemana.forEach(dia => {
        ul.innerHTML += `<li><strong>${dia}:</strong> ${resumo[dia].length > 0 ? resumo[dia].join(', ') : '<span style="color:#888;">Nenhuma</span>'}</li>`;
      });
    }

    function preencherProximasDemandas() {
      const hoje = new Date();
      const dias = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
      const proximos = [];
      for (let i = 1; i <= 5; i++) {
        const data = new Date(hoje);
        data.setDate(hoje.getDate() + i);
        const diaNome = dias[data.getDay()];
        for (const [nome, demanda] of Object.entries(descricaoDemandas)) {
          if (demanda.diasArray && demanda.diasArray.includes(diaNome)) {
            proximos.push(`${nome} (${diaNome})`);
          }
        }
      }
      const ul = document.getElementById('proximasDemandas');
      ul.innerHTML = proximos.length > 0
        ? proximos.map(d => `<li>${d}</li>`).join('')
        : '<li><span style="color:#888;">Nenhuma demanda nos próximos dias</span></li>';
    }

    function atualizarSidebarDemandas() {
      const ul = document.querySelector('.demandas-list');
      ul.innerHTML = '';
      Object.keys(descricaoDemandas).forEach(nome => {
        const li = document.createElement('li');
        li.textContent = '📌 ' + nome;
        li.onclick = () => mostrarDetalhes(nome);
        ul.appendChild(li);
      });
    }

    async function atualizarDemandas() {
    const ok = await carregarDescricaoDemandas();
    if (ok) {
        atualizarSidebarDemandas();
        atualizarPainelBoasVindas();
        preencherResumoSemanal();
        preencherProximasDemandas();
    }
}

    atualizarDemandas();

    function atualizarDataHora() {
      const agora = new Date();
      const dataStr = agora.toLocaleDateString('pt-BR');
      const hora = agora.getHours().toString().padStart(2,'0');
      const min = agora.getMinutes().toString().padStart(2,'0');
      document.getElementById('dataHoraAtual').innerText = `${dataStr} ${hora}:${min}`;
    }
    setInterval(atualizarDataHora, 1000);
    atualizarDataHora();

    
    function mostrarDetalhes(nomeDemanda) {
      const demanda = descricaoDemandas[nomeDemanda];
      document.getElementById("painelDetalhes").classList.add("ativo");
      document.getElementById("painelBoasVindas").classList.add("painel-embacado");
      document.getElementById("tituloDemanda").innerText = nomeDemanda;
      document.getElementById("diasDemanda").innerText = "Dias: " + demanda.dias;
      document.getElementById("descricaoDemanda").innerText = demanda.descricao;

      document.getElementById("responsavelDemanda").innerHTML = demanda.responsavel
        ? `<strong>Responsável:</strong> ${demanda.responsavel}` : '';
      document.getElementById("prioridadeDemanda").innerHTML = demanda.prioridade
        ? `<strong>Prioridade:</strong> ${demanda.prioridade}` : '';
      document.getElementById("tempoEstimadoDemanda").innerHTML = demanda.tempoEstimado
        ? `<strong>Tempo estimado:</strong> ${demanda.tempoEstimado}` : '';
      document.getElementById("tagsDemanda").innerHTML = demanda.tags && demanda.tags.length
        ? `<strong>Tags:</strong> ${demanda.tags.map(tag => `<span style="background:#eee; color:#660099; border-radius:6px; padding:2px 8px; margin-right:4px; font-size:0.95em;">${tag}</span>`).join('')}` : '';

      const img = document.getElementById("imagemDemanda");
      if (demanda.imagem) {
        img.src = demanda.imagem;
        img.style.display = "block";
      } else {
        img.style.display = "none";
      }

      const cardsContainer = document.getElementById("cardsDemanda");
      cardsContainer.innerHTML = "";
      if (demanda.links && demanda.links.length > 0) {
        demanda.links.forEach((link, idx) => {
          const card = document.createElement("div");
          card.className = "card-link";
          let icone = '🌐';
          let isLocal = false;
          if (/^file:\/\//i.test(link.url) || /^\\\\/.test(link.url)) {
            icone = '📁';
            isLocal = true;
          }

          card.innerHTML = `
            <h4>${link.nome}</h4>
            ${
              isLocal
                ? `<button id="btnCopiarCaminho${idx}" style="background:#eee; color:#660099; border:none; border-radius:6px; padding:6px 14px; cursor:pointer; font-size:1em;">
                     ${icone} Copiar caminho
                   </button>
                   <div style="font-size:0.92em; color:#888; margin-top:6px; word-break:break-all;">${link.url}</div>`
                : `<a href="${link.url}" target="_blank" style="text-decoration:underline;">
                     ${icone} Acessar
                   </a>`
            }
          `;

          
          if (isLocal) {
            card.style.cursor = "pointer";
            card.onclick = function(e) {
              
              if (e.target.tagName.toLowerCase() === "button") return;
              navigator.clipboard.writeText(link.url).then(() => {
                const btn = document.getElementById(`btnCopiarCaminho${idx}`);
                if (btn) {
                  btn.textContent = "Copiado!";
                  setTimeout(()=>{ btn.innerHTML = `${icone} Copiar caminho`; }, 1200);
                }
              });
            };
            
            setTimeout(() => {
              const btn = document.getElementById(`btnCopiarCaminho${idx}`);
              if (btn) {
                btn.onclick = function(ev) {
                  ev.stopPropagation();
                  navigator.clipboard.writeText(link.url).then(() => {
                    btn.textContent = "Copiado!";
                    setTimeout(()=>{ btn.innerHTML = `${icone} Copiar caminho`; }, 1200);
                  });
                }
              }
            }, 0);
            card.title = "Clique para copiar o caminho";
          } else {
            card.style.cursor = "pointer";
            card.onclick = function(e) {
              
              if (e.target.tagName.toLowerCase() === "a") return;
              window.open(link.url, "_blank");
            };
            card.title = "Clique para acessar o link";
          }

          cardsContainer.appendChild(card);
        });
      } else {
        cardsContainer.innerHTML = '<p style="color:#888;">Nenhum link útil para esta demanda.</p>';
      }

      
      document.getElementById('btnEditarDemanda').onclick = function() {
        abrirFormularioEditarDemanda(nomeDemanda);
      };
                                             }
    function fecharDetalhes() {
      document.getElementById("painelDetalhes").classList.remove("ativo");
      document.getElementById("painelBoasVindas").classList.remove("painel-embacado");
    }

    
    document.getElementById('demandasAtivas').onclick = abrirModalAtivas;
    function abrirModalAtivas() {
      const lista = document.getElementById('listaAtivasModal');
      lista.innerHTML = '';
      for (const [nome, demanda] of Object.entries(descricaoDemandas)) {
        if (demanda.diasArray && demanda.diasArray.length > 0) {
          lista.innerHTML += `<li onclick="mostrarDetalhes('${nome}'); fecharModalAtivas();">
            <strong>${nome}</strong><br>
            <span style="font-size:0.97em; color:#444;">${demanda.dias}</span>
            ${demanda.responsavel ? `<br><span style="font-size:0.95em; color:#888;">Resp.: ${demanda.responsavel}</span>` : ''}
          </li>`;
        }
      }
      document.getElementById('modalAtivas').style.display = 'flex';
    }
    function fecharModalAtivas() {
      document.getElementById('modalAtivas').style.display = 'none';
    }

    
    function abrirFormularioNovaDemanda() {
      if (document.getElementById('formNovaDemanda')) return;

      const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sobdemanda'];

      const form = document.createElement('div');
      form.id = 'formNovaDemanda';

      const box = document.createElement('div');
      box.className = 'modal-box';
      box.innerHTML = `
        <button class="close-modal" id="fecharFormNovaDemanda" title="Fechar">&times;</button>
        <h2>Nova Demanda</h2>
        <label>Nome<br>
          <input type='text' id='inputNome' maxlength="50">
        </label>
        <label>Responsável<br>
          <input type='text' id='inputResponsavel' maxlength="40">
        </label>
        <label>Prioridade<br>
          <select id="inputPrioridade">
            <option value="Baixa">Baixa</option>
            <option value="Média" selected>Média</option>
            <option value="Alta">Alta</option>
          </select>
        </label>
        <div style="margin-bottom:10px;">Dias de execução<br>
          <div class="dias-checkboxes" id="diasCheckboxes" style="margin-top:6px; margin-bottom:10px;">
            ${diasSemana.map(dia => `
              <label>
                <input type="checkbox" value="${dia}" class="chk-dia"> ${dia}
              </label>
            `).join('')}
          </div>
        </div>
        <label>Tempo estimado<br>
          <input type='text' id='inputTempoEstimado' placeholder='Ex: 10 minutos, 2 horas, 1 dia'>
        </label>
        <label>Tags (separadas por vírgula)<br>
          <input type='text' id='inputTags' placeholder='Ex: Backup, Servidor, Urgente'>
        </label>
        <label>Descrição<br>
          <textarea id='inputDescricao'></textarea>
        </label>
        <label>Links úteis<br>
          <input type='text' id='inputLinks' placeholder='Ex: Manual|file:///C:/Documentos/manual.pdf; Google|https://google.com'>
          <span style="font-size:0.92em; color:#888;">
            Separe cada link com ponto e vírgula (<b>;</b>). Para cada link, use <b>Título|URL ou Caminho</b>.<br>
            <b>Exemplo web:</b> Google|https://google.com; Manual|https://manual.com<br>
            <b>Exemplo local:</b> Manual|file:///C:/Documentos/manual.pdf; Compartilhado|\\\\servidor\\pasta\\arquivo.xlsx
          </span>
        </label>
        <label>URL da Imagem<br>
          <input type='text' id='inputImagem' placeholder='https://...'>
        </label>
        <div class="modal-actions">
          <button class="salvar" id='btnSalvarDemanda'>Salvar</button>
          <button class="cancelar" id='btnCancelarDemanda'>Cancelar</button>
        </div>
      `;

      form.appendChild(box);
      document.body.appendChild(form);

      document.getElementById('fecharFormNovaDemanda').onclick =
      document.getElementById('btnCancelarDemanda').onclick = () => form.remove();

      document.getElementById('btnSalvarDemanda').onclick = () => {
        const nome = document.getElementById('inputNome').value.trim();
        const responsavel = document.getElementById('inputResponsavel').value.trim();
        const prioridade = document.getElementById('inputPrioridade').value;
        const descricao = document.getElementById('inputDescricao').value.trim();
        const linksStr = document.getElementById('inputLinks').value.trim();
        const imagem = document.getElementById('inputImagem').value.trim();
        const diasArray = Array.from(form.querySelectorAll('.chk-dia:checked')).map(cb => cb.value);
        const tempoEstimado = document.getElementById('inputTempoEstimado').value.trim();
        const tagsStr = document.getElementById('inputTags').value.trim();
        const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(t => t.length > 0) : [];

        if (!nome || !descricao || diasArray.length === 0) {
          alert('Por favor, preencha nome, descrição e selecione ao menos um dia.');
          return;
        }

        let links = [];
        if (linksStr) {
          let erroLink = false;
          links = linksStr.split(';').map(s => {
            const parts = s.split('|');
            if (parts.length < 2 || !parts[0].trim() || !parts[1].trim()) erroLink = true;
            return { nome: (parts[0]||'').trim(), url: (parts[1]||'').trim() };
          });
          if (erroLink) {
            alert('Preencha os links no formato: Título|URL. Exemplo: Google|https://google.com; Manual|https://manual.com');
            return;
          }
        }

        fetch(`${API_URL}/criar_demanda`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
          titulo: nome,
          descricao: descricao,
          prioridade: prioridade,
          responsavel: responsavel,
          tempoEstimado: tempoEstimado,
          dias: diasArray.join(', '),
          tags: tags
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.mensagem) {
         alert(data.mensagem);
         form.remove();
         atualizarDemandas(); 
        } else {
          alert(data.erro || 'Erro ao criar demanda');
        }
      })
      .catch(err => {
      console.error('Erro ao criar demanda:', err);
      alert('Erro ao criar demanda');
     });
      };
    }

   
    async function abrirFormularioEditarDemanda(nomeDemanda) {
      if (document.getElementById('formNovaDemanda')) return;

      const demanda = descricaoDemandas[nomeDemanda];
      const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sobdemanda'];

      const form = document.createElement('div');
      form.id = 'formNovaDemanda';

      const box = document.createElement('div');
      box.className = 'modal-box';
      box.innerHTML = `
        <button class="close-modal" id="fecharFormNovaDemanda" title="Fechar">&times;</button>
        <h2>Editar Demanda</h2>
        <label>Nome<br>
          <input type='text' id='inputNome' maxlength="50" value="${nomeDemanda}" disabled>
        </label>
        <label>Responsável<br>
          <input type='text' id='inputResponsavel' maxlength="40" value="${demanda.responsavel||''}">
        </label>
        <label>Prioridade<br>
          <select id="inputPrioridade">
            <option value="Baixa" ${demanda.prioridade === 'Baixa' ? 'selected' : ''}>Baixa</option>
            <option value="Média" ${demanda.prioridade === 'Média' ? 'selected' : ''}>Média</option>
            <option value="Alta" ${demanda.prioridade === 'Alta' ? 'selected' : ''}>Alta</option>
          </select>
        </label>
        <div style="margin-bottom:10px;">Dias de execução<br>
          <div class="dias-checkboxes" id="diasCheckboxes" style="margin-top:6px; margin-bottom:10px;">
            ${diasSemana.map(dia => `
              <label>
                <input type="checkbox" value="${dia}" class="chk-dia" ${demanda.diasArray.includes(dia) ? 'checked' : ''}> ${dia}
              </label>
            `).join('')}
          </div>
        </div>
        <label>Tempo estimado<br>
          <input type='text' id='inputTempoEstimado' placeholder='Ex: 10 minutos, 2 horas, 1 dia' value="${demanda.tempoEstimado||''}">
        </label>
        <label>Tags (separadas por vírgula)<br>
          <input type='text' id='inputTags' placeholder='Ex: Backup, Servidor, Urgente' value="${demanda.tags ? demanda.tags.join(', ') : ''}">
        </label>
        <label>Descrição<br>
          <textarea id='inputDescricao'>${demanda.descricao||''}</textarea>
        </label>
        <label>Links úteis<br>
          <input type='text' id='inputLinks' placeholder='Ex: Manual|file:///C:/Documentos/manual.pdf; Google|https://google.com' value="${demanda.links && demanda.links.length ? demanda.links.map(l => `${l.nome}|${l.url}`).join('; ') : ''}">
          <span style="font-size:0.92em; color:#888;">
            Separe cada link com ponto e vírgula (<b>;</b>). Para cada link, use <b>Título|URL ou Caminho</b>.<br>
            <b>Exemplo web:</b> Google|https://google.com; Manual|https://manual.com<br>
            <b>Exemplo local:</b> Manual|file:///C:/Documentos/manual.pdf; Compartilhado|\\\\servidor\\pasta\\arquivo.xlsx
          </span>
        </label>
        <label>URL da Imagem<br>
          <input type='text' id='inputImagem' placeholder='https://...' value="${demanda.imagem||''}">
        </label>
        <div class="modal-actions">
          <button class="salvar" id='btnSalvarDemanda'>Salvar</button>
          <button class="cancelar" id='btnCancelarDemanda'>Cancelar</button>
        </div>
      `;

      form.appendChild(box);
      document.body.appendChild(form);

      document.getElementById('fecharFormNovaDemanda').onclick =
      document.getElementById('btnCancelarDemanda').onclick = () => form.remove();

      document.getElementById('btnSalvarDemanda').onclick = async () => {
        const responsavel = document.getElementById('inputResponsavel').value.trim();
        const prioridade = document.getElementById('inputPrioridade').value;
        const descricao = document.getElementById('inputDescricao').value.trim();
        const linksStr = document.getElementById('inputLinks').value.trim();
        const imagem = document.getElementById('inputImagem').value.trim();
        const diasArray = Array.from(form.querySelectorAll('.chk-dia:checked')).map(cb => cb.value);
        const tempoEstimado = document.getElementById('inputTempoEstimado').value.trim();
        const tagsStr = document.getElementById('inputTags').value.trim();
        const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(t => t.length > 0) : [];

        if (!descricao || diasArray.length === 0) {
          alert('Por favor, preencha a descrição e selecione ao menos um dia.');
          return;
        }

        let links = [];
        if (linksStr) {
          let erroLink = false;
          links = linksStr.split(';').map(s => {
            const parts = s.split('|');
            if (parts.length < 2 || !parts[0].trim() || !parts[1].trim()) erroLink = true;
            return { nome: (parts[0]||'').trim(), url: (parts[1]||'').trim() };
          });
          if (erroLink) {
            alert('Preencha os links no formato: Título|URL. Exemplo: Google|https://google.com; Manual|https://manual.com.br.html');
            return;
          }
        }

       
        let id = null;
        try {
          const resListar = await fetch(`${API_URL}/listar_demandas`);
          const demandas = await resListar.json();
          const demandaSelecionada = demandas.find(d => d.titulo === nomeDemanda);
          if (!demandaSelecionada) {
            alert('Demanda não encontrada!');
            return;
          }
          id = demandaSelecionada.id;
        } catch (err) {
          alert('Erro ao buscar demanda no banco.');
          return;
        }

        
        try {
          const res = await fetch(`${API_URL}/editar_demanda/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              titulo: nomeDemanda,
              dias: diasArray.join(', '),
              descricao: descricao,
              links: links,
              prioridade: prioridade,
              tempoEstimado: tempoEstimado,
              responsavel: responsavel,
              tags: tags,
              imagem: imagem
            })
          });
          const data = await res.json();
          if (res.ok && data.mensagem) {
            alert(data.mensagem);
            form.remove();
            atualizarDemandas();
            mostrarDetalhes(nomeDemanda);
          } else {
            alert(data.erro || 'Erro ao editar demanda');
          }
        } catch (err) {
          console.error('Erro ao editar demanda:', err);
          alert('Erro ao editar demanda');
        }
      };
    }

    
    function abrirModalApagarDemanda() {
      if (document.getElementById('modalApagarDemanda')) return;

      const modal = document.createElement('div');
      modal.id = 'modalApagarDemanda';
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100vw';
      modal.style.height = '100vh';
      modal.style.background = 'rgba(0,0,0,0.22)';
      modal.style.display = 'flex';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      modal.style.zIndex = '3001';

      const box = document.createElement('div');
      box.style.background = 'white';
      box.style.padding = '20px';
      box.style.borderRadius = '12px';
      box.style.maxWidth = '400px';
      box.style.width = '90vw';
      box.style.boxShadow = '0 2px 20px rgba(0,0,0,0.15)';
      box.style.position = 'relative';

      box.innerHTML = `
        <h3>Apagar Demanda</h3>
        <p>Selecione a demanda que deseja apagar:</p>
        <select id='selectDemandaApagar' style='width: 100%; padding: 8px; margin-bottom: 12px;'>
          <option value=''>-- Selecione --</option>
        </select>
        <div style='text-align: right;'>
          <button id='btnCancelarApagar' style='margin-right: 10px; padding: 8px 16px; cursor: pointer;'>Cancelar</button>
          <button id='btnConfirmarApagar' style='background:#cc0000; color:#fff; border:none; padding: 8px 16px; border-radius: 8px; cursor: pointer;'>Apagar</button>
        </div>
      `;

      modal.appendChild(box);
      document.body.appendChild(modal);

      const select = document.getElementById('selectDemandaApagar');
      const demandas = descricaoDemandas;
      Object.keys(demandas).forEach(nome => {
        const option = document.createElement('option');
        option.value = nome;
        option.textContent = nome;
        select.appendChild(option);
      });

      document.getElementById('btnCancelarApagar').onclick = () => {
        modal.remove();
      };

    document.getElementById('btnConfirmarApagar').onclick = async () => {
     const nomeSelecionado = select.value;
     if (!nomeSelecionado) {
       alert('Por favor, selecione uma demanda para apagar.');
       return;
      }

     if (!confirm(`Tem certeza que deseja apagar a demanda "${nomeSelecionado}"?`)) return;

     try {
    
      const resListar = await fetch(`${API_URL}/listar_demandas`);
      const demandas = await resListar.json();

    
      const demandaSelecionada = demandas.find(d => d.titulo === nomeSelecionado);
      if (!demandaSelecionada) {
        alert('Demanda não encontrada!');
        return;
      }

      const idSelecionado = demandaSelecionada.id;

    
      const res = await fetch(`${API_URL}/apagardemandas/${idSelecionado}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.mensagem || 'Demanda apagada com sucesso!');
        modal.remove();
        atualizarDemandas();
      } else {
       alert(data.erro || 'Erro ao apagar demanda.');
      }

   } catch (err) {
      console.error('Erro ao apagar demanda:', err);
      alert('Erro ao apagar demanda.');
    }
   };


    }

// --------- BOTÕES NO PAINEL DE BOAS-VINDAS ---------
window.addEventListener('DOMContentLoaded', function() {
  const painelBoasVindas = document.getElementById('painelBoasVindas');

  if (!document.getElementById('btnExportarDemandas')) {
    const divBtns = document.createElement('div');
    divBtns.style = 'display:flex; justify-content:center; gap:10px; margin-bottom:15px;';

    // BOTÃO EXPORTAR
    const btnExportar = document.createElement('button');
    btnExportar.id = 'btnExportarDemandas';
    btnExportar.textContent = 'Exportar Demandas';
    btnExportar.style = 'background:#660099; color:#fff; border:none; border-radius:6px; padding:8px 18px; font-size:1em; cursor:pointer;';
    divBtns.appendChild(btnExportar);

    // BOTÃO IMPORTAR
    const btnImportar = document.createElement('button');
    btnImportar.id = 'btnImportarDemandas';
    btnImportar.textContent = 'Importar Demandas';
    btnImportar.style = 'background:#7be495; color:#222; border:none; border-radius:6px; padding:8px 18px; font-size:1em; cursor:pointer;';
    divBtns.appendChild(btnImportar);

    // INPUT OCULTO PARA JSON
    const inputImportar = document.createElement('input');
    inputImportar.type = 'file';
    inputImportar.id = 'inputImportarDemandas';
    inputImportar.accept = '.json';
    inputImportar.style = 'display:none;';
    divBtns.appendChild(inputImportar);

    painelBoasVindas.insertBefore(divBtns, painelBoasVindas.querySelector('#btnNovaDemanda'));
  }

  // BOTÃO NOVA DEMANDA
  if (!document.getElementById('btnNovaDemanda')) {
    const btnNovaDemanda = document.createElement('button');
    btnNovaDemanda.id = 'btnNovaDemanda';
    btnNovaDemanda.textContent = '+ Nova Demanda';
    btnNovaDemanda.style = 'background:#660099; color:#fff; border:none; border-radius:6px; padding:8px 18px; font-size:1em; cursor:pointer; margin-top:20px;';
    btnNovaDemanda.onclick = abrirFormularioNovaDemanda;
    painelBoasVindas.appendChild(btnNovaDemanda);
  }

  // BOTÃO APAGAR DEMANDA
  if (!document.getElementById('btnApagarDemanda')) {
    const btnApagarDemanda = document.createElement('button');
    btnApagarDemanda.id = 'btnApagarDemanda';
    btnApagarDemanda.textContent = 'Apagar Demanda';
    btnApagarDemanda.style = 'background:#cc0000; color:#fff; border:none; border-radius:6px; padding:8px 18px; font-size:1em; cursor:pointer; margin-top:10px; margin-left: 10px;';
    btnApagarDemanda.onclick = abrirModalApagarDemanda;
    painelBoasVindas.appendChild(btnApagarDemanda);
  }

  // -------- BOTÃO EXPORTAR DEMANDAS --------
  document.getElementById('btnExportarDemandas').onclick = function() {
    const demandas = JSON.stringify(descricaoDemandas);
    if (!demandas) return alert('Não há demandas para exportar.');
    const blob = new Blob([demandas], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'demandas.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // -------- BOTÃO IMPORTAR DEMANDAS --------
  const btnImportar = document.getElementById('btnImportarDemandas');
  const inputImportar = document.getElementById('inputImportarDemandas');

  btnImportar.onclick = () => {
    inputImportar.click(); 
  };

  inputImportar.onchange = async () => {
    const file = inputImportar.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/importar_demandas`, {
       method: 'POST',
       body: formData
     });

    
      const data = await res.json();
      if (res.ok) {
         alert(data.mensagem || 'Demandas importadas com sucesso!');
      } else {
         alert(data.erro || 'Erro ao importar demandas.');
      }
    } catch (error) {
      console.error('Erro ao conectar com o servidor:', error);
      alert('Erro ao conectar com o servidor.');
    }

  
    inputImportar.value = '';
    };


  // -------- FUNÇÃO PARA CARREGAR DEMANDAS NA TELA --------
  async function carregarDemandas() {
    try {
      const res = await fetch('/listar_demandas');
      const demandas = await res.json();
      console.log(demandas);


      const container = document.getElementById('listaDemandas');
      if (!container) return;
      container.innerHTML = '';
      demandas.forEach(d => {
        const div = document.createElement('div');
        div.textContent = `${d.titulo} - Responsável: ${d.responsavel} - Prioridade: ${d.prioridade}`;
        container.appendChild(div);
      });

    } catch (err) {
      console.error('Erro ao carregar demandas:', err);
    }
  }

  
  carregarDemandas();
});


    // --------- Matriz VISUAL ---------
let fluxoOrdem = JSON.parse(localStorage.getItem('fluxoOrdem') || '{}');

document.getElementById('btnFluxograma').onclick = function() {
  document.getElementById('modalFluxograma').style.display = 'flex';
  renderizarFluxograma();
};
function fecharFluxograma() {
  document.getElementById('modalFluxograma').style.display = 'none';
}

function calcularTempoMedio(col) {
  let total = 0, count = 0;
  Object.keys(fluxoHistorico).forEach(nome => {
    if (fluxoPosicoes[nome] === col && fluxoHistorico[nome] && fluxoHistorico[nome][col]) {
      const dataEntrada = new Date(fluxoHistorico[nome][col]);
      const agora = new Date();
      const diff = (agora - dataEntrada) / 1000 / 60; 
      total += diff;
      count++;
    }
  });
  return count ? (total / count).toFixed(1) : '-';
}

function renderizarFluxograma() {
  const colunas = ['urgente-importante','urgente-naoimportante','naourgente-importante','naourgente-naoimportante'];
  colunas.forEach(col => {
    if (!fluxoOrdem[col]) fluxoOrdem[col] = [];
    document.getElementById('col-' + col).innerHTML = '';
    document.getElementById('count-' + col).innerText = '0'; 
  });

  Object.keys(descricaoDemandas).forEach(nome => {
    let col = fluxoPosicoes[nome] || 'urgente-importante';
    fluxoPosicoes[nome] = col;
  
    if (!colunas.some(c => fluxoOrdem[c].includes(nome))) {
      fluxoOrdem[col].push(nome);
    }
  });

  colunas.forEach(col => {
    fluxoOrdem[col] = fluxoOrdem[col].filter(nome => descricaoDemandas[nome]);
  });

  colunas.forEach(col => {
    let count = 0;
    fluxoOrdem[col].forEach(nome => {
      if (!descricaoDemandas[nome]) return;
      count++;
      const card = document.createElement('div');
      card.className = 'fluxo-card';
      card.draggable = true;
      card.textContent = nome;
      card.ondragstart = function(e) {
        e.dataTransfer.setData('text/plain', nome);
      };
      card.onclick = function() {
        mostrarDetalhes(nome);
        fecharFluxograma();
      };
      document.getElementById('col-' + col).appendChild(card);
    });
    document.getElementById('count-' + col).innerText = count;
    document.getElementById('tm-' + col).innerText =
      '⏱️ Tempo médio: ' + calcularTempoMedio(col) + ' min';
  });

  // Drag & Drop nas colunas
  document.querySelectorAll('.fluxo-dropzone').forEach(dropzone => {
    dropzone.ondragover = e => e.preventDefault();
    dropzone.ondrop = function(e) {
      e.preventDefault();
      const nome = e.dataTransfer.getData('text/plain');
      const col = this.id.replace('col-','');
      
      Object.keys(fluxoOrdem).forEach(c => {
        fluxoOrdem[c] = fluxoOrdem[c].filter(n => n !== nome);
      });
   
      if (!fluxoOrdem[col]) fluxoOrdem[col] = [];
      fluxoOrdem[col].push(nome);

      fluxoPosicoes[nome] = col;
    
      if (!fluxoHistorico[nome]) fluxoHistorico[nome] = {};
      fluxoHistorico[nome][col] = new Date().toISOString();

      localStorage.setItem('fluxoOrdem', JSON.stringify(fluxoOrdem));
      localStorage.setItem('fluxoPosicoes', JSON.stringify(fluxoPosicoes));
      localStorage.setItem('fluxoHistorico', JSON.stringify(fluxoHistorico));
      renderizarFluxograma();
    };
  });
  }
  
  

  
  function normalizaDia(s = '') {
    return String(s)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') 
      .trim().toLowerCase();
  }

  
  function obterDiasArray(demanda) {
    if (Array.isArray(demanda?.diasArray)) return demanda.diasArray;
    if (typeof demanda?.dias === 'string') {
        return demanda.dias.split(/[,;\/|]| e /i).map(s => s.trim()).filter(Boolean);
    }
    return [];
  }

  
  function escapeHTML(t = '') {
    return String(t)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  
   function demandasDoDiaAtual() {
   const hoje = normalizaDia(getDiaSemanaAtual());
   const diasValidos = ['segunda', 'terca', 'quarta', 'quinta', 'sexta'];
   const itens = [];
   for (const [nome, demanda] of Object.entries(descricaoDemandas)) {
    
     const dias = obterDiasArray(demanda).map(d => normalizaDia(d));
 
     const eHoje = dias.includes(hoje) && diasValidos.includes(hoje);
     const eSob = dias.some(d => normalizaDia(d) === 'sobdemanda');
     if (eHoje && !eSob) {
       itens.push({ nome, demanda });
     }
   }
   return itens;
  }

  
  function abrirModalhoje() {
    const ul = document.getElementById('listahojeModal'); 
    if (!ul) return;

    const itens = demandasDoDiaAtual();

    if (!itens.length) {
      ul.innerHTML = `
        <li>
          <strong>Sem demandas para hoje</strong><br>
          <span style="font-size:0.95em; color:#666;">Crie novas tarefas ou reagende.</span>
        </li>`;
    } else {
      ul.innerHTML = itens.map(({ nome, demanda }) => {
        const nomeEsc = escapeHTML(nome);
        const diasTexto = demanda.dias ?? (Array.isArray(demanda.diasArray) ? demanda.diasArray.join(', ') : '');
        const respHtml = demanda.responsavel
          ? `<br><span style="font-size:0.95em; color:#888;">Resp.: ${escapeHTML(demanda.responsavel)}</span>`
          : '';
        
        return `
          <li onclick="mostrarDetalhes('${nomeEsc.replace(/'/g, '\\\'')}'); fecharModalhoje();" style="cursor:pointer;">
            <strong>${nomeEsc}</strong><br>
            <span style="font-size:0.97em; color:#444;">${escapeHTML(diasTexto)}</span>
            ${respHtml}
          </li>`;
      }).join('');
    }

    const modal = document.getElementById('modalhoje');
    if (modal) modal.style.display = 'flex';
  }

 
  function fecharModalhoje() {
    const modal = document.getElementById('modalhoje');
    if (modal) modal.style.display = 'none';
  }
  
  window.fecharModalhoje = fecharModalhoje;

  
  function wireCardHoje() {
    const card = document.getElementById('demandasHoje');
    if (!card) return;
    card.style.cursor = 'pointer';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.addEventListener('click', abrirModalhoje);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirModalhoje(); }
    });
  }

  
  document.addEventListener('DOMContentLoaded', wireCardHoje);

function filtrarDemandasBusca(texto) {
  texto = texto.trim().toLowerCase();
  if (!texto) return Object.keys(descricaoDemandas);
  return Object.entries(descricaoDemandas)
    .filter(([nome, d]) =>
      nome.toLowerCase().includes(texto) ||
      (d.responsavel && d.responsavel.toLowerCase().includes(texto)) ||
      (d.tags && d.tags.some(tag => tag.toLowerCase().includes(texto)))
    )
    .map(([nome]) => nome);
}

function atualizarSidebarDemandasFiltrada() {
  const ul = document.querySelector('.demandas-list');
  const textoBusca = document.getElementById('buscaDemandas').value;
  const nomesFiltrados = filtrarDemandasBusca(textoBusca);
  ul.innerHTML = '';
  nomesFiltrados.forEach(nome => {
    const li = document.createElement('li');
    li.textContent = '📌 ' + nome;
    li.onclick = () => mostrarDetalhes(nome);
    ul.appendChild(li);
  });
}


document.addEventListener('DOMContentLoaded', () => {
  const busca = document.getElementById('buscaDemandas');
  if (busca) {
    busca.addEventListener('input', atualizarSidebarDemandasFiltrada);
  }



});

function abrirChat() {
    window.open(
        'chat.html',
        'ChatIA',
        'width=600,height=700,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,status=no'
    );
}

