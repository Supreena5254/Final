import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: 1, name: "Breakfast", icon: "food-croissant", color: "#FED7AA" },
    { id: 2, name: "Lunch", icon: "food", color: "#BBF7D0" },
    { id: 3, name: "Dessert", icon: "cupcake", color: "#FBCFE8" },
    { id: 4, name: "Soup", icon: "food-variant", color: "#A7F3D0" },
  ];

  const recommended = [
    { id: 1, name: "Chocolate Cake", time: "30 mins", calories: "370 kcal" },
    { id: 2, name: "Red Sauce Pasta", time: "25 mins", calories: "290 kcal" },
    { id: 3, name: "Oats", time: "10 mins", calories: "180 kcal" },
  ];

  const quickRecipes = [
    { id: 1, name: "Pancake", time: "12 mins" },
    { id: 2, name: "Mushroom Soup", time: "25 mins" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <MaterialCommunityIcons
              name="chef-hat"
              size={28}
              color="#16a34a"
            />
            <Text style={styles.logoText}>CookMate</Text>
          </View>
        </View>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <Feather name="search" size={18} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for recipe, ingredients, or cuisines..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* RECOMMENDED RECIPES */}
        <Text style={styles.sectionTitle}>Recommended Recipes</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {recommended.map((item) => (
            <View key={item.id} style={styles.recipeCard}>
              <View style={styles.recipeImage}>
                <MaterialCommunityIcons
                  name="food"
                  size={40}
                  color="#16a34a"
                />
                <TouchableOpacity style={styles.heart}>
                  <Feather name="heart" size={16} />
                </TouchableOpacity>
              </View>

              <Text style={styles.recipeName}>{item.name}</Text>
              <Text style={styles.recipeMeta}>
                ⏱ {item.time} • {item.calories}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* POPULAR CATEGORIES */}
        <Text style={styles.sectionTitle}>Popular categories</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {categories.map((cat) => (
            <View key={cat.id} style={styles.categoryItem}>
              <View
                style={[styles.categoryIcon, { backgroundColor: cat.color }]}
              >
                <MaterialCommunityIcons
                  name={cat.icon}
                  size={28}
                  color="#374151"
                />
              </View>
              <Text style={styles.categoryText}>{cat.name}</Text>
            </View>
          ))}
        </ScrollView>

        {/* QUICK RECIPES */}
        <Text style={styles.sectionTitle}>Quick Recipes</Text>

        {quickRecipes.map((item) => (
          <View key={item.id} style={styles.quickCard}>
            <MaterialCommunityIcons
              name="food"
              size={32}
              color="#16a34a"
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.quickName}>{item.name}</Text>
              <Text style={styles.quickTime}>⏱ {item.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    padding: 20,
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoText: {
    fontSize: 26,
    fontWeight: "800",
    color: "#16a34a",
    marginLeft: 8,
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

  searchInput: {
    marginLeft: 10,
    flex: 1,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginHorizontal: 20,
    marginBottom: 12,
  },

  recipeCard: {
    width: 170,
    backgroundColor: "#ecfdf5",
    marginLeft: 20,
    padding: 12,
    borderRadius: 16,
  },

  recipeImage: {
    height: 100,
    backgroundColor: "#d1fae5",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  heart: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 20,
  },

  recipeName: {
    fontWeight: "600",
    fontSize: 16,
  },

  recipeMeta: {
    fontSize: 12,
    color: "#6b7280",
  },

  categoryRow: {
    paddingHorizontal: 20,
  },

  categoryItem: {
    alignItems: "center",
    marginRight: 20,
  },

  categoryIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },

  categoryText: {
    fontSize: 12,
  },

  quickCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
  },

  quickName: {
    fontWeight: "600",
  },

  quickTime: {
    fontSize: 12,
    color: "#6b7280",
  },
});
