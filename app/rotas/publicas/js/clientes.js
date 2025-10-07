const API_URL = "http://localhost:3000/api";

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

  validarEmail: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
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
    const btnSubmit = document.getElementById("btnSubmit");
    const btnText = document.getElementById("btnText");
    const btnSpinner = document.getElementById("btnSpinner");

    if (loading) {
      btnSubmit.disabled = true;
      btnText.classList.add("d-none");
      btnSpinner.classList.remove("d-none");
    } else {
      btnSubmit.disabled = false;
      btnText.classList.remove("d-none");
      btnSpinner.classList.add("d-none");
    }
  },
};

const ClienteService = {
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
};

const FormValidator = {
  validarCPF: (input) => {
    const cpf = input.value.replace(/\D/g, "");
    const isValid = Utils.validarCPF(cpf);

    if (!isValid && cpf.length > 0) {
      input.classList.add("is-invalid");
      input.nextElementSibling.textContent = "CPF inválido";
      return false;
    } else if (cpf.length === 0) {
      input.classList.add("is-invalid");
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

    if (!Utils.validarEmail(email)) {
      input.classList.add("is-invalid");
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

document.addEventListener("DOMContentLoaded", function () {
  const formCliente = document.getElementById("formCliente");
  const inputCPF = document.getElementById("cli_cpf");
  const inputTelefone = document.getElementById("cli_telefone");

  inputCPF.addEventListener("input", function (e) {
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

  inputTelefone.addEventListener("input", function (e) {
    const valor = e.target.value.replace(/\D/g, "");
    let telefoneFormatado = valor;

    if (valor.length >= 11) {
      telefoneFormatado = valor.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (valor.length >= 7) {
      telefoneFormatado = valor.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    } else if (valor.length >= 3) {
      telefoneFormatado = valor.replace(/(\d{2})(\d{4})/, "($1) $2");
    } else if (valor.length >= 1) {
      telefoneFormatado = valor.replace(/(\d{2})/, "($1");
    }

    e.target.value = telefoneFormatado;

    FormValidator.validarTelefone(e.target);
  });

  const inputNome = document.getElementById("cli_nome");
  const inputEmail = document.getElementById("cli_email");

  inputNome.addEventListener("input", function (e) {
    FormValidator.validarNome(e.target);
  });

  inputEmail.addEventListener("input", function (e) {
    FormValidator.validarEmail(e.target);
  });

  formCliente.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!FormValidator.validarFormulario()) {
      Utils.mostrarAlerta("Por favor, corrija os erros no formulário.");
      return;
    }

    Utils.mostrarLoading(true);

    try {
      const dadosCliente = {
        cli_cpf: inputCPF.value.replace(/\D/g, ""),
        cli_nome: inputNome.value.trim(),
        cli_telefone: inputTelefone.value.replace(/\D/g, ""),
        cli_email: inputEmail.value.trim(),
      };

      const resultado = await ClienteService.criar(dadosCliente);

      Utils.mostrarAlerta(
        "Parabéns! Você foi cadastrado com sucesso na nossa fila de espera. " +
          "Em breve entraremos em contato quando houver livros raros disponíveis.",
        "success"
      );

      formCliente.reset();

      document.querySelectorAll(".form-control").forEach((input) => {
        input.classList.remove("is-valid", "is-invalid");
      });
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);

      let mensagemErro = "Erro ao processar cadastro. Tente novamente.";

      if (error.message.includes("CPF já existe")) {
        mensagemErro = "Este CPF já está cadastrado em nossa fila de espera.";
      } else if (error.message.includes("Email")) {
        mensagemErro = "Este email já está sendo utilizado.";
      } else if (error.message) {
        mensagemErro = error.message;
      }

      Utils.mostrarAlerta(mensagemErro);
    } finally {
      Utils.mostrarLoading(false);
    }
  });

  inputCPF.focus();
});
