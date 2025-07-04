import { ThemedText } from "@/components/ThemedText";
import { isLoggedIn } from "@/hooks/useAuth";
import { req } from "@/utils/RequestConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BASE_URL } from "../../env";

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<string | object | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [avatarError, setAvatarError] = useState(false);

  const refreshUserInfo = useCallback(async () => {
    if (user && typeof user === "object" && (user as any).id) {
      try {
        const { data } = await req({
          url: `/api/user/info?userId=${(user as any).id}`,
          method: "GET",
        });
        setUserInfo({
          nickname: data.nickname || "",
          date_birth: data.date_birth
            ? new Date(data.date_birth).toISOString().split("T")[0]
            : "",
          email: data.email || "",
        });
      } catch (error) {
        console.error("Error fetching user info:", error);
        setUserInfo({
          nickname: (user as any).name || "",
          date_birth: (user as any).date_birth || (user as any).birthday || "",
          email: (user as any).email || "",
        });
      }
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      refreshUserInfo();
    }, [refreshUserInfo])
  );

  useEffect(() => {
    isLoggedIn().then((logged) => {
      if (!logged) {
        router.replace("/login");
        setUser("unlogined");
      } else {
        AsyncStorage.getItem("user").then((userStr) => {
          if (userStr) {
            const localUser = JSON.parse(userStr);
            setUser(localUser);
            req({
              url: `/api/user/info?userId=${localUser.id}`,
              method: "GET",
            })
              .then(({ data }) => {
                setUserInfo({
                  nickname: data.nickname || "",
                  date_birth: data.date_birth
                    ? new Date(data.date_birth).toISOString().split("T")[0]
                    : "",
                  email: data.email || "",
                });
              })
              .catch((error) => {
                console.error("Error fetching user info:", error);
                setUserInfo({
                  nickname: localUser.name || "",
                  date_birth: localUser.date_birth || localUser.birthday || "",
                  email: localUser.email || "",
                });
              });
          }
        });
      }
    });
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    // await AsyncStorage.removeItem("token");
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={{ flex: 1 }}>
          <View style={styles.profileHeader}>
            {(() => {
              const avatarUri =
                user && typeof user === "object" && (user as any).id
                  ? `${BASE_URL}/api/portrait?uid=${
                      (user as any).id
                    }&t=${Date.now()}`
                  : null;
              console.log("Avatar URI:", avatarUri);
              return null;
            })()}
            <Image
              key={
                user && typeof user === "object" && (user as any).id
                  ? `${(user as any).id}_${Date.now()}`
                  : "default"
              }
              source={
                avatarError
                  ? require("@/assets/images/react-logo.png")
                  : user && user.id
                  ? {
                      uri: `${BASE_URL}/api/portrait?uid=${user.id}`,
                      cache: "reload",
                    }
                  : require("@/assets/images/react-logo.png")
              }
              style={styles.avatar}
              onError={() => setAvatarError(true)}
            />
            <ThemedText type="title" style={styles.title}>
              {userInfo?.nickname ||
                (user && typeof user === "object" ? (user as any).name : user)}
            </ThemedText>
          </View>
          <View style={styles.menuList}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                router.push({
                  pathname: "/updateProfile",
                  params: { userInfo: JSON.stringify(userInfo) },
                })
              }
            >
              <Text>Update profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/updatePassword")}
            >
              <Text>Update password</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/myBlogs")}
            >
              <Text>My Blogs</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  profileHeader: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  title: {
    marginTop: 0,
    marginBottom: 0,
    fontSize: 20,
    fontWeight: "bold",
  },
  menuList: {
    gap: 16,
  },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  logoutContainer: {
    alignItems: "center",
    width: "100%",
    marginBottom: 100,
  },
  logoutButton: {
    backgroundColor: "#f44",
    paddingHorizontal: 32,
    width: "100%",
    paddingVertical: 12,
    borderRadius: 24,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
});
