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
  Modal,
  Dimensions,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../api/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const COLORS = {
  primary:      "#16a34a",
  darkGreen:    "#15803d",
  lightGreen:   "#f0fdf4",
  selectedGreen:"#bbf7d0",
  textGray:     "#666",
};

// ─── Tiny SVG-style Pie Chart (React Native) ────────────────────────────────
// Renders a simple donut chart using nested Views + border-radius trick
const DonutChart = ({ protein, carbs, fats }) => {
  const total = protein + carbs + fats;
  if (total === 0) {
    return (
      <View style={donutStyles.empty}>
        <Text style={donutStyles.emptyText}>No data</Text>
      </View>
    );
  }
  const pPct = (protein / total) * 100;
  const cPct = (carbs   / total) * 100;
  const fPct = (fats    / total) * 100;

  const segments = [
    { label: "Protein", value: protein, pct: pPct, color: "#16a34a" },
    { label: "Carbs",   value: carbs,   pct: cPct, color: "#f59e0b" },
    { label: "Fats",    value: fats,    pct: fPct, color: "#ef4444" },
  ];

  return (
    <View style={donutStyles.wrapper}>
      {/* Stacked bar approach — clean & works without SVG */}
      <View style={donutStyles.barRow}>
        {segments.map((s) => (
          <View
            key={s.label}
            style={[
              donutStyles.barSegment,
              { flex: s.pct, backgroundColor: s.color },
            ]}
          />
        ))}
      </View>
      {/* Legend */}
      <View style={donutStyles.legend}>
        {segments.map((s) => (
          <View key={s.label} style={donutStyles.legendItem}>
            <View style={[donutStyles.dot, { backgroundColor: s.color }]} />
            <Text style={donutStyles.legendLabel}>{s.label}</Text>
            <Text style={donutStyles.legendValue}>{Math.round(s.value)}g</Text>
            <Text style={donutStyles.legendPct}>({Math.round(s.pct)}%)</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const donutStyles = StyleSheet.create({
  wrapper:     { width: "100%" },
  barRow:      { flexDirection: "row", height: 22, borderRadius: 11, overflow: "hidden", marginBottom: 16 },
  barSegment:  { height: "100%" },
  legend:      { gap: 8 },
  legendItem:  { flexDirection: "row", alignItems: "center", gap: 8 },
  dot:         { width: 12, height: 12, borderRadius: 6 },
  legendLabel: { fontSize: 14, fontWeight: "600", color: "#2C3E50", width: 60 },
  legendValue: { fontSize: 14, fontWeight: "700", color: "#2C3E50" },
  legendPct:   { fontSize: 12, color: "#95A5A6" },
  empty:       { alignItems: "center", paddingVertical: 20 },
  emptyText:   { color: "#95A5A6", fontSize: 14 },
});

// ─── Weekly Summary Modal ────────────────────────────────────────────────────
function WeeklySummaryModal({ visible, onClose }) {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    if (visible) loadSummary();
  }, [visible]);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem("cooked_recipes");
      const allCooked = raw ? JSON.parse(raw) : [];

      // Filter to last 7 days
      const now  = new Date();
      const week = new Date(now);
      week.setDate(now.getDate() - 6);
      week.setHours(0, 0, 0, 0);

      const weekCooked = allCooked.filter((e) => new Date(e.cooked_at) >= week);

      // Aggregate
      const totalCalories = weekCooked.reduce((s, e) => s + (e.calories || 0), 0);
      const totalProtein  = weekCooked.reduce((s, e) => s + (e.protein  || 0), 0);
      const totalCarbs    = weekCooked.reduce((s, e) => s + (e.carbs    || 0), 0);
      const totalFats     = weekCooked.reduce((s, e) => s + (e.fats     || 0), 0);

      // Unique cuisines
      const cuisineSet = new Set(weekCooked.map((e) => e.cuisine).filter(Boolean));

      // Build per-day map (Mon-Sun)
      const dayMap = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const key = d.toDateString();
        dayMap[key] = {
          date:    d,
          recipes: weekCooked.filter(
            (e) => new Date(e.cooked_at).toDateString() === key
          ),
        };
      }

      // Date range label  e.g.  "Feb 11 – Feb 17, 2026"
      const fmt = (d) =>
        d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const dateRangeLabel =
        `${fmt(week)} – ${fmt(now)}, ${now.getFullYear()}`;

      setSummaryData({
        dateRangeLabel,
        totalRecipes:  weekCooked.length,
        totalCalories: Math.round(totalCalories),
        totalProtein:  Math.round(totalProtein),
        totalCarbs:    Math.round(totalCarbs),
        totalFats:     Math.round(totalFats),
        cuisinesCount: cuisineSet.size,
        cuisines:      [...cuisineSet],
        dayMap,
      });
    } catch (e) {
      console.error("loadSummary error:", e);
    } finally {
      setLoading(false);
    }
  };

  const dayLabel = (date) => {
    const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const months= ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${days[date.getDay()]} ${months[date.getMonth()]} ${date.getDate()}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={summaryStyles.overlay}>
        <View style={summaryStyles.sheet}>
          {/* Handle */}
          <View style={summaryStyles.handle} />

          {/* Header */}
          <View style={summaryStyles.header}>
            <View>
              <Text style={summaryStyles.headerTitle}>Week in Review</Text>
              {summaryData && !loading && (
                <Text style={summaryStyles.dateRange}>
                  📅 {summaryData.dateRangeLabel}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={summaryStyles.closeBtn}>
              <Feather name="x" size={22} color="#666" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={summaryStyles.loadingBox}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={summaryStyles.loadingText}>Loading your week...</Text>
            </View>
          ) : !summaryData || summaryData.totalRecipes === 0 ? (
            <View style={summaryStyles.emptyBox}>
              <MaterialCommunityIcons name="chef-hat" size={72} color="#d1fae5" />
              <Text style={summaryStyles.emptyTitle}>No cooking this week yet</Text>
              <Text style={summaryStyles.emptySubtitle}>
                Open any recipe and tap "Mark as Cooked" to start tracking!
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

              {/* ── Highlights ── */}
              <View style={summaryStyles.highlightsCard}>
                <Text style={summaryStyles.cardTitle}>🌟 This Week's Highlights</Text>
                <View style={summaryStyles.highlightRow}>
                  <MaterialCommunityIcons name="food" size={20} color={COLORS.primary} />
                  <Text style={summaryStyles.highlightText}>
                    <Text style={summaryStyles.highlightBold}>{summaryData.totalRecipes}</Text>
                    {" "}recipe{summaryData.totalRecipes !== 1 ? "s" : ""} explored
                  </Text>
                </View>
                <View style={summaryStyles.highlightRow}>
                  <Feather name="heart" size={20} color="#ef4444" />
                  <Text style={summaryStyles.highlightText}>
                    <Text style={summaryStyles.highlightBold}>{summaryData.totalCalories.toLocaleString()}</Text>
                    {" "}total calories cooked
                  </Text>
                </View>
                <View style={summaryStyles.highlightRow}>
                  <Feather name="globe" size={20} color="#f59e0b" />
                  <Text style={summaryStyles.highlightText}>
                    <Text style={summaryStyles.highlightBold}>{summaryData.cuisinesCount}</Text>
                    {" "}cuisine{summaryData.cuisinesCount !== 1 ? "s" : ""} tried
                    {summaryData.cuisines.length > 0 && (
                      <Text style={summaryStyles.cuisineList}>
                        {" "}({summaryData.cuisines.join(", ")})
                      </Text>
                    )}
                  </Text>
                </View>
              </View>

              {/* ── Nutrition Breakdown ── */}
              <View style={summaryStyles.nutritionCard}>
                <Text style={summaryStyles.cardTitle}>📊 Nutrition Breakdown</Text>
                <Text style={summaryStyles.nutritionSubtitle}>
                  Total from {summaryData.totalRecipes} cooked recipe{summaryData.totalRecipes !== 1 ? "s" : ""}
                </Text>

                {/* Big calorie number */}
                <View style={summaryStyles.calorieBadge}>
                  <Text style={summaryStyles.calorieNumber}>
                    {summaryData.totalCalories.toLocaleString()}
                  </Text>
                  <Text style={summaryStyles.calorieUnit}>kcal total</Text>
                </View>

                {/* Macro bar */}
                <DonutChart
                  protein={summaryData.totalProtein}
                  carbs={summaryData.totalCarbs}
                  fats={summaryData.totalFats}
                />

                {/* Macro cards */}
                <View style={summaryStyles.macroRow}>
                  {[
                    { label: "Protein", value: summaryData.totalProtein, color: "#16a34a", bg: "#dcfce7" },
                    { label: "Carbs",   value: summaryData.totalCarbs,   color: "#f59e0b", bg: "#fef3c7" },
                    { label: "Fats",    value: summaryData.totalFats,    color: "#ef4444", bg: "#fee2e2" },
                  ].map((m) => (
                    <View key={m.label} style={[summaryStyles.macroCard, { backgroundColor: m.bg }]}>
                      <Text style={[summaryStyles.macroValue, { color: m.color }]}>{m.value}g</Text>
                      <Text style={summaryStyles.macroLabel}>{m.label}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* ── Day-by-day breakdown ── */}
              <View style={summaryStyles.dayCard}>
                <Text style={summaryStyles.cardTitle}>📆 Daily Activity</Text>
                {Object.values(summaryData.dayMap).map(({ date, recipes }) => {
                  const isToday = date.toDateString() === new Date().toDateString();
                  return (
                    <View
                      key={date.toDateString()}
                      style={[summaryStyles.dayRow, isToday && summaryStyles.dayRowToday]}
                    >
                      <View style={summaryStyles.dayLeft}>
                        <Text style={[summaryStyles.dayLabel, isToday && summaryStyles.dayLabelToday]}>
                          {isToday ? "Today" : dayLabel(date)}
                        </Text>
                        {recipes.length === 0 ? (
                          <Text style={summaryStyles.dayEmpty}>—</Text>
                        ) : (
                          recipes.map((r, i) => (
                            <Text key={i} style={summaryStyles.dayRecipe} numberOfLines={1}>
                              🍳 {r.title}
                            </Text>
                          ))
                        )}
                      </View>
                      {recipes.length > 0 && (
                        <View style={summaryStyles.dayRight}>
                          <Text style={summaryStyles.dayCal}>
                            {Math.round(recipes.reduce((s, r) => s + (r.calories || 0), 0))} kcal
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const summaryStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 0,
    maxHeight: "92%",
    flex: 1,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: "#e5e7eb",
    alignSelf: "center", marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#2C3E50" },
  dateRange:   { fontSize: 13, color: COLORS.textGray, marginTop: 4 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#f3f4f6",
    alignItems: "center", justifyContent: "center",
  },
  loadingBox: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 80 },
  loadingText:{ marginTop: 12, color: COLORS.textGray, fontSize: 15 },
  emptyBox: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingVertical: 60, paddingHorizontal: 30,
  },
  emptyTitle:   { fontSize: 20, fontWeight: "700", color: "#2C3E50", marginTop: 20, textAlign: "center" },
  emptySubtitle:{ fontSize: 14, color: COLORS.textGray, marginTop: 10, textAlign: "center", lineHeight: 20 },

  // Cards
  highlightsCard: {
    backgroundColor: COLORS.lightGreen,
    borderRadius: 16, padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: "#bbf7d0",
  },
  nutritionCard: {
    backgroundColor: "#fff",
    borderRadius: 16, padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: "#e5e7eb",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  dayCard: {
    backgroundColor: "#fff",
    borderRadius: 16, padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: "#e5e7eb",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardTitle: {
    fontSize: 17, fontWeight: "700", color: "#2C3E50", marginBottom: 16,
  },

  // Highlights
  highlightRow:  { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 12 },
  highlightText: { fontSize: 15, color: "#2C3E50", flex: 1, lineHeight: 22 },
  highlightBold: { fontWeight: "800", color: COLORS.primary },
  cuisineList:   { fontWeight: "400", color: COLORS.textGray },

  // Nutrition
  nutritionSubtitle: { fontSize: 13, color: COLORS.textGray, marginTop: -8, marginBottom: 16 },
  calorieBadge: { alignItems: "center", marginBottom: 20 },
  calorieNumber:{ fontSize: 52, fontWeight: "800", color: COLORS.primary },
  calorieUnit:  { fontSize: 14, color: COLORS.textGray, marginTop: -4 },
  macroRow:     { flexDirection: "row", gap: 10, marginTop: 20 },
  macroCard:    {
    flex: 1, borderRadius: 12, padding: 14, alignItems: "center",
  },
  macroValue:   { fontSize: 22, fontWeight: "800" },
  macroLabel:   { fontSize: 13, color: "#555", fontWeight: "600", marginTop: 4 },

  // Days
  dayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  dayRowToday: {
    backgroundColor: COLORS.lightGreen,
    borderRadius: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 0,
    marginHorizontal: -10,
  },
  dayLeft:    { flex: 1 },
  dayRight:   { alignItems: "flex-end" },
  dayLabel:   { fontSize: 13, fontWeight: "700", color: "#95A5A6", marginBottom: 4 },
  dayLabelToday: { color: COLORS.primary },
  dayEmpty:   { fontSize: 13, color: "#d1d5db" },
  dayRecipe:  { fontSize: 13, color: "#2C3E50", fontWeight: "500", marginBottom: 2 },
  dayCal:     { fontSize: 13, fontWeight: "700", color: COLORS.primary },
});

// ────────────────────────────────────────────────────────────────────────────
// Option chip
const Option = ({ label, selected, onPress, disabled }) => (
  <TouchableOpacity
    style={[styles.option, selected && styles.selected, disabled && styles.optionDisabled]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={[styles.optionText, selected && styles.selectedText]}>{label}</Text>
    {selected && <Feather name="check-circle" size={20} color={COLORS.primary} />}
  </TouchableOpacity>
);

// ────────────────────────────────────────────────────────────────────────────
export default function ProfileScreen({ navigation }) {
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Edit states
  const [fullName, setFullName]   = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dietType, setDietType]   = useState(null);
  const [skillLevel, setSkillLevel] = useState(null);
  const [mealGoal, setMealGoal]   = useState(null);
  const [healthGoal, setHealthGoal] = useState(null);
  const [allergies, setAllergies] = useState([]);
  const [cuisines, setCuisines]   = useState([]);

  useEffect(() => { loadProfile(); }, []);

  useEffect(() => {
    const unsub = navigation.addListener("focus", () => loadProfile());
    return unsub;
  }, [navigation]);

  const parseArrayOrString = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === "string") return value.split(",").map((i) => i.trim()).filter(Boolean);
    return [];
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get("/auth/profile");
      const user = response.data.user;
      setUserData(user);
      setFullName(user.full_name || "");
      setDateOfBirth(user.date_of_birth ? user.date_of_birth.split("T")[0] : "");
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
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const handleEditToggle = () => {
    if (isEditing && userData) {
      setFullName(userData.full_name || "");
      setDateOfBirth(userData.date_of_birth ? userData.date_of_birth.split("T")[0] : "");
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
    if (!fullName.trim()) {
      Alert.alert("Validation Error", "Full name is required");
      return;
    }
    setSaving(true);
    try {
      await api.put("/auth/profile", {
        full_name:     fullName.trim(),
        date_of_birth: dateOfBirth || null,
      });
      await api.put("/auth/preferences", {
        diet_type:   dietType,
        skill_level: skillLevel,
        meal_goal:   mealGoal,
        health_goal: healthGoal,
        allergies:   allergies.length > 0 ? allergies.join(", ") : null,
        cuisines:    cuisines.length  > 0 ? cuisines.join(", ")  : null,
      });
      Alert.alert("Success! 🎉", "Your profile has been updated");
      await loadProfile();
      setIsEditing(false);
    } catch (err) {
      console.error("❌ Update error:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.error || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout", style: "destructive",
        onPress: async () => {
          await AsyncStorage.clear();
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        },
      },
    ]);
  };

  const displayArrayValue = (value) => {
    if (!value) return "Not set";
    if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "Not set";
    return value || "Not set";
  };

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Feather name={icon} size={20} color={COLORS.primary} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue} numberOfLines={2}>
        {typeof value === "string" || typeof value === "number"
          ? value || "Not set"
          : displayArrayValue(value)}
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
      {/* Header bar */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditToggle}
          disabled={saving}
        >
          <Feather name={isEditing ? "x" : "edit-2"} size={20} color={COLORS.primary} />
          <Text style={styles.editButtonText}>{isEditing ? "Cancel" : "Edit"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Feather name="user" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.name}>{userData.full_name || "User"}</Text>
          <Text style={styles.email}>{userData.email}</Text>

          {/* ── Weekly Summary Button ── */}
          {!isEditing && (
            <TouchableOpacity
              style={styles.summaryButton}
              onPress={() => setShowSummary(true)}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="chart-bar" size={20} color="#fff" />
              <Text style={styles.summaryButtonText}>Weekly Summary</Text>
              <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          )}
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          {!isEditing ? (
            <View style={styles.card}>
              <InfoRow icon="user"     label="Full Name" value={userData.full_name} />
              <InfoRow icon="mail"     label="Email"     value={userData.email} />
              <InfoRow
                icon="calendar"
                label="Date of Birth"
                value={userData.date_of_birth
                  ? new Date(userData.date_of_birth).toLocaleDateString()
                  : null}
              />
            </View>
          ) : (
            <View style={styles.card}>
              <EditInputRow
                icon="user" label="Full Name" value={fullName}
                onChangeText={setFullName} placeholder="Enter your full name"
              />
              <View style={styles.staticInfoRow}>
                <View style={styles.infoLeft}>
                  <Feather name="mail" size={20} color={COLORS.textGray} />
                  <Text style={styles.infoLabel}>Email</Text>
                </View>
                <Text style={styles.staticInfoText}>{userData.email}</Text>
              </View>
              <EditInputRow
                icon="calendar" label="Date of Birth" value={dateOfBirth}
                onChangeText={setDateOfBirth} placeholder="YYYY-MM-DD"
              />
            </View>
          )}
        </View>

        {/* Cooking Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cooking Preferences</Text>
          {!isEditing ? (
            <View style={styles.card}>
              <InfoRow icon="heart"        label="Diet Type"    value={userData.diet_type} />
              <InfoRow icon="award"        label="Skill Level"  value={userData.skill_level} />
              <InfoRow icon="clock"        label="Meal Goal"    value={userData.meal_goal} />
              <InfoRow icon="target"       label="Health Goal"  value={userData.health_goal} />
              <InfoRow icon="alert-circle" label="Allergies"    value={userData.allergies} />
              <InfoRow icon="globe"        label="Cuisines"     value={userData.cuisines} />
            </View>
          ) : (
            <View>
              {/* Diet */}
              <View style={styles.editSection}>
                <Text style={styles.label}>
                  <Feather name="heart" size={16} color={COLORS.primary} /> Diet Type
                </Text>
                {["Veg", "Non-Veg", "Vegan"].map((v) => (
                  <Option key={v} label={v} selected={dietType === v}
                    onPress={() => setDietType(v)} disabled={saving} />
                ))}
              </View>
              {/* Skill */}
              <View style={styles.editSection}>
                <Text style={styles.label}>
                  <Feather name="award" size={16} color={COLORS.primary} /> Cooking Skill
                </Text>
                {["Beginner", "Intermediate", "Advanced"].map((v) => (
                  <Option key={v} label={v} selected={skillLevel === v}
                    onPress={() => setSkillLevel(v)} disabled={saving} />
                ))}
              </View>
              {/* Meal goal */}
              <View style={styles.editSection}>
                <Text style={styles.label}>
                  <Feather name="clock" size={16} color={COLORS.primary} /> Meal Goal
                </Text>
                {["Breakfast", "Lunch", "Dinner", "Snacks"].map((v) => (
                  <Option key={v} label={v} selected={mealGoal === v}
                    onPress={() => setMealGoal(v)} disabled={saving} />
                ))}
              </View>
              {/* Health goal */}
              <View style={styles.editSection}>
                <Text style={styles.label}>
                  <Feather name="target" size={16} color={COLORS.primary} /> Health Goal
                </Text>
                {["Weight Loss", "Muscle Gain", "Balanced Diet", "General Health"].map((v) => (
                  <Option key={v} label={v} selected={healthGoal === v}
                    onPress={() => setHealthGoal(v)} disabled={saving} />
                ))}
              </View>
              {/* Allergies */}
              <View style={styles.editSection}>
                <Text style={styles.label}>
                  <Feather name="alert-circle" size={16} color={COLORS.primary} /> Allergies
                </Text>
                {["Peanuts", "Milk", "Eggs", "Seafood", "Soy", "Gluten", "None"].map((v) => (
                  <Option key={v} label={v} selected={allergies.includes(v)}
                    onPress={() => toggleMulti(v, allergies, setAllergies)} disabled={saving} />
                ))}
              </View>
              {/* Cuisines */}
              <View style={styles.editSection}>
                <Text style={styles.label}>
                  <Feather name="globe" size={16} color={COLORS.primary} /> Cuisines
                </Text>
                {["Nepali", "Indian", "Italian", "Chinese", "Mexican", "Thai", "Japanese", "Continental"].map((v) => (
                  <Option key={v} label={v} selected={cuisines.includes(v)}
                    onPress={() => toggleMulti(v, cuisines, setCuisines)} disabled={saving} />
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Account */}
        {!isEditing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.card}>
              <TouchableOpacity style={styles.actionRow} onPress={handleLogout}>
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

      {/* Weekly Summary Modal */}
      <WeeklySummaryModal
        visible={showSummary}
        onClose={() => setShowSummary(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: "#fff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  loadingText:      { marginTop: 16, fontSize: 16, color: COLORS.textGray },
  errorText:        { marginTop: 16, fontSize: 16, color: COLORS.textGray, textAlign: "center" },
  retryButton:      { marginTop: 20, backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryButtonText:  { color: "#fff", fontSize: 16, fontWeight: "600" },

  headerBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16,
    backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e5e7eb",
  },
  headerTitle:    { fontSize: 20, fontWeight: "700", color: "#333" },
  editButton: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 8, backgroundColor: COLORS.lightGreen,
  },
  editButtonText: { fontSize: 15, color: COLORS.primary, fontWeight: "600" },

  scrollView: { flex: 1 },

  header: {
    alignItems: "center", paddingTop: 30, paddingBottom: 24,
    backgroundColor: COLORS.lightGreen,
  },
  avatarContainer: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "#fff", justifyContent: "center", alignItems: "center",
    marginBottom: 16, shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  name:  { fontSize: 24, fontWeight: "700", color: "#333", marginBottom: 4 },
  email: { fontSize: 16, color: COLORS.textGray, marginBottom: 20 },

  // ── Summary button ──────────────────────────────────────────────────────
  summaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  section:      { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: COLORS.darkGreen, marginBottom: 12 },
  card:         { backgroundColor: COLORS.lightGreen, borderRadius: 12, padding: 16 },

  infoRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#e5e7eb",
  },
  infoLeft:  { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  infoLabel: { fontSize: 15, color: "#333", fontWeight: "500" },
  infoValue: { fontSize: 15, color: COLORS.textGray, textAlign: "right", flex: 1 },

  editInputRow:       { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  editInputLabel:     { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  editInputLabelText: { fontSize: 15, color: "#333", fontWeight: "500" },
  editInput: {
    fontSize: 15, color: "#333", paddingVertical: 8, paddingHorizontal: 12,
    backgroundColor: "#fff", borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb",
  },
  staticInfoRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#e5e7eb",
  },
  staticInfoText: { fontSize: 15, color: COLORS.textGray, fontStyle: "italic" },
  editSection:    { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 12, color: COLORS.darkGreen },
  option: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 16, borderRadius: 12, backgroundColor: COLORS.lightGreen,
    marginBottom: 10, borderWidth: 2, borderColor: "transparent",
  },
  selected:      { backgroundColor: COLORS.selectedGreen, borderColor: COLORS.primary },
  optionDisabled:{ opacity: 0.5 },
  optionText:    { fontSize: 15, color: "#333", fontWeight: "500" },
  selectedText:  { color: COLORS.darkGreen, fontWeight: "600" },

  actionRow:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16 },
  actionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  actionText: { fontSize: 16, color: "#333", fontWeight: "500" },
  logoutText: { color: "#dc2626" },

  saveButtonContainer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#e5e7eb",
    shadowColor: "#000", shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 8,
  },
  saveButton: {
    flexDirection: "row", backgroundColor: COLORS.primary,
    padding: 18, borderRadius: 12, alignItems: "center", justifyContent: "center",
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  saveButtonDisabled: { backgroundColor: "#86efac", opacity: 0.7 },
  saveButtonText:     { color: "#fff", fontSize: 18, fontWeight: "600", marginLeft: 8 },
});