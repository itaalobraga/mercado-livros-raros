import { ClienteModelo } from "../models/ClienteModel.js";
import { ClienteDAO } from "../daos/ClienteDAO.js";

class ClienteController {
  #clienteDAO;

  constructor() {
    this.#clienteDAO = new ClienteDAO();
  }

  async listar(req, res) {
    try {
      const clientes = await this.#clienteDAO.buscarTodos();

      res.json(clientes);
    } catch (erro) {
      res.status(500).json({ erro: "Erro ao buscar clientes" });
    }
  }

  async buscarPorCpf(req, res) {
    try {
      const { cpf } = req.params;

      const cliente = await this.#clienteDAO.buscarPorCpf(cpf);

      if (!cliente) {
        return res.status(404).json({ erro: "Cliente não encontrado" });
      }

      res.json(cliente);
    } catch (erro) {
      res.status(500).json({ erro: "Erro ao buscar cliente" });
    }
  }

  async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const cliente = await this.#clienteDAO.buscarPorId(id);

      if (!cliente) {
        return res.status(404).json({ erro: "Cliente não encontrado" });
      }

      res.json(cliente);
    } catch (erro) {
      res.status(500).json({ erro: "Erro ao buscar cliente" });
    }
  }

  async criar(req, res) {
    try {
      const { cli_cpf, cli_nome, cli_telefone, cli_email } = req.body;

      const cliente = new ClienteModelo(
        cli_cpf,
        cli_nome,
        cli_telefone,
        cli_email
      );

      const erros = cliente.validar();

      if (erros.length > 0) {
        return res.status(400).json({ erro: erros.join(", ") });
      }

      const clienteExistente = await this.#clienteDAO.existe(cli_cpf);

      if (clienteExistente) {
        return res.status(409).json({ erro: "Cliente com este CPF já existe" });
      }

      await this.#clienteDAO.criar(cliente);

      res.status(201).json({ mensagem: "Cliente criado com sucesso" });
    } catch (erro) {
      res.status(500).json({ erro: "Erro ao criar cliente" });
    }
  }

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { cli_cpf, cli_nome, cli_telefone, cli_email } = req.body;

      const clienteExistente = await this.#clienteDAO.buscarPorId(id);

      if (!clienteExistente) {
        return res.status(404).json({ erro: "Cliente não encontrado" });
      }

      const novoCpf = cli_cpf || clienteExistente.cli_cpf;

      if (novoCpf !== clienteExistente.cli_cpf) {
        const clienteComNovoCpf = await this.#clienteDAO.buscarPorCpf(novoCpf);
        if (clienteComNovoCpf) {
          return res
            .status(409)
            .json({ erro: "Cliente com este CPF já existe" });
        }
      }

      const cliente = new ClienteModelo(
        novoCpf,
        cli_nome,
        cli_telefone,
        cli_email
      );

      const erros = cliente.validar();

      if (erros.length > 0) {
        return res.status(400).json({ erro: erros.join(", ") });
      }

      const resultado = await this.#clienteDAO.atualizar(id, cliente);

      if (resultado.affectedRows === 0) {
        return res.status(404).json({ erro: "Cliente não encontrado" });
      }

      res.json({ mensagem: "Cliente atualizado com sucesso" });
    } catch (erro) {
      res.status(500).json({ erro: "Erro ao atualizar cliente" });
    }
  }

  async deletar(req, res) {
    try {
      const { id } = req.params;

      const resultado = await this.#clienteDAO.deletar(id);

      if (resultado.affectedRows === 0) {
        return res.status(404).json({ erro: "Cliente não encontrado" });
      }

      res.json({ mensagem: "Cliente deletado com sucesso" });
    } catch (erro) {
      res.status(500).json({ erro: "Erro ao deletar cliente" });
    }
  }
}

export { ClienteController };
