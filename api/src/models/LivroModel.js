class LivroModelo {
  #liv_id;
  #liv_titulo;
  #liv_autor;
  #cliente_id;
  #status;
  #data_reserva;

  constructor(
    liv_id,
    liv_titulo,
    liv_autor,
    cliente_id,
    status = "disponivel",
    data_reserva = null
  ) {
    this.#liv_id = liv_id;
    this.#liv_titulo = liv_titulo;
    this.#liv_autor = liv_autor;
    this.#cliente_id = cliente_id;
    this.#status = status;
    this.#data_reserva =
      data_reserva && typeof data_reserva === "string"
        ? new Date(data_reserva)
        : data_reserva;
  }

  validar() {
    const erros = [];

    if (!this.#liv_titulo) {
      erros.push("Título é obrigatório");
    }

    if (!this.#liv_autor) {
      erros.push("Autor é obrigatório");
    }

    if (this.#liv_titulo && this.#liv_titulo.length > 255) {
      erros.push("Título deve ter no máximo 255 caracteres");
    }

    if (this.#liv_autor && this.#liv_autor.length > 255) {
      erros.push("Autor deve ter no máximo 255 caracteres");
    }

    if (this.#status && !["disponivel", "reservado"].includes(this.#status)) {
      erros.push("Status deve ser: disponivel ou reservado");
    }

    return erros;
  }

  get liv_id() {
    return this.#liv_id;
  }

  set liv_id(valor) {
    this.#liv_id = valor;
  }

  get liv_titulo() {
    return this.#liv_titulo;
  }

  set liv_titulo(valor) {
    this.#liv_titulo = valor;
  }

  get liv_autor() {
    return this.#liv_autor;
  }

  set liv_autor(valor) {
    this.#liv_autor = valor;
  }

  get cliente_id() {
    return this.#cliente_id;
  }

  set cliente_id(valor) {
    this.#cliente_id = valor;
  }

  get status() {
    return this.#status;
  }

  set status(valor) {
    this.#status = valor;
  }

  get data_reserva() {
    return this.#data_reserva;
  }

  set data_reserva(valor) {
    this.#data_reserva = valor;
  }

  toJSON() {
    return {
      liv_id: this.#liv_id,
      liv_titulo: this.#liv_titulo,
      liv_autor: this.#liv_autor,
      cliente_id: this.#cliente_id,
      status: this.#status,
      data_reserva: this.#data_reserva,
    };
  }
}

export { LivroModelo };
