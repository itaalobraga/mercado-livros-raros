CREATE DATABASE IF NOT EXISTS mercado_livros_raros;

USE mercado_livros_raros;

CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cli_cpf VARCHAR(14) UNIQUE NOT NULL,
    cli_nome VARCHAR(255) NOT NULL,
    cli_telefone VARCHAR(20),
    cli_email VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS livros (
    liv_id INT AUTO_INCREMENT PRIMARY KEY,
    liv_titulo VARCHAR(255) NOT NULL,
    liv_autor VARCHAR(255) NOT NULL,
    cliente_id INT,
    status ENUM('disponivel', 'reservado') DEFAULT 'disponivel',
    data_reserva TIMESTAMP NULL,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
);