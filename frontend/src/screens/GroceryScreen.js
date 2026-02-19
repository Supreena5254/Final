import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import api from "../api/api";

export default function GroceryScreen() {
  const [groceryList, setGroceryList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load grocery list when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadGroceryList();
    }, [])
  );

  const loadGroceryList = async () => {
    try {
      setLoading(true);
      const response = await api.get("/grocery");
      console.log("✅ Grocery list loaded:", response.data);
      setGroceryList(response.data);
    } catch (error) {
      console.error("❌ Error loading grocery list:", error);
      setGroceryList([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleIngredient = async (groceryId, ingredientIndex) => {
    try {
      const response = await api.put(`/grocery/toggle/${groceryId}`, {
        ingredientIndex
      });

      console.log("✅ Ingredient toggled:", response.data);

      // Update local state
      setGroceryList(prevList =>
        prevList.map(item =>
          item.grocery_id === groceryId
            ? { ...item, ingredients: response.data.groceryItem.ingredients }
            : item
        )
      );

      // Check if all ingredients are checked
      const updatedItem = response.data.groceryItem;
      const allChecked = updatedItem.ingredients.every(ing => ing.checked);

      if (allChecked) {
        setTimeout(() => {
          Alert.alert(
            "All Done! 🎉",
            `All ingredients for "${updatedItem.recipe_name}" are checked. Remove from list?`,
            [
              { text: "Keep It", style: "cancel" },
              {
                text: "Remove",
                onPress: () => deleteGroceryItem(groceryId),
              },
            ]
          );
        }, 300);
      }
    } catch (error) {
      console.error("Error toggling ingredient:", error);
      Alert.alert("Error", "Failed to update ingredient");
    }
  };

  const deleteGroceryItem = async (groceryId) => {
    try {
      await api.delete(`/grocery/${groceryId}`);
      console.log("✅ Grocery item deleted");
      setGroceryList(prevList => prevList.filter(item => item.grocery_id !== groceryId));
    } catch (error) {
      console.error("Error deleting grocery item:", error);
      Alert.alert("Error", "Failed to delete item");
    }
  };

  const confirmDeleteItem = (groceryId, recipeName) => {
    Alert.alert(
      "Delete Recipe",
      `Remove "${recipeName}" from your grocery list?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteGroceryItem(groceryId),
        },
      ]
    );
  };

  const clearAllGroceryList = async () => {
    Alert.alert(
      "Clear All",
      "Remove all recipes from your grocery list?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete("/grocery");
              console.log("✅ Grocery list cleared");
              setGroceryList([]);
            } catch (error) {
              console.error("Error clearing grocery list:", error);
              Alert.alert("Error", "Failed to clear list");
            }
          },
        },
      ]
    );
  };

  const RecipeSection = ({ item }) => {
    const checkedCount = item.ingredients.filter(ing => ing.checked).length;
    const totalCount = item.ingredients.length;
    const allChecked = checkedCount === totalCount;

    return (
      <View style={styles.section}>
        {/* Recipe Header */}
        <View style={styles.recipeHeader}>
          <View style={styles.recipeHeaderLeft}>
            <Text style={styles.recipeName}>{item.recipe_name}</Text>
            <Text style={styles.progressText}>
              {checkedCount} / {totalCount} items
            </Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => confirmDeleteItem(item.grocery_id, item.recipe_name)}
          >
            <Feather name="trash-2" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(checkedCount / totalCount) * 100}%` }
            ]}
          />
        </View>

        {/* Ingredients List */}
        {item.ingredients.map((ingredient, ingredientIndex) => (
          <TouchableOpacity
            key={ingredientIndex}
            style={styles.ingredientRow}
            onPress={() => toggleIngredient(item.grocery_id, ingredientIndex)}
          >
            <View style={styles.ingredientContent}>
              <View style={styles.checkboxContainer}>
                <View
                  style={[
                    styles.checkbox,
                    ingredient.checked && styles.checkboxChecked,
                  ]}
                >
                  {ingredient.checked && (
                    <Feather name="check" size={16} color="#FFF" />
                  )}
                </View>
              </View>

              {/* Ingredient name */}
              <Text
                style={[
                  styles.ingredientName,
                  ingredient.checked && styles.ingredientNameChecked,
                ]}
              >
                {ingredient.name}
              </Text>

              {/* Quantity on the right */}
              {ingredient.quantity && (
                <Text
                  style={[
                    styles.quantityText,
                    ingredient.checked && styles.quantityTextChecked
                  ]}
                >
                  {ingredient.quantity}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* All Checked Badge */}
        {allChecked && (
          <View style={styles.completedBadge}>
            <Feather name="check-circle" size={16} color="#27AE60" />
            <Text style={styles.completedText}>All items collected!</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>Loading grocery list...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Grocery List</Text>
          <Text style={styles.subtitle}>
            {groceryList.length} recipe{groceryList.length !== 1 ? "s" : ""}
          </Text>
        </View>
        {groceryList.length > 0 && (
          <TouchableOpacity
            style={styles.clearAllButton}
            onPress={clearAllGroceryList}
          >
            <Feather name="trash-2" size={20} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {groceryList.length > 0 ? (
          <>
            {groceryList.map((item) => (
              <RecipeSection
                key={item.grocery_id}
                item={item}
              />
            ))}
            <View style={{ height: 40 }} />
          </>
        ) : (
          <View style={styles.emptyState}>
            <Feather name="shopping-cart" size={80} color="#E0E0E0" />
            <Text style={styles.emptyTitle}>Your grocery list is empty</Text>
            <Text style={styles.emptySubtitle}>
              Add ingredients from recipe details to start your list
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  subtitle: {
    fontSize: 14,
    color: "#95A5A6",
    marginTop: 4,
  },
  clearAllButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  recipeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  recipeHeaderLeft: {
    flex: 1,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 4,
  },
  progressText: {
    fontSize: 13,
    color: "#95A5A6",
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#F0F0F0",
    borderRadius: 3,
    marginBottom: 16,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#27AE60",
    borderRadius: 3,
  },
  ingredientRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  ingredientContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#27AE60",
    borderColor: "#27AE60",
  },
  ingredientName: {
    fontSize: 15,
    color: "#2C3E50",
    flex: 1,
  },
  ingredientNameChecked: {
    color: "#95A5A6",
    textDecorationLine: "line-through",
  },
  quantityText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#16a34a",
    marginLeft: 12,
  },
  quantityTextChecked: {
    color: "#95A5A6",
    textDecorationLine: "line-through",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F8F0",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  completedText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#27AE60",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C3E50",
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#95A5A6",
    textAlign: "center",
    lineHeight: 22,
  },
});