// Função de inicialização de assinatura
function setupSig(id){
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext('2d');
  let drawing=false; let lastX=0,lastY=0;

  function resize(){
    const ratio=window.devicePixelRatio||1;
    canvas.width=canvas.clientWidth*ratio;
    // Altura fixa em 140px, ajustada pela resolução do dispositivo
    canvas.height=140*ratio;
    ctx.scale(ratio,ratio);
    ctx.lineJoin='round';
    ctx.lineCap='round';
    ctx.lineWidth=2.6;
    ctx.strokeStyle='#111'
  }

  function start(e){
    drawing=true;
    [lastX,lastY]=getXY(e);
    // Para evitar que a tela se mova em dispositivos móveis ao desenhar
    e.preventDefault();
  }

  function end(){drawing=false}

  function draw(e){
    if(!drawing) return;
    e.preventDefault();
    const [x,y]=getXY(e);
    ctx.beginPath();
    ctx.moveTo(lastX,lastY);
    ctx.lineTo(x,y);
    ctx.stroke();
    [lastX,lastY]=[x,y]
  }

  function getXY(e){
    const rect=canvas.getBoundingClientRect();
    if(e.touches){
      return [e.touches[0].clientX-rect.left, e.touches[0].clientY-rect.top]
    }
    return [e.clientX-rect.left, e.clientY-rect.top]
  }

  // Configurações e Listeners
  window.addEventListener('resize',resize);
  resize();

  canvas.addEventListener('mousedown',start);
  canvas.addEventListener('touchstart',start);
  canvas.addEventListener('mouseup',end);
  canvas.addEventListener('touchend',end);
  canvas.addEventListener('mousemove',draw);
  canvas.addEventListener('touchmove',draw);
}

// Função para limpar a assinatura
function clearSig(id){
  const c=document.getElementById(id);
  const ctx=c.getContext('2d');
  ctx.clearRect(0,0,c.width,c.height)
}

// Inicializa os campos de assinatura
setupSig('sig1');
setupSig('sig2');

// Função para obter as cláusulas principais do HTML (para impressão)
function getClausesHTML() {
  const clausesContainer = document.querySelector('.section-title + p'); // Encontra o primeiro parágrafo após 'Cláusulas Principais'
  if (!clausesContainer) return '';
  
  // Seleciona todos os parágrafos e a lista ordenada que contêm as cláusulas
  let clauses = '';
  let element = clausesContainer;
  while (element && (element.tagName === 'P' || element.tagName === 'OL')) {
    clauses += element.outerHTML;
    element = element.nextElementSibling;
  }
  return clauses;
}

// Função para gerar o PDF (imprimir)
function gerarPDF(){
  // Verifica se o checkbox de confirmação está marcado
  if (!document.getElementById('confirmo').checked) {
    alert("Você precisa confirmar que leu e concorda com os termos.");
    return;
  }
  
  // Marca as assinaturas como URLs de dados
  const sig1=document.getElementById('sig1');
  const sig2=document.getElementById('sig2');
  const s1=sig1.toDataURL();
  const s2=sig2.toDataURL();

  // Constrói o documento de impressão em um iframe
  const doc = document.createElement('iframe');
  doc.style.position='fixed'; doc.style.right='0'; doc.style.bottom='0'; doc.style.width='0'; doc.style.height='0'; doc.style.border='0';
  document.body.appendChild(doc);
  const d = doc.contentWindow.document;

  const html = buildPrintableHTML(s1,s2);
  d.open();
  d.write(html);
  d.close();

  // Espera um pouco e chama a impressão
  setTimeout(()=>{
    doc.contentWindow.focus();
    doc.contentWindow.print();
    // doc.remove(); // Opcional: remover o iframe após a impressão
  }, 600);
}

