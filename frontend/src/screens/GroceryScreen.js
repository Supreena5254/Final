import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GroceryScreen() {
  const [checked, setChecked] = useState({});

  const toggle = (item) =>
    setChecked((prev) => ({ ...prev, [item]: !prev[item] }));

  const Section = ({ title, servings, items }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.servings}>{servings} Servings</Text>
      </View>

      {items.map((item) => (
        <TouchableOpacity
          key={item}
          style={styles.row}
          onPress={() => toggle(item)}
        >
          <Text style={styles.itemText}>{item}</Text>
          <Feather
            name={checked[item] ? "check-square" : "square"}
            size={18}
            color="#f97316"
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Grocery List</Text>
          <TouchableOpacity style={styles.add}>
            <Feather name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <Section
          title="Banana Pancakes"
          servings={6}
          items={["Banana", "Egg", "Flour", "Milk"]}
        />

        <Section
          title="Chicken Curry"
          servings={3}
          items={["Chicken", "Onion", "Tomato", "Ginger"]}
        />

        <Section
          title="Checked Items"
          servings={4}
          items={["Honey", "Garlic", "Spices"]}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 20,
  },
  title: { fontSize: 22, fontWeight: "700" },
  add: {
    backgroundColor: "#f97316",
    padding: 8,
    borderRadius: 20,
  },

  section: {
    backgroundColor: "#f3f4f6",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 12,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: { fontWeight: "600" },
  servings: { fontSize: 12, color: "#6b7280" },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  itemText: { fontSize: 14 },
});
