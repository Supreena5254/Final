import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import api from "../api/api";

export default function SignupScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSignup = async () => {
    if (!fullName || !email || !password || !confirm) {
      Alert.alert("Validation", "Please fill all required fields");
      return;
    }

    if (password !== confirm) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        full_name: fullName.trim(),
        email: email.toLowerCase().trim(),
        password: password,
        date_of_birth: dob || null,
      });

      console.log("✅ Signup success:", response.data);

      // Check if verification is required
      if (response.data.requiresVerification) {
        Alert.alert(
          "Check Your Email! 📧",
          "We've sent a 6-digit verification code to your email. Please enter it to verify your account.",
          [
            {
              text: "OK",
              onPress: () => {
                // Navigate to OTP verification screen
                navigation.navigate("OTPVerification", {
                  email: email.toLowerCase().trim(),
                  fullName: fullName.trim(),
                });
              },
            },
          ]
        );
      } else {
        // Old flow (if OTP is disabled)
        Alert.alert("Success", "Account created successfully! Please login.");
        navigation.navigate("Login");
      }
    } catch (err) {
      console.error("❌ Signup error:", err.response?.data || err.message);

      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Server error. Please try again.";

      Alert.alert("Signup failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* LOGO */}
      <View style={styles.logoRow}>
        <MaterialCommunityIcons name="chef-hat" size={36} color="#16a34a" />
        <Text style={styles.logoText}>CookMate</Text>
      </View>

      {/* CARD */}
      <View style={styles.card}>
        {/* TABS */}
        <View style={styles.tabRow}>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.tabInactive}>Sign in</Text>
          </TouchableOpacity>
          <Text style={styles.tabActive}>Sign up</Text>
        </View>

        {input("user", "Enter full name", fullName, setFullName)}
        {input("mail", "Enter email", email, setEmail, false, "email-address")}
        {input("calendar", "YYYY-MM-DD (Optional)", dob, setDob)}
        {input("lock", "Enter password", password, setPassword, true)}
        {input("lock", "Confirm password", confirm, setConfirm, true)}

        {/* REMEMBER ME */}
        <TouchableOpacity
          style={styles.rememberRow}
          onPress={() => setRemember(!remember)}
        >
          <Feather
            name={remember ? "check-square" : "square"}
            size={18}
            color="#16a34a"
          />
          <Text style={styles.rememberText}>Remember me</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={onSignup}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Creating account..." : "Sign up"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* INPUT COMPONENT */
const input = (
  icon,
  placeholder,
  value,
  setter,
  secure = false,
  keyboardType = "default"
) => (
  <View style={styles.inputRow}>
    <Feather name={icon} size={20} color="#6b7280" />
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#9ca3af"
      style={styles.input}
      secureTextEntry={secure}
      value={value}
      onChangeText={setter}
      autoCapitalize="none"
      keyboardType={keyboardType}
    />
  </View>
);

/* STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#16a34a",
    marginLeft: 8,
  },
  card: {
    backgroundColor: "#f0fdf4",
    padding: 24,
    borderRadius: 16,
    elevation: 2,
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 20,
  },
  tabActive: {
    fontSize: 18,
    fontWeight: "700",
  },
  tabInactive: {
    fontSize: 18,
    color: "#6b7280",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#bbf7d0",
    marginBottom: 16,
    paddingBottom: 6,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  rememberText: {
    fontSize: 14,
  },
  button: {
    backgroundColor: "#16a34a",
    borderRadius: 999,
    paddingVertical: 14,
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: "#86efac",
  },
  buttonText: {
    textAlign: "center",
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
});