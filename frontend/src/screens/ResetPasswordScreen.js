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

export default function ResetPasswordScreen({ navigation, route }) {
  const { email } = route.params;

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    // Validation
    if (!otp.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit code");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    console.log("🔐 Resetting password for:", email);

    try {
      const response = await api.post("/auth/reset-password", {
        email,
        otp: otp.trim(),
        new_password: newPassword,
      });

      console.log("✅ Password reset successful:", response.data);

      Alert.alert(
        "Success! 🎉",
        "Your password has been changed successfully",
        [
          {
            text: "Go to Login",
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error("❌ Reset password error:", error.response?.data);

      const errorMsg = error.response?.data?.error ||
                       error.response?.data?.message ||
                       "Failed to reset password. Please try again.";

      Alert.alert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    console.log("📤 Resending OTP to:", email);

    try {
      await api.post("/auth/forgot-password", { email });

      Alert.alert("Success", "A new reset code has been sent to your email");
    } catch (error) {
      console.error("❌ Resend error:", error.response?.data);
      Alert.alert("Error", "Failed to resend code. Please try again.");
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
          <Feather name="shield" size={60} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{"\n"}
          <Text style={styles.email}>{email}</Text>
        </Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {/* OTP Input */}
        <View style={styles.inputContainer}>
          <Feather name="hash" size={20} color={COLORS.primary} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit code"
            placeholderTextColor="#999"
            value={otp}
            onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ""))}
            keyboardType="number-pad"
            maxLength={6}
            editable={!loading}
          />
        </View>

        {/* New Password */}
        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color={COLORS.primary} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor="#999"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
            autoCapitalize="none"
            editable={!loading}
          />
          <TouchableOpacity
            onPress={() => setShowNewPassword(!showNewPassword)}
            style={styles.eyeIcon}
            disabled={loading}
          >
            <Feather
              name={showNewPassword ? "eye" : "eye-off"}
              size={20}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}
        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color={COLORS.primary} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            editable={!loading}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
            disabled={loading}
          >
            <Feather
              name={showConfirmPassword ? "eye" : "eye-off"}
              size={20}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          style={[styles.resetButton, loading && styles.resetButtonDisabled]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Feather name="check-circle" size={20} color="#FFF" />
              <Text style={styles.resetButtonText}>Change Password</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Resend OTP */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
            <Text style={styles.resendLink}>Resend</Text>
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
  email: {
    fontWeight: "600",
    color: COLORS.primary,
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
    marginBottom: 15,
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
  resetButton: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  resetButtonDisabled: {
    backgroundColor: "#86efac",
    shadowOpacity: 0.1,
  },
  resetButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  resendText: {
    fontSize: 15,
    color: COLORS.textGray,
  },
  resendLink: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: "600",
  },
});