import { pool } from "../config/database.js";

class LivroDAO {
  async buscarTodos() {
    const [linhas] = await pool.execute(`
      SELECT l.*, c.cli_nome, c.cli_email 
      FROM livros l 
      LEFT JOIN clientes c ON l.cliente_id = c.id
      ORDER BY l.liv_id
    `);

    return linhas;
  }

  async buscarDisponiveis() {
    const [linhas] = await pool.execute(`
      SELECT l.*, c.cli_nome, c.cli_email 
      FROM livros l 
      LEFT JOIN clientes c ON l.cliente_id = c.id
      WHERE l.status = 'disponivel'
      ORDER BY l.liv_id
    `);

    return linhas;
  }

  async buscarPorId(id) {
    const [linhas] = await pool.execute(
      `
      SELECT l.*, c.cli_nome, c.cli_email 
      FROM livros l 
      LEFT JOIN clientes c ON l.cliente_id = c.id 
      WHERE l.liv_id = ?
    `,
      [id]
    );

    return linhas[0] || null;
  }

  async criar(livro) {
    const [resultado] = await pool.execute(
      "INSERT INTO livros (liv_titulo, liv_autor, cliente_id, status, data_reserva) VALUES (?, ?, ?, ?, ?)",
      [
        livro.liv_titulo,
        livro.liv_autor,
        livro.cliente_id,
        livro.status,
        livro.data_reserva,
      ]
    );

    return resultado;
  }

  async atualizar(id, livro) {
    const [resultado] = await pool.execute(
      "UPDATE livros SET liv_titulo = ?, liv_autor = ?, cliente_id = ?, status = ?, data_reserva = ? WHERE liv_id = ?",
      [
        livro.liv_titulo,
        livro.liv_autor,
        livro.cliente_id,
        livro.status,
        livro.data_reserva,
        id,
      ]
    );

    return resultado;
  }

  async deletar(id) {
    const [resultado] = await pool.execute(
      "DELETE FROM livros WHERE liv_id = ?",
      [id]
    );

    return resultado;
  }

  async buscarPorCliente(cliente_id) {
    const [linhas] = await pool.execute(
      `
      SELECT l.*, c.cli_nome, c.cli_email 
      FROM livros l 
      LEFT JOIN clientes c ON l.cliente_id = c.id 
      WHERE l.cliente_id = ?
    `,
      [cliente_id]
    );

    return linhas;
  }

  async reservarParaCliente(livro_id, cliente_id) {
    const [resultado] = await pool.execute(
      "UPDATE livros SET cliente_id = ?, status = 'reservado', data_reserva = NOW() WHERE liv_id = ? AND status = 'disponivel'",
      [cliente_id, livro_id]
    );

    return resultado;
  }

  async liberarLivrosDoCliente(cliente_id) {
    const [resultado] = await pool.execute(
      "UPDATE livros SET cliente_id = NULL, status = 'disponivel', data_reserva = NULL WHERE cliente_id = ? AND status = 'reservado'",
      [cliente_id]
    );

    return resultado;
  }

  async existe(id) {
    const livro = await this.buscarPorId(id);

    return livro !== null;
  }
}

export { LivroDAO };
