import { req } from "@/utils/RequestConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter email");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Error", "Please enter password");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    setLoading(true);
    req({
      url: "/api/auth/register",
      method: "POST",
      data: {
        email,
        password,
        nickname: email,
      },
    })
      .then(({ data }) => {
        if (data.success) {
          // 注册成功后自动登录
          req({
            url: "/api/mobileLogin",
            method: "POST",
            data: {
              email,
              password,
            },
          })
            .then(({ data }) => {
              if (data.success) {
                AsyncStorage.setItem("user", JSON.stringify(data.user));
                router.replace("/(tabs)");
              } else {
                Alert.alert("Error", "Auto login failed");
              }
            })
            .catch(() => {
              Alert.alert("Error", "Auto login failed");
            });
        } else {
          Alert.alert("Error", data.error || "Register failed");
        }
      })
      .catch(() => {
        Alert.alert("Error", "Register failed");
      })
      .finally(() => setLoading(false));
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
          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Password:</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Confirm Password:</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm password"
            secureTextEntry
          />
        </View>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Submitting..." : "Submit"}
          </Text>
        </TouchableOpacity>
        <View style={styles.agreementRow}>
          <Text style={styles.agreementText}>
            Registering means agreeing with{" "}
          </Text>
          <Text
            style={styles.agreementLink}
            onPress={() => Linking.openURL("https://www.google.com")}
          >
            Agreement
          </Text>
        </View>
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
    marginTop: 32,
    marginBottom: 16,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  agreementRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  agreementText: {
    fontSize: 14,
    color: "#888",
  },
  agreementLink: {
    fontSize: 14,
    color: "#007aff",
    textDecorationLine: "underline",
  },
});

export const unstable_settings = {
  headerShown: false,
};
