import mysql from "mysql2/promise";

const configuracaoBanco = {
  host: "localhost",
  user: "root",
  password: "root",
  database: "mercado_livros_raros",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "-03:00",
};

const pool = mysql.createPool(configuracaoBanco);

const inicializarBancoDados = async () => {
  try {
    const conexao = await mysql.createConnection({
      host: configuracaoBanco.host,
      user: configuracaoBanco.user,
      password: configuracaoBanco.password,
    });

    await conexao.execute(
      `CREATE DATABASE IF NOT EXISTS ${configuracaoBanco.database}`
    );

    await conexao.end();

    console.log("Banco de dados inicializado com sucesso!");
  } catch (erro) {
    console.error("Erro ao inicializar banco de dados:", erro);

    throw erro;
  }
};

export { pool, inicializarBancoDados };
