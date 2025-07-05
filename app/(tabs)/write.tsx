import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { isLoggedIn } from "@/hooks/useAuth";
import { req } from "@/utils/RequestConfig"; // Import req
import { showToast } from "@/utils/Toastrn";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosError } from "axios"; // Import AxiosError
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import Animated from "react-native-reanimated";

const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === "string" &&
    args[0].includes(
      'A props object containing a "key" prop is being spread into JSX'
    )
  ) {
    // 忽略这个特定警告
    return;
  }
  originalConsoleError(...args);
};

export default function WriteScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    isLoggedIn().then((logged) => {
      if (!logged) {
        router.replace("/login");
      }
    });
    AsyncStorage.getItem("user").then((userStr) => {
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
    });
  }, []);

  const handleSubmit = () => {
    if (!title.trim()) {
      showToast("Blog title cannot be empty!");
      return;
    }
    if (!content.trim()) {
      showToast("Blog content cannot be empty!");
      return;
    }
    if (!user?.id) {
      showToast("User not logged in. Please log in to publish.");
      return;
    }

    req({
      url: "/api/blog",
      method: "POST",
      data: {
        uid: user.id,
        title: title,
        content: content,
        status: 1,
      },
    })
      .then(({ data }) => {
        if (data.success) {
          Alert.alert("Success", "Blog published successfully!", [
            {
              text: "OK",
              onPress: () => {
                setTitle("");
                setContent("");
              },
            },
          ]);
        } else {
          showToast(`Failed to publish blog: ${data.error || "Unknown error"}`);
        }
      })
      .catch((error: unknown) => {
        console.error("Error publishing blog:", error);
        const axiosError = error as AxiosError<{ error: string }>;
        showToast(
          axiosError.response?.data?.error ||
            axiosError.message ||
            "An unexpected error occurred during publishing."
        );
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView style={styles.scrollView}>
        <ThemedText type="title" style={styles.title}>
          Write Blog
        </ThemedText>

        {/* 标题输入 */}
        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>Title:</ThemedText>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter blog title..."
            placeholderTextColor="#999"
          />
        </View>

        {/* 内容输入 */}
        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>Content (Markdown):</ThemedText>
          <TextInput
            style={[
              styles.contentInput,
              { height: 160, textAlignVertical: "top" },
            ]}
            value={content}
            onChangeText={setContent}
            placeholder="Write your blog content in Markdown..."
            placeholderTextColor="#999"
            multiline
          />
        </View>

        <View style={{ marginTop: 16, marginBottom: 8 }}>
          <Text style={{ fontWeight: "bold", marginBottom: 4 }}>Preview:</Text>
          <View
            style={{
              minHeight: 60,
              borderWidth: 1,
              borderColor: "#eee",
              borderRadius: 8,
              padding: 8,
              backgroundColor: "#fafbfc",
            }}
          >
            <Markdown>{content || "_Nothing to preview..._"}</Markdown>
          </View>
        </View>

        {/* 提交按钮 */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <ThemedText style={styles.submitButtonText}>Submit</ThemedText>
        </TouchableOpacity>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    marginTop: 20,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  titleInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  contentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#f9f9f9",
    height: 300,
    fontFamily: "monospace",
  },
  submitButton: {
    backgroundColor: Colors.main_blue,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
