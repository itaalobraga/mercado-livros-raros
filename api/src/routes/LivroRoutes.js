import express from "express";
import { LivroController } from "../controllers/LivroController.js";

const livroRotas = express.Router();
const livroController = new LivroController();

livroRotas.get("/", (req, res) => livroController.listar(req, res));
livroRotas.get("/disponiveis", (req, res) =>
  livroController.buscarDisponiveis(req, res)
);
livroRotas.get("/cliente/:id", (req, res) =>
  livroController.buscarPorCliente(req, res)
);
livroRotas.get("/:id", (req, res) => livroController.buscarPorId(req, res));
livroRotas.post("/", (req, res) => livroController.criar(req, res));
livroRotas.post("/:id/reservar", (req, res) =>
  livroController.reservarLivro(req, res)
);
livroRotas.put("/:id", (req, res) => livroController.atualizar(req, res));
livroRotas.delete("/:id", (req, res) => livroController.deletar(req, res));

export { livroRotas };
