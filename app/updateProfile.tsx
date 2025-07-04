import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { BASE_URL } from "../env";

export default function UpdateProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [nickname, setNickname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    AsyncStorage.getItem("user").then((userStr) => {
      if (userStr) {
        const user = JSON.parse(userStr);
        setUser(user);

        if (params.userInfo) {
          try {
            const userInfo = JSON.parse(params.userInfo as string);
            setNickname(userInfo.nickname || "");
            setBirthDate(userInfo.date_birth || "");
          } catch (e) {
            console.error("Error parsing userInfo:", e);
            setNickname(user?.name || "");
            setBirthDate(
              user?.date_birth || user?.birthday
                ? new Date(user.date_birth || user.birthday)
                    .toISOString()
                    .slice(0, 10)
                : ""
            );
          }
        } else {
          setNickname(user?.name || "");
          setBirthDate(
            user?.date_birth || user?.birthday
              ? new Date(user.date_birth || user.birthday)
                  .toISOString()
                  .slice(0, 10)
              : ""
          );
        }
      }
    });
  }, [params.userInfo]);

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
      await handleUploadAvatar(uri);
    }
  };

  const handleUploadAvatar = async (uri: string) => {
    if (!user?.id) return;
    setUploading(true);
    try {
      let filename = uri.split("/").pop() || "avatar.jpg";
      let match = /\.([a-zA-Z0-9]+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : `image`;
      const formData = new FormData();
      formData.append("file", {
        uri: Platform.OS === "ios" ? uri.replace("file://", "") : uri,
        name: filename,
        type,
      } as any);
      formData.append("userId", String(user.id));
      const res = await fetch(`${BASE_URL}/api/portrait/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: formData,
      });
      if (res.ok) {
        Alert.alert("Success", "Avatar updated successfully");
        setAvatarUri(`${BASE_URL}/api/portrait?uid=${user.id}&t=${Date.now()}`);
      } else {
        console.log(res);
        Alert.alert("Error", "Failed to upload avatar");
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert("Error", "User not logged in");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/user/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify({
          nickname,
          date_birth: birthDate,
          userId: user.id,
        }),
      });
      if (res.ok) {
        Alert.alert("Success", "Profile updated successfully", [
          {
            text: "OK",
            onPress: () => {
              router.back();
            },
          },
        ]);
      } else {
        Alert.alert("Error", "Failed to update profile");
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Failed to update profile");
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
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={handlePickAvatar}>
          <Image
            source={
              avatarUri
                ? { uri: avatarUri }
                : user && user.id
                ? {
                    uri: `${BASE_URL}/api/portrait?uid=${
                      user.id
                    }&t=${Date.now()}`,
                  }
                : require("@/assets/images/react-logo.png")
            }
            style={styles.avatar}
          />
        </TouchableOpacity>
        <View style={styles.row}>
          <Text style={styles.label}>Nickname:</Text>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="please input nickname"
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Birth Date:</Text>
          <TouchableOpacity
            style={[styles.input, { justifyContent: "center" }]}
            onPress={() => setDatePickerVisible(true)}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.inputText, { color: birthDate ? "#000" : "#888" }]}
            >
              {birthDate || "please input birth date"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.submitContainer}>
        <Text style={styles.submitButton} onPress={handleSubmit}>
          {loading ? "Submitting..." : "Submit"}
        </Text>
      </View>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={
          birthDate
            ? (() => {
                const [y, m, d] = birthDate.split("-").map(Number);
                return new Date(y, m - 1, d);
              })()
            : new Date()
        }
        onConfirm={(date) => {
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const dd = String(date.getDate()).padStart(2, "0");
          setBirthDate(`${yyyy}-${mm}-${dd}`);
          setDatePickerVisible(false);
        }}
        onCancel={() => setDatePickerVisible(false)}
      />
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
  profileHeader: { alignItems: "center", marginTop: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 4,
    width: "80%",
    justifyContent: "space-between",
  },
  label: { fontSize: 16, color: "#888", width: 100 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    marginLeft: 8,
  },
  inputText: {
    fontSize: 16,
    // color: "#000",
    // padding: 2,
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
