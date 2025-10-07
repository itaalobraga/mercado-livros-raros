const API_URL = "http://localhost:3000/api";

let clientes = [];
let modoEdicao = false;
let clienteEditando = null;

const Utils = {
  formatarCPF: (cpf) => {
    return cpf
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  },

  validarCPF: (cpf) => {
    cpf = cpf.replace(/\D/g, "");
    if (cpf.length !== 11) return false;

    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;

    return true;
  },

  formatarTelefone: (telefone) => {
    const numeros = telefone.replace(/\D/g, "");
    if (numeros.length === 11) {
      return numeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (numeros.length === 10) {
      return numeros.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return telefone;
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
    const btnSalvar = document.getElementById("btnSalvarCliente");

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

  buscarPorId: async (id) => {
    try {
      const response = await fetch(`${API_URL}/clientes/id/${id}`);
      if (!response.ok) throw new Error("Erro ao buscar cliente");
      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
      throw error;
    }
  },

  criar: async (dadosCliente) => {
    try {
      const response = await fetch(`${API_URL}/clientes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosCliente),
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.erro || "Erro ao criar cliente");
      }

      return resultado;
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      throw error;
    }
  },

  atualizar: async (id, dadosCliente) => {
    try {
      const response = await fetch(`${API_URL}/clientes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosCliente),
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.erro || "Erro ao atualizar cliente");
      }

      return resultado;
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      throw error;
    }
  },

  deletar: async (id) => {
    try {
      const response = await fetch(`${API_URL}/clientes/${id}`, {
        method: "DELETE",
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.erro || "Erro ao deletar cliente");
      }

      return resultado;
    } catch (error) {
      console.error("Erro ao deletar cliente:", error);
      throw error;
    }
  },
};

const FormValidator = {
  validarCPF: (input) => {
    const cpf = input.value.replace(/\D/g, "");
    const isValid = Utils.validarCPF(cpf);

    if (!isValid && cpf.length > 0) {
      input.classList.add("is-invalid");
      input.classList.remove("is-valid");
      input.nextElementSibling.textContent = "CPF inválido";
      return false;
    } else if (cpf.length === 0) {
      input.classList.add("is-invalid");
      input.classList.remove("is-valid");
      input.nextElementSibling.textContent = "CPF é obrigatório";
      return false;
    } else {
      input.classList.remove("is-invalid");
      input.classList.add("is-valid");
      return true;
    }
  },

  validarNome: (input) => {
    const nome = input.value.trim();

    if (nome.length < 2) {
      input.classList.add("is-invalid");
      input.classList.remove("is-valid");
      input.nextElementSibling.textContent =
        "Nome deve ter pelo menos 2 caracteres";
      return false;
    } else {
      input.classList.remove("is-invalid");
      input.classList.add("is-valid");
      return true;
    }
  },

  validarTelefone: (input) => {
    const telefone = input.value.replace(/\D/g, "");

    if (telefone.length < 11) {
      input.classList.add("is-invalid");
      input.classList.remove("is-valid");
      input.nextElementSibling.textContent = "Telefone deve ter 11 dígitos";
      return false;
    } else {
      input.classList.remove("is-invalid");
      input.classList.add("is-valid");
      return true;
    }
  },

  validarEmail: (input) => {
    const email = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      input.classList.add("is-invalid");
      input.classList.remove("is-valid");
      input.nextElementSibling.textContent = "Email inválido";
      return false;
    } else {
      input.classList.remove("is-invalid");
      input.classList.add("is-valid");
      return true;
    }
  },

  validarFormulario: () => {
    const cpf = document.getElementById("cli_cpf");
    const nome = document.getElementById("cli_nome");
    const telefone = document.getElementById("cli_telefone");
    const email = document.getElementById("cli_email");

    const cpfValido = FormValidator.validarCPF(cpf);
    const nomeValido = FormValidator.validarNome(nome);
    const telefoneValido = FormValidator.validarTelefone(telefone);
    const emailValido = FormValidator.validarEmail(email);

    return cpfValido && nomeValido && telefoneValido && emailValido;
  },
};

