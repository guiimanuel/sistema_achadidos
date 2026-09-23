import React, {
  useCallback,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
} from 'firebase/firestore';

import { useFocusEffect } from '@react-navigation/native';

import { Ionicons } from '@expo/vector-icons';

import { db } from '../config/firebase.js';
import { usuarioAtual } from '../services/auth.js';
import { colors } from '../styles/colors.js';
const logoImage = require('../assets/images/mural-caixa.png');
const bottleImage = require('../assets/images/garrafa.png');
const notebookImage = require('../assets/images/caderno.png');
const caseImage = require('../assets/images/estojo.png');

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getFallbackImage(item) {
  const text = normalizeText(
    `${item.titulo} ${item.categoria}`
  );

  if (text.includes('garrafa')) {
    return bottleImage;
  }

  if (text.includes('caderno')) {
    return notebookImage;
  }

  if (text.includes('estojo')) {
    return caseImage;
  }

  return logoImage;
}

function getImageSource(item) {
  const imageUrl = String(
    item.imageUrl ||
    item.imagem ||
    item.fotoUrl ||
    ''
  );

  if (
    /^(https?:|file:|data:image\/)/i.test(
      imageUrl
    )
  ) {
    return {
      uri: imageUrl,
    };
  }

  return getFallbackImage(item);
}

function getDateMillis(value) {
  if (!value) return 0;

  if (
    typeof value.toMillis ===
    'function'
  ) {
    return value.toMillis();
  }

  if (
    typeof value.toDate ===
    'function'
  ) {
    return value.toDate().getTime();
  }

  if (
    typeof value.seconds ===
    'number'
  ) {
    return value.seconds * 1000;
  }

  if (typeof value === 'number') {
    return value;
  }

  return 0;
}

function formatDate(value) {
  const millis = getDateMillis(value);

  if (!millis) return '';

  const date = new Date(millis);

  const day = String(
    date.getDate()
  ).padStart(2, '0');

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');

  const year = date.getFullYear();

  const hour = String(
    date.getHours()
  ).padStart(2, '0');

  const minute = String(
    date.getMinutes()
  ).padStart(2, '0');

  return `${day}/${month}/${year} ${hour}:${minute}`;
}

function normalizePublicacao(
  docSnapshot
) {
  const data = docSnapshot.data();

  return {
    id: docSnapshot.id,

    titulo:
      data.titulo ||
      data.title ||
      data.nome ||
      'Item sem título',

    descricao:
      data.descricao ||
      data.description ||
      data.texto ||
      data.detalhes ||
      '',

    categoria:
      data.categoria ||
      data.categoriaNome ||
      data.category ||
      data.tipo ||
      data.filtro ||
      '',

    imageUrl:
      data.imageUrl ||
      data.imagem ||
      data.fotoUrl ||
      data.photoUrl ||
      data.image ||
      data.foto ||
      '',

    userId:
      data.userId ||
      data.uid ||
      data.id_usuario ||
      data.usuarioId ||
      '',

    userEmail:
      data.userEmail ||
      data.email ||
      data.usuarioEmail ||
      '',

    createdAt:
      data.createdAt ||
      data.dataCriacao ||
      data.data ||
      null,
  };
}

