import { pool } from "../config/database.js";
import { LivroDAO } from "./LivroDAO.js";

class ClienteDAO {
  #livroDAO;

  constructor() {
    this.#livroDAO = new LivroDAO();
  }

  async buscarTodos() {
    const [linhas] = await pool.execute("SELECT * FROM clientes");
    return linhas;
  }

  async buscarPorCpf(cpf) {
    const [linhas] = await pool.execute(
      "SELECT * FROM clientes WHERE cli_cpf = ?",
      [cpf]
    );

    return linhas[0] || null;
  }

  async buscarPorId(id) {
    const [linhas] = await pool.execute("SELECT * FROM clientes WHERE id = ?", [
      id,
    ]);

    return linhas[0] || null;
  }

  async criar(cliente) {
    const [resultado] = await pool.execute(
      "INSERT INTO clientes (cli_cpf, cli_nome, cli_telefone, cli_email) VALUES (?, ?, ?, ?)",
      [
        cliente.cli_cpf,
        cliente.cli_nome,
        cliente.cli_telefone,
        cliente.cli_email,
      ]
    );

    return resultado;
  }

  async atualizar(id, cliente) {
    const [resultado] = await pool.execute(
      "UPDATE clientes SET cli_cpf = ?, cli_nome = ?, cli_telefone = ?, cli_email = ? WHERE id = ?",
      [
        cliente.cli_cpf,
        cliente.cli_nome,
        cliente.cli_telefone,
        cliente.cli_email,
        id,
      ]
    );

    return resultado;
  }

  async deletar(id) {
    await this.#livroDAO.liberarLivrosDoCliente(id);

    const [resultado] = await pool.execute(
      "DELETE FROM clientes WHERE id = ?",
      [id]
    );

    return resultado;
  }

  async existe(cpf) {
    const cliente = await this.buscarPorCpf(cpf);

    return cliente !== null;
  }

  async existePorId(id) {
    const cliente = await this.buscarPorId(id);

    return cliente !== null;
  }
}

export { ClienteDAO };
