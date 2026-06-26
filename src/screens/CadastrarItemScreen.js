import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
} from "react-native";

const filtros = [
  "Caderno",
  "Material escolar",
  "Utensílio pessoal",
  "Celular",
  "Garrafa",
];

export default function CadastrarItem({ navigation, route }) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [filtroSelecionado, setFiltroSelecionado] = useState("");

  const imagemRecebida = route?.params?.imagemRecebida;

  function publicar() {
    const novaPublicacao = {
      id: Date.now().toString(),
      titulo,
      descricao,
      filtro: filtroSelecionado,
      imageUrl: imagemRecebida || null,
      createdAt: new Date(),
    };

    navigation.navigate("MinhasPublicacoes", {
      novaPublicacao,
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Cadastrar Item</Text>

      <Text style={styles.title}>Adicionar item</Text>

      <TouchableOpacity
        style={styles.imageBox}
        onPress={() => navigation.navigate("EscolherImagem")}
      >
        {imagemRecebida ? (
          <Image source={{ uri: imagemRecebida }} style={styles.preview} />
        ) : (
          <Text>+ adicionar imagem</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.filterTitle}>Filtro</Text>

      <View style={styles.filterContainer}>
        {filtros.map((filtro) => (
          <TouchableOpacity
            key={filtro}
            style={[
              styles.filterButton,
              filtroSelecionado === filtro && styles.filterSelected,
            ]}
            onPress={() => setFiltroSelecionado(filtro)}
          >
            <Text>{filtro}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        placeholder="Adicionar Título..."
        style={styles.input}
        value={titulo}
        onChangeText={setTitulo}
      />

      <TextInput
        placeholder="Adicionar Descrição..."
        style={styles.input}
        value={descricao}
        onChangeText={setDescricao}
      />

      {filtroSelecionado ? (
        <View style={styles.tag}>
          <Text>{filtroSelecionado}</Text>
        </View>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={publicar}>
        <Text style={{ color: "#fff" }}>Publicar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: {
    backgroundColor: "green",
    color: "#fff",
    padding: 15,
    textAlign: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "green",
    marginVertical: 20,
  },
  imageBox: {
    width: "100%",
    height: 150,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  preview: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  filterTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "green",
    marginTop: 20,
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 20,
  },
  filterButton: {
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 8,
  },
  filterSelected: {
    borderWidth: 2,
    borderColor: "green",
  },
  input: {
    borderWidth: 1,
    marginTop: 20,
    padding: 10,
  },
  tag: {
    backgroundColor: "#ddd",
    padding: 10,
    alignSelf: "flex-start",
    marginTop: 20,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "green",
    padding: 15,
    alignItems: "center",
    marginTop: 30,
  },
});