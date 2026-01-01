import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";

const COLORS = {
  primary: "#16a34a",
  darkGreen: "#15803d",
  lightGreen: "#f0fdf4",
  selectedGreen: "#bbf7d0",
  textGray: "#666",
};

const Option = ({ label, selected, onPress, disabled }) => (
  <TouchableOpacity
    style={[styles.option, selected && styles.selected, disabled && styles.optionDisabled]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={[styles.optionText, selected && styles.selectedText]}>
      {label}
    </Text>
    {selected && <Feather name="check-circle" size={20} color={COLORS.primary} />}
  </TouchableOpacity>
);

export default function ProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Personal info edit states
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  // Preferences edit states
  const [dietType, setDietType] = useState(null);
  const [skillLevel, setSkillLevel] = useState(null);
  const [mealGoal, setMealGoal] = useState(null);
  const [healthGoal, setHealthGoal] = useState(null);
  const [allergies, setAllergies] = useState([]);
  const [cuisines, setCuisines] = useState([]);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProfile();
    });
    return unsubscribe;
  }, [navigation]);

  const parseArrayOrString = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value.split(',').map(item => item.trim()).filter(Boolean);
    }
    return [];
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get("/auth/profile");
      console.log("✅ Profile loaded:", response.data);
      const user = response.data.user;
      setUserData(user);

      // Personal info
      setFullName(user.full_name || "");
      setDateOfBirth(user.date_of_birth ? user.date_of_birth.split('T')[0] : "");

      // Preferences
      setDietType(user.diet_type);
      setSkillLevel(user.skill_level);
      setMealGoal(user.meal_goal);
      setHealthGoal(user.health_goal);
      setAllergies(parseArrayOrString(user.allergies));
      setCuisines(parseArrayOrString(user.cuisines));

    } catch (error) {
      console.error("❌ Profile error:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const toggleMulti = (value, list, setList) => {
    setList(
      list.includes(value)
        ? list.filter(v => v !== value)
        : [...list, value]
    );
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset to original values
      setFullName(userData.full_name || "");
      setDateOfBirth(userData.date_of_birth ? userData.date_of_birth.split('T')[0] : "");
      setDietType(userData.diet_type);
      setSkillLevel(userData.skill_level);
      setMealGoal(userData.meal_goal);
      setHealthGoal(userData.health_goal);
      setAllergies(parseArrayOrString(userData.allergies));
      setCuisines(parseArrayOrString(userData.cuisines));
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    // Validation
    if (!fullName.trim()) {
      Alert.alert("Validation Error", "Full name is required");
      return;
    }

    setSaving(true);

    try {
      // Update personal info
      const profileData = {
        full_name: fullName.trim(),
        date_of_birth: dateOfBirth || null,
      };

      console.log("📤 Updating profile with PUT /auth/profile");
      await api.put("/auth/profile", profileData);

      // Update preferences
      const preferencesData = {
        diet_type: dietType,
        skill_level: skillLevel,
        meal_goal: mealGoal,
        health_goal: healthGoal,
        allergies: allergies.length > 0 ? allergies.join(", ") : null,
        cuisines: cuisines.length > 0 ? cuisines.join(", ") : null,
      };

      console.log("📤 Updating preferences with PUT /auth/preferences");
      console.log("📋 Preferences data being sent:", preferencesData);

      await api.put("/auth/preferences", preferencesData);

      console.log("✅ Profile and preferences updated successfully");

      Alert.alert("Success! 🎉", "Your profile has been updated");

      // Reload profile and exit edit mode
      await loadProfile();
      setIsEditing(false);
    } catch (err) {
      console.error("❌ Update error:", err.response?.data || err.message);
      console.error("❌ Full error object:", err);

      const errorMsg = err.response?.data?.details ||
                       err.response?.data?.error ||
                       err.response?.data?.message ||
                       "Failed to update profile. Please try again.";

      Alert.alert("Error", errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          },
        },
      ]
    );
  };

  const displayArrayValue = (value) => {
    if (!value) return "Not set";
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(", ") : "Not set";
    }
    return value || "Not set";
  };

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Feather name={icon} size={20} color={COLORS.primary} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue} numberOfLines={2}>
        {typeof value === 'string' || typeof value === 'number'
          ? (value || "Not set")
          : displayArrayValue(value)
        }
      </Text>
    </View>
  );

  const EditInputRow = ({ icon, label, value, onChangeText, placeholder, keyboardType = "default" }) => (
    <View style={styles.editInputRow}>
      <View style={styles.editInputLabel}>
        <Feather name={icon} size={20} color={COLORS.primary} />
        <Text style={styles.editInputLabelText}>{label}</Text>
      </View>
      <TextInput
        style={styles.editInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        keyboardType={keyboardType}
        editable={!saving}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Feather name="alert-circle" size={48} color={COLORS.textGray} />
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditToggle}
          disabled={saving}
        >
          <Feather
            name={isEditing ? "x" : "edit-2"}
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.editButtonText}>
            {isEditing ? "Cancel" : "Edit"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* User Info Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Feather name="user" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.name}>{userData.full_name || "User"}</Text>
          <Text style={styles.email}>{userData.email}</Text>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          {!isEditing ? (
            <View style={styles.card}>
              <InfoRow icon="user" label="Full Name" value={userData.full_name} />
              <InfoRow icon="mail" label="Email" value={userData.email} />
              <InfoRow
                icon="calendar"
                label="Date of Birth"
                value={userData.date_of_birth ? new Date(userData.date_of_birth).toLocaleDateString() : null}
              />
            </View>
          ) : (
            <View style={styles.card}>
              <EditInputRow
                icon="user"
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
              />
              <View style={styles.staticInfoRow}>
                <View style={styles.infoLeft}>
                  <Feather name="mail" size={20} color={COLORS.textGray} />
                  <Text style={styles.infoLabel}>Email</Text>
                </View>
                <Text style={styles.staticInfoText}>{userData.email}</Text>
              </View>
              <EditInputRow
                icon="calendar"
                label="Date of Birth"
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="YYYY-MM-DD"
              />
            </View>
          )}
        </View>

        {/* Cooking Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cooking Preferences</Text>

          {!isEditing ? (
            <View style={styles.card}>
              <InfoRow icon="heart" label="Diet Type" value={userData.diet_type} />
              <InfoRow icon="award" label="Skill Level" value={userData.skill_level} />
              <InfoRow icon="clock" label="Meal Goal" value={userData.meal_goal} />
              <InfoRow icon="target" label="Health Goal" value={userData.health_goal} />
              <InfoRow icon="alert-circle" label="Allergies" value={userData.allergies} />
              <InfoRow icon="globe" label="Cuisines" value={userData.cuisines} />
            </View>
          ) : (
            <View>
              <View style={styles.editSection}>
                <Text style={styles.label}>
                  <Feather name="heart" size={16} color={COLORS.primary} /> Diet Type
                </Text>
                {["Veg", "Non-Veg", "Vegan"].map(v => (
                  <Option
                    key={v}
                    label={v}
                    selected={dietType === v}
                    onPress={() => setDietType(v)}
                    disabled={saving}
                  />
                ))}
              </View>

              <View style={styles.editSection}>
                <Text style={styles.label}>
                  <Feather name="award" size={16} color={COLORS.primary} /> Cooking Skill
                </Text>
                {["Beginner", "Intermediate", "Advanced"].map(v => (
                  <Option
                    key={v}
                    label={v}
                    selected={skillLevel === v}
                    onPress={() => setSkillLevel(v)}
                    disabled={saving}
                  />
                ))}
              </View>

              <View style={styles.editSection}>
                <Text style={styles.label}>
                  <Feather name="clock" size={16} color={COLORS.primary} /> Meal Goal
                </Text>
                {["Breakfast", "Lunch", "Dinner", "Snacks"].map(v => (
                  <Option
                    key={v}
                    label={v}
                    selected={mealGoal === v}
                    onPress={() => setMealGoal(v)}
                    disabled={saving}
                  />
                ))}
              </View>

              <View style={styles.editSection}>
                <Text style={styles.label}>
                  <Feather name="target" size={16} color={COLORS.primary} /> Health Goal
                </Text>
                {["Weight Loss", "Muscle Gain", "Balanced Diet", "General Health"].map(v => (
                  <Option
                    key={v}
                    label={v}
                    selected={healthGoal === v}
                    onPress={() => setHealthGoal(v)}
                    disabled={saving}
                  />
                ))}
              </View>

              <View style={styles.editSection}>
                <Text style={styles.label}>
                  <Feather name="alert-circle" size={16} color={COLORS.primary} /> Allergies
                </Text>
                {["Peanuts", "Milk", "Eggs", "Seafood", "Soy", "Gluten", "None"].map(v => (
                  <Option
                    key={v}
                    label={v}
                    selected={allergies.includes(v)}
                    onPress={() => toggleMulti(v, allergies, setAllergies)}
                    disabled={saving}
                  />
                ))}
              </View>

              <View style={styles.editSection}>
                <Text style={styles.label}>
                  <Feather name="globe" size={16} color={COLORS.primary} /> Cuisines
                </Text>
                {["Indian", "Italian", "Chinese", "Mexican", "Thai", "Japanese", "Continental"].map(v => (
                  <Option
                    key={v}
                    label={v}
                    selected={cuisines.includes(v)}
                    onPress={() => toggleMulti(v, cuisines, setCuisines)}
                    disabled={saving}
                  />
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Account Actions - ONLY SHOW IN VIEW MODE */}
        {!isEditing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.actionRow}
                onPress={handleLogout}
              >
                <View style={styles.actionLeft}>
                  <Feather name="log-out" size={20} color="#dc2626" />
                  <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#dc2626" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Save Button */}
      {isEditing && (
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.saveButtonText}>Saving...</Text>
              </>
            ) : (
              <>
                <Feather name="check" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Save All Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textGray,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textGray,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.lightGreen,
  },
  editButtonText: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 30,
    backgroundColor: COLORS.lightGreen,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: COLORS.textGray,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.darkGreen,
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.lightGreen,
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.textGray,
    textAlign: "right",
    flex: 1,
  },
  editInputRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  editInputLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  editInputLabelText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  editInput: {
    fontSize: 15,
    color: "#333",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  staticInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  staticInfoText: {
    fontSize: 15,
    color: COLORS.textGray,
    fontStyle: "italic",
  },
  editSection: {
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
  optionDisabled: {
    opacity: 0.5,
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
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  logoutText: {
    color: "#dc2626",
  },
  saveButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: "#86efac",
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
});