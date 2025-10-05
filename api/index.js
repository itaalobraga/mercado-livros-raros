import express from "express";
import { inicializarBancoDados } from "./src/config/database.js";
import { clienteRotas } from "./src/routes/ClienteRoutes.js";
import { livroRotas } from "./src/routes/LivroRoutes.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORTA = 3000;
const app = express();

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "../app")));

app.use("/api/clientes", clienteRotas);
app.use("/api/livros", livroRotas);

const iniciarServidor = async () => {
  try {
    await inicializarBancoDados();

    app.listen(PORTA, () => {
      console.log(`Backend rodando em http://localhost:${PORTA}/api`);
      console.log(`Frontend disponível em: http://localhost:${PORTA}`);
    });
  } catch (erro) {
    console.error("Erro ao iniciar servidor:", erro);

    process.exit(1);
  }
};

iniciarServidor();
