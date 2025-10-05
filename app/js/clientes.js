let clientes = [];
let clienteEditando = null;

document.addEventListener("DOMContentLoaded", function () {
  carregarClientes();
  configurarEventos();
});

function configurarEventos() {
  document
    .getElementById("clienteForm")
    .addEventListener("submit", handleSubmitCliente);

  document
    .getElementById("searchInput")
    .addEventListener("input", filtrarClientes);

  document
    .getElementById("clienteModal")
    .addEventListener("hidden.bs.modal", resetarModal);

  document
    .getElementById("clienteModal")
    .addEventListener("show.bs.modal", function (event) {
      if (!clienteEditando) {
        resetarFormulario();
      }
    });

  document.getElementById("cli_cpf").addEventListener("input", formatarCPF);
  document
    .getElementById("cli_telefone")
    .addEventListener("input", formatarTelefone);
}

async function carregarClientes() {
  const loadingDiv = document.getElementById("loadingClientes");
  const tableDiv = document.getElementById("clientesTable");
  const noClientesDiv = document.getElementById("noClientes");

  try {
    loadingDiv.style.display = "block";
    tableDiv.style.display = "none";
    noClientesDiv.style.display = "none";

    clientes = await ApiService.getClientes();

    loadingDiv.style.display = "none";

    if (clientes.length > 0) {
      renderizarClientes(clientes);
      tableDiv.style.display = "block";
    } else {
      noClientesDiv.style.display = "block";
    }
  } catch (error) {
    loadingDiv.style.display = "none";
    MessageManager.showError("Erro ao carregar clientes: " + error.message);
  }
}

