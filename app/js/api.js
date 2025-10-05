const API_BASE_URL = "http://localhost:3000";

class ApiService {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const config = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ erro: "Erro na requisição" }));

        throw new Error(errorData.erro || `Erro HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro na requisição:", error);
      throw error;
    }
  }

  static async getClientes() {
    return this.request("/api/clientes");
  }

  static async getClientePorCpf(cpf) {
    return this.request(`/api/clientes/${cpf}`);
  }

  static async criarCliente(cliente) {
    return this.request("/api/clientes", {
      method: "POST",
      body: JSON.stringify(cliente),
    });
  }

  static async atualizarCliente(id, cliente) {
    return this.request(`/api/clientes/${id}`, {
      method: "PUT",
      body: JSON.stringify(cliente),
    });
  }

  static async deletarCliente(id) {
    return this.request(`/api/clientes/${id}`, {
      method: "DELETE",
    });
  }

  static async getLivros() {
    return this.request("/api/livros");
  }

  static async getLivrosDisponiveis() {
    return this.request("/api/livros/disponiveis");
  }

  static async getLivroPorId(id) {
    return this.request(`/api/livros/${id}`);
  }

  static async getLivrosPorCliente(clienteId) {
    return this.request(`/api/livros/cliente/${clienteId}`);
  }

  static async criarLivro(livro) {
    return this.request("/api/livros", {
      method: "POST",
      body: JSON.stringify(livro),
    });
  }

  static async atualizarLivro(id, livro) {
    return this.request(`/api/livros/${id}`, {
      method: "PUT",
      body: JSON.stringify(livro),
    });
  }

  static async reservarLivro(id, clienteId) {
    return this.request(`/api/livros/${id}/reservar`, {
      method: "POST",
      body: JSON.stringify({ cliente_id: clienteId }),
    });
  }

  static async deletarLivro(id) {
    return this.request(`/api/livros/${id}`, {
      method: "DELETE",
    });
  }
}

class MessageManager {
  static showSuccess(message) {
    this.showAlert(message, "success");
  }

  static showError(message) {
    this.showAlert(message, "danger");
  }

  static showWarning(message) {
    this.showAlert(message, "warning");
  }

  static showInfo(message) {
    this.showAlert(message, "info");
  }

  static showAlert(message, type = "info") {
    const alertContainer =
      document.getElementById("alert-container") || this.createAlertContainer();

    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

    alertContainer.appendChild(alertDiv);

    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.remove();
      }
    }, 5000);
  }

  static createAlertContainer() {
    const container = document.createElement("div");
    container.id = "alert-container";
    container.className = "position-fixed top-0 end-0 p-3";
    container.style.zIndex = "1050";
    document.body.appendChild(container);
    return container;
  }
}

class Validator {
  static validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  static validateRequired(value) {
    return value && value.trim().length > 0;
  }

  static formatCPF(cpf) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
}

class Utils {
  static formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  }

  static formatDateTime(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR");
  }

  static confirmAction(message, callback) {
    if (confirm(message)) {
      callback();
    }
  }

  static showLoading(element) {
    element.classList.add("loading");
  }

  static hideLoading(element) {
    element.classList.remove("loading");
  }
}

window.ApiService = ApiService;
window.MessageManager = MessageManager;
window.Validator = Validator;
window.Utils = Utils;
