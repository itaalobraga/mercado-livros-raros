let livros = [];
let clientes = [];
let livroEditando = null;
let livroReservando = null;

document.addEventListener("DOMContentLoaded", function () {
  carregarDados();
  configurarEventos();

  const urlParams = new URLSearchParams(window.location.search);
  const clienteId = urlParams.get("cliente");
  if (clienteId) {
    setTimeout(() => filtrarLivrosPorCliente(clienteId), 1000);
  }
});

function configurarEventos() {
  document
    .getElementById("livroForm")
    .addEventListener("submit", handleSubmitLivro);

  document
    .getElementById("reservarForm")
    .addEventListener("submit", handleSubmitReserva);

  document
    .getElementById("searchInput")
    .addEventListener("input", filtrarLivros);

  document
    .getElementById("livroModal")
    .addEventListener("hidden.bs.modal", resetarModalLivro);
  document
    .getElementById("reservarModal")
    .addEventListener("hidden.bs.modal", resetarModalReserva);

  document
    .getElementById("livroModal")
    .addEventListener("show.bs.modal", function (event) {
      if (!livroEditando) {
        resetarFormularioLivro();
      }
    });
  document
    .getElementById("reservarModal")
    .addEventListener("show.bs.modal", function () {
      const form = document.getElementById("reservarForm");
      form.classList.remove("was-validated");

      const inputs = form.querySelectorAll("input, select, textarea");
      inputs.forEach((input) => {
        input.setCustomValidity("");
        input.classList.remove("is-invalid", "is-valid");
      });

      const feedbacks = form.querySelectorAll(".invalid-feedback");
      feedbacks.forEach((feedback) => {
        feedback.style.display = "none";
      });
    });
}

async function carregarDados() {
  await Promise.all([carregarLivros(), carregarClientes()]);
}

async function carregarLivros() {
  const loadingDiv = document.getElementById("loadingLivros");
  const tableDiv = document.getElementById("livrosTable");
  const noLivrosDiv = document.getElementById("noLivros");

  try {
    loadingDiv.style.display = "block";
    tableDiv.style.display = "none";
    noLivrosDiv.style.display = "none";

    livros = await ApiService.getLivros();

    loadingDiv.style.display = "none";

    if (livros.length > 0) {
      renderizarLivros(livros);
      atualizarEstatisticas();
      tableDiv.style.display = "block";
    } else {
      noLivrosDiv.style.display = "block";
    }
  } catch (error) {
    loadingDiv.style.display = "none";
    MessageManager.showError("Erro ao carregar livros: " + error.message);
  }
}

async function carregarClientes() {
  try {
    clientes = await ApiService.getClientes();
    atualizarSelectClientes();
  } catch (error) {
    MessageManager.showError("Erro ao carregar clientes: " + error.message);
  }
}

function atualizarSelectClientes() {
  const selectLivro = document.getElementById("cliente_id");
  const selectReserva = document.getElementById("clienteReserva");

  selectLivro.innerHTML =
    '<option value="">Selecione um cliente (deixar vazio para disponível)</option>';
  selectReserva.innerHTML = '<option value="">Selecione um cliente</option>';

  clientes.forEach((cliente) => {
    const option1 = new Option(
      `${cliente.cli_nome} (${cliente.cli_cpf})`,
      cliente.id
    );
    const option2 = new Option(
      `${cliente.cli_nome} (${cliente.cli_cpf})`,
      cliente.id
    );

    selectLivro.add(option1);
    selectReserva.add(option2);
  });
}

