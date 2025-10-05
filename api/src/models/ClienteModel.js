import { cpf } from "cpf-cnpj-validator";

class ClienteModelo {
  #cli_cpf;
  #cli_nome;
  #cli_telefone;
  #cli_email;

  constructor(cli_cpf, cli_nome, cli_telefone, cli_email) {
    this.#cli_cpf = cli_cpf;
    this.#cli_nome = cli_nome;
    this.#cli_telefone = cli_telefone;
    this.#cli_email = cli_email;
  }

  validar() {
    const erros = [];

    if (!this.#cli_cpf) {
      erros.push("CPF é obrigatório");
    }

    if (!this.#cli_nome) {
      erros.push("Nome é obrigatório");
    }

    if (this.#cli_cpf && !cpf.isValid(this.#cli_cpf)) {
      erros.push("CPF inválido");
    }

    if (this.#cli_email && !this.validarEmail(this.#cli_email)) {
      erros.push("Email inválido");
    }

    return erros;
  }

  validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  get cli_cpf() {
    return this.#cli_cpf;
  }

  set cli_cpf(valor) {
    this.#cli_cpf = valor;
  }

  get cli_nome() {
    return this.#cli_nome;
  }

  set cli_nome(valor) {
    this.#cli_nome = valor;
  }

  get cli_telefone() {
    return this.#cli_telefone;
  }

  set cli_telefone(valor) {
    this.#cli_telefone = valor;
  }

  get cli_email() {
    return this.#cli_email;
  }

  set cli_email(valor) {
    this.#cli_email = valor;
  }

  toJSON() {
    return {
      cli_cpf: this.#cli_cpf,
      cli_nome: this.#cli_nome,
      cli_telefone: this.#cli_telefone,
      cli_email: this.#cli_email,
    };
  }
}

export { ClienteModelo };
