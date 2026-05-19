create schema achadidosdb;
use achadidosdb;

create table categoria(
	id integer primary key,
    nome varchar(30) not null
);

create table usuario(
	id integer primary key,
    nome varchar(20) not null,
    email varchar(20) not null,
    senha varchar(20) not null,
    tipo ENUM('Discente', 'Servidor')
);

create table item(
	id integer primary key,
    titulo varchar(30) not null,
    imagem varchar(255) not null,
    situacao ENUM('Perdido', 'Encontrado', 'Devolvido'),
	local varchar(50),
    descricao varchar(100),
    id_categoria integer not null,
    foreign key(id_categoria) references categoria(id),
    id_usuario integer not null,
    foreign key(id_usuario) references usuario(id)
);