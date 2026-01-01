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

const COLORS = {
  primary: "#16a34a",
  darkGreen: "#15803d",
  lightGreen: "#f0fdf4",
  textGray: "#666",
};

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    // Validation
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    console.log("📧 Requesting password reset for:", email);

    try {
      const response = await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      console.log("✅ OTP sent:", response.data);

      Alert.alert(
        "Success",
        "Password reset code sent to your email",
        [
          {
            text: "OK",
            onPress: () => {
              navigation.navigate("ResetPassword", {
                email: email.trim().toLowerCase(),
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error("❌ Forgot password error:", error.response?.data);

      const errorMsg = error.response?.data?.error ||
                       error.response?.data?.message ||
                       "Failed to send reset code. Please try again.";

      Alert.alert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Feather name="arrow-left" size={24} color="#333" />
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Feather name="lock" size={60} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you a code to reset your password
        </Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Feather name="mail" size={20} color={COLORS.primary} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={handleSendOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Feather name="send" size={20} color="#FFF" />
              <Text style={styles.sendButtonText}>Send Reset Code</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backToLoginContainer}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Feather name="arrow-left" size={16} color={COLORS.primary} />
          <Text style={styles.backToLoginText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  header: {
    alignItems: "center",
    paddingTop: 100,
    paddingHorizontal: 30,
    marginBottom: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.lightGreen,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textGray,
    textAlign: "center",
    lineHeight: 22,
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
    height: 55,
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  sendButton: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: "#86efac",
    shadowOpacity: 0.1,
  },
  sendButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  backToLoginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 6,
  },
  backToLoginText: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: "600",
  },
});