function renderizarClientes(clientesParaRenderizar) {
  const tbody = document.getElementById("clientesTableBody");
  tbody.innerHTML = "";

  clientesParaRenderizar.forEach((cliente) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${formatarCPFDisplay(cliente.cli_cpf)}</td>
            <td>${cliente.cli_nome}</td>
            <td>${cliente.cli_telefone || "-"}</td>
            <td>${cliente.cli_email || "-"}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary btn-action" 
                        onclick="editarCliente('${cliente.cli_cpf}')" 
                        title="Editar">
                    ✏️
                </button>
                <button class="btn btn-sm btn-outline-danger btn-action" 
                        onclick="confirmarExclusao(${cliente.id}, '${
      cliente.cli_nome
    }')" 
                        title="Excluir">
                    🗑️
                </button>
                <button class="btn btn-sm btn-outline-info btn-action" 
                        onclick="verLivrosCliente(${cliente.id})" 
                        title="Ver Livros">
                    📖
                </button>
            </td>
        `;
    tbody.appendChild(row);
  });
}

function filtrarClientes() {
  const termo = document.getElementById("searchInput").value.toLowerCase();

  if (!termo) {
    renderizarClientes(clientes);
    return;
  }

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.cli_nome.toLowerCase().includes(termo) ||
      cliente.cli_cpf.includes(termo)
  );

  renderizarClientes(clientesFiltrados);
}

function novoCliente() {
  clienteEditando = null;
  document.getElementById("clienteModalTitle").textContent = "Novo Cliente";
  document.getElementById("clienteSubmitBtn").textContent = "Salvar Cliente";
  resetarFormulario();
}

async function editarCliente(cpf) {
  try {
    clienteEditando = await ApiService.getClientePorCpf(cpf);

    document.getElementById("clienteModalTitle").textContent = "Editar Cliente";
    document.getElementById("clienteSubmitBtn").textContent =
      "Atualizar Cliente";

    document.getElementById("cli_cpf").value = clienteEditando.cli_cpf;
    document.getElementById("cli_cpf").readOnly = false;
    document.getElementById("cli_nome").value = clienteEditando.cli_nome;
    document.getElementById("cli_telefone").value =
      clienteEditando.cli_telefone || "";
    document.getElementById("cli_email").value =
      clienteEditando.cli_email || "";

    const modal = new bootstrap.Modal(document.getElementById("clienteModal"));
    modal.show();
  } catch (error) {
    MessageManager.showError(
      "Erro ao carregar dados do cliente: " + error.message
    );
  }
}

function confirmarExclusao(id, nome) {
  Utils.confirmAction(
    `Tem certeza que deseja excluir o cliente "${nome}"?\n\nEsta ação não pode ser desfeita.`,
    () => excluirCliente(id)
  );
}

async function excluirCliente(id) {
  try {
    await ApiService.deletarCliente(id);
    MessageManager.showSuccess("Cliente excluído com sucesso!");
    carregarClientes();
  } catch (error) {
    MessageManager.showError("Erro ao excluir cliente: " + error.message);
  }
}

function verLivrosCliente(clienteId) {
  window.location.href = `livros.html?cliente=${clienteId}`;
}

async function handleSubmitCliente(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  if (!validarFormulario(form)) {
    return;
  }

  const cliente = {
    cli_cpf: formData.get("cli_cpf"),
    cli_nome: formData.get("cli_nome"),
    cli_telefone: formData.get("cli_telefone") || null,
    cli_email: formData.get("cli_email") || null,
  };

  try {
    if (clienteEditando) {
      await ApiService.atualizarCliente(clienteEditando.id, cliente);
      MessageManager.showSuccess("Cliente atualizado com sucesso!");
    } else {
      await ApiService.criarCliente(cliente);
      MessageManager.showSuccess("Cliente cadastrado com sucesso!");
    }

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("clienteModal")
    );
    modal.hide();
    carregarClientes();
  } catch (error) {
    MessageManager.showError("Erro ao salvar cliente: " + error.message);
  }
}

function validarFormulario(form) {
  let valido = true;

  form.classList.remove("was-validated");

  const cpfInput = document.getElementById("cli_cpf");
  const cpf = cpfInput.value.replace(/[^\d]/g, "");

  const cpfFeedback = cpfInput.parentNode.querySelector(".invalid-feedback");

  if (!cpf || cpf.trim().length === 0) {
    cpfInput.setCustomValidity("CPF é obrigatório");
    cpfInput.classList.add("is-invalid");
    cpfInput.classList.remove("is-valid");
    if (cpfFeedback) cpfFeedback.classList.add("show");
    valido = false;
  } else if (cpf.length !== 11) {
    cpfInput.setCustomValidity("CPF deve ter 11 dígitos");
    cpfInput.classList.add("is-invalid");
    cpfInput.classList.remove("is-valid");
    if (cpfFeedback) cpfFeedback.classList.add("show");
    valido = false;
  } else {
    cpfInput.setCustomValidity("");
    cpfInput.classList.remove("is-invalid");
    cpfInput.classList.add("is-valid");
    if (cpfFeedback) cpfFeedback.classList.remove("show");
  }

  const nomeInput = document.getElementById("cli_nome");
  const nomeFeedback = nomeInput.parentNode.querySelector(".invalid-feedback");

  if (!nomeInput.value || nomeInput.value.trim().length === 0) {
    nomeInput.setCustomValidity("Nome é obrigatório");
    nomeInput.classList.add("is-invalid");
    nomeInput.classList.remove("is-valid");
    if (nomeFeedback) nomeFeedback.classList.add("show");
    valido = false;
  } else if (nomeInput.value.trim().length < 2) {
    nomeInput.setCustomValidity("Nome deve ter pelo menos 2 caracteres");
    nomeInput.classList.add("is-invalid");
    nomeInput.classList.remove("is-valid");
    if (nomeFeedback) nomeFeedback.classList.add("show");
    valido = false;
  } else {
    nomeInput.setCustomValidity("");
    nomeInput.classList.remove("is-invalid");
    nomeInput.classList.add("is-valid");
    if (nomeFeedback) nomeFeedback.classList.remove("show");
  }

  const telefoneInput = document.getElementById("cli_telefone");
  const telefoneFeedback =
    telefoneInput.parentNode.querySelector(".invalid-feedback");
  const telefone = telefoneInput.value.replace(/[^\d]/g, "");

  if (telefoneInput.value && telefone.length < 10) {
    telefoneInput.setCustomValidity("Telefone deve ter pelo menos 10 dígitos");
    telefoneInput.classList.add("is-invalid");
    telefoneInput.classList.remove("is-valid");
    if (telefoneFeedback) telefoneFeedback.classList.add("show");
    valido = false;
  } else if (telefoneInput.value) {
    telefoneInput.setCustomValidity("");
    telefoneInput.classList.remove("is-invalid");
    telefoneInput.classList.add("is-valid");
    if (telefoneFeedback) telefoneFeedback.classList.remove("show");
  } else {
    telefoneInput.setCustomValidity("");
    telefoneInput.classList.remove("is-invalid", "is-valid");
    if (telefoneFeedback) telefoneFeedback.classList.remove("show");
  }

  const emailInput = document.getElementById("cli_email");
  const emailFeedback =
    emailInput.parentNode.querySelector(".invalid-feedback");

  if (emailInput.value && !Validator.validateEmail(emailInput.value)) {
    emailInput.setCustomValidity("Digite um email válido");
    emailInput.classList.add("is-invalid");
    emailInput.classList.remove("is-valid");
    if (emailFeedback) emailFeedback.classList.add("show");
    valido = false;
  } else if (emailInput.value) {
    emailInput.setCustomValidity("");
    emailInput.classList.remove("is-invalid");
    emailInput.classList.add("is-valid");
    if (emailFeedback) emailFeedback.classList.remove("show");
  } else {
    emailInput.setCustomValidity("");
    emailInput.classList.remove("is-invalid", "is-valid");
    if (emailFeedback) emailFeedback.classList.remove("show");
  }

  form.classList.add("was-validated");

  return valido;
}

function formatarCPF(event) {
  let value = event.target.value.replace(/\D/g, "");

  if (value.length > 11) {
    value = value.substring(0, 11);
  }

  if (value.length <= 3) {
    event.target.value = value;
  } else if (value.length <= 6) {
    event.target.value = value.replace(/(\d{3})(\d+)/, "$1.$2");
  } else if (value.length <= 9) {
    event.target.value = value.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
  } else {
    event.target.value = value.replace(
      /(\d{3})(\d{3})(\d{3})(\d+)/,
      "$1.$2.$3-$4"
    );
  }
}

function formatarTelefone(event) {
  let value = event.target.value.replace(/\D/g, "");

  if (value.length > 11) {
    value = value.substring(0, 11);
  }

  if (value.length === 0) {
    event.target.value = "";
  } else if (value.length <= 2) {
    event.target.value = `(${value}`;
  } else if (value.length <= 6) {
    event.target.value = value.replace(/(\d{2})(\d+)/, "($1) $2");
  } else if (value.length <= 10) {
    event.target.value = value.replace(/(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
  } else {
    event.target.value = value.replace(/(\d{2})(\d{5})(\d+)/, "($1) $2-$3");
  }
}

function formatarCPFDisplay(cpf) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function resetarFormulario() {
  const form = document.getElementById("clienteForm");
  form.reset();
  form.classList.remove("was-validated");
  document.getElementById("cli_cpf").readOnly = false;

  document.getElementById("clienteModalTitle").textContent = "Novo Cliente";
  document.getElementById("clienteSubmitBtn").textContent = "Cadastrar Cliente";

  const inputs = form.querySelectorAll("input, select, textarea");
  inputs.forEach((input) => {
    input.setCustomValidity("");
    input.classList.remove("is-invalid", "is-valid");
  });

  const feedbacks = form.querySelectorAll(".invalid-feedback");
  feedbacks.forEach((feedback) => {
    feedback.style.display = "none";
  });
}

function resetarModal() {
  clienteEditando = null;
  resetarFormulario();
}
