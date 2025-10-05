import express from "express";
import { ClienteController } from "../controllers/ClienteController.js";

const clienteRotas = express.Router();
const clienteController = new ClienteController();

clienteRotas.get("/", (req, res) => clienteController.listar(req, res));
clienteRotas.get("/:cpf", (req, res) =>
  clienteController.buscarPorCpf(req, res)
);
clienteRotas.get("/id/:id", (req, res) =>
  clienteController.buscarPorId(req, res)
);
clienteRotas.post("/", (req, res) => clienteController.criar(req, res));
clienteRotas.put("/:id", (req, res) => clienteController.atualizar(req, res));
clienteRotas.delete("/:id", (req, res) => clienteController.deletar(req, res));

export { clienteRotas };
