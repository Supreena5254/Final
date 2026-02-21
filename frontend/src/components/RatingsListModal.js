// frontend/src/components/RatingsListModal.js
import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";

export default function RatingsListModal({
  visible,
  onClose,
  stats = null,
  userRating = null,
  onAddRating,
  onEditRating,
  loading = false
}) {

  const RatingBar = ({ stars, count, total }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <View style={styles.ratingBar}>
        <Text style={styles.ratingBarLabel}>{stars}★</Text>
        <View style={styles.ratingBarTrack}>
          <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.ratingBarCount}>{count}</Text>
      </View>
    );
  };

  // ✅ FIX: Proper filled stars using FontAwesome
  const StarRow = ({ rating, size = 24 }) => {
    return (
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          star <= Math.round(rating)
            ? <FontAwesome key={star} name="star" size={size} color="#FFD700" />
            : <FontAwesome key={star} name="star-o" size={size} color="#E0E0E0" />
        ))}
      </View>
    );
  };

  const hasNoRatings = !stats || parseInt(stats.total_ratings) === 0;

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
            <Text style={styles.headerTitle}>Rating Details</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#16a34a" />
              <Text style={styles.loadingText}>Loading ratings...</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>

              {/* Empty State — no ratings yet */}
              {hasNoRatings ? (
                <View style={styles.emptyState}>
                  <FontAwesome name="star-o" size={60} color="#E0E0E0" />
                  <Text style={styles.emptyText}>No ratings yet</Text>
                  <Text style={styles.emptySubtext}>
                    Be the first to rate this recipe!
                  </Text>
                </View>
              ) : (
                /* Overall Rating + Distribution */
                <View style={styles.overallSection}>
                  <View style={styles.overallRating}>
                    <Text style={styles.overallNumber}>
                      {parseFloat(stats.average_rating || 0).toFixed(1)}
                    </Text>
                    {/* ✅ FIX: Filled stars using FontAwesome */}
                    <StarRow rating={stats.average_rating} size={24} />
                    <Text style={styles.overallCount}>
                      Based on {stats.total_ratings} {parseInt(stats.total_ratings) === 1 ? 'rating' : 'ratings'}
                    </Text>
                  </View>

                  {/* Rating Distribution Bars */}
                  <View style={styles.distributionSection}>
                    <RatingBar stars={5} count={parseInt(stats.five_star) || 0} total={parseInt(stats.total_ratings)} />
                    <RatingBar stars={4} count={parseInt(stats.four_star) || 0} total={parseInt(stats.total_ratings)} />
                    <RatingBar stars={3} count={parseInt(stats.three_star) || 0} total={parseInt(stats.total_ratings)} />
                    <RatingBar stars={2} count={parseInt(stats.two_star) || 0} total={parseInt(stats.total_ratings)} />
                    <RatingBar stars={1} count={parseInt(stats.one_star) || 0} total={parseInt(stats.total_ratings)} />
                  </View>
                </View>
              )}

              {/* ✅ FIX: User's own rating section */}
              {userRating ? (
                /* Already rated — show their rating + option to change */
                <View style={styles.userRatingSection}>
                  <View style={styles.yourRatingCard}>
                    <Text style={styles.yourRatingLabel}>Your Rating</Text>
                    {/* ✅ FIX: Filled stars for user's rating */}
                    <StarRow rating={userRating.rating} size={28} />
                    <Text style={styles.yourRatingNumber}>
                      {userRating.rating}.0
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={onEditRating}
                  >
                    <Feather name="edit-2" size={18} color="#16a34a" />
                    {/* ✅ FIX: "Change Rating" only shown when already rated */}
                    <Text style={styles.editButtonText}>Change Rating</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* Not yet rated — show "Rate This Recipe" button */
                <TouchableOpacity
                  style={styles.addRatingButton}
                  onPress={onAddRating}
                >
                  <FontAwesome name="star" size={20} color="#FFF" />
                  {/* ✅ FIX: "Rate This Recipe" only shown when NOT yet rated */}
                  <Text style={styles.addRatingButtonText}>Rate This Recipe</Text>
                </TouchableOpacity>
              )}

            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: "75%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C3E50",
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  overallSection: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  overallRating: {
    alignItems: "center",
    marginBottom: 24,
  },
  overallNumber: {
    fontSize: 56,
    fontWeight: "700",
    color: "#16a34a",
    marginBottom: 12,
  },
  starRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 12,
  },
  overallCount: {
    fontSize: 15,
    color: "#666",
  },
  distributionSection: {
    gap: 10,
  },
  ratingBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ratingBarLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    width: 35,
  },
  ratingBarTrack: {
    flex: 1,
    height: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
    overflow: "hidden",
  },
  ratingBarFill: {
    height: "100%",
    backgroundColor: "#FFD700",
    borderRadius: 5,
  },
  ratingBarCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    width: 35,
    textAlign: "right",
  },
  userRatingSection: {
    marginBottom: 20,
  },
  yourRatingCard: {
    backgroundColor: "#dcfce7",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#16a34a",
  },
  yourRatingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 12,
  },
  yourRatingNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#16a34a",
    marginTop: 8,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    marginTop: 12,
  },
  editButtonText: {
    color: "#16a34a",
    fontSize: 16,
    fontWeight: "600",
  },
  addRatingButton: {
    flexDirection: "row",
    backgroundColor: "#16a34a",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addRatingButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 15,
    color: "#999",
    marginTop: 8,
  },
});