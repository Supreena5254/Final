// frontend/src/components/RatingModal.js
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";

export default function RatingModal({
  visible,
  onClose,
  onSubmit,
  recipeName,
  existingRating = null,
}) {
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Reset state when modal opens
  // ✅ FIX: Always start at 0 for new rating, only prefill if EDITING
  useEffect(() => {
    if (visible) {
      setRating(existingRating || 0);
      setSubmitting(false);
    }
  }, [visible, existingRating]);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(rating, null);
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitting(false);
    }
  };

  // ✅ FIX: Using FontAwesome for proper filled/empty stars
  const StarButton = ({ index }) => {
    const isFilled = index <= rating;
    return (
      <TouchableOpacity
        onPress={() => setRating(index)}
        style={styles.starButton}
        disabled={submitting}
        activeOpacity={0.7}
      >
        {isFilled ? (
          <FontAwesome name="star" size={50} color="#FFD700" />
        ) : (
          <FontAwesome name="star-o" size={50} color="#E0E0E0" />
        )}
      </TouchableOpacity>
    );
  };

  const getRatingLabel = () => {
    if (rating === 5) return "⭐ Excellent!";
    if (rating === 4) return "😊 Very Good";
    if (rating === 3) return "👍 Good";
    if (rating === 2) return "😐 Could be Better";
    if (rating === 1) return "😞 Poor";
    return "";
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Rate Recipe</Text>
            <TouchableOpacity onPress={onClose} disabled={submitting}>
              <Feather name="x" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Recipe Name */}
          <Text style={styles.recipeName} numberOfLines={2}>
            {recipeName}
          </Text>

          {/* Star Rating */}
          <Text style={styles.label}>Tap a star to rate</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <StarButton key={star} index={star} />
            ))}
          </View>

          {/* Rating Description */}
          {rating > 0 && (
            <Text style={styles.ratingText}>{getRatingLabel()}</Text>
          )}

          {/* ✅ FIX: Button text — "Rate Recipe" for new, "Update Rating" for edit */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (rating === 0 || submitting) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={rating === 0 || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <FontAwesome name="star" size={18} color="#FFF" />
                <Text style={styles.submitButtonText}>
                  {existingRating ? "Update Rating" : "Rate Recipe"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={submitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 30,
    width: "85%",
    maxWidth: 400,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2C3E50",
  },
  recipeName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#16a34a",
    marginBottom: 30,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#999",
    marginBottom: 16,
    textAlign: "center",
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 20,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#16a34a",
    textAlign: "center",
    marginBottom: 30,
  },
  submitButton: {
    flexDirection: "row",
    backgroundColor: "#16a34a",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#A8D8A0",
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
});