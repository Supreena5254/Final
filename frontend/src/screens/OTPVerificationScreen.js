import React, { useState, useEffect } from "react";
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

// Green Color Theme
const COLORS = {
  primary: "#16a34a",
  darkGreen: "#15803d",
  lightGreen: "#f0fdf4",
  mediumGreen: "#86efac",
  textGray: "#666",
};

export default function OTPVerificationScreen({ navigation, route }) {
  const { email } = route.params;
  
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for resend
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    console.log("📧 Verifying OTP for:", email);

    try {
      const response = await api.post("/auth/verify-otp", {
        email,
        otp,
      });

      console.log("✅ Verification successful:", response.data);

      Alert.alert(
        "Success",
        "Email verified successfully! You can now login.",
        [
          {
            text: "Go to Login",
            onPress: () => navigation.replace("Login"),
          },
        ]
      );
    } catch (error) {
      console.error("❌ Verification error:", error.response?.data);
      Alert.alert(
        "Verification Failed",
        error.response?.data?.error || "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setResending(true);
    console.log("📤 Resending OTP to:", email);

    try {
      const response = await api.post("/auth/resend-otp", { email });

      console.log("✅ OTP resent:", response.data);

      Alert.alert("Success", "A new OTP has been sent to your email");
      
      // Reset timer
      setTimer(60);
      setCanResend(false);
    } catch (error) {
      console.error("❌ Resend error:", error.response?.data);
      Alert.alert(
        "Resend Failed",
        error.response?.data?.error || "Failed to resend OTP"
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Feather name="arrow-left" size={24} color="#333" />
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Feather name="mail" size={60} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit code to{"\n"}
          <Text style={styles.email}>{email}</Text>
        </Text>
      </View>

      {/* OTP Input */}
      <View style={styles.form}>
        <TextInput
          style={styles.otpInput}
          placeholder="Enter 6-digit code"
          placeholderTextColor="#999"
          value={otp}
          onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ""))}
          keyboardType="number-pad"
          maxLength={6}
          editable={!loading}
        />

        {/* Verify Button */}
        <TouchableOpacity
          style={[styles.verifyButton, loading && styles.buttonDisabled]}
          onPress={handleVerifyOTP}
          disabled={loading || otp.length !== 6}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Feather name="check-circle" size={20} color="#FFF" />
              <Text style={styles.verifyButtonText}>Verify Email</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Resend OTP */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <TouchableOpacity
            onPress={handleResendOTP}
            disabled={!canResend || resending}
          >
            <Text
              style={[
                styles.resendLink,
                (!canResend || resending) && styles.resendDisabled,
              ]}
            >
              {resending
                ? "Sending..."
                : canResend
                ? "Resend"
                : `Resend in ${timer}s`}
            </Text>
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
    paddingTop: 100,
    paddingHorizontal: 30,
    alignItems: "center",
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
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  email: {
    fontWeight: "600",
    color: COLORS.primary,
  },
  form: {
    paddingHorizontal: 30,
  },
  otpInput: {
    backgroundColor: COLORS.lightGreen,
    borderRadius: 12,
    paddingHorizontal: 20,
    height: 60,
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 8,
    color: "#333",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.mediumGreen,
  },
  verifyButton: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: COLORS.mediumGreen,
    shadowOpacity: 0.1,
  },
  verifyButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    alignItems: "center",
  },
  resendText: {
    fontSize: 15,
    color: "#666",
  },
  resendLink: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: "600",
  },
  resendDisabled: {
    color: "#CCC",
  },
});