const UI = {
  renderizarTabela: () => {
    const tbody = document.querySelector("#tabelaClientes tbody");

    if (clientes.length === 0) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="no-data">
                        <i class="fas fa-users"></i>
                        <p>Nenhum cliente cadastrado</p>
                    </td>
                </tr>
            `;
      return;
    }

    tbody.innerHTML = clientes
      .map(
        (cliente) => `
            <tr>
                <td>${cliente.id}</td>
                <td>${Utils.formatarCPF(cliente.cli_cpf)}</td>
                <td>${cliente.cli_nome}</td>
                <td>${Utils.formatarTelefone(cliente.cli_telefone)}</td>
                <td>${cliente.cli_email}</td>
                <td>
                    <div class="btn-group-custom">
                        <button class="btn btn-warning btn-sm" onclick="UI.editarCliente(${
                          cliente.id
                        })" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="UI.confirmarExclusao(${
                          cliente.id
                        })" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `
      )
      .join("");
  },

  atualizarEstatisticas: () => {
    document.getElementById("totalClientes").textContent = clientes.length;
    document.getElementById("clientesAtivos").textContent = clientes.length;
    document.getElementById("ultimaAtualizacao").textContent =
      new Date().toLocaleTimeString("pt-BR");
  },

  limparFormulario: () => {
    document.getElementById("formCliente").reset();
    document.getElementById("clienteId").value = "";

    document.querySelectorAll("#formCliente .form-control").forEach((input) => {
      input.classList.remove("is-valid", "is-invalid");
    });
  },

  prepararModalEdicao: (cliente) => {
    document.getElementById("modalClienteTitulo").innerHTML =
      '<i class="fas fa-user-edit me-2"></i>Editar Cliente';
    document.getElementById("clienteId").value = cliente.id;
    document.getElementById("cli_cpf").value = Utils.formatarCPF(
      cliente.cli_cpf
    );
    document.getElementById("cli_nome").value = cliente.cli_nome;
    document.getElementById("cli_telefone").value = Utils.formatarTelefone(
      cliente.cli_telefone
    );
    document.getElementById("cli_email").value = cliente.cli_email;

    modoEdicao = true;
    clienteEditando = cliente;
  },

  prepararModalCriacao: () => {
    document.getElementById("modalClienteTitulo").innerHTML =
      '<i class="fas fa-user-plus me-2"></i>Novo Cliente';
    UI.limparFormulario();

    modoEdicao = false;
    clienteEditando = null;
  },

  editarCliente: async (id) => {
    try {
      const cliente = await ClienteService.buscarPorId(id);
      UI.prepararModalEdicao(cliente);

      const modal = new bootstrap.Modal(
        document.getElementById("modalCliente")
      );
      modal.show();
    } catch (error) {
      Utils.mostrarAlerta("Erro ao carregar dados do cliente");
    }
  },

  confirmarExclusao: (id) => {
    const cliente = clientes.find((c) => c.id === id);

    if (
      confirm(`Tem certeza que deseja excluir o cliente "${cliente.cli_nome}"?`)
    ) {
      UI.excluirCliente(id);
    }
  },

  excluirCliente: async (id) => {
    try {
      await ClienteService.deletar(id);
      Utils.mostrarAlerta("Cliente excluído com sucesso!", "success");
      await carregarClientes();
    } catch (error) {
      Utils.mostrarAlerta(error.message || "Erro ao excluir cliente");
    }
  },
};

const carregarClientes = async () => {
  try {
    clientes = await ClienteService.listar();
    UI.renderizarTabela();
    UI.atualizarEstatisticas();
  } catch (error) {
    const tbody = document.querySelector("#tabelaClientes tbody");
    tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Erro ao carregar clientes
                </td>
            </tr>
        `;
    Utils.mostrarAlerta("Erro ao carregar lista de clientes");
  }
};

const salvarCliente = async () => {
  if (!FormValidator.validarFormulario()) {
    return;
  }

  Utils.mostrarLoading(true);

  try {
    const dadosCliente = {
      cli_cpf: document.getElementById("cli_cpf").value.replace(/\D/g, ""),
      cli_nome: document.getElementById("cli_nome").value.trim(),
      cli_telefone: document
        .getElementById("cli_telefone")
        .value.replace(/\D/g, ""),
      cli_email: document.getElementById("cli_email").value.trim(),
    };

    if (modoEdicao) {
      await ClienteService.atualizar(clienteEditando.id, dadosCliente);
      Utils.mostrarAlerta("Cliente atualizado com sucesso!", "success");
    } else {
      await ClienteService.criar(dadosCliente);
      Utils.mostrarAlerta("Cliente criado com sucesso!", "success");
    }

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("modalCliente")
    );

    modal.hide();

    await carregarClientes();
    UI.limparFormulario();
  } catch (error) {
    Utils.mostrarAlerta(error.message || "Erro ao salvar cliente");
  } finally {
    Utils.mostrarLoading(false);
  }
};

const atualizarLista = () => {
  carregarClientes();
};

document.addEventListener("DOMContentLoaded", function () {
  carregarClientes();

  document.getElementById("cli_cpf").addEventListener("input", function (e) {
    const valor = e.target.value.replace(/\D/g, "");
    let cpfFormatado = valor;

    if (valor.length >= 4) {
      cpfFormatado = valor.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        "$1.$2.$3-$4"
      );
    } else if (valor.length >= 7) {
      cpfFormatado = valor.replace(/(\d{3})(\d{3})(\d{3})/, "$1.$2.$3");
    } else if (valor.length >= 4) {
      cpfFormatado = valor.replace(/(\d{3})(\d{3})/, "$1.$2");
    } else if (valor.length >= 1) {
      cpfFormatado = valor.replace(/(\d{3})/, "$1");
    }

    e.target.value = cpfFormatado;
    FormValidator.validarCPF(e.target);
  });

  document
    .getElementById("cli_telefone")
    .addEventListener("input", function (e) {
      const valor = e.target.value.replace(/\D/g, "");
      let telefoneFormatado = valor;

      if (valor.length >= 11) {
        telefoneFormatado = valor.replace(
          /(\d{2})(\d{5})(\d{4})/,
          "($1) $2-$3"
        );
      } else if (valor.length >= 7) {
        telefoneFormatado = valor.replace(
          /(\d{2})(\d{4})(\d{4})/,
          "($1) $2-$3"
        );
      } else if (valor.length >= 3) {
        telefoneFormatado = valor.replace(/(\d{2})(\d{4})/, "($1) $2");
      } else if (valor.length >= 1) {
        telefoneFormatado = valor.replace(/(\d{2})/, "($1");
      }

      e.target.value = telefoneFormatado;
      FormValidator.validarTelefone(e.target);
    });

  // Adicionar validação em tempo real para nome e email
  document.getElementById("cli_nome").addEventListener("input", function (e) {
    FormValidator.validarNome(e.target);
  });

  document.getElementById("cli_email").addEventListener("input", function (e) {
    FormValidator.validarEmail(e.target);
  });

  document
    .getElementById("btnSalvarCliente")
    .addEventListener("click", salvarCliente);

  document
    .getElementById("modalCliente")
    .addEventListener("hidden.bs.modal", function () {
      UI.prepararModalCriacao();
    });

  document
    .getElementById("modalCliente")
    .addEventListener("show.bs.modal", function () {
      if (!modoEdicao) {
        UI.prepararModalCriacao();
      }
    });
});
