import React, { useState } from 'react';
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
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { criarPublicacao } from '../services/publicacoes.js';
import { usuarioAtual } from '../services/auth.js';
import { colors } from '../styles/colors.js';

const filtros = ['Caderno', 'Material escolar', 'Utensílio pessoal', 'Celular', 'Garrafa'];

function CadastrarItem({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [filtroSelecionado, setFiltroSelecionado] = useState('');
  const [publicando, setPublicando] = useState(false);

  const imagemRecebida = route?.params?.imagemRecebida || '';
  const topPadding = insets.top + 10;

  async function publicar() {
    if (!usuarioAtual()) {
      Alert.alert('Login necessário', 'Entre na sua conta para publicar um item.');
      navigation.navigate('Login');
      return;
    }

    if (!titulo.trim()) {
      Alert.alert('Título obrigatório', 'Informe um título para a publicação.');
      return;
    }

    if (!filtroSelecionado) {
      Alert.alert('Filtro obrigatório', 'Escolha uma categoria para a publicação.');
      return;
    }

    try {
      setPublicando(true);
      const publicacaoRef = await criarPublicacao({
        titulo,
        descricao,
        filtro: filtroSelecionado,
        imagem: imagemRecebida,
      });

      console.log('Item publicado com ID:', publicacaoRef.id);
      Alert.alert('Publicado', 'Item cadastrado com sucesso.');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home', params: { publishedItemId: publicacaoRef.id } }],
      });
    } catch (error) {
      console.log('Erro ao publicar item:', error);
      Alert.alert('Erro ao publicar', getPublishErrorMessage(error));
    } finally {
      setPublicando(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* HEADER SUPERIOR */}
      <View style={[styles.topBar, { paddingTop: topPadding }]}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={publicando}
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>

        <Text style={styles.headerTitle}>Cadastrar Item</Text>

        <View style={{ width: 40 }} />
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* SEÇÃO DA IMAGEM */}
        <Text style={styles.sectionLabel}>Imagem do Item</Text>
        <View style={styles.imageCard}>
          <Pressable
            style={styles.imageBox}
            onPress={() => navigation.navigate('EscolherImagem', { origem: 'CadastrarItem' })}
            disabled={publicando}
          >
            {imagemRecebida ? (
              <Image source={{ uri: imagemRecebida }} style={styles.preview} resizeMode="cover" />
            ) : (
              <View style={styles.placeholderContainer}>
                <Ionicons name="camera-outline" size={38} color="#7f8a7b" />
                <Text style={styles.placeholderText}>Tirar foto ou escolher da galeria</Text>
              </View>
            )}
          </Pressable>

          <Pressable
            style={styles.changeImageButton}
            onPress={() => navigation.navigate('EscolherImagem', { origem: 'CadastrarItem' })}
            disabled={publicando}
          >
            <Ionicons name={imagemRecebida ? 'image-outline' : 'add-circle-outline'} size={18} color={colors.white} />
            <Text style={styles.changeImageText}>
              {imagemRecebida ? 'Alterar Imagem' : 'Adicionar Imagem'}
            </Text>
          </Pressable>
        </View>

        {/* CAMPOS DO FORMULÁRIO */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Título</Text>
          <TextInput
            placeholder="Ex: Caderno Universitário Capa Dura"
            placeholderTextColor="#8a9286"
            style={styles.input}
            value={titulo}
            onChangeText={setTitulo}
            editable={!publicando}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            placeholder="Descreva onde encontrou ou perdeu, cor e detalhes..."
            placeholderTextColor="#8a9286"
            style={[styles.input, styles.textArea]}
            value={descricao}
            onChangeText={setDescricao}
            editable={!publicando}
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
                  disabled={publicando}
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

        {/* BOTÃO DE PUBLICAR */}
        <View style={styles.actionButtons}>
          <Pressable
            style={styles.button}
            onPress={publicar}
            disabled={publicando}
          >
            {publicando ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={20} color={colors.white} />
                <Text style={styles.buttonText}>Publicar Item</Text>
              </>
            )}
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

export default CadastrarItem;

function getPublishErrorMessage(error) {
  if (error?.code === 'permission-denied') {
    return 'O Firebase bloqueou o cadastro. Confirme se você está logado com email @discente.ifpe.edu.br e se as regras do Firestore foram publicadas.';
  }

  if (error?.code === 'unavailable') {
    return 'Não foi possível conectar ao Firestore. Verifique sua internet e tente novamente.';
  }

  if (error?.code === 'not-found') {
    return 'O banco Firestore ainda não foi criado no Firebase Console.';
  }

  return error?.message || 'Não foi possível publicar o item.';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screen_background,
  },

  topBar: {
    backgroundColor: colors.green_primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontFamily: 'MontserratBold',
    includeFontPadding: false,
  },

  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  sectionLabel: {
    fontSize: 16,
    color: '#2c3b2d',
    fontFamily: 'MontserratBold',
    marginBottom: 10,
  },

  imageCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e1e6dc',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  imageBox: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f3ee',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  preview: {
    width: '100%',
    height: '100%',
  },

  placeholderContainer: {
    alignItems: 'center',
    gap: 6,
  },

  placeholderText: {
    color: '#7f8a7b',
    fontSize: 14,
    fontFamily: 'MontserratSemiBold',
    textAlign: 'center',
  },

  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontFamily: 'MontserratBold',
  },

  formGroup: {
    marginBottom: 18,
  },

  label: {
    fontSize: 15,
    color: '#2c3b2d',
    fontFamily: 'MontserratSemiBold',
    marginBottom: 8,
  },

  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#dce2d8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1d2b20',
    fontFamily: 'MontserratMedium',
  },

  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  filterChip: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#d8e2d4',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  filterChipSelected: {
    backgroundColor: colors.green_primary,
    borderColor: colors.green_primary,
  },

  filterChipText: {
    color: '#48544a',
    fontSize: 13,
    fontFamily: 'MontserratMedium',
  },

  filterChipTextSelected: {
    color: colors.white,
  },

  actionButtons: {
    marginTop: 10,
  },

  button: {
    minHeight: 50,
    backgroundColor: colors.green_primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: 'MontserratBold',
    includeFontPadding: false,
  },
});
