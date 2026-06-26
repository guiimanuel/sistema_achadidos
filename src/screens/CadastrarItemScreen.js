import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../utils/firebase.js';
import { criarPublicacao } from '../services/publicacoes.js';
import { colors } from '../components/colors.js';

const filtros = ['Caderno', 'Material escolar', 'Utensílio pessoal', 'Celular', 'Garrafa'];

function CadastrarItem({ navigation, route }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [filtroSelecionado, setFiltroSelecionado] = useState('');
  const [publicando, setPublicando] = useState(false);

  const imagemRecebida = route?.params?.imagemRecebida || '';

  async function publicar() {
    if (!auth.currentUser) {
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
      await criarPublicacao({
        titulo,
        descricao,
        filtro: filtroSelecionado,
        imagem: imagemRecebida,
      });

      navigation.navigate('Home');
    } catch (error) {
      console.log('Erro ao publicar item:', error);
      Alert.alert('Erro ao publicar', error.message || 'Não foi possível publicar o item.');
    } finally {
      setPublicando(false);
    }
  }

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Adicionar item</Text>

      <TouchableOpacity
        style={styles.imageBox}
        onPress={() => navigation.navigate('EscolherImagem', { origem: 'CadastrarItem' })}
        disabled={publicando}
      >
        {imagemRecebida ? (
          <Image source={{ uri: imagemRecebida }} style={styles.preview} />
        ) : (
          <Text><Ionicons name="add" size={24} color="#000" /> Adicionar imagem</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.filterTitle}>Filtro</Text>

      <View style={styles.filterContainer}>
        {filtros.map((filtro) => (
          <TouchableOpacity
            key={filtro}
            style={[styles.filterButton, filtroSelecionado === filtro && styles.filterSelected]}
            onPress={() => setFiltroSelecionado(filtro)}
            disabled={publicando}
          >
            <Text>{filtro}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        placeholder="Adicionar título..."
        style={styles.input}
        value={titulo}
        onChangeText={setTitulo}
        editable={!publicando}
      />

      <TextInput
        placeholder="Adicionar descrição..."
        style={[styles.input, styles.textArea]}
        value={descricao}
        onChangeText={setDescricao}
        editable={!publicando}
        multiline
      />

      {filtroSelecionado ? (
        <View style={styles.tag}>
          <Text>{filtroSelecionado}</Text>
        </View>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={publicar} disabled={publicando}>
        {publicando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Publicar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

export default CadastrarItem;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.green_primary,
    marginVertical: 20,
  },
  imageBox: {
    width: '100%',
    height: 150,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  preview: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  filterTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.green_primary,
    marginTop: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
  },
  filterButton: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 8,
  },
  filterSelected: {
    borderWidth: 2,
    borderColor: colors.green_primary,
  },
  input: {
    borderWidth: 2,
    marginTop: 20,
    padding: 10,
    borderRadius: 10,
    borderColor: colors.green_primary,
  },
  textArea: {
    borderRadius: 10,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  tag: {
    backgroundColor: '#ddd',
    padding: 10,
    alignSelf: 'flex-start',
    marginTop: 20,
    borderRadius: 10,
  },
  button: {
    backgroundColor: colors.green_primary,
    padding: 15,
    alignItems: 'center',
    marginTop: 30,
    minHeight: 50,
    justifyContent: 'center',
    borderRadius: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
