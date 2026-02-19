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

const COLORS = {
  primary: "#16a34a",
  darkGreen: "#15803d",
  lightGreen: "#f0fdf4",
  mediumGreen: "#86efac",
  textGray: "#666",
};

export default function ResetPasswordScreen({ navigation, route }) {
  const { email } = route.params;

  // Step management
  const [step, setStep] = useState(1); // 1 = OTP, 2 = Password

  // Step 1: OTP
  const [otp, setOtp] = useState("");
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Step 2: Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (step === 1 && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [timer, step]);

  // ============================================
  // STEP 1: VERIFY OTP
  // ============================================
  const handleVerifyOTP = () => {
    if (otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit code");
      return;
    }

    console.log("✅ OTP verified, moving to password step");
    setStep(2); // Move to password step
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setResending(true);
    console.log("📤 Resending OTP to:", email);

    try {
      await api.post("/auth/forgot-password", { email });

      Alert.alert("Success", "A new reset code has been sent to your email");

      // Reset timer
      setTimer(60);
      setCanResend(false);
      setOtp(""); // Clear OTP input
    } catch (error) {
      console.error("❌ Resend error:", error.response?.data);
      Alert.alert("Error", "Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  // ============================================
  // STEP 2: CHANGE PASSWORD
  // ============================================
  const handleResetPassword = async () => {
    // Validation
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert("Error", "Please fill in all fields");
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

      // If OTP is invalid/expired, go back to step 1
      if (errorMsg.includes("expired") || errorMsg.includes("Invalid")) {
        Alert.alert(
          "Invalid Code",
          "Your verification code is invalid or expired. Please try again.",
          [
            {
              text: "OK",
              onPress: () => {
                setStep(1);
                setOtp("");
                setNewPassword("");
                setConfirmPassword("");
              },
            },
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RENDER: STEP 1 - OTP VERIFICATION
  // ============================================
  if (step === 1) {
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
          <Text style={styles.title}>Verify Code</Text>
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
            editable={!resending}
          />

          {/* Continue Button */}
          <TouchableOpacity
            style={[styles.continueButton, otp.length !== 6 && styles.buttonDisabled]}
            onPress={handleVerifyOTP}
            disabled={otp.length !== 6}
          >
            <Feather name="arrow-right" size={20} color="#FFF" />
            <Text style={styles.continueButtonText}>Continue</Text>
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

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Feather name="info" size={16} color={COLORS.textGray} />
            <Text style={styles.helpText}>
              Check your spam folder if you don't see the email
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // ============================================
  // RENDER: STEP 2 - CHANGE PASSWORD
  // ============================================
  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setStep(1)} // Go back to OTP step
      >
        <Feather name="arrow-left" size={24} color="#333" />
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Feather name="lock" size={60} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>Create New Password</Text>
        <Text style={styles.subtitle}>
          Choose a strong password for{"\n"}
          <Text style={styles.email}>{email}</Text>
        </Text>
      </View>

      {/* Password Form */}
      <View style={styles.form}>
        {/* New Password Input */}
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

        {/* Confirm Password Input */}
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

        {/* Password Requirements */}
        <View style={styles.requirementsContainer}>
          <View style={styles.requirementRow}>
            <Feather
              name={newPassword.length >= 6 ? "check-circle" : "circle"}
              size={16}
              color={newPassword.length >= 6 ? COLORS.primary : COLORS.textGray}
            />
            <Text style={[
              styles.requirementText,
              newPassword.length >= 6 && styles.requirementMet
            ]}>
              At least 6 characters
            </Text>
          </View>
          <View style={styles.requirementRow}>
            <Feather
              name={newPassword === confirmPassword && confirmPassword !== "" ? "check-circle" : "circle"}
              size={16}
              color={newPassword === confirmPassword && confirmPassword !== "" ? COLORS.primary : COLORS.textGray}
            />
            <Text style={[
              styles.requirementText,
              newPassword === confirmPassword && confirmPassword !== "" && styles.requirementMet
            ]}>
              Passwords match
            </Text>
          </View>
        </View>

        {/* Reset Password Button */}
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

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Feather name="shield" size={16} color={COLORS.textGray} />
          <Text style={styles.securityText}>
            Make sure your password is strong and unique
          </Text>
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

  // Step 1: OTP Styles
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
  continueButton: {
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
  continueButtonText: {
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
  helpContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    gap: 8,
  },
  helpText: {
    fontSize: 13,
    color: COLORS.textGray,
    textAlign: "center",
    flex: 1,
  },

  // Step 2: Password Styles
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
  requirementsContainer: {
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },
  requirementText: {
    fontSize: 14,
    color: COLORS.textGray,
  },
  requirementMet: {
    color: COLORS.primary,
    fontWeight: "500",
  },
  resetButton: {
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
  buttonDisabled: {
    backgroundColor: COLORS.mediumGreen,
    shadowOpacity: 0.1,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 8,
  },
  securityText: {
    fontSize: 13,
    color: COLORS.textGray,
    textAlign: "center",
    flex: 1,
  },
});