import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FavoritesScreen() {
  const favorites = [
    { id: 1, name: "Apple pie", calories: "350 kcal" },
    { id: 2, name: "Ramen", calories: "450 kcal" },
    { id: 3, name: "Bread toast", calories: "280 kcal" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <Text style={styles.title}>Favorites</Text>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color="#6b7280" />
          <TextInput
            placeholder="Find the recipe"
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
          />
        </View>

        {/* FAVORITE CARDS */}
        <View style={styles.grid}>
          {favorites.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.imageBox}>
                <MaterialCommunityIcons
                  name="food"
                  size={40}
                  color="#16a34a"
                />
                <TouchableOpacity style={styles.heart}>
                  <Feather name="heart" size={16} color="#16a34a" />
                </TouchableOpacity>
              </View>

              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>{item.calories}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  title: {
    fontSize: 22,
    fontWeight: "700",
    margin: 20,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },

  searchInput: { marginLeft: 10, flex: 1 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 15,
  },

  card: {
    width: "47%",
    backgroundColor: "#ecfdf5",
    padding: 12,
    borderRadius: 16,
  },

  imageBox: {
    height: 110,
    backgroundColor: "#d1fae5",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  heart: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 20,
  },

  cardTitle: { fontWeight: "600", fontSize: 14 },
  cardMeta: { fontSize: 12, color: "#6b7280" },
});
