import { req } from "@/utils/RequestConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function UpdatePasswordScreen() {
  const [user, setUser] = useState<any>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem("user").then((userStr) => {
      if (userStr) {
        const user = JSON.parse(userStr);
        setUser(user);
      }
    });
  }, []);

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    if (!oldPassword.trim()) {
      Alert.alert("Error", "Please enter old password");
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert("Error", "Please enter new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New password and confirm password do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await req({
        url: "/api/auth/register",
        method: "PUT",
        data: {
          oldPassword,
          newPassword,
          userId: user.id,
        },
      });

      if (res.data.success) {
        Alert.alert("Success", "Password updated successfully", [
          {
            text: "OK",
            onPress: () => {
              router.back();
            },
          },
        ]);
      } else {
        Alert.alert("Error", res.data.error || "Failed to update password");
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.backText} onPress={() => router.back()}>
          Back
        </Text>
      </View>
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.label}>Old Password:</Text>
          <TextInput
            style={styles.input}
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholder="Enter old password"
            secureTextEntry
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>New Password:</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            secureTextEntry
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Confirm Password:</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            secureTextEntry
          />
        </View>
      </View>
      <View style={styles.submitContainer}>
        <Text style={styles.submitButton} onPress={handleSubmit}>
          {loading ? "Submitting..." : "Submit"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    paddingLeft: 16,
  },
  backText: {
    color: "#007aff",
    fontSize: 18,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 4,
    width: "100%",
    justifyContent: "space-between",
  },
  label: { fontSize: 16, color: "#888", width: 120 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    marginLeft: 8,
  },
  submitContainer: {
    position: "absolute",
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: "#007aff",
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 48,
    paddingVertical: 12,
    borderRadius: 24,
    overflow: "hidden",
    textAlign: "center",
  },
});

export const unstable_settings = {
  headerShown: false,
};
