import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

const PORTA = 3030;
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: "mercado-livros-raros-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 3600000,
      httpOnly: true,
    },
  })
);

app.post("/login", (request, response) => {
  const { username, password } = request.body;

  const eUsuarioValido = username === "admin" && password === "admin";

  if (eUsuarioValido) {
    request.session.autenticado = true;
    request.session.usuario = {
      nome: "Administrador",
      username: "admin",
    };

    response.redirect("/painel/admin");

    return;
  }
});

app.get("/logout", (request, response) => {
  request.session.destroy((err) => {
    if (err) {
      console.error("Ocorreu um erro ao deslogar:", err);
    }
    response.redirect("/login.html");
  });
});

app.get("/home", (request, response) => {
  if (request.session.autenticado) {
    response.redirect("/painel/admin");
  } else {
    response.redirect("/");
  }
});

app.use(express.static(path.join(__dirname, "rotas/publicas")));

app.use((req, res, next) => {
  if (req.session && req.session.autenticado) {
    next();

    return;
  }

  res.redirect("/login.html");
}, express.static(path.join(__dirname, "rotas/privadas")));

app.listen(PORTA, () => {
  console.log(`Frontend rodando em http://localhost:${PORTA}`);
});
