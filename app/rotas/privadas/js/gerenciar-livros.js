const API_URL = "http://localhost:3000/api";

let livros = [];
let clientes = [];
let livrosFiltrados = [];
let modoEdicao = false;
let livroEditando = null;

const Utils = {
  formatarData: (data) => {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  mostrarAlerta: (mensagem, tipo = "danger") => {
    const alertContainer = document.getElementById("alertContainer");
    const icon = tipo === "success" ? "check-circle" : "exclamation-triangle";

    alertContainer.innerHTML = `
            <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
                <i class="fas fa-${icon} me-2"></i>
                ${mensagem}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

    if (tipo === "success") {
      setTimeout(() => {
        const alert = alertContainer.querySelector(".alert");
        if (alert) {
          const bsAlert = new bootstrap.Alert(alert);
          bsAlert.close();
        }
      }, 5000);
    }
  },

  mostrarLoading: (loading) => {
    const btnSalvar = document.getElementById("btnSalvarLivro");

    if (loading) {
      btnSalvar.disabled = true;
      btnSalvar.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span>Salvando...';
    } else {
      btnSalvar.disabled = false;
      btnSalvar.innerHTML = '<i class="fas fa-save me-1"></i>Salvar';
    }
  },
};

const LivroService = {
  listar: async () => {
    try {
      const response = await fetch(`${API_URL}/livros`);
      if (!response.ok) throw new Error("Erro ao carregar livros");
      return await response.json();
    } catch (error) {
      console.error("Erro ao listar livros:", error);
      throw error;
    }
  },

  buscarPorId: async (id) => {
    try {
      const response = await fetch(`${API_URL}/livros/${id}`);
      if (!response.ok) throw new Error("Erro ao buscar livro");
      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar livro:", error);
      throw error;
    }
  },

  criar: async (dadosLivro) => {
    try {
      const response = await fetch(`${API_URL}/livros`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosLivro),
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.erro || "Erro ao criar livro");
      }

      return resultado;
    } catch (error) {
      console.error("Erro ao criar livro:", error);
      throw error;
    }
  },

  atualizar: async (id, dadosLivro) => {
    try {
      const response = await fetch(`${API_URL}/livros/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosLivro),
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.erro || "Erro ao atualizar livro");
      }

      return resultado;
    } catch (error) {
      console.error("Erro ao atualizar livro:", error);
      throw error;
    }
  },

  deletar: async (id) => {
    try {
      const response = await fetch(`${API_URL}/livros/${id}`, {
        method: "DELETE",
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.erro || "Erro ao deletar livro");
      }

      return resultado;
    } catch (error) {
      console.error("Erro ao deletar livro:", error);
      throw error;
    }
  },

  reservar: async (id, clienteId) => {
    try {
      const response = await fetch(`${API_URL}/livros/${id}/reservar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cliente_id: clienteId }),
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.erro || "Erro ao reservar livro");
      }

      return resultado;
    } catch (error) {
      console.error("Erro ao reservar livro:", error);
      throw error;
    }
  },
};

const ClienteService = {
  listar: async () => {
    try {
      const response = await fetch(`${API_URL}/clientes`);
      if (!response.ok) throw new Error("Erro ao carregar clientes");
      return await response.json();
    } catch (error) {
      console.error("Erro ao listar clientes:", error);
      throw error;
    }
  },
};

const FormValidator = {
  validarTitulo: (input) => {
    const titulo = input.value.trim();

    if (titulo.length < 2) {
      input.classList.add("is-invalid");
      input.classList.remove("is-valid");
      input.nextElementSibling.textContent =
        "Título deve ter pelo menos 2 caracteres";
      return false;
    } else {
      input.classList.remove("is-invalid");
      input.classList.add("is-valid");
      return true;
    }
  },

  validarAutor: (input) => {
    const autor = input.value.trim();

    if (autor.length < 2) {
      input.classList.add("is-invalid");
      input.classList.remove("is-valid");
      input.nextElementSibling.textContent =
        "Autor deve ter pelo menos 2 caracteres";
      return false;
    } else {
      input.classList.remove("is-invalid");
      input.classList.add("is-valid");
      return true;
    }
  },

  validarFormulario: () => {
    const titulo = document.getElementById("liv_titulo");
    const autor = document.getElementById("liv_autor");

    const tituloValido = FormValidator.validarTitulo(titulo);
    const autorValido = FormValidator.validarAutor(autor);

    return tituloValido && autorValido;
  },
};

const UI = {
  renderizarTabela: (livrosParaRenderizar = livrosFiltrados) => {
    const tbody = document.querySelector("#tabelaLivros tbody");

    if (livrosParaRenderizar.length === 0) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="no-data">
                        <i class="fas fa-book"></i>
                        <p>Nenhum livro encontrado</p>
                    </td>
                </tr>
            `;
      return;
    }

    tbody.innerHTML = livrosParaRenderizar
      .map((livro) => {
        const clienteNome = livro.cliente_id
          ? clientes.find((c) => c.id === livro.cliente_id)?.cli_nome ||
            "Cliente não encontrado"
          : "-";

        const statusBadge =
          livro.status === "disponivel"
            ? '<span class="status-badge status-disponivel">Disponível</span>'
            : '<span class="status-badge status-reservado">Reservado</span>';

        return `
                <tr>
                    <td>${livro.liv_id}</td>
                    <td>${livro.liv_titulo}</td>
                    <td>${livro.liv_autor}</td>
                    <td>${statusBadge}</td>
                    <td>${clienteNome}</td>
                    <td>${Utils.formatarData(livro.data_reserva)}</td>
                    <td>
                        <div class="btn-group-custom">
                            <button class="btn btn-warning btn-sm" onclick="UI.editarLivro(${
                              livro.liv_id
                            })" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            ${
                              livro.status === "disponivel"
                                ? `<button class="btn btn-success btn-sm" onclick="UI.abrirModalReserva(${livro.liv_id})" title="Reservar">
                                    <i class="fas fa-bookmark"></i>
                                </button>`
                                : `<button class="btn btn-info btn-sm" onclick="UI.liberarLivro(${livro.liv_id})" title="Liberar">
                                    <i class="fas fa-unlock"></i>
                                </button>`
                            }
                            <button class="btn btn-danger btn-sm" onclick="UI.confirmarExclusao(${
                              livro.liv_id
                            })" title="Excluir">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
      })
      .join("");
  },

  atualizarEstatisticas: () => {
    const total = livros.length;
    const disponiveis = livros.filter((l) => l.status === "disponivel").length;
    const reservados = livros.filter((l) => l.status === "reservado").length;

    document.getElementById("totalLivros").textContent = total;
    document.getElementById("livrosDisponiveis").textContent = disponiveis;
    document.getElementById("livrosReservados").textContent = reservados;
    document.getElementById("ultimaAtualizacao").textContent =
      new Date().toLocaleTimeString("pt-BR");
  },

  carregarClientesSelect: (selectId, valorSelecionado = "") => {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Selecione um cliente</option>';

    clientes.forEach((cliente) => {
      const option = document.createElement("option");
      option.value = cliente.id;
      option.textContent = `${cliente.cli_nome} (${cliente.cli_cpf})`;
      if (cliente.id == valorSelecionado) {
        option.selected = true;
      }
      select.appendChild(option);
    });
  },

  limparFormulario: () => {
    document.getElementById("formLivro").reset();
    document.getElementById("livroId").value = "";

    document.querySelectorAll("#formLivro .form-control").forEach((input) => {
      input.classList.remove("is-valid", "is-invalid");
    });
  },

  prepararModalEdicao: (livro) => {
    document.getElementById("modalLivroTitulo").innerHTML =
      '<i class="fas fa-book-edit me-2"></i>Editar Livro';
    document.getElementById("livroId").value = livro.liv_id;
    document.getElementById("liv_titulo").value = livro.liv_titulo;
    document.getElementById("liv_autor").value = livro.liv_autor;

    UI.carregarClientesSelect("cliente_id", livro.cliente_id);

    // Atualizar status baseado no cliente selecionado
    atualizarStatusBaseadoCliente();

    modoEdicao = true;
    livroEditando = livro;
  },

  prepararModalCriacao: () => {
    document.getElementById("modalLivroTitulo").innerHTML =
      '<i class="fas fa-book-plus me-2"></i>Novo Livro';
    UI.limparFormulario();
    UI.carregarClientesSelect("cliente_id");

    // Atualizar status baseado no cliente selecionado (vazio por padrão)
    atualizarStatusBaseadoCliente();

    modoEdicao = false;
    livroEditando = null;
  },

  editarLivro: async (id) => {
    try {
      const livro = await LivroService.buscarPorId(id);
      UI.prepararModalEdicao(livro);

      const modal = new bootstrap.Modal(document.getElementById("modalLivro"));
      modal.show();
    } catch (error) {
      Utils.mostrarAlerta("Erro ao carregar dados do livro");
    }
  },

  abrirModalReserva: (id) => {
    document.getElementById("livroReservarId").value = id;
    UI.carregarClientesSelect("clienteReservar");

    const modal = new bootstrap.Modal(document.getElementById("modalReservar"));
    modal.show();
  },

  confirmarExclusao: (id) => {
    const livro = livros.find((l) => l.liv_id === id);

    if (
      confirm(`Tem certeza que deseja excluir o livro "${livro.liv_titulo}"?`)
    ) {
      UI.excluirLivro(id);
    }
  },

  excluirLivro: async (id) => {
    try {
      await LivroService.deletar(id);
      Utils.mostrarAlerta("Livro excluído com sucesso!", "success");
      await carregarLivros();
    } catch (error) {
      Utils.mostrarAlerta(error.message || "Erro ao excluir livro");
    }
  },

  liberarLivro: async (id) => {
    try {
      await LivroService.atualizar(id, {
        liv_titulo: livros.find((l) => l.liv_id === id).liv_titulo,
        liv_autor: livros.find((l) => l.liv_id === id).liv_autor,
        cliente_id: null,
        status: "disponivel",
        data_reserva: null,
      });

      Utils.mostrarAlerta("Livro liberado com sucesso!", "success");
      await carregarLivros();
    } catch (error) {
      Utils.mostrarAlerta(error.message || "Erro ao liberar livro");
    }
  },
};

const filtrarLivros = () => {
  const filtroStatus = document.getElementById("filtroStatus").value;
  const busca = document.getElementById("buscaLivro").value.toLowerCase();

  livrosFiltrados = livros.filter((livro) => {
    const statusMatch = !filtroStatus || livro.status === filtroStatus;
    const buscaMatch =
      !busca ||
      livro.liv_titulo.toLowerCase().includes(busca) ||
      livro.liv_autor.toLowerCase().includes(busca);

    return statusMatch && buscaMatch;
  });

  UI.renderizarTabela();
};

const limparFiltros = () => {
  document.getElementById("filtroStatus").value = "";
  document.getElementById("buscaLivro").value = "";
  livrosFiltrados = [...livros];
  UI.renderizarTabela();
};

const carregarLivros = async () => {
  try {
    const [livrosData, clientesData] = await Promise.all([
      LivroService.listar(),
      ClienteService.listar(),
    ]);

    livros = livrosData;
    clientes = clientesData;
    livrosFiltrados = [...livros];

    UI.renderizarTabela();
    UI.atualizarEstatisticas();
  } catch (error) {
    const tbody = document.querySelector("#tabelaLivros tbody");
    tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Erro ao carregar livros
                </td>
            </tr>
        `;
    Utils.mostrarAlerta("Erro ao carregar lista de livros");
  }
};

const salvarLivro = async () => {
  if (!FormValidator.validarFormulario()) {
    return;
  }

  Utils.mostrarLoading(true);

  try {
    const dadosLivro = {
      liv_titulo: document.getElementById("liv_titulo").value.trim(),
      liv_autor: document.getElementById("liv_autor").value.trim(),
      cliente_id: document.getElementById("cliente_id").value || null,
      status: document.getElementById("status").value,
    };

    if (modoEdicao) {
      await LivroService.atualizar(livroEditando.liv_id, dadosLivro);
      Utils.mostrarAlerta("Livro atualizado com sucesso!", "success");
    } else {
      await LivroService.criar(dadosLivro);
      Utils.mostrarAlerta("Livro criado com sucesso!", "success");
    }

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("modalLivro")
    );
    modal.hide();

    await carregarLivros();
    UI.limparFormulario();
  } catch (error) {
    Utils.mostrarAlerta(error.message || "Erro ao salvar livro");
  } finally {
    Utils.mostrarLoading(false);
  }
};

const confirmarReserva = async () => {
  const livroId = document.getElementById("livroReservarId").value;
  const clienteId = document.getElementById("clienteReservar").value;

  if (!clienteId) {
    document.getElementById("clienteReservar").classList.add("is-invalid");
    Utils.mostrarAlerta("Selecione um cliente para a reserva");
    return;
  }

  try {
    await LivroService.reservar(livroId, clienteId);
    Utils.mostrarAlerta("Livro reservado com sucesso!", "success");

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("modalReservar")
    );
    modal.hide();

    await carregarLivros();
  } catch (error) {
    Utils.mostrarAlerta(error.message || "Erro ao reservar livro");
  }
};

