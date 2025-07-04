import { req } from "@/utils/RequestConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Blog {
  bid: number;
  title: string;
  content: string;
  num_view: number;
  create_time: string;
}

export default function MyBlogsScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("user").then((userStr) => {
      if (userStr) {
        const user = JSON.parse(userStr);
        setUser(user);
        fetchMyBlogs(user.id);
      }
    });
  }, []);

  const fetchMyBlogs = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await req({
        url: `/api/blogs?uid=${userId}`,
        method: "GET",
      });

      console.log("My Blogs API Response:", response.data);
      setBlogs(response.data.blogs || []);
    } catch (e: any) {
      console.error("Error fetching my blogs:", e);
      setError(
        e.response?.data?.message || e.message || "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderBlogItem = ({ item }: { item: Blog }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({ pathname: "/blogDetail", params: { bid: item.bid } })
      }
      activeOpacity={0.8}
    >
      <View style={styles.blogItem}>
        <Text style={styles.blogTitle}>{item.title}</Text>
        <Text style={styles.blogContent} numberOfLines={3}>
          {item.content}
        </Text>
        <View style={styles.blogMeta}>
          <Text style={styles.blogDate}>
            {new Date(item.create_time).toLocaleDateString()}
          </Text>
          <Text style={styles.blogViews}>{item.num_view} views</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.backText} onPress={() => router.back()}>
            Back
          </Text>
        </View>
        <View style={styles.centerContent}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.backText} onPress={() => router.back()}>
            Back
          </Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.backText} onPress={() => router.back()}>
          Back
        </Text>
        <Text style={styles.headerTitle}>My Blogs</Text>
      </View>
      {blogs.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No blogs found</Text>
        </View>
      ) : (
        <FlatList
          data={blogs}
          renderItem={renderBlogItem}
          keyExtractor={(item) => item.bid.toString()}
          contentContainerStyle={styles.blogList}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backText: {
    color: "#007aff",
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
  },
  blogList: {
    padding: 16,
  },
  blogItem: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  blogTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#212529",
  },
  blogContent: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 12,
    lineHeight: 20,
  },
  blogMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  blogDate: {
    fontSize: 12,
    color: "#868e96",
  },
  blogViews: {
    fontSize: 12,
    color: "#868e96",
  },
});

export const unstable_settings = {
  headerShown: false,
};
