const formAgendamento = document.getElementById("formAgendamento");
const formLogin = document.getElementById("formLogin");

const mensagem = document.getElementById("mensagem");
const mensagemLogin = document.getElementById("mensagemLogin");
const dadosCliente = document.getElementById("dadosCliente");

const modalLogin = document.getElementById("modalLogin");
const tabLogin = document.getElementById("tabLogin");
const tabCadastro = document.getElementById("tabCadastro");

const usuarioLogado = document.getElementById("usuarioLogado");
const nomeUsuario = document.getElementById("nomeUsuario");
const btnAbrirLogin = document.getElementById("btnAbrirLogin");

let agendamentos = carregarAgendamentos();

function carregarAgendamentos() {
  try {
    return JSON.parse(localStorage.getItem("agendamentos")) || [];
  } catch (erro) {
    localStorage.removeItem("agendamentos");
    return [];
  }
}

function salvarAgendamentos() {
  localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
}

function abrirModalLogin() {
  modalLogin.classList.add("ativo");
  mostrarLogin();
}

function abrirModalCadastro() {
  modalLogin.classList.add("ativo");
  mostrarCadastro();
}

function fecharModalLogin() {
  modalLogin.classList.remove("ativo");
}

function mostrarLogin() {
  formLogin.classList.remove("escondido");
  formAgendamento.classList.add("escondido");

  tabLogin.classList.add("ativo");
  tabCadastro.classList.remove("ativo");

  limparMensagens();
}

function mostrarCadastro() {
  formAgendamento.classList.remove("escondido");
  formLogin.classList.add("escondido");

  tabCadastro.classList.add("ativo");
  tabLogin.classList.remove("ativo");

  limparMensagens();
}

function limparMensagens() {
  mensagem.innerText = "";
  mensagemLogin.innerText = "";
  mensagem.className = "";
  mensagemLogin.className = "";
}

formAgendamento.addEventListener("submit", function (event) {
  event.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const senha = document.getElementById("senha").value.trim();
  const servico = document.getElementById("servico").value;
  const data = document.getElementById("data").value;
  const horario = document.getElementById("horario").value;

  agendamentos = carregarAgendamentos();

  const horarioOcupado = agendamentos.some(item => {
    return item.data === data && item.horario === horario;
  });

  if (horarioOcupado) {
    mostrarMensagem(mensagem, "Esse horário já está ocupado. Escolha outro.", "erro");
    return;
  }

  const novoAgendamento = {
    id: Date.now(),
    nome,
    email,
    senha,
    servico,
    data,
    horario,
    status: "Confirmado"
  };

  agendamentos.push(novoAgendamento);
  salvarAgendamentos();

  mostrarMensagem(mensagem, "Cadastro e agendamento feitos com sucesso! Agora faça login.", "sucesso");

  formAgendamento.reset();

  setTimeout(() => {
    mostrarLogin();
  }, 900);
});

formLogin.addEventListener("submit", function (event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const senha = document.getElementById("loginSenha").value.trim();

  agendamentos = carregarAgendamentos();

  const agendamentosDoCliente = agendamentos.filter(item => {
    return item.email === email && item.senha === senha;
  });

  if (agendamentosDoCliente.length === 0) {
    mostrarMensagem(mensagemLogin, "Email ou senha incorretos, ou nenhum agendamento encontrado.", "erro");
    dadosCliente.innerHTML = "";
    return;
  }

  const cliente = agendamentosDoCliente[0];

  localStorage.setItem("clienteLogado", JSON.stringify(cliente));

  mostrarMensagem(mensagemLogin, "Login realizado com sucesso!", "sucesso");
  mostrarAgendamentosDoCliente(agendamentosDoCliente);
  atualizarAreaLogada();

  setTimeout(() => {
    fecharModalLogin();
    window.location.href = "#meuAgendamento";
  }, 600);
});

function mostrarAgendamentosDoCliente(lista) {
  dadosCliente.innerHTML = "";

  lista.forEach(agendamento => {
    const card = document.createElement("div");
    card.classList.add("card-agendamento");

    card.innerHTML = `
      <h3>${agendamento.nome}</h3>
      <p><strong>Email:</strong> ${agendamento.email}</p>
      <p><strong>Serviço:</strong> ${agendamento.servico}</p>
      <p><strong>Data:</strong> ${formatarData(agendamento.data)}</p>
      <p><strong>Horário:</strong> ${agendamento.horario}</p>
      <p><strong>Status:</strong> ${agendamento.status}</p>

      <button class="cancelar" onclick="cancelarAgendamento(${agendamento.id})">
        Cancelar agendamento
      </button>
    `;

    dadosCliente.appendChild(card);
  });
}

function cancelarAgendamento(id) {
  agendamentos = carregarAgendamentos();

  const agendamentoCancelado = agendamentos.find(item => item.id === id);

  if (!agendamentoCancelado) {
    alert("Agendamento não encontrado.");
    return;
  }

  const confirmar = confirm(`Deseja cancelar o agendamento de ${agendamentoCancelado.nome}?`);

  if (!confirmar) return;

  agendamentos = agendamentos.filter(item => item.id !== id);
  salvarAgendamentos();

  localStorage.removeItem("clienteLogado");

  dadosCliente.innerHTML = `
    <div class="card-agendamento cancelado">
      <h3>Agendamento cancelado</h3>
      <p>O horário foi removido com sucesso.</p>
    </div>
  `;

  atualizarAreaLogada();

  alert(`Alerta para profissional: ${agendamentoCancelado.nome} cancelou o horário.`);
}

function atualizarAreaLogada() {
  const clienteLogado = JSON.parse(localStorage.getItem("clienteLogado"));

  if (clienteLogado) {
    usuarioLogado.style.display = "flex";
    nomeUsuario.innerText = `Olá, ${clienteLogado.nome}`;
    btnAbrirLogin.style.display = "none";
  } else {
    usuarioLogado.style.display = "none";
    nomeUsuario.innerText = "";
    btnAbrirLogin.style.display = "inline-block";
  }
}

function sairConta() {
  localStorage.removeItem("clienteLogado");
  dadosCliente.innerHTML = "";
  atualizarAreaLogada();
  window.location.href = "#";
}

function formatarData(data) {
  const partes = data.split("-");
  if (partes.length !== 3) return data;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function mostrarMensagem(elemento, texto, tipo) {
  elemento.innerText = texto;
  elemento.className = tipo;
}

window.abrirModalLogin = abrirModalLogin;
window.abrirModalCadastro = abrirModalCadastro;
window.fecharModalLogin = fecharModalLogin;
window.mostrarLogin = mostrarLogin;
window.mostrarCadastro = mostrarCadastro;
window.cancelarAgendamento = cancelarAgendamento;
window.sairConta = sairConta;

atualizarAreaLogada();