const atualizarStatusBaseadoCliente = () => {
  const clienteSelect = document.getElementById("cliente_id");
  const statusSelect = document.getElementById("status");

  if (clienteSelect.value && clienteSelect.value !== "") {
    // Se tem cliente selecionado, status = "reservado"
    statusSelect.value = "reservado";
  } else {
    // Se não tem cliente selecionado, status = "disponivel"
    statusSelect.value = "disponivel";
  }
};

const atualizarLista = () => {
  carregarLivros();
};

document.addEventListener("DOMContentLoaded", function () {
  carregarLivros();

  // Adicionar validação em tempo real para os campos do modal de livros
  document.getElementById("liv_titulo").addEventListener("input", function (e) {
    FormValidator.validarTitulo(e.target);
  });

  document.getElementById("liv_autor").addEventListener("input", function (e) {
    FormValidator.validarAutor(e.target);
  });

  document
    .getElementById("btnSalvarLivro")
    .addEventListener("click", salvarLivro);

  document
    .getElementById("btnConfirmarReserva")
    .addEventListener("click", confirmarReserva);

  document
    .getElementById("modalLivro")
    .addEventListener("hidden.bs.modal", function () {
      UI.prepararModalCriacao();
    });

  document
    .getElementById("modalReservar")
    .addEventListener("hidden.bs.modal", function () {
      document.getElementById("formReservar").reset();
    });

  document
    .getElementById("modalLivro")
    .addEventListener("show.bs.modal", function () {
      if (!modoEdicao) {
        UI.prepararModalCriacao();
      }
    });
});
