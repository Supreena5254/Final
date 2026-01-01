import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import api from "../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const COLORS = {
  primary: "#6BBF59",
  darkGreen: "#3A7D44",
  lightGreen: "#EAF6EA",
  textGray: "#666",
};

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    console.log("🔐 Attempting login for:", email);

    try {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      console.log("✅ Login successful:", response.data);

      await AsyncStorage.setItem("authToken", response.data.token);
      await AsyncStorage.setItem("userId", response.data.user.id.toString());
      await AsyncStorage.setItem("userEmail", response.data.user.email);

      try {
        const profileResponse = await api.get("/auth/profile");
        console.log("📋 Profile data:", profileResponse.data);

        const hasPreferences = profileResponse.data.user.diet_type !== null ||
                              profileResponse.data.user.skill_level !== null ||
                              profileResponse.data.user.meal_goal !== null;

        if (hasPreferences) {
          console.log("✅ User has preferences, going to MainTabs");
          await AsyncStorage.setItem("preferences_completed", "true");
          navigation.reset({
            index: 0,
            routes: [{ name: "MainTabs" }],
          });
        } else {
          console.log("⚠️ No preferences found, showing PreferenceForm");
          navigation.reset({
            index: 0,
            routes: [{ name: "PreferenceForm" }],
          });
        }
      } catch (prefError) {
        console.error("⚠️ Could not check preferences:", prefError.response?.data);
        navigation.reset({
          index: 0,
          routes: [{ name: "PreferenceForm" }],
        });
      }

    } catch (error) {
      console.error("❌ Login error:", error.response?.data);

      if (error.response?.data?.requiresVerification === true) {
        Alert.alert(
          "Email Not Verified",
          "Please verify your email before logging in.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Verify Now",
              onPress: () => {
                navigation.navigate("OTPVerification", {
                  email: email.trim(),
                  fromLogin: true,
                });
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Login Failed",
          error.response?.data?.error || "Invalid email or password"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Feather name="mail" size={20} color={COLORS.darkGreen} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color={COLORS.darkGreen} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            editable={!loading}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
            disabled={loading}
          >
            <Feather
              name={showPassword ? "eye" : "eye-off"}
              size={20}
              color={COLORS.darkGreen}
            />
          </TouchableOpacity>
        </View>

        {/* Forgot Password Link */}
        <TouchableOpacity
          style={styles.forgotPasswordContainer}
          onPress={() => navigation.navigate("ForgotPassword")}
          disabled={loading}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Signup")}
            disabled={loading}
          >
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    paddingTop: 80,
    paddingHorizontal: 30,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.darkGreen,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textGray,
  },
  form: {
    paddingHorizontal: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGreen,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 55,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  eyeIcon: {
    padding: 5,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#dc2626",
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: "#A8D8A0",
    shadowOpacity: 0.1,
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  signupText: {
    fontSize: 15,
    color: COLORS.textGray,
  },
  signupLink: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: "600",
  },
});