function renderizarLivros(livrosParaRenderizar) {
  const tbody = document.getElementById("livrosTableBody");
  tbody.innerHTML = "";

  livrosParaRenderizar.forEach((livro) => {
    const row = document.createElement("tr");

    const statusBadge =
      livro.status === "disponivel"
        ? '<span class="status-badge status-disponivel">Disponível</span>'
        : '<span class="status-badge status-reservado">Reservado</span>';

    const clienteInfo = livro.cli_nome
      ? `${livro.cli_nome}<br><small class="text-muted">${
          livro.cli_email || ""
        }</small>`
      : "-";

    const dataReserva = livro.data_reserva
      ? Utils.formatDate(livro.data_reserva)
      : "-";

    row.innerHTML = `
            <td><strong>${livro.liv_titulo}</strong></td>
            <td>${livro.liv_autor}</td>
            <td>${statusBadge}</td>
            <td>${clienteInfo}</td>
            <td>${dataReserva}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary btn-action" 
                        onclick="editarLivro(${livro.liv_id})" 
                        title="Editar">
                    ✏️
                </button>
                ${
                  livro.status === "disponivel"
                    ? `<button class="btn btn-sm btn-outline-warning btn-action" 
                               onclick="abrirModalReserva(${livro.liv_id})" 
                               title="Reservar">
                          🔒
                       </button>`
                    : ""
                }
                <button class="btn btn-sm btn-outline-danger btn-action" 
                        onclick="confirmarExclusao(${livro.liv_id}, '${
      livro.liv_titulo
    }')" 
                        title="Excluir">
                    🗑️
                </button>
            </td>
        `;
    tbody.appendChild(row);
  });
}

function atualizarEstatisticas() {
  const totalDisponiveis = livros.filter(
    (l) => l.status === "disponivel"
  ).length;
  const totalReservados = livros.filter((l) => l.status === "reservado").length;

  document.getElementById("totalDisponiveis").textContent = totalDisponiveis;
  document.getElementById("totalReservados").textContent = totalReservados;
  document.getElementById("totalLivros").textContent = livros.length;
}

function filtrarLivros() {
  const statusFilter = document.getElementById("statusFilter").value;
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();

  let livrosFiltrados = livros;

  if (statusFilter) {
    livrosFiltrados = livrosFiltrados.filter(
      (livro) => livro.status === statusFilter
    );
  }

  if (searchTerm) {
    livrosFiltrados = livrosFiltrados.filter(
      (livro) =>
        livro.liv_titulo.toLowerCase().includes(searchTerm) ||
        livro.liv_autor.toLowerCase().includes(searchTerm)
    );
  }

  renderizarLivros(livrosFiltrados);
}

function filtrarLivrosPorCliente(clienteId) {
  const livrosCliente = livros.filter((l) => l.cliente_id == clienteId);
  renderizarLivros(livrosCliente);
  document.getElementById("statusFilter").value = "";
  document.getElementById("searchInput").value = "";
}

function novoLivro() {
  livroEditando = null;
  document.getElementById("livroModalTitle").textContent = "Novo Livro";
  document.getElementById("livroSubmitBtn").textContent = "Salvar Livro";
  resetarFormularioLivro();
}

async function editarLivro(id) {
  try {
    livroEditando = await ApiService.getLivroPorId(id);

    document.getElementById("livroModalTitle").textContent = "Editar Livro";
    document.getElementById("livroSubmitBtn").textContent = "Atualizar Livro";

    document.getElementById("liv_titulo").value = livroEditando.liv_titulo;
    document.getElementById("liv_autor").value = livroEditando.liv_autor;
    document.getElementById("cliente_id").value =
      livroEditando.cliente_id || "";

    const modal = new bootstrap.Modal(document.getElementById("livroModal"));
    modal.show();
  } catch (error) {
    MessageManager.showError(
      "Erro ao carregar dados do livro: " + error.message
    );
  }
}

function abrirModalReserva(livroId) {
  const livro = livros.find((l) => l.liv_id == livroId);
  if (!livro) return;

  livroReservando = livro;

  document.getElementById(
    "livroReservaInfo"
  ).textContent = `"${livro.liv_titulo}" - ${livro.liv_autor}`;

  const modal = new bootstrap.Modal(document.getElementById("reservarModal"));
  modal.show();
}

function confirmarExclusao(id, titulo) {
  Utils.confirmAction(
    `Tem certeza que deseja excluir o livro "${titulo}"?\n\nEsta ação não pode ser desfeita.`,
    () => excluirLivro(id)
  );
}

async function excluirLivro(id) {
  try {
    await ApiService.deletarLivro(id);
    MessageManager.showSuccess("Livro excluído com sucesso!");
    carregarLivros();
  } catch (error) {
    MessageManager.showError("Erro ao excluir livro: " + error.message);
  }
}

async function handleSubmitLivro(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  if (!validarFormularioLivro(form)) {
    return;
  }

  const livro = {
    liv_titulo: formData.get("liv_titulo"),
    liv_autor: formData.get("liv_autor"),
    cliente_id: formData.get("cliente_id") || null,
  };

  if (livroEditando) {
    livro.status = livroEditando.status;
    livro.data_reserva = livroEditando.data_reserva;
  }

  try {
    if (livroEditando) {
      await ApiService.atualizarLivro(livroEditando.liv_id, livro);
      MessageManager.showSuccess("Livro atualizado com sucesso!");
    } else {
      await ApiService.criarLivro(livro);
      MessageManager.showSuccess("Livro cadastrado com sucesso!");
    }

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("livroModal")
    );
    modal.hide();
    carregarLivros();
  } catch (error) {
    MessageManager.showError("Erro ao salvar livro: " + error.message);
  }
}

async function handleSubmitReserva(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const clienteId = formData.get("cliente_id");

  if (!clienteId) {
    MessageManager.showError("Selecione um cliente para reservar o livro.");
    return;
  }

  try {
    await ApiService.reservarLivro(livroReservando.liv_id, clienteId);
    MessageManager.showSuccess("Livro reservado com sucesso!");

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("reservarModal")
    );
    modal.hide();
    carregarLivros();
  } catch (error) {
    MessageManager.showError("Erro ao reservar livro: " + error.message);
  }
}

function validarFormularioLivro(form) {
  let valido = true;

  form.classList.remove("was-validated");

  const tituloInput = document.getElementById("liv_titulo");
  const tituloFeedback =
    tituloInput.parentNode.querySelector(".invalid-feedback");

  if (!tituloInput.value || tituloInput.value.trim().length === 0) {
    tituloInput.setCustomValidity("Título é obrigatório");
    tituloInput.classList.add("is-invalid");
    tituloInput.classList.remove("is-valid");
    if (tituloFeedback) tituloFeedback.classList.add("show");
    valido = false;
  } else if (tituloInput.value.trim().length < 2) {
    tituloInput.setCustomValidity("Título deve ter pelo menos 2 caracteres");
    tituloInput.classList.add("is-invalid");
    tituloInput.classList.remove("is-valid");
    if (tituloFeedback) tituloFeedback.classList.add("show");
    valido = false;
  } else {
    tituloInput.setCustomValidity("");
    tituloInput.classList.remove("is-invalid");
    tituloInput.classList.add("is-valid");
    if (tituloFeedback) tituloFeedback.classList.remove("show");
  }

  const autorInput = document.getElementById("liv_autor");
  const autorFeedback =
    autorInput.parentNode.querySelector(".invalid-feedback");

  if (!autorInput.value || autorInput.value.trim().length === 0) {
    autorInput.setCustomValidity("Autor é obrigatório");
    autorInput.classList.add("is-invalid");
    autorInput.classList.remove("is-valid");
    if (autorFeedback) autorFeedback.classList.add("show");
    valido = false;
  } else if (autorInput.value.trim().length < 2) {
    autorInput.setCustomValidity("Autor deve ter pelo menos 2 caracteres");
    autorInput.classList.add("is-invalid");
    autorInput.classList.remove("is-valid");
    if (autorFeedback) autorFeedback.classList.add("show");
    valido = false;
  } else {
    autorInput.setCustomValidity("");
    autorInput.classList.remove("is-invalid");
    autorInput.classList.add("is-valid");
    if (autorFeedback) autorFeedback.classList.remove("show");
  }

  form.classList.add("was-validated");

  return valido;
}

function resetarFormularioLivro() {
  const form = document.getElementById("livroForm");
  form.reset();
  form.classList.remove("was-validated");

  document.getElementById("livroModalTitle").textContent = "Novo Livro";
  document.getElementById("livroSubmitBtn").textContent = "Cadastrar Livro";

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

function resetarModalLivro() {
  livroEditando = null;
  resetarFormularioLivro();
}

function resetarModalReserva() {
  livroReservando = null;
  document.getElementById("reservarForm").reset();
  document.getElementById("reservarForm").classList.remove("was-validated");
}
