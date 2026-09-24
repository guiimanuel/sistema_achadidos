import * as React from 'react';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { colors } from '../styles/colors.js';
import { observarAutenticacao } from '../services/auth.js';
import {
  COLECOES_PUBLICACOES,
  observarPublicacoes,
} from '../services/publicacoes.js';

const DEFAULT_FILTERS = [
  'Material escolar',
  'Utensílio pessoal',
  'Caderno',
  'Garrafa',
  'Celular',
];

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

function firstValue(data, keys) {
  for (const key of keys) {
    const value = data[key];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ''
    ) {
      return value;
    }
  }

  return '';
}

function toMillis(value) {
  if (!value) return 0;

  if (typeof value.toMillis === 'function') {
    return value.toMillis();
  }

  if (typeof value.toDate === 'function') {
    return value.toDate().getTime();
  }

  if (typeof value.seconds === 'number') {
    return value.seconds * 1000;
  }

  if (typeof value === 'number') {
    return value < 10000000000 ? value * 1000 : value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    const brDate = trimmed.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/
    );

    if (brDate) {
      const [
        ,
        day,
        month,
        year,
        hour = '0',
        minute = '0',
      ] = brDate;

      return new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute)
      ).getTime();
    }

    const parsed = Date.parse(trimmed);

    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function formatDate(value) {
  const millis = toMillis(value);

  if (!millis) return '';

  const date = new Date(millis);

  return `${pad(date.getDate())}/${pad(
    date.getMonth() + 1
  )}/${date.getFullYear()} ${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`;
}

function normalizeItem(docId, data, sourceCollection) {
  const rawTitle = firstValue(data, [
    'titulo',
    'title',
    'nome',
    'name',
  ]);

  const rawDescription = firstValue(data, [
    'descricao',
    'description',
    'texto',
    'text',
    'detalhes',
  ]);

  const rawCategory = firstValue(data, [
    'categoria',
    'categoriaNome',
    'category',
    'tipo',
    'filtro',
  ]);

  const rawDate = firstValue(data, [
    'data',
    'dataCriacao',
    'createdAt',
    'created_at',
    'updatedAt',
    'date',
  ]);

  const imageUrl = String(
    firstValue(data, [
      'imagem',
      'imageUrl',
      'fotoUrl',
      'photoUrl',
      'image',
      'foto',
    ])
  );

  const ownerId = String(
    firstValue(data, [
      'userId',
      'uid',
      'id_usuario',
      'usuarioId',
    ])
  );

  const ownerEmail = String(
    firstValue(data, [
      'userEmail',
      'email',
      'usuarioEmail',
    ])
  );

  const title = String(rawTitle || 'Item sem título');
  const description = String(rawDescription || '');
  const category = String(rawCategory || '');

  const location = String(
    firstValue(data, [
      'local',
      'location',
      'lugar',
    ])
  );

  const status = data.status || 'disponivel';
  const expiraEm = data.expiraEm || null;

  return {
    id: `${sourceCollection}-${docId}`,
    docId,
    sourceCollection,
    title,
    description,
    category,
    location,
    imageUrl,
    ownerId,
    ownerEmail,
    status,
    expiraEm,
    dateText: formatDate(rawDate),
    dateMillis: toMillis(rawDate),
    searchText: normalizeText(
      `${title} ${description} ${category} ${location} ${status}`
    ),
  };
}

function getFallbackImage(item) {
  const text = normalizeText(
    `${item.title} ${item.category}`
  );

  if (text.includes('garrafa')) {
    return bottleImage;
  }

  if (text.includes('estojo')) {
    return caseImage;
  }

  if (text.includes('caderno')) {
    return notebookImage;
  }

  return logoImage;
}

function getImageSource(item) {
  if (
    /^(https?:|file:|data:image\/)/i.test(
      item.imageUrl
    )
  ) {
    return {
      uri: item.imageUrl,
    };
  }

  return getFallbackImage(item);
}

function HomeScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  const [itemsByCollection, setItemsByCollection] = useState({});
  const [loadedCollections, setLoadedCollections] = useState({});
  const [collectionErrors, setCollectionErrors] = useState({});

  const filterOptionsProgress = React.useRef(new Animated.Value(0)).current;
  const [showFilterOptions, setShowFilterOptions] = useState(false);

  const primeiraLetraUser = currentUser?.email
    ? currentUser.email.charAt(0).toUpperCase()
    : '?';

  // Ajustado para usar apenas o padding exato do topo do dispositivo
  const topPadding = insets.top;

  useEffect(() => {
    return observarAutenticacao((user) => {
      setCurrentUser(user);
    });
  }, []);

  useEffect(() => {
    return observarPublicacoes(
      (collectionName, docs) => {
        const items = docs.map((doc) =>
          normalizeItem(
            doc.id,
            doc.data(),
            collectionName
          )
        );

        setItemsByCollection((current) => ({
          ...current,
          [collectionName]: items,
        }));

        setLoadedCollections((current) => ({
          ...current,
          [collectionName]: true,
        }));

        setCollectionErrors((current) => {
          const next = { ...current };

          delete next[collectionName];

          return next;
        });
      },

      (collectionName, error) => {
        console.log(
          `Erro ao carregar ${collectionName}:`,
          error
        );

        setLoadedCollections((current) => ({
          ...current,
          [collectionName]: true,
        }));

        setCollectionErrors((current) => ({
          ...current,
          [collectionName]: error.message,
        }));
      }
    );
  }, []);

  useEffect(() => {
    const shouldShowOptions = filterOpen && !activeFilter;

    if (shouldShowOptions) {
      setShowFilterOptions(true);

      Animated.timing(filterOptionsProgress, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();

      return;
    }

    Animated.timing(filterOptionsProgress, {
      toValue: 0,
      duration: 160,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setShowFilterOptions(false);
      }
    });
  }, [
    activeFilter,
    filterOpen,
    filterOptionsProgress,
  ]);

  const loading = COLECOES_PUBLICACOES.some(
    (collectionName) => !loadedCollections[collectionName]
  );

  const allItems = React.useMemo(() => {
    return Object.values(itemsByCollection)
      .flat()
      .sort((a, b) => b.dateMillis - a.dateMillis);
  }, [itemsByCollection]);

  const filterOptions = React.useMemo(() => {
    const options = new Map();

    DEFAULT_FILTERS.forEach((filter) => {
      options.set(
        normalizeText(filter),
        filter
      );
    });

    allItems.forEach((item) => {
      const label = String(
        item.category || ''
      ).trim();

      if (label) {
        options.set(
          normalizeText(label),
          label
        );
      }
    });

    return Array.from(options.values());
  }, [allItems]);

  useEffect(() => {
    if (!activeFilter) return;

    const hasActiveFilter = filterOptions.some(
      (filter) =>
        normalizeText(filter) === normalizeText(activeFilter)
    );

    if (!hasActiveFilter) {
      setActiveFilter('');
    }
  }, [activeFilter, filterOptions]);

  const filteredItems = React.useMemo(() => {
    const agora = Date.now();
    const normalizedSearch = normalizeText(search);
    const normalizedFilter = normalizeText(activeFilter);

    return allItems.filter((item) => {
      const jaExpirou =
        item.status === 'achado' &&
        item.expiraEm &&
        agora >= item.expiraEm;

      if (jaExpirou) {
        return false;
      }

      const matchesSearch =
        !normalizedSearch ||
        item.searchText.includes(normalizedSearch);

      const matchesFilter =
        !normalizedFilter ||
        normalizeText(item.category).includes(normalizedFilter);

      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, allItems, search]);

  const columns =
    width >= 900
      ? 4
      : width >= 640
        ? 3
        : 2;

  const horizontalPadding = width >= 640 ? 24 : 16;
  const cardGap = width >= 640 ? 18 : 12;

  const cardWidth = Math.floor(
    (
      width -
      horizontalPadding * 2 -
      cardGap * (columns - 1)
    ) / columns
  );

  const hasOnlyErrors =
    !loading &&
    filteredItems.length === 0 &&
    allItems.length === 0 &&
    Object.keys(collectionErrors).length === COLECOES_PUBLICACOES.length;

  function handleAuthPress() {
    if (currentUser) {
      navigation.navigate('Perfil');
      return;
    }

    navigation.navigate('Login');
  }

  function renderHeader() {
    return (
      <View style={styles.listHeader}>
        <Text style={styles.title}>
          Mural de Achados e Perdidos
        </Text>

        <View style={styles.controlsCard}>
          {currentUser ? (
            <>
              <Pressable
                accessibilityRole="button"
                style={styles.myPostsButton}
                onPress={() =>
                  navigation.navigate('MinhasPublicacoes')
                }
              >
                <Ionicons
                  name="person-outline"
                  size={22}
                  color={colors.white}
                />

                <Text style={styles.myPostsButtonText}>
                  Minhas Publicações
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.white}
                />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                style={styles.addItemButton}
                onPress={() =>
                  navigation.navigate('CadastrarItem')
                }
              >
                <Ionicons
                  name="add-circle-outline"
                  size={23}
                  color={colors.white}
                />

                <Text style={styles.addItemButtonText}>
                  Adicionar item
                </Text>
              </Pressable>
            </>
          ) : null}

          <View style={styles.filtersRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir filtros"
              style={[
                styles.filterButton,
                (filterOpen || activeFilter) && styles.filterButtonActive,
              ]}
              onPress={() =>
                setFilterOpen((open) => !open)
              }
            >
              <Ionicons
                name={
                  filterOpen
                    ? 'funnel'
                    : 'funnel-outline'
                }
                size={24}
                color={
                  filterOpen || activeFilter
                    ? colors.white
                    : colors.green_primary
                }
              />

              <Text
                style={[
                  styles.filterButtonText,
                  (filterOpen || activeFilter) && styles.filterButtonTextActive,
                ]}
              >
                Filtrar
              </Text>
            </Pressable>

            {activeFilter ? (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterText}>
                  {activeFilter}
                </Text>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Remover filtro"
                  hitSlop={10}
                  onPress={() => {
                    setActiveFilter('');
                    setFilterOpen(false);
                  }}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={colors.green_primary}
                  />
                </Pressable>
              </View>
            ) : null}
          </View>

          {showFilterOptions ? (
            <Animated.View
              style={[
                styles.filterOptions,
                {
                  opacity: filterOptionsProgress,
                  transform: [
                    {
                      translateY: filterOptionsProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-8, 0],
                      }),
                    },
                    {
                      scale: filterOptionsProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.98, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              {filterOptions.map((filter) => (
                <Pressable
                  key={filter}
                  accessibilityRole="button"
                  style={styles.filterOption}
                  onPress={() => {
                    setActiveFilter(filter);
                    setFilterOpen(false);
                  }}
                >
                  <Text style={styles.filterOptionText}>
                    {filter}
                  </Text>
                </Pressable>
              ))}
            </Animated.View>
          ) : null}
        </View>
      </View>
    );
  }

  function renderEmptyState() {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator color={colors.green_primary} />
          <Text style={styles.emptyText}>
            Carregando publicações...
          </Text>
        </View>
      );
    }

    if (hasOnlyErrors) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Não foi possível carregar o mural.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>
          Nenhuma publicação encontrada
        </Text>
      </View>
    );
  }

  function renderItem({ item }) {
    const isAchado = item.status === 'achado';

    return (
      <Pressable
        style={[
          styles.card,
          {
            width: cardWidth,
          },
        ]}
        accessibilityRole="button"
        onPress={() =>
          navigation.navigate('ItemFullScreen', { item })
        }
      >
        <View style={styles.cardImageWrap}>
          <Image
            source={getImageSource(item)}
            style={styles.cardImage}
            resizeMode={
              item.imageUrl ? 'cover' : 'contain'
            }
          />

          {isAchado && (
            <View style={styles.badgeAchado}>
              <Text style={styles.badgeAchadoText}>ACHADO</Text>
            </View>
          )}
        </View>

        {item.category ? (
          <Text
            numberOfLines={1}
            style={styles.cardCategory}
          >
            {item.category}
          </Text>
        ) : null}

        <Text
          numberOfLines={1}
          style={styles.cardTitle}
        >
          {item.title}
        </Text>

        <Text
          numberOfLines={5}
          style={styles.cardText}
        >
          {item.description || 'Sem descrição informada.'}
        </Text>

        {item.dateText ? (
          <View style={styles.cardFooter}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={colors.text_date}
            />
            <Text style={styles.cardDate}>
              {item.dateText}
            </Text>
          </View>
        ) : null}
      </Pressable>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container}>
      <View
        style={[
          styles.topBar,
          {
            paddingTop: topPadding,
          },
        ]}
      >
        <View style={styles.topBarRow}>
          <View style={styles.logoSurface}>
            <Image source={logoImage} style={styles.logo} />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              currentUser ? 'Abrir perfil' : 'Ir para login'
            }
            style={
              currentUser
                ? styles.profileButton
                : styles.loginButton
            }
            onPress={handleAuthPress}
          >
            {currentUser ? (
              <Text style={styles.profileInitial}>
                {primeiraLetraUser}
              </Text>
            ) : (
              <>
                <Ionicons
                  name="log-in-outline"
                  size={22}
                  color={colors.green_primary}
                />
                <Text style={styles.loginText}>Login</Text>
              </>
            )}
          </Pressable>
        </View>

        <View style={styles.searchBox}>
          <Ionicons
            name="search"
            size={22}
            color={colors.green_primary}
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Pesquisar"
            placeholderTextColor="#7f8a7b"
            style={styles.searchInput}
          />

          {search ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Limpar pesquisa"
              hitSlop={8}
              onPress={() => setSearch('')}
            >
              <Ionicons
                name="close-circle"
                size={22}
                color="#8a9286"
              />
            </Pressable>
          ) : null}
        </View>
      </View>

      <FlatList
        key={columns}
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={columns}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingHorizontal: horizontalPadding,
          },
        ]}
        columnWrapperStyle={
          columns > 1 ? styles.cardRow : undefined
        }
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      />
    </KeyboardAvoidingView>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screen_background,
  },

  topBar: {
    backgroundColor: colors.green_primary,
    gap: 14,
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    zIndex: 5,
  },

  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },

  logoSurface: {
    width: 82,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: 150,
    height: 150,
    marginTop: 10,
    resizeMode: 'contain',
  },

  searchBox: {
    height: 48,
    backgroundColor: colors.white,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 7,
  },

  searchInput: {
    flex: 1,
    color: '#1d2b20',
    fontSize: 16,
    paddingVertical: 0,
    fontFamily: 'MontserratSemiBold',
    includeFontPadding: false,
  },

  profileButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: '#d8ded4',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 7,
  },

  profileInitial: {
    color: colors.green_primary,
    fontSize: 21,
    fontFamily: 'MontserratExtraBold',
    includeFontPadding: false,
  },

  loginButton: {
    height: 44,
    minWidth: 96,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 14,
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 7,
  },

  loginText: {
    color: colors.green_primary,
    fontSize: 17,
    fontFamily: 'MontserratBold',
    includeFontPadding: false,
  },

  listContent: {
    paddingBottom: 32,
    flexGrow: 1,
  },

  listHeader: {
    paddingTop: 28,
    paddingBottom: 20,
    gap: 16,
  },

  title: {
    color: colors.green_primary,
    fontSize: 27,
    textAlign: 'center',
    lineHeight: 32,
    fontFamily: 'MontserratExtraBold',
    includeFontPadding: false,
  },

  controlsCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e6dc',
    padding: 12,
    gap: 12,
    elevation: 2,
    shadowColor: colors.shadow_green,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 7,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },

  myPostsButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    backgroundColor: colors.green_primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 10,
  },

  myPostsButtonText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: 'MontserratBold',
    includeFontPadding: false,
  },

  addItemButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    backgroundColor: colors.green_primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 10,
  },

  addItemButtonText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: 'MontserratBold',
    includeFontPadding: false,
  },

  filtersRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },

  filterButton: {
    height: 42,
    minWidth: 104,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cfe0cc',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f4faf2',
  },

  filterButtonActive: {
    backgroundColor: colors.green_primary,
    borderColor: colors.green_primary,
  },

  filterButtonText: {
    color: colors.green_primary,
    fontSize: 15,
    fontFamily: 'MontserratBold',
    includeFontPadding: false,
  },

  filterButtonTextActive: {
    color: colors.white,
  },

  activeFilterChip: {
    minHeight: 38,
    borderRadius: 10,
    backgroundColor: colors.green_soft,
    borderWidth: 1,
    borderColor: '#d8e5d4',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 12,
    paddingRight: 8,
  },

  activeFilterText: {
    color: '#315a32',
    fontSize: 14,
    fontFamily: 'MontserratSemiBold',
    includeFontPadding: false,
  },

  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  filterOption: {
    minHeight: 36,
    borderRadius: 10,
    backgroundColor: '#f5f6f2',
    borderWidth: 1,
    borderColor: '#e1e5dd',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },

  filterOptionText: {
    color: '#48544a',
    fontSize: 13,
    fontFamily: 'MontserratSemiBold',
    includeFontPadding: false,
  },

  cardRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  card: {
    minHeight: 262,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dfe4dc',
    backgroundColor: colors.white,
    padding: 12,
    elevation: 2,
    shadowColor: '#1a2619',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  cardImageWrap: {
    width: '100%',
    height: 104,
    backgroundColor: '#f0f3ee',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },

  cardImage: {
    width: '100%',
    height: '100%',
  },

  badgeAchado: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#2e7d32',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },

  badgeAchadoText: {
    color: '#ffffff',
    fontSize: 10,
    fontFamily: 'MontserratBold',
    includeFontPadding: false,
  },

  cardCategory: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    color: colors.green_primary,
    backgroundColor: '#eef7ec',
    borderRadius: 7,
    overflow: 'hidden',
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 7,
    fontFamily: 'MontserratBold',
    includeFontPadding: false,
  },

  cardTitle: {
    color: '#121a14',
    fontSize: 15,
    marginBottom: 6,
    fontFamily: 'MontserratBold',
    includeFontPadding: false,
  },

  cardText: {
    color: colors.text_body,
    fontSize: 13,
    lineHeight: 17,
    flexGrow: 1,
    fontFamily: 'MontserratRegular',
    includeFontPadding: false,
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#edf0ea',
  },

  cardDate: {
    color: colors.text_date,
    fontSize: 12,
    fontFamily: 'MontserratSemiBold',
    includeFontPadding: false,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },

  emptyText: {
    color: '#557056',
    fontSize: 15,
    fontFamily: 'MontserratSemiBold',
    includeFontPadding: false,
  },
});
