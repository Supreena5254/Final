import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function IngredientSearchScreen() {
  const [query, setQuery] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Search by Ingredients</Text>

      <View style={styles.searchBox}>
        <Feather name="search" size={18} color="#6b7280" />
        <TextInput
          placeholder="Enter ingredients (e.g. egg, milk)"
          value={query}
          onChangeText={setQuery}
          style={styles.input}
          placeholderTextColor="#9ca3af"
        />
      </View>

      <ScrollView>
        <Text style={styles.hint}>
          Results will appear here based on ingredients.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 12,
  },
  input: { marginLeft: 10, flex: 1 },
  hint: { marginTop: 20, color: "#6b7280" },
});
