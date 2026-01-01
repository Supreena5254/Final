import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";

// Green Color Theme
const COLORS = {
  primary: "#16a34a",
  darkGreen: "#15803d",
  lightGreen: "#f0fdf4",
  selectedGreen: "#bbf7d0",
  mediumGreen: "#22c55e",
  textGray: "#666",
};

const Option = ({ label, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.option, selected && styles.selected]}
    onPress={onPress}
  >
    <Text style={[styles.optionText, selected && styles.selectedText]}>
      {label}
    </Text>
    {selected && <Feather name="check-circle" size={20} color={COLORS.primary} />}
  </TouchableOpacity>
);

export default function PreferenceFormScreen({ navigation }) {
  const [dietType, setDietType] = useState(null);
  const [skillLevel, setSkillLevel] = useState(null);
  const [mealGoal, setMealGoal] = useState(null);
  const [healthGoal, setHealthGoal] = useState(null);
  const [allergies, setAllergies] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleMulti = (value, list, setList) => {
    setList(
      list.includes(value)
        ? list.filter(v => v !== value)
        : [...list, value]
    );
  };

  const submitPreferences = async () => {
    // Validation - at least one preference should be selected
    if (!dietType && !skillLevel && !mealGoal && !healthGoal && 
        allergies.length === 0 && cuisines.length === 0) {
      Alert.alert("Incomplete", "Please select at least one preference");
      return;
    }

    setLoading(true);

    try {
      const preferencesData = {
        diet_type: dietType,
        skill_level: skillLevel,
        meal_goal: mealGoal,
        health_goal: healthGoal,
        allergies: allergies.length > 0 ? allergies.join(", ") : null,
        cuisines: cuisines.length > 0 ? cuisines.join(", ") : null,
      };

      console.log("📤 Sending preferences to PUT /auth/preferences");

      // ✅ CORRECT: PUT method (not POST!)
      // Backend route: router.put("/preferences", authMiddleware, authController.updatePreferences)
      const response = await api.put("/auth/preferences", preferencesData);
      
      console.log("✅ Preferences saved successfully:", response.data);

      // Store flag in AsyncStorage so user doesn't see this form again
      await AsyncStorage.setItem("preferences_completed", "true");

      Alert.alert("Success! 🎉", "Your preferences have been saved", [
        {
          text: "Continue",
          onPress: () => {
            // Navigate to MainTabs (your main app)
            navigation.reset({
              index: 0,
              routes: [{ name: "MainTabs" }],
            });
          },
        },
      ]);
    } catch (err) {
      console.error("❌ Preferences error:", err.response?.data || err.message);
      console.error("❌ Full error:", err);
      
      // Check if it's a 404 error (route not found)
      if (err.response?.status === 404) {
        Alert.alert(
          "Backend Error", 
          "Preferences endpoint not found. Please check your backend routes.\n\nTried: POST /preferences\n\nExpected routes:\n- POST /preferences\n- PUT /preferences\n- POST /user/preferences"
        );
      } else {
        const errorMsg = err.response?.data?.error || 
                         err.response?.data?.message || 
                         "Failed to save preferences. Please try again.";
        
        Alert.alert("Error", errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Feather name="settings" size={40} color={COLORS.primary} />
        <Text style={styles.title}>Tell us about you</Text>
        <Text style={styles.subtitle}>
          Help us personalize your cooking experience
        </Text>
      </View>

      {/* Diet Type */}
      <View style={styles.section}>
        <Text style={styles.label}>
          <Feather name="heart" size={16} color={COLORS.primary} /> Diet Type
        </Text>
        {["Veg", "Non-Veg", "Vegan"].map(v => (
          <Option 
            key={v} 
            label={v} 
            selected={dietType === v} 
            onPress={() => setDietType(v)} 
          />
        ))}
      </View>

      {/* Cooking Skill */}
      <View style={styles.section}>
        <Text style={styles.label}>
          <Feather name="award" size={16} color={COLORS.primary} /> Cooking Skill
        </Text>
        {["Beginner", "Intermediate", "Advanced"].map(v => (
          <Option 
            key={v} 
            label={v} 
            selected={skillLevel === v} 
            onPress={() => setSkillLevel(v)} 
          />
        ))}
      </View>

      {/* Meal Goal */}
      <View style={styles.section}>
        <Text style={styles.label}>
          <Feather name="clock" size={16} color={COLORS.primary} /> Meal Goal
        </Text>
        {["Breakfast", "Lunch", "Dinner", "Snacks"].map(v => (
          <Option 
            key={v} 
            label={v} 
            selected={mealGoal === v} 
            onPress={() => setMealGoal(v)} 
          />
        ))}
      </View>

      {/* Health Goal */}
      <View style={styles.section}>
        <Text style={styles.label}>
          <Feather name="target" size={16} color={COLORS.primary} /> Health Goal
        </Text>
        {["Weight Loss", "Muscle Gain", "Balanced Diet", "General Health"].map(v => (
          <Option 
            key={v} 
            label={v} 
            selected={healthGoal === v} 
            onPress={() => setHealthGoal(v)} 
          />
        ))}
      </View>

      {/* Allergies */}
      <View style={styles.section}>
        <Text style={styles.label}>
          <Feather name="alert-circle" size={16} color={COLORS.primary} /> Allergies (Select all that apply)
        </Text>
        {["Peanuts", "Milk", "Eggs", "Seafood", "Soy", "Gluten", "None"].map(v => (
          <Option 
            key={v} 
            label={v} 
            selected={allergies.includes(v)} 
            onPress={() => toggleMulti(v, allergies, setAllergies)} 
          />
        ))}
      </View>

      {/* Preferred Cuisines */}
      <View style={styles.section}>
        <Text style={styles.label}>
          <Feather name="globe" size={16} color={COLORS.primary} /> Preferred Cuisines (Select all that apply)
        </Text>
        {["Indian", "Italian", "Chinese", "Mexican", "Thai", "Japanese", "Continental"].map(v => (
          <Option 
            key={v} 
            label={v} 
            selected={cuisines.includes(v)} 
            onPress={() => toggleMulti(v, cuisines, setCuisines)} 
          />
        ))}
      </View>

      {/* Submit Button */}
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={submitPreferences}
        disabled={loading}
      >
        {loading ? (
          <>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.buttonText}>Saving...</Text>
          </>
        ) : (
          <>
            <Feather name="check" size={20} color="#fff" />
            <Text style={styles.buttonText}>Save & Continue</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  title: { 
    fontSize: 28, 
    fontWeight: "700", 
    marginTop: 15,
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textGray,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  label: { 
    fontSize: 16, 
    fontWeight: "600", 
    marginBottom: 12,
    color: COLORS.darkGreen,
  },
  option: { 
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16, 
    borderRadius: 12, 
    backgroundColor: COLORS.lightGreen,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selected: { 
    backgroundColor: COLORS.selectedGreen,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  selectedText: {
    color: COLORS.darkGreen,
    fontWeight: "600",
  },
  button: { 
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    padding: 18, 
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: COLORS.mediumGreen,
    opacity: 0.7,
  },
  buttonText: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "600",
    marginLeft: 8,
  },
});