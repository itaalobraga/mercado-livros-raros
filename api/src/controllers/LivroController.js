import { LivroModelo } from "../models/LivroModel.js";
import { LivroDAO } from "../daos/LivroDAO.js";
import { ClienteDAO } from "../daos/ClienteDAO.js";

class LivroController {
  #livroDAO;
  #clienteDAO;

  constructor() {
    this.#livroDAO = new LivroDAO();
    this.#clienteDAO = new ClienteDAO();
  }

  async listar(req, res) {
    try {
      const livros = await this.#livroDAO.buscarTodos();

      res.json(livros);
    } catch (erro) {
      res.status(500).json({ erro: "Erro ao buscar livros" });
    }
  }

  async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const livro = await this.#livroDAO.buscarPorId(id);

      if (!livro) {
        return res.status(404).json({ erro: "Livro não encontrado" });
      }

      res.json(livro);
    } catch (erro) {
      res.status(500).json({ erro: "Erro ao buscar livro" });
    }
  }

  async criar(req, res) {
    try {
      const {
        liv_titulo,
        liv_autor,
        cliente_id,
        status = "disponivel",
      } = req.body;

      const data_reserva = cliente_id ? new Date() : null;
      const statusFinal = cliente_id ? "reservado" : status;

      const livro = new LivroModelo(
        null,
        liv_titulo,
        liv_autor,
        cliente_id,
        statusFinal,
        data_reserva
      );

      const erros = livro.validar();

      if (erros.length > 0) {
        return res.status(400).json({ erro: erros.join(", ") });
      }

      if (cliente_id) {
        const clienteExiste = await this.#clienteDAO.existePorId(cliente_id);

        if (!clienteExiste) {
          return res.status(404).json({ erro: "Cliente não encontrado" });
        }
      }

      await this.#livroDAO.criar(livro);
      res.status(201).json({ mensagem: "Livro criado com sucesso" });
    } catch (erro) {
      res.status(500).json({ erro: "Erro ao criar livro" });
    }
  }

  async atualizar(req, res) {
    try {
      const { id } = req.params;

      const { liv_titulo, liv_autor, cliente_id, status, data_reserva } =
        req.body;

      const livroExistente = await this.#livroDAO.buscarPorId(id);

      if (!livroExistente) {
        return res.status(404).json({ erro: "Livro não encontrado" });
      }

      const statusFinal = status !== undefined ? status : livroExistente.status;
      const dataReservaFinal =
        data_reserva !== undefined ? data_reserva : livroExistente.data_reserva;

      const livro = new LivroModelo(
        id,
        liv_titulo,
        liv_autor,
        cliente_id,
        statusFinal,
        dataReservaFinal
      );

      const erros = livro.validar();

      if (erros.length > 0) {
        return res.status(400).json({ erro: erros.join(", ") });
      }

      if (cliente_id) {
        const clienteExiste = await this.#clienteDAO.existePorId(cliente_id);

        if (!clienteExiste) {
          return res.status(404).json({ erro: "Cliente não encontrado" });
        }
      }

      const resultado = await this.#livroDAO.atualizar(id, livro);

      if (resultado.affectedRows === 0) {
        return res.status(404).json({ erro: "Livro não encontrado" });
      }

      res.json({ mensagem: "Livro atualizado com sucesso" });
    } catch (erro) {
      res.status(500).json({ erro: "Erro ao atualizar livro" });
    }
  }

  async deletar(req, res) {
    try {
      const { id } = req.params;

      const resultado = await this.#livroDAO.deletar(id);

      if (resultado.affectedRows === 0) {
        return res.status(404).json({ erro: "Livro não encontrado" });
      }

      res.json({ mensagem: "Livro deletado com sucesso" });
    } catch (erro) {
      res.status(500).json({ erro: "Erro ao deletar livro" });
    }
  }

  async buscarPorCliente(req, res) {
    try {
      const { id } = req.params;

      const clienteExiste = await this.#clienteDAO.existePorId(id);

      if (!clienteExiste) {
        return res.status(404).json({ erro: "Cliente não encontrado" });
      }

      const livros = await this.#livroDAO.buscarPorCliente(id);

      res.json(livros);
    } catch (erro) {
      res.status(500).json({ erro: "Erro ao buscar livros do cliente" });
    }
  }

  async buscarDisponiveis(req, res) {
    try {
      const livros = await this.#livroDAO.buscarDisponiveis();

      res.json(livros);
    } catch (erro) {
      res.status(500).json({ erro: "Erro ao buscar livros disponíveis" });
    }
  }

  async reservarLivro(req, res) {
    try {
      const { id } = req.params;
      const { cliente_id } = req.body;

      if (!cliente_id) {
        return res.status(400).json({ erro: "ID do cliente é obrigatório" });
      }

      const clienteExiste = await this.#clienteDAO.existePorId(cliente_id);

      if (!clienteExiste) {
        return res.status(404).json({ erro: "Cliente não encontrado" });
      }

      const resultado = await this.#livroDAO.reservarParaCliente(
        id,
        cliente_id
      );

      if (resultado.affectedRows === 0) {
        return res
          .status(400)
          .json({ erro: "Livro não está disponível para reserva" });
      }

      res.json({ mensagem: "Livro reservado com sucesso" });
    } catch (erro) {
      res.status(500).json({ erro: "Erro ao reservar livro" });
    }
  }
}

export { LivroController };
