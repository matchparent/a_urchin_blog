import { req } from "@/utils/RequestConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosError } from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function LoginScreen() {
  const [username, setUsername] = useState("qwer@qw.er");
  const [password, setPassword] = useState("qwer1234");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    setError("");
    req({
      url: `/api/mobileLogin`,
      method: "POST",
      data: {
        email: username,
        password: password,
      },
    })
      .then(({ data }) => {
        if (data.success) {
          console.log(data);
          AsyncStorage.setItem("user", JSON.stringify(data.user));
          router.replace("/(tabs)");
        } else {
          setError("Login failed");
        }
      })
      .catch((error: AxiosError<{ error: string }, any>) => {
        if (error) {
          // 只有在有实际错误时才显示错误消息
          // console.error("Registration error:", error);
          const axiosError = error as AxiosError<{ error: string }>;
          setError(
            axiosError.response?.data?.error ||
              error.message ||
              "An error occurred during registration"
          );
        }
      });
  };

  const handleCancel = () => {
    router.replace("/(tabs)");
  };

  const handleBack = () => {
    if (router.canGoBack && router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.backText} onPress={handleBack}>
          Back
        </Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? (
        <Text style={{ color: "red", marginLeft: 32 }}>{error}</Text>
      ) : null}
      <View
        style={{
          marginTop: 32,
          flexDirection: "row",
          justifyContent: "space-between",
          marginHorizontal: 32,
        }}
      >
        <Button title="Register" onPress={() => router.push("/register")} />
        <Button title="Login" onPress={handleLogin} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 30, padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginLeft: 32,
    marginRight: 32,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    paddingLeft: 16,
    marginBottom: 120,
  },
  backText: {
    color: "#007aff",
    fontSize: 18,
  },
});
