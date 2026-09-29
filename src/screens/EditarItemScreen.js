import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

import {
  atualizarPublicacao,
  excluirPublicacao,
  marcarComoAchado,
} from "../services/publicacoes.js";
import { colors } from "../styles/colors.js";

const filtros = ["Caderno", "Material escolar", "Utensílio pessoal", "Celular", "Garrafa"];

function EditarItem({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { item } = route.params || {};

  const [titulo, setTitulo] = useState(item?.titulo || item?.title || "");
  const [descricao, setDescricao] = useState(item?.descricao || item?.description || "");
  const [imagem, setImagem] = useState(item?.imageUrl || "");
  const [filtroSelecionado, setFiltroSelecionado] = useState(
    item?.filtro || item?.category || ""
  );

  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [marcandoAchado, setMarcandoAchado] = useState(false);

  const topPadding = insets.top + 10;

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

  function confirmarMarcacaoAchado() {
    Alert.alert(
      "Marcar como achado",
      "O item exibirá o selo 'Achado' no mural e será removido automaticamente após 24 horas.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Confirmar", onPress: handleMarcarAchado },
      ]
    );
  }

  async function handleMarcarAchado() {
    if (!item) return;

    try {
      setMarcandoAchado(true);
      await marcarComoAchado(item, 24);
      navigation.navigate("Home");
    } catch (error) {
      console.log("Erro ao marcar como achado:", error);
      Alert.alert("Erro", "Não foi possível atualizar o status do item.");
    } finally {
      setMarcandoAchado(false);
    }
  }

  function confirmarExclusao() {
    Alert.alert(
      "Excluir publicação",
      "Esta ação excluirá o item permanentemente sem aguardar o tempo limite.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir já", style: "destructive", onPress: excluirItem },
      ]
    );
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

  const desabilitado = salvando || excluindo || marcandoAchado;

  return (
    <KeyboardAvoidingView style={styles.container}>
      {/* HEADER SUPERIOR */}
      <View style={[styles.topBar, { paddingTop: topPadding }]}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={desabilitado}
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>

        <Text style={styles.headerTitle}>Editar Publicação</Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* SEÇÃO DE IMAGEM */}
        <Text style={styles.sectionLabel}>Imagem do Item</Text>
        <View style={styles.imageCard}>
          <Pressable
            style={styles.imageBox}
            onPress={() => navigation.navigate("EscolherImagem", { origem: "EditarItem" })}
            disabled={desabilitado}
          >
            {imagem ? (
              <Image source={{ uri: imagem }} style={styles.preview} resizeMode="cover" />
            ) : (
              <View style={styles.placeholderContainer}>
                <Ionicons name="camera-outline" size={36} color="#7f8a7b" />
                <Text style={styles.placeholderText}>Adicionar imagem</Text>
              </View>
            )}
          </Pressable>

          <Pressable
            style={styles.changeImageButton}
            onPress={() => navigation.navigate("EscolherImagem", { origem: "EditarItem" })}
            disabled={desabilitado}
          >
            <Ionicons name="image-outline" size={18} color={colors.white} />
            <Text style={styles.changeImageText}>Alterar Imagem</Text>
          </Pressable>
        </View>

        {/* CAMPOS DE FORMULÁRIO */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Título</Text>
          <TextInput
            style={styles.input}
            value={titulo}
            onChangeText={setTitulo}
            placeholder="Ex: Garrafa Térmica Azul"
            placeholderTextColor="#8a9286"
            editable={!desabilitado}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Descreva onde encontrou ou perdeu e características..."
            placeholderTextColor="#8a9286"
            editable={!desabilitado}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* CATEGORIAS / FILTROS */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Categoria</Text>
          <View style={styles.filterContainer}>
            {filtros.map((filtro) => {
              const selecionado = filtroSelecionado === filtro;
              return (
                <Pressable
                  key={filtro}
                  style={[
                    styles.filterChip,
                    selecionado && styles.filterChipSelected,
                  ]}
                  onPress={() => setFiltroSelecionado(filtro)}
                  disabled={desabilitado}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selecionado && styles.filterChipTextSelected,
                    ]}
                  >
                    {filtro}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* GRUPO DE BOTÕES DE AÇÃO */}
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.btn, styles.btnSave]}
            onPress={salvarEdicao}
            disabled={desabilitado}
          >
            {salvando ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark-sharp" size={20} color={colors.white} />
                <Text style={styles.btnText}>Salvar Alterações</Text>
              </>
            )}
          </Pressable>

          <Pressable
            style={[styles.btn, styles.btnAchado]}
            onPress={confirmarMarcacaoAchado}
            disabled={desabilitado}
          >
            {marcandoAchado ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark-done-circle" size={20} color={colors.white} />
                <Text style={styles.btnText}>Marcar como Achado (24h)</Text>
              </>
            )}
          </Pressable>

          <Pressable
            style={[styles.btn, styles.btnDelete]}
            onPress={confirmarExclusao}
            disabled={desabilitado}
          >
            {excluindo ? (
              <ActivityIndicator color="#d32f2f" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color="#d32f2f" />
                <Text style={styles.btnDeleteText}>Excluir Agora</Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default EditarItem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screen_background,
  },

  topBar: {
    backgroundColor: colors.green_primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontFamily: "MontserratBold",
    includeFontPadding: false,
  },

  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  sectionLabel: {
    fontSize: 16,
    color: "#2c3b2d",
    fontFamily: "MontserratBold",
    marginBottom: 10,
  },

  imageCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e1e6dc",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  imageBox: {
    width: "100%",
    height: 180,
    backgroundColor: "#f0f3ee",
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  preview: {
    width: "100%",
    height: "100%",
  },

  placeholderContainer: {
    alignItems: "center",
    gap: 6,
  },

  placeholderText: {
    color: "#7f8a7b",
    fontSize: 14,
    fontFamily: "MontserratSemiBold",
  },

  changeImageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.green_primary,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },

  changeImageText: {
    color: colors.white,
    fontSize: 13,
    fontFamily: "MontserratBold",
  },

  formGroup: {
    marginBottom: 18,
  },

  label: {
    fontSize: 15,
    color: "#2c3b2d",
    fontFamily: "MontserratSemiBold",
    marginBottom: 8,
  },

  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#dce2d8",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1d2b20",
    fontFamily: "MontserratRegular",
  },

  textArea: {
    height: 100,
    textAlignVertical: "top",
  },

  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  filterChip: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#d8e2d4",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  filterChipSelected: {
    backgroundColor: colors.green_primary,
    borderColor: colors.green_primary,
  },

  filterChipText: {
    color: "#48544a",
    fontSize: 13,
    fontFamily: "MontserratSemiBold",
  },

  filterChipTextSelected: {
    color: colors.white,
  },

  actionButtons: {
    marginTop: 10,
    gap: 12,
  },

  btn: {
    minHeight: 50,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },

  btnSave: {
    backgroundColor: colors.green_primary,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  btnAchado: {
    backgroundColor: "#1976D2",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  btnDelete: {
    backgroundColor: "#fde8e8",
    borderWidth: 1,
    borderColor: "#f8b4b4",
  },

  btnText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: "MontserratBold",
    includeFontPadding: false,
  },

  btnDeleteText: {
    color: "#d32f2f",
    fontSize: 15,
    fontFamily: "MontserratBold",
    includeFontPadding: false,
  },
});
