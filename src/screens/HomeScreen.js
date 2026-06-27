import * as React from 'react';
import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
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
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import { colors } from '../components/colors.js';
import { auth, db } from '../utils/firebase.js';
import { useExpoFonts } from '../components/expoFonts.js';

const ITEM_COLLECTIONS = ['itens', 'item'];
const DEFAULT_FILTERS = ['Material escolar', 'Utensílio pessoal', 'Caderno', 'Garrafa', 'Celular'];

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
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value;
    }
  }
  return '';
}

function toMillis(value) {
  if (!value) {
    return 0;
  }
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
    const brDate = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
    if (brDate) {
      const [, day, month, year, hour = '0', minute = '0'] = brDate;
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
  if (!millis) {
    return '';
  }
  const date = new Date(millis);
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

function normalizeItem(docId, data, sourceCollection) {
  const rawTitle = firstValue(data, ['titulo', 'title', 'nome', 'name']);
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
    firstValue(data, ['imagem', 'imageUrl', 'fotoUrl', 'photoUrl', 'image', 'foto'])
  );
  const ownerId = String(firstValue(data, ['userId', 'uid', 'id_usuario', 'usuarioId']));
  const ownerEmail = String(firstValue(data, ['userEmail', 'email', 'usuarioEmail']));
  const title = String(rawTitle || 'Item sem título');
  const description = String(rawDescription || '');
  const category = String(rawCategory || '');
  const location = String(firstValue(data, ['local', 'location', 'lugar']));

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
    dateText: formatDate(rawDate),
    dateMillis: toMillis(rawDate),
    searchText: normalizeText(`${title} ${description} ${category} ${location}`),
  };
}

function getFallbackImage(item) {
  const text = normalizeText(`${item.title} ${item.category}`);
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
  if (/^(https?:|file:|data:image\/)/i.test(item.imageUrl)) {
    return { uri: item.imageUrl };
  }
  return getFallbackImage(item);
}

function belongsToUser(item, user) {
  if (!user) {
    return false;
  }
  return item.ownerId === user.uid || item.ownerEmail === user.email;
}

function HomeScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('mural');
  const [itemsByCollection, setItemsByCollection] = useState({});
  const [loadedCollections, setLoadedCollections] = useState({});
  const [collectionErrors, setCollectionErrors] = useState({});
  const tabTranslateX = React.useRef(new Animated.Value(0)).current;
  const tabIndicatorWidth = React.useRef(new Animated.Value(0)).current;
  const filterOptionsProgress = React.useRef(new Animated.Value(0)).current;
  const [tabLayouts, setTabLayouts] = useState({});
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const primeiraLetraUser = currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : '?';

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setActiveTab('mural');
      }
    });
  }, [auth]);

  useEffect(() => {
    const unsubscribers = ITEM_COLLECTIONS.map((collectionName) =>
      onSnapshot(
        collection(db, collectionName),
        (snapshot) => {
          const items = snapshot.docs.map((doc) =>
            normalizeItem(doc.id, doc.data(), collectionName)
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
        (error) => {
          console.log(`Erro ao carregar ${collectionName}:`, error);
          setLoadedCollections((current) => ({
            ...current,
            [collectionName]: true,
          }));
          setCollectionErrors((current) => ({
            ...current,
            [collectionName]: error.message,
          }));
        }
      )
    );

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [db]);

  useEffect(() => {
    const layout = tabLayouts[activeTab];

    if (!layout) {
      return;
    }

    Animated.parallel([
      Animated.timing(tabTranslateX, {
        toValue: layout.x,
        duration: 220,
        useNativeDriver: false,
      }),
      Animated.timing(tabIndicatorWidth, {
        toValue: layout.width,
        duration: 220,
        useNativeDriver: false,
      }),
    ]).start();
  }, [activeTab, tabIndicatorWidth, tabLayouts, tabTranslateX]);

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
  }, [activeFilter, filterOpen, filterOptionsProgress]);

  function handleTabLayout(tabName, event) {
    const { x, width } = event.nativeEvent.layout;

    setTabLayouts((current) => {
      const previous = current[tabName];

      if (previous?.x === x && previous?.width === width) {
        return current;
      }

      return {
        ...current,
        [tabName]: { x, width },
      };
    });
  }

  const loading = ITEM_COLLECTIONS.some((collectionName) => !loadedCollections[collectionName]);

  const allItems = React.useMemo(() => {
    return Object.values(itemsByCollection)
      .flat()
      .sort((a, b) => b.dateMillis - a.dateMillis);
  }, [itemsByCollection]);

  const filterOptions = React.useMemo(() => {
    const options = new Map();

    DEFAULT_FILTERS.forEach((filter) => {
      options.set(normalizeText(filter), filter);
    });

    allItems.forEach((item) => {
      const label = String(item.category || '').trim();
      if (label) {
        options.set(normalizeText(label), label);
      }
    });

    return Array.from(options.values());
  }, [allItems]);

  useEffect(() => {
    if (!activeFilter) {
      return;
    }

    const hasActiveFilter = filterOptions.some(
      (filter) => normalizeText(filter) === normalizeText(activeFilter)
    );

    if (!hasActiveFilter) {
      setActiveFilter('');
    }
  }, [activeFilter, filterOptions]);

  const filteredItems = React.useMemo(() => {
    const normalizedSearch = normalizeText(search);
    const normalizedFilter = normalizeText(activeFilter);

    return allItems.filter((item) => {
      const matchesTab = activeTab === 'mural' || belongsToUser(item, currentUser);
      const matchesSearch = !normalizedSearch || item.searchText.includes(normalizedSearch);
      const matchesFilter =
        !normalizedFilter || normalizeText(item.category).includes(normalizedFilter);

      return matchesTab && matchesSearch && matchesFilter;
    });
  }, [activeFilter, activeTab, allItems, currentUser, search]);

  const columns = width >= 900 ? 4 : width >= 640 ? 3 : 2;
  const horizontalPadding = width >= 640 ? 24 : 16;
  const cardGap = width >= 640 ? 18 : 12;
  const cardWidth = Math.floor((width - horizontalPadding * 2 - cardGap * (columns - 1)) / columns);
  const hasOnlyErrors =
    !loading &&
    filteredItems.length === 0 &&
    allItems.length === 0 &&
    Object.keys(collectionErrors).length === ITEM_COLLECTIONS.length;

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
        <Text style={styles.title}>Mural de Achados e Perdidos</Text>

        <View style={styles.controlsCard}>
          {currentUser ? (
            <View style={styles.tabs}>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.tabIndicator,
                  {
                    width: tabIndicatorWidth,
                    transform: [{ translateX: tabTranslateX }],
                  },
                ]}
              />
              <Pressable
                accessibilityRole="button"
                style={[styles.tab, styles.muralTab]}
                onLayout={(event) => handleTabLayout('mural', event)}
                onPress={() => setActiveTab('mural')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'mural' ? styles.tabTextActive : styles.tabTextInactive,
                  ]}
                >
                  Mural
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                style={[styles.tab, styles.mineTab]}
                onLayout={(event) => handleTabLayout('mine', event)}
                onPress={() => setActiveTab('mine')}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.tabText,
                    activeTab === 'mine' ? styles.tabTextActive : styles.tabTextInactive,
                  ]}
                >
                  Minhas Publicações
                </Text>
              </Pressable>
            </View>
          ) : null}

          {currentUser ? (
            <Pressable
              accessibilityRole="button"
              style={styles.addItemButton}
              onPress={() => navigation.navigate('CadastrarItem')}
            >
              <Ionicons name="add-circle-outline" size={23} color="#ffffff" />
              <Text style={styles.addItemButtonText}>Adicionar item</Text>
            </Pressable>
          ) : null}

          <View style={styles.filtersRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir filtros"
              style={[
                styles.filterButton,
                (filterOpen || activeFilter) && styles.filterButtonActive,
              ]}
              onPress={() => setFilterOpen((open) => !open)}
            >
              <Ionicons
                name={filterOpen ? 'funnel' : 'funnel-outline'}
                size={24}
                color={filterOpen || activeFilter ? '#ffffff' : colors.green_primary}
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
                <Text style={styles.activeFilterText}>{activeFilter}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Remover filtro"
                  hitSlop={10}
                  onPress={() => {
                    setActiveFilter('');
                    setFilterOpen(false);
                  }}
                >
                  <Ionicons name="close-circle" size={20} color={colors.green_primary} />
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
                  <Text style={styles.filterOptionText}>{filter}</Text>
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
          <Text style={styles.emptyText}>Carregando publicações...</Text>
        </View>
      );
    }

    if (hasOnlyErrors) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Não foi possível carregar o mural.</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>Nenhuma publicação encontrada</Text>
      </View>
    );
  }

  function renderItem({ item }) {
    return (
      <Pressable
        style={[styles.card, { width: cardWidth }]}
        accessibilityRole="button"
        onPress={() => navigation.navigate('ItemFullScreen', { item })}
      >
        <View style={styles.cardImageWrap}>
          <Image
            source={getImageSource(item)}
            style={styles.cardImage}
            resizeMode={item.imageUrl ? 'cover' : 'contain'}
          />
        </View>

        {item.category ? (
          <Text numberOfLines={1} style={styles.cardCategory}>
            {item.category}
          </Text>
        ) : null}
        <Text numberOfLines={1} style={styles.cardTitle}>
          {item.title.toUpperCase()}
        </Text>
        <Text numberOfLines={5} style={styles.cardText}>
          {item.description || 'Sem descrição informada.'}
        </Text>
        {item.dateText ? (
          <View style={styles.cardFooter}>
            <Ionicons name="calendar-outline" size={14} color="#6c7568" />
            <Text style={styles.cardDate}>{item.dateText}</Text>
          </View>
        ) : null}
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={colors.green_primary} />

      <View style={styles.topBar}>
        <View style={styles.topBarRow}>
          <View style={styles.logoSurface}>
            <Image source={logoImage} style={styles.logo} />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={currentUser ? 'Abrir perfil' : 'Ir para login'}
            style={currentUser ? styles.profileButton : styles.loginButton}
            onPress={handleAuthPress}
          >
            {currentUser ? (
              <Text style={styles.profileInitial}>{primeiraLetraUser}</Text>
            ) : (
              <>
                <Ionicons name="log-in-outline" size={22} color={colors.green_primary} />
                <Text style={styles.loginText}>Login</Text>
              </>
            )}
          </Pressable>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={22} color={colors.green_primary} />
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
              <Ionicons name="close-circle" size={22} color="#8a9286" />
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
        contentContainerStyle={[styles.listContent, { paddingHorizontal: horizontalPadding }]}
        columnWrapperStyle={columns > 1 ? styles.cardRow : undefined}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f2',
  },
  topBar: {
    minHeight: 158,
    backgroundColor: colors.green_primary,
    gap: 14,
    paddingHorizontal: 18,
    paddingTop: 18,
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
    marginTop: 25,
    resizeMode: 'contain',
  },
  searchBox: {
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    boxShadow: '0 6px 14px rgba(0, 0, 0, 0.12)',
  },
  searchInput: {
    flex: 1,
    color: '#1d2b20',
    fontSize: 16,
    paddingVertical: 0,
    fontFamily: 'MontserratSemiBold',
  },
  profileButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#d8ded4',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 14px rgba(0, 0, 0, 0.12)',
  },
  profileInitial: {
    color: colors.green_primary,
    fontSize: 21,
    fontWeight: '800',
    fontFamily: 'MontserratBold',
  },
  loginButton: {
    height: 44,
    minWidth: 96,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 14,
    boxShadow: '0 6px 14px rgba(0, 0, 0, 0.12)',
  },
  loginText: {
    color: colors.green_primary,
    fontSize: 17,
    fontWeight: '800',
    fontFamily: 'MontserratSemiBold',
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
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 32,
    fontFamily: 'MontserratExtraBold',
  },
  controlsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e6dc',
    padding: 12,
    gap: 12,
    boxShadow: '0 6px 14px rgba(36, 51, 37, 0.08)',
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
    fontFamily: 'MontserratSemiBold',
  },
  filterButtonTextActive: {
    color: '#ffffff',
    fontFamily: 'MontserratSemiBold',
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eef4ea',
    borderRadius: 12,
    padding: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 0,
    borderRadius: 9,
    backgroundColor: colors.green_primary,
  },
  tab: {
    minHeight: 40,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    zIndex: 1,
  },
  muralTab: {
    flex: 0.62,
    minWidth: 72,
  },
  mineTab: {
    flex: 1.38,
    minWidth: 170,
  },
  tabActive: {
    backgroundColor: colors.green_primary,
  },
  tabInactive: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'MontserratSemiBold',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  tabTextInactive: {
    color: '#557056',
  },
  addItemButton: {
    minHeight: 42,
    borderRadius: 10,
    backgroundColor: colors.green_primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
  },
  addItemButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'MontserratSemiBold',
  },
  activeFilterChip: {
    minHeight: 38,
    borderRadius: 10,
    backgroundColor: '#eef4ea',
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
    backgroundColor: '#ffffff',
    padding: 12,
    boxShadow: '0 5px 12px rgba(26, 38, 25, 0.08)',
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
  cardCategory: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    color: colors.green_primary,
    backgroundColor: '#eef7ec',
    borderRadius: 7,
    overflow: 'hidden',
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 7,
  },
  cardTitle: {
    color: '#121a14',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 6,
  },
  cardText: {
    color: '#2e352f',
    fontSize: 13,
    lineHeight: 17,
    flexGrow: 1,
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
    color: '#6c7568',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyText: {
    color: '#8a9587',
    fontSize: 17,
    textAlign: 'center',
    fontFamily: 'MontserratSemiBold',
  },
});