// Função que monta o HTML para impressão
function buildPrintableHTML(s1,s2){
  const locadoraNome = document.getElementById('locadora_nome').value;
  const locadoraRep = document.getElementById('locadora_representante').value;
  const locadoraCont = document.getElementById('locadora_contato').value;
  const locatarioNome = document.getElementById('locatario_nome').value;
  const cpf = document.getElementById('locatario_cpf').value;
  const tel = document.getElementById('locatario_tel').value;
  const endereco = document.getElementById('locatario_endereco').value;
  const dataEv = document.getElementById('data_evento').value;
  const valor = document.getElementById('valor_locacao').value;
  // Substitui quebras de linha por <br> para impressão
  const itens = document.getElementById('itens_kit').value.replace(/\n/g,'<br>');

  const today = new Date();
  const dt = today.toLocaleDateString();

  // Obtém o HTML das cláusulas diretamente do DOM principal
  const clausesHTML = getClausesHTML();

  return `<!doctype html><html><head><meta charset="utf-8"><title>Termo - Impressão</title><style>body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:24px}h2{margin:0 0 6px}p.small{color:#555;font-size:13px}table{width:100%;border-collapse:collapse;margin-top:12px}td,th{padding:8px;border:1px solid #e6e6e6;text-align:left;font-size:13px}fieldset{border:1px solid #e6e6e6;padding:10px;border-radius:8px;margin-top:12px}img.sign{max-width:320px;max-height:120px;border:1px solid #ddd}</style></head><body>
    <h2>Termo Simplificado de Locação de Kit de Festa</h2>
    <p class="small">Glipearte Pegue e Monte — Representante: ${locadoraRep}</p>
    <table><tr><th>Locador</th><th>Locatário</th></tr>
    <tr><td>${locadoraNome}<br>${locadoraCont}</td>
        <td>${locatarioNome}<br>CPF: ${cpf}<br>Tel: ${tel}<br>Endereço evento: ${endereco}</td></tr></table>

    <fieldset><legend>Dados do Evento</legend>
      <p>Data do evento: ${dataEv} &nbsp;&nbsp; Valor da locação: R$ ${valor}</p>
      <p><strong>Itens do kit:</strong><br>${itens}</p>
    </fieldset>

    <fieldset><legend>Cláusulas</legend>
      ${clausesHTML}
      
    </fieldset>

    <div style="display:flex;gap:30px;margin-top:18px">
      <div>
        <p class="small">Assinatura do Locatário</p>
        <img class="sign" src="${s1}" alt="assinatura locatario" />
      </div>
      <div>
        <p class="small">Assinatura da Glipearte (Locador)</p>
        <img class="sign" src="${s2}" alt="assinatura locador" />
      </div>
    </div>

    <p style="margin-top:18px;color:#666;font-size:12px">Fortaleza, Ceará: ${dt}</p>
    </body></html>`;
}

// Função para baixar os dados preenchidos como JSON
function baixarJSON(){
  const data = {
    locadora_nome: document.getElementById('locadora_nome').value,
    locadora_representante: document.getElementById('locadora_representante').value,
    locadora_contato: document.getElementById('locadora_contato').value,
    locatario_nome: document.getElementById('locatario_nome').value,
    locatario_cpf: document.getElementById('locatario_cpf').value,
    locatario_tel: document.getElementById('locatario_tel').value,
    locatario_endereco: document.getElementById('locatario_endereco').value,
    data_evento: document.getElementById('data_evento').value,
    valor_locacao: document.getElementById('valor_locacao').value,
    itens_kit: document.getElementById('itens_kit').value,
    assinatura_locatario: document.getElementById('sig1').toDataURL(),
    assinatura_locadora: document.getElementById('sig2').toDataURL()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href=url;
  a.download='termo_glipearte_dados.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Adiciona os event listeners aos botões no formulário para melhor prática
document.querySelector('button[onclick="gerarPDF()"]').addEventListener('click', gerarPDF);
document.querySelector('button[onclick="baixarJSON()"]').addEventListener('click', baixarJSON);