function MinhasPublicacoesScreen({
  navigation,
}) {
  const [currentUser, setCurrentUser] =
    useState(null);

  const [publicacoes, setPublicacoes] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const carregarPublicacoes =
    useCallback(async () => {
      try {
        setLoading(true);

        const user = await usuarioAtual();

        setCurrentUser(user);

        if (!user) {
          setPublicacoes([]);
          return;
        }

        const snapshot =
          await getDocs(
            collection(db, 'itens')
          );

        const minhasPublicacoes = [];

        snapshot.forEach(
          (docSnapshot) => {
            const data =
              docSnapshot.data();

            const userId = String(
              data.userId ||
              data.uid ||
              data.ownerId ||
              ''
            );

            const userEmail = String(
              data.userEmail ||
              data.email ||
              data.ownerEmail ||
              ''
            );

            const pertenceAoUsuario =
              userId === user.uid ||
              (
                user.email &&
                userEmail.toLowerCase() ===
                user.email.toLowerCase()
              );

            if (pertenceAoUsuario) {
              minhasPublicacoes.push(
                normalizePublicacao(
                  docSnapshot
                )
              );
            }
          }
        );

        minhasPublicacoes.sort(
          (a, b) =>
            getDateMillis(
              b.createdAt
            ) -
            getDateMillis(
              a.createdAt
            )
        );

        setPublicacoes(
          minhasPublicacoes
        );
      } catch (error) {
        console.log(
          'Erro ao carregar minhas publicações:',
          error
        );

        Alert.alert(
          'Erro',
          'Não foi possível carregar suas publicações.'
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useFocusEffect(
    useCallback(() => {
      carregarPublicacoes();
    }, [carregarPublicacoes])
  );

  async function handleExcluir(item) {
    Alert.alert(
      'Excluir publicação',
      'Tem certeza que deseja excluir esta publicação?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',

          onPress: async () => {
            try {
              await deleteDoc(
                doc(
                  db,
                  'itens',
                  item.id
                )
              );

              setPublicacoes(
                (listaAtual) =>
                  listaAtual.filter(
                    (publicacao) =>
                      publicacao.id !==
                      item.id
                  )
              );

              Alert.alert(
                'Sucesso',
                'Publicação excluída.'
              );
            } catch (error) {
              console.log(
                'Erro ao excluir:',
                error
              );

              Alert.alert(
                'Erro',
                'Não foi possível excluir a publicação.'
              );
            }
          },
        },
      ]
    );
  }

  function renderItem({ item }) {
    return (
      <View style={styles.card}>
        <Pressable
          style={styles.cardContent}
          onPress={() =>
            navigation.navigate(
              'ItemFullScreen',
              {
                item: {
                  id: item.id,
                  docId: item.id,
                  titulo: item.titulo,
                  title: item.titulo,
                  descricao:
                    item.descricao,
                  description:
                    item.descricao,
                  categoria:
                    item.categoria,
                  category:
                    item.categoria,
                  imageUrl:
                    item.imageUrl,
                  userId:
                    item.userId,
                  userEmail:
                    item.userEmail,
                  createdAt:
                    item.createdAt,
                },
              }
            )
          }
        >
          <View
            style={
              styles.imageContainer
            }
          >
            <Image
              source={getImageSource(item)}
              style={styles.image}
              resizeMode={
                item.imageUrl
                  ? 'cover'
                  : 'contain'
              }
            />
          </View>

          {item.categoria ? (
            <Text
              numberOfLines={1}
              style={
                styles.category
              }
            >
              {item.categoria}
            </Text>
          ) : null}

          <Text
            numberOfLines={2}
            style={styles.title}
          >
            {item.titulo}
          </Text>

          <Text
            numberOfLines={4}
            style={styles.description}
          >
            {item.descricao ||
              'Sem descrição informada.'}
          </Text>

          {item.createdAt ? (
            <View
              style={
                styles.dateContainer
              }
            >
              <Ionicons
                name="calendar-outline"
                size={14}
                color={
                  colors.text_date
                }
              />

              <Text
                style={styles.date}
              >
                {formatDate(
                  item.createdAt
                )}
              </Text>
            </View>
          ) : null}
        </Pressable>

        <View
          style={styles.buttonsContainer}
        >
          <Pressable
            style={styles.editButton}
            onPress={() =>
              navigation.navigate(
                'EditarItem',
                {
                  item,
                }
              )
            }
          >
            <Ionicons
              name="create-outline"
              size={18}
              color={
                colors.green_primary
              }
            />

            <Text
              style={
                styles.editButtonText
              }
            >
              Editar
            </Text>
          </Pressable>

          <Pressable
            style={styles.deleteButton}
            onPress={() =>
              handleExcluir(item)
            }
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color={colors.white}
            />

            <Text
              style={
                styles.deleteButtonText
              }
            >
              Excluir
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={styles.loadingContainer}
        >
          <ActivityIndicator
            size="large"
            color={
              colors.green_primary
            }
          />

          <Text
            style={styles.loadingText}
          >
            Carregando suas publicações...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() =>
            navigation.goBack()
          }
        >
          <Ionicons
            name="arrow-back"
            size={25}
            color={colors.white}
          />
        </Pressable>

        <Text
          style={styles.headerTitle}
        >
          Minhas Publicações
        </Text>

        <View
          style={styles.headerSpace}
        />
      </View>

      {publicacoes.length === 0 ? (
        <View
          style={styles.emptyContainer}
        >
          <Ionicons
            name="documents-outline"
            size={60}
            color={
              colors.green_primary
            }
          />

          <Text
            style={styles.emptyTitle}
          >
            Você ainda não publicou nenhum item.
          </Text>

          <Text
            style={styles.emptyText}
          >
            As publicações que você criar aparecerão aqui.
          </Text>

          <Pressable
            style={styles.addButton}
            onPress={() =>
              navigation.navigate(
                'CadastrarItem'
              )
            }
          >
            <Ionicons
              name="add-circle-outline"
              size={21}
              color={colors.white}
            />

            <Text
              style={styles.addButtonText}
            >
              Publicar item
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={publicacoes}
          renderItem={renderItem}
          keyExtractor={(item) =>
            item.id
          }
          numColumns={2}
          columnWrapperStyle={
            styles.row
          }
          contentContainerStyle={
            styles.listContent
          }
          showsVerticalScrollIndicator={
            false
          }
        />
      )}
    </SafeAreaView>
  );
}

export default MinhasPublicacoesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      colors.screen_background,
  },

  header: {
    backgroundColor:
      colors.green_primary,
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    paddingHorizontal: 16,
  },

  backButton: {
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent:
      'center',
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.white,
    fontSize: 20,
    fontFamily:
      'MontserratExtraBold',
    includeFontPadding: false,
  },

  headerSpace: {
    width: 45,
  },

  listContent: {
    padding: 16,
    paddingBottom: 30,
  },

  row: {
    justifyContent:
      'space-between',
    marginBottom: 14,
  },

  card: {
    width: '48%',
    backgroundColor:
      colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dfe4dc',
    padding: 10,
    elevation: 2,
    shadowColor: '#1a2619',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  cardContent: {
    flex: 1,
  },

  imageContainer: {
    width: '100%',
    height: 105,
    borderRadius: 9,
    backgroundColor: '#f0f3ee',
    alignItems: 'center',
    justifyContent:
      'center',
    overflow: 'hidden',
    marginBottom: 10,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  category: {
    alignSelf: 'flex-start',
    color:
      colors.green_primary,
    backgroundColor: '#eef7ec',
    borderRadius: 7,
    fontSize: 10,
    paddingHorizontal: 7,
    paddingVertical: 4,
    marginBottom: 6,
    fontFamily:
      'MontserratBold',
    includeFontPadding: false,
  },

  title: {
    color: '#121a14',
    fontSize: 15,
    marginBottom: 5,
    fontFamily:
      'MontserratBold',
    includeFontPadding: false,
  },

  description: {
    color:
      colors.text_body,
    fontSize: 12,
    lineHeight: 16,
    fontFamily:
      'MontserratRegular',
    includeFontPadding: false,
  },

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#edf0ea',
  },

  date: {
    flex: 1,
    color:
      colors.text_date,
    fontSize: 10,
    fontFamily:
      'MontserratSemiBold',
    includeFontPadding: false,
  },

  buttonsContainer: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 10,
  },

  editButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor:
      colors.green_primary,
    backgroundColor: '#f4faf2',
    alignItems: 'center',
    justifyContent:
      'center',
    flexDirection: 'row',
    gap: 5,
  },

  editButtonText: {
    color:
      colors.green_primary,
    fontSize: 12,
    fontFamily:
      'MontserratBold',
    includeFontPadding: false,
  },

  deleteButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#d9534f',
    alignItems: 'center',
    justifyContent:
      'center',
    flexDirection: 'row',
    gap: 5,
  },

  deleteButtonText: {
    color: colors.white,
    fontSize: 12,
    fontFamily:
      'MontserratBold',
    includeFontPadding: false,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent:
      'center',
    gap: 14,
  },

  loadingText: {
    color:
      colors.green_primary,
    fontSize: 15,
    fontFamily:
      'MontserratSemiBold',
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent:
      'center',
    paddingHorizontal: 35,
    gap: 12,
  },

  emptyTitle: {
    textAlign: 'center',
    color:
      colors.green_primary,
    fontSize: 18,
    fontFamily:
      'MontserratBold',
  },

  emptyText: {
    textAlign: 'center',
    color: '#557056',
    fontSize: 14,
    lineHeight: 20,
    fontFamily:
      'MontserratRegular',
  },

  addButton: {
    marginTop: 10,
    minHeight: 45,
    borderRadius: 10,
    backgroundColor:
      colors.green_primary,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent:
      'center',
    flexDirection: 'row',
    gap: 7,
  },

  addButtonText: {
    color: colors.white,
    fontSize: 14,
    fontFamily:
      'MontserratBold',
  },
});
