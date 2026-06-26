import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { auth, db } from "../utils/firebase.js";
import {
  getDateMillis,
  normalizePublicacao,
  PUBLICACOES_COLLECTION,
} from "../services/publicacoes.js";

function MinhasPublicacoes({ navigation }) {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [publicacoes, setPublicacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const primeiraLetraUser = currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : "?";

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setPublicacoes([]);
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!currentUser) {
      return undefined;
    }

    setLoading(true);

    const minhasPublicacoesQuery = query(
      collection(db, PUBLICACOES_COLLECTION),
      where("userId", "==", currentUser.uid)
    );

    return onSnapshot(
      minhasPublicacoesQuery,
      (snapshot) => {
        const items = snapshot.docs
          .map((docSnapshot) => normalizePublicacao(docSnapshot, PUBLICACOES_COLLECTION))
          .sort((a, b) => getDateMillis(b.createdAt) - getDateMillis(a.createdAt));

        setPublicacoes(items);
        setLoading(false);
      },
      (error) => {
        console.log("Erro ao carregar publicações:", error);
        setLoading(false);
      }
    );
  }, [currentUser]);

  const data = useMemo(() => formatData([...publicacoes], 2), [publicacoes]);

  function formatData(dataList, numColumns) {
    const numberOfFullRows = Math.floor(dataList.length / numColumns);
    let numberOfElementsLastRow = dataList.length - numberOfFullRows * numColumns;

    while (numberOfElementsLastRow !== numColumns && numberOfElementsLastRow !== 0) {
      dataList.push({ id: `blank-${numberOfElementsLastRow}`, empty: true });
      numberOfElementsLastRow++;
    }
    return dataList;
  }

  function renderEmptyState() {
    if (loading) {
      return (
        <View style={styles.emptyBox}>
          <ActivityIndicator color="#009933" />
          <Text style={styles.emptyText}>Carregando publicações...</Text>
        </View>
      );
    }

    if (!currentUser) {
      return (
        <TouchableOpacity style={styles.loginPrompt} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.emptyText}>Entre na sua conta para ver suas publicações.</Text>
        </TouchableOpacity>
      );
    }

    return <Text style={styles.emptyText}>Nenhum item publicado ainda.</Text>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topAppBar}>
        <View style={styles.boxIconContainer}>
          <Text style={styles.boxIconEmoji}>📦</Text>
        </View>

        <View style={styles.searchBarContainer}>
          <TextInput style={styles.searchBarInput} placeholder="" editable={false} />
          <Text style={styles.searchIconEmoji}>🔍</Text>
        </View>

        <TouchableOpacity style={styles.avatarButton} onPress={() => navigation.navigate("Perfil")}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{primeiraLetraUser}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <Text style={styles.screenTitle}>Minhas Publicações</Text>

        <View style={styles.tabsRow}>
          <View style={styles.leftTabs}>
            <TouchableOpacity style={styles.muralTabButton} onPress={() => navigation.navigate("Home")}>
              <Text style={styles.muralTabButtonText}>Mural</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.minhasPublicacoesTabButton}>
              <Text style={styles.minhasPublicacoesTabButtonText}>Minhas Publicações</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.plusButton}
            onPress={() => navigation.navigate(currentUser ? "CadastrarItem" : "Login")}
          >
            <Text style={styles.plus}>+</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
          renderItem={({ item }) => {
            if (item.empty) {
              return <View style={[styles.card, styles.cardInvisible]} />;
            }

            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => navigation.navigate("EditarItem", { item })}
              >
                <View style={styles.imageContainer}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.image} />
                  ) : (
                    <View style={styles.noImagePlaceholder}>
                      <Text style={styles.noImageText}>Sem foto</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.titulo || "SEM TÍTULO"}
                  </Text>
                  <Text style={styles.itemDescription} numberOfLines={3}>
                    {item.descricao || "Sem descrição"}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={renderEmptyState}
        />
      </View>
    </SafeAreaView>
  );
}

export default MinhasPublicacoes;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topAppBar: {
    backgroundColor: "#009933",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    height: 70,
  },
  boxIconContainer: {
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  boxIconEmoji: {
    fontSize: 32,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#fff",
    borderRadius: 20,
    height: 35,
    marginHorizontal: 15,
    paddingHorizontal: 10,
  },
  searchBarInput: {
    flex: 1,
    color: "#fff",
  },
  searchIconEmoji: {
    fontSize: 14,
    color: "#fff",
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#009933",
    fontWeight: "bold",
    fontSize: 18,
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 25,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#009933",
    textAlign: "center",
    marginBottom: 20,
  },
  tabsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  leftTabs: {
    flexDirection: "row",
    gap: 10,
  },
  muralTabButton: {
    backgroundColor: "#a3d9a5",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
  muralTabButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  minhasPublicacoesTabButton: {
    backgroundColor: "#009933",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#007722",
  },
  minhasPublicacoesTabButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  plusButton: {
    backgroundColor: "#b3b3b3",
    width: 35,
    height: 35,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  plus: {
    fontSize: 26,
    color: "#fff",
    fontWeight: "normal",
    marginTop: -3,
  },
  row: {
    flex: 1,
    justifyContent: "space-between",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#000",
    flex: 0.48,
    padding: 8,
  },
  cardInvisible: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
  imageContainer: {
    width: "100%",
    height: 120,
    backgroundColor: "#bbb",
    marginBottom: 8,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  noImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    color: "#666",
    fontSize: 12,
  },
  cardContent: {
    paddingHorizontal: 2,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
    textTransform: "uppercase",
    marginBottom: 5,
  },
  itemDescription: {
    fontSize: 12,
    color: "#333",
    lineHeight: 16,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingTop: 40,
  },
  loginPrompt: {
    paddingTop: 40,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 40,
    fontSize: 16,
  },
});
