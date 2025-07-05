import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { req } from "@/utils/RequestConfig"; // Import req
import { AxiosError } from "axios"; // Import AxiosError
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import Animated from "react-native-reanimated";

interface Blog {
  bid: number;
  title: string;
  content: string;
  num_view: number;
  create_time: string;
  author?: {
    uid: string;
    nickname: string;
  };
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // Current page state
  const [error, setError] = useState<string | null>(null);
  const [totalBlogs, setTotalBlogs] = useState(0); // Total blogs count
  const [refreshing, setRefreshing] = useState(false); // 新增
  const pageSize = 4; // Blogs per page
  const router = useRouter();

  // 根据主题设置蒙层颜色
  const overlayColor = colorScheme === "dark" ? "#151718" : "#fff";
  const overlayTransparent =
    colorScheme === "dark" ? "rgba(21, 23, 24, 0)" : "rgba(255, 255, 255, 0)";

  // fetchBlogs 提取到外部
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await req({
        url: `/api/blogs?page=${currentPage}&limit=${pageSize}`,
        method: "GET",
      });

      setBlogs(response.data.blogs);
      setTotalBlogs(response.data.totalBlogs);
    } catch (e: unknown) {
      console.error("Error fetching blogs:", e);
      const axiosError = e as AxiosError<{ message: string }>;
      setError(
        axiosError.response?.data?.message ||
          axiosError.message ||
          "An unknown error occurred"
      );
    } finally {
      setLoading(false);
      setRefreshing(false); // 新增
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [currentPage]); // 当 currentPage 改变时重新获取数据

  // 下拉刷新
  const onRefresh = () => {
    setRefreshing(true);
    fetchBlogs();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && (
          <ThemedText style={styles.text}>Loading blogs...</ThemedText>
        )}

        {error && (
          <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
        )}

        {blogs.map((blog) => (
          <TouchableOpacity
            key={blog.bid}
            onPress={() =>
              router.push({
                pathname: "/blogDetail",
                params: { bid: blog.bid },
              })
            }
            activeOpacity={0.8}
          >
            <ThemedView style={styles.blogItem}>
              <SafeAreaView
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <ThemedText
                  type="defaultSemiBold"
                  style={styles.title}
                  numberOfLines={1}
                >
                  {blog.title}
                </ThemedText>
                <SafeAreaView
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  {blog.author && blog.author.nickname && (
                    <ThemedText
                      style={{ fontSize: 13, color: "#333", marginRight: 6 }}
                      numberOfLines={1}
                    >
                      {blog.author.nickname}
                    </ThemedText>
                  )}
                  {blog.author && blog.author.uid ? (
                    <Image
                      source={{
                        uri: `${require("@/env").BASE_URL}/api/portrait?uid=${
                          blog.author.uid
                        }`,
                        cache: "reload",
                      }}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: "#eee",
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: "#eee",
                      }}
                    />
                  )}
                </SafeAreaView>
              </SafeAreaView>
              <ThemedText style={styles.text}>
                Views: {blog.num_view} &nbsp;&nbsp;&nbsp;&nbsp; Created:{" "}
                {new Date(blog.create_time).toLocaleDateString()}
              </ThemedText>
              <Markdown style={markdownStyles}>{blog.content}</Markdown>
              <LinearGradient
                colors={[overlayTransparent, overlayColor]}
                style={styles.overlay}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
            </ThemedView>
          </TouchableOpacity>
        ))}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // 或者使用主题颜色
    paddingTop: 30,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },

  blogItem: {
    height: 200,
    margin: 5,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    overflow: "hidden",
  },
  errorText: {
    color: "red",
    padding: 10,
    fontSize: 12,
  },
  text: {
    fontSize: 12,
  },
  title: {
    fontSize: 16,
    color: Colors.main_blue,
    borderBottomWidth: 1,
    borderColor: Colors.main_blue,
    alignSelf: "flex-start",
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 40,
  },
});

const markdownStyles = {
  body: {
    fontSize: 12,
    color: "#333",
  },
  paragraph: {
    marginVertical: 2,
  },
  heading1: {
    fontSize: 14,
    fontWeight: "bold",
    marginVertical: 4,
  },
  heading2: {
    fontSize: 13,
    fontWeight: "bold",
    marginVertical: 3,
  },
  heading3: {
    fontSize: 12,
    fontWeight: "bold",
    marginVertical: 2,
  },
  code_block: {
    backgroundColor: "#f5f5f5",
    padding: 4,
    borderRadius: 3,
    fontSize: 11,
  },
  code_inline: {
    backgroundColor: "#f5f5f5",
    padding: 2,
    borderRadius: 2,
    fontSize: 11,
  },
};
