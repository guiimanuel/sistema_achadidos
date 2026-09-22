import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { atualizarPublicacao, excluirPublicacao } from "../services/publicacoes.js";
import { colors } from "../styles/colors.js";

const filtros = ["Caderno", "Material escolar", "Utensílio pessoal", "Celular", "Garrafa"];

function EditarItem({ navigation, route }) {
  const { item } = route.params || {};

  const [titulo, setTitulo] = useState(item?.titulo || item?.title || "");
  const [descricao, setDescricao] = useState(item?.descricao || item?.description || "");
  const [imagem, setImagem] = useState(item?.imageUrl || "");
  const [filtroSelecionado, setFiltroSelecionado] = useState(
    item?.filtro || item?.category || ""
  );
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    if (route?.params?.imagemRecebida) {
      setImagem(route.params.imagemRecebida);
    }
  }, [route?.params?.imagemRecebida]);

  async function salvarEdicao() {
    if (!item) {
      Alert.alert("Erro", "Publicação não encontrada.");
      return;
    }

    if (!titulo.trim()) {
      Alert.alert("Título obrigatório", "Informe um título para a publicação.");
      return;
    }

    if (!filtroSelecionado) {
      Alert.alert("Filtro obrigatório", "Escolha uma categoria para a publicação.");
      return;
    }

    try {
      setSalvando(true);
      await atualizarPublicacao(item, {
        titulo,
        descricao,
        filtro: filtroSelecionado,
        imagem,
      });

      navigation.navigate("Home");
    } catch (error) {
      console.log("Erro ao salvar edição:", error);
      Alert.alert("Erro ao salvar", error.message || "Não foi possível salvar a edição.");
    } finally {
      setSalvando(false);
    }
  }

  function confirmarExclusao() {
    Alert.alert("Excluir publicação", "Esta ação não pode ser desfeita.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: excluirItem },
    ]);
  }

  async function excluirItem() {
    if (!item) {
      Alert.alert("Erro", "Publicação não encontrada.");
      return;
    }

    try {
      setExcluindo(true);
      await excluirPublicacao(item);
      navigation.navigate("Home");
    } catch (error) {
      console.log("Erro ao excluir item:", error);
      Alert.alert("Erro ao excluir", error.message || "Não foi possível excluir a publicação.");
    } finally {
      setExcluindo(false);
    }
  }

  const desabilitado = salvando || excluindo;

  return (
    <KeyboardAvoidingView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={desabilitado}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Editar Item</Text>
      </View>

      <View style={styles.container}>
        <Text style={styles.mainTitle}>Editar item</Text>

        <View style={styles.imageContainer}>
          <TouchableOpacity
            style={styles.imageBox}
            onPress={() => navigation.navigate("EscolherImagem", { origem: "EditarItem" })}
            disabled={desabilitado}
          >
            {imagem ? (
              <Image source={{ uri: imagem }} style={styles.preview} />
            ) : (
              <Text>+ adicionar imagem</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.changeImageButton}
            onPress={() => navigation.navigate("EscolherImagem", { origem: "EditarItem" })}
            disabled={desabilitado}
          >
            <Text style={styles.changeImageText}>Mudar Imagem</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Título</Text>
        <TextInput
          style={styles.input}
          value={titulo}
          onChangeText={setTitulo}
          editable={!desabilitado}
        />

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={descricao}
          onChangeText={setDescricao}
          editable={!desabilitado}
          multiline
        />

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
              disabled={desabilitado}
            >
              <Text>{filtro}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {filtroSelecionado ? (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{filtroSelecionado}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.btnPublish} onPress={salvarEdicao} disabled={desabilitado}>
          {salvando ? <ActivityIndicator color={colors.white} /> : <Text style={styles.btnText}>Salvar</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnDelete} onPress={confirmarExclusao} disabled={desabilitado}>
          {excluindo ? <ActivityIndicator color={colors.white} /> : <Text style={styles.btnText}>Excluir</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

export default EditarItem;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.green_secondary,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  back: {
    color: colors.white,
    fontSize: 24,
    marginRight: 20,
  },
  headerTitle: {
    color: colors.white,
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
    backgroundColor: colors.gray_light,
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
    color: colors.white,
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
    backgroundColor: colors.gray_light,
    padding: 10,
    borderRadius: 8,
  },
  filterSelected: {
    borderWidth: 2,
    borderColor: "green",
  },
  tag: {
    backgroundColor: colors.gray_border,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginTop: 20,
    marginBottom: 30,
  },
  tagText: {
    color: colors.white,
    fontWeight: "bold",
  },
  btnPublish: {
    backgroundColor: colors.green_secondary,
    paddingVertical: 14,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 15,
    minHeight: 50,
    justifyContent: "center",
  },
  btnDelete: {
    backgroundColor: colors.error_dark,
    paddingVertical: 14,
    borderRadius: 5,
    alignItems: "center",
    minHeight: 50,
    justifyContent: "center",
  },
  btnText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
});
