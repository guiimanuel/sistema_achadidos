import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const filtros = [
  "Caderno",
  "Material escolar",
  "Utensílio pessoal",
  "Celular",
  "Garrafa",
];

export default function EditarItem({ navigation, route }) {
  const { item } = route.params || {};

  const [itemId] = useState(item?.id || item?._id || item?.key || String(Date.now()));

  const [titulo, setTitulo] = useState(item?.titulo || "");
  const [descricao, setDescricao] = useState(item?.descricao || "");
  const [imagem, setImagem] = useState(item?.imageUrl || null);
  const [filtroSelecionado, setFiltroSelecionado] = useState(
    item?.filtro || ""
  );

  useEffect(() => {
    if (route?.params?.imagemRecebida) {
      setImagem(route.params.imagemRecebida);
    }
  }, [route?.params?.imagemRecebida]);

  async function salvarEdicao() {
    try {
      if (!itemId) {
        console.log("Erro interno: ID não configurado.");
        return;
      }

      const dados = await AsyncStorage.getItem("@publicacoes");

      if (dados) {
        let lista = JSON.parse(dados);

        lista = lista.map((p) => {
          const currentId = p.id || p._id || p.key;
          return currentId === itemId
            ? {
                ...p,
                id: itemId, 
                titulo,
                descricao,
                imageUrl: imagem,
                filtro: filtroSelecionado,
              }
            : p;
        });

        await AsyncStorage.setItem("@publicacoes", JSON.stringify(lista));
      }

      
      navigation.reset({
        index: 0,
        routes: [{ name: "MinhasPublicacoes" }],
      });
    } catch (error) {
      console.log("Erro ao salvar edição:", error);
    }
  }

  async function excluirItem() {
    try {
      if (!itemId) return;

      const dados = await AsyncStorage.getItem("@publicacoes");

      if (dados) {
        let lista = JSON.parse(dados);

        lista = lista.filter((p) => {
          const currentId = p.id || p._id || p.key;
          return currentId !== itemId;
        });

        await AsyncStorage.setItem("@publicacoes", JSON.stringify(lista));
      }

      navigation.reset({
        index: 0,
        routes: [{ name: "MinhasPublicacoes" }],
      });
    } catch (error) {
      console.log("Erro ao excluir item:", error);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Editar Item</Text>
      </View>

      <View style={styles.container}>
        <Text style={styles.mainTitle}>Editar item</Text>

        {/* IMAGEM */}
        <View style={styles.imageContainer}>
          <TouchableOpacity
            style={styles.imageBox}
            onPress={() => navigation.navigate("EscolherImagemEditar")}
          >
            {imagem ? (
              <Image source={{ uri: imagem }} style={styles.preview} />
            ) : (
              <Text>+ adicionar imagem</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.changeImageButton}
            onPress={() => navigation.navigate("EscolherImagemEditar")}
          >
            <Text style={styles.changeImageText}>Mudar Imagem</Text>
          </TouchableOpacity>
        </View>

        {/* TITULO */}
        <Text style={styles.label}>Título</Text>
        <TextInput
          style={styles.input}
          value={titulo}
          onChangeText={setTitulo}
        />

        {/* DESCRIÇÃO */}
        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={descricao}
          onChangeText={setDescricao}
          multiline
        />

        {/* FILTROS */}
        <Text style={styles.label}>Filtro</Text>

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

        {/* TAG */}
        {filtroSelecionado ? (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{filtroSelecionado}</Text>
          </View>
        ) : null}

        {/* SALVAR */}
        <TouchableOpacity style={styles.btnPublish} onPress={salvarEdicao}>
          <Text style={styles.btnText}>Publicar</Text>
        </TouchableOpacity>

        {/* EXCLUIR */}
        <TouchableOpacity style={styles.btnDelete} onPress={excluirItem}>
          <Text style={styles.btnText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#009933",
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  back: {
    color: "#fff",
    fontSize: 24,
    marginRight: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "green",
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
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
  changeImageButton: {
    backgroundColor: "green",
    padding: 8,
    marginTop: 10,
    borderRadius: 5,
  },
  changeImageText: {
    color: "#fff",
    fontWeight: "bold",
  },
  label: {
    fontSize: 18,
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
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
  tag: {
    backgroundColor: "#ccc",
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginTop: 20,
    marginBottom: 30,
  },
  tagText: {
    color: "#fff",
    fontWeight: "bold",
  },
  btnPublish: {
    backgroundColor: "#009933",
    paddingVertical: 14,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 15,
  },
  btnDelete: {
    backgroundColor: "#990000",
    paddingVertical: 14,
    borderRadius: 5,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});