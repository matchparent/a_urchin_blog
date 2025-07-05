import { req } from "@/utils/RequestConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { BASE_URL } from "../env";

// 定义评论类型
interface CommentWithUser {
  rid: number;
  uid: string;
  bid: number;
  content: string;
  rbid: number | null;
  rtuid: string | null;
  create_time: string | null;
  userNickname: string;
  replyToUserNickname?: string;
}

interface GroupedComment extends CommentWithUser {
  replies: CommentWithUser[];
}

export default function BlogDetailScreen() {
  const router = useRouter();
  const { bid } = useLocalSearchParams();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<GroupedComment[]>([]);
  const [commentContent, setCommentContent] = useState("");
  const [replyTo, setReplyTo] = useState<any>({
    rbid: null,
    rtuid: null,
    rtuname: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (bid) {
      req({
        url: `/api/blog/${bid}`,
        method: "GET",
      })
        .then(({ data }) => {
          setBlog(data);
        })
        .finally(() => setLoading(false));
      fetchComments();
    }
    // 获取当前用户
    AsyncStorage.getItem("user").then((userStr) => {
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
    });
    // eslint-disable-next-line
  }, [bid]);

  const fetchComments = () => {
    req({
      url: `/api/comments?bid=${bid}`,
      method: "GET",
    }).then(({ data }) => {
      setComments(data || []);
    });
  };

  const handleSubmit = async () => {
    if (!commentContent.trim()) {
      Alert.alert("Error", "Please enter your comment");
      return;
    }
    if (!user?.id) {
      Alert.alert("Error", "User not logged in");
      router.replace("/login");
      return;
    }
    setSubmitting(true);
    const payload: any = {
      bid,
      content: commentContent,
      uid: user.id,
    };
    if (replyTo.rbid) {
      payload.rbid = replyTo.rbid;
      payload.rtuid = replyTo.rtuid;
      payload.rtuname = replyTo.rtuname;
    }
    try {
      await req({
        url: "/api/comments",
        method: "POST",
        data: payload,
      });
      Alert.alert("Success", "Comment posted successfully!");
      setCommentContent("");
      setReplyTo({ rbid: null, rtuid: null, rtuname: null });
      fetchComments();
    } catch (e) {
      Alert.alert("Error", "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (comment: any) => {
    setReplyTo({
      rbid: comment.rid,
      rtuid: comment.uid,
      rtuname: comment.userNickname,
    });
  };

  const handleCancelReply = () => {
    setReplyTo({ rbid: null, rtuid: null, rtuname: null });
  };

  const renderComment = (
    comment: GroupedComment | CommentWithUser,
    isChild = false
  ) => (
    <View
      key={comment.rid}
      style={[styles.commentBox, isChild ? styles.childCommentBox : null]}
    >
      <View style={styles.commentHeader}>
        <Text style={styles.commentAuthor}>{comment.userNickname}</Text>
        <Text style={styles.commentDate}>
          {comment.create_time
            ? new Date(comment.create_time).toLocaleString().slice(0, 16)
            : ""}
        </Text>
      </View>
      <Text style={styles.commentContent}>
        {isChild && comment.replyToUserNickname ? (
          <Text style={{ color: "#888" }}>
            reply to {comment.replyToUserNickname}:{" "}
          </Text>
        ) : null}
        {comment.content}
      </Text>
      <TouchableOpacity onPress={() => handleReply(comment)}>
        <Text style={styles.replyBtn}>Reply</Text>
      </TouchableOpacity>
      {/* 渲染二级评论 */}
      {"replies" in comment &&
        comment.replies &&
        comment.replies.length > 0 && (
          <View style={styles.childCommentsWrap}>
            {comment.replies.map((child) => renderComment(child, true))}
          </View>
        )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!blog) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>Blog not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.titleRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <SymbolView name="chevron.left" size={20} tintColor="#007aff" />
            </TouchableOpacity>
            <Text style={styles.title}>{blog.title}</Text>
            <View style={{ width: 44 }} />
          </View>
          <View style={styles.metaRow}>
            <View style={styles.authorInfoRow}>
              {blog.author && blog.author.uid ? (
                <Image
                  source={{
                    uri: `${BASE_URL}/api/portrait?uid=${blog.author.uid}`,
                    cache: "reload",
                  }}
                  style={styles.authorAvatar}
                  onError={() => {}}
                />
              ) : (
                <View
                  style={[styles.authorAvatar, { backgroundColor: "#eee" }]}
                />
              )}
              <Text style={styles.authorName}>
                {blog.author && blog.author.nickname
                  ? blog.author.nickname
                  : "Anonymous"}
              </Text>
            </View>
            <View style={styles.metaRightRow}>
              <Text style={styles.meta}>Views: {blog.num_view}</Text>
              <Text style={[styles.meta, { marginLeft: 12 }]}>
                {new Date(blog.create_time).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <Markdown style={markdownStyles}>{blog.content}</Markdown>

          <Text style={styles.commentsTitle}>Comments</Text>
          <View style={styles.commentInputWrap}>
            <TextInput
              style={styles.commentInput}
              value={commentContent}
              onChangeText={setCommentContent}
              placeholder={
                replyTo.rbid && replyTo.rtuname
                  ? `Reply to ${replyTo.rtuname}:`
                  : "Leave your comments here ..."
              }
              multiline
            />
            <View style={styles.commentBtnRow}>
              <TouchableOpacity
                style={styles.commentBtn}
                onPress={handleSubmit}
                disabled={submitting}
              >
                <Text style={styles.commentBtnText}>Post Comment</Text>
              </TouchableOpacity>
              {replyTo.rbid && (
                <TouchableOpacity
                  style={styles.cancelReplyBtn}
                  onPress={handleCancelReply}
                >
                  <Text style={styles.cancelReplyText}>Cancel Reply</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.commentsList}>
            {comments.length === 0 ? (
              <Text style={styles.noComments}>No comments yet.</Text>
            ) : (
              comments.map((comment) => renderComment(comment))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scroll: { flex: 1, padding: 16 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  backBtn: {
    marginRight: 8,
    width: 36,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    flex: 1,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  authorInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: "#eee",
  },
  authorName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  metaRightRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  meta: { color: "#888", fontSize: 13 },
  loading: { marginTop: 40, textAlign: "center" },
  error: { marginTop: 40, textAlign: "center", color: "red" },
  commentsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 32,
    marginBottom: 12,
  },
  commentInputWrap: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  commentInput: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#007aff",
    borderRadius: 6,
    padding: 8,
    fontSize: 15,
    backgroundColor: "#fff",
  },
  commentBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  commentBtn: {
    backgroundColor: "#007aff",
    borderRadius: 6,
    paddingVertical: 8,
    width: 120,
    alignItems: "center",
    marginRight: 10,
  },
  commentBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  cancelReplyBtn: {
    backgroundColor: "#f1f3f5",
    borderRadius: 6,
    paddingVertical: 8,
    width: 120,
    alignItems: "center",
    marginLeft: "auto",
  },
  cancelReplyText: {
    color: "#333",
    fontSize: 15,
  },
  commentsList: {
    marginTop: 8,
    marginBottom: 32,
  },
  noComments: {
    color: "#888",
    fontSize: 15,
    textAlign: "center",
    marginVertical: 16,
  },
  commentBox: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  childCommentBox: {
    marginLeft: 32,
    marginTop: 4,
    backgroundColor: "#f8f9fa",
  },
  childCommentsWrap: {
    marginTop: 4,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  commentAuthor: {
    fontWeight: "bold",
    fontSize: 15,
    marginRight: 8,
  },
  commentDate: {
    color: "#888",
    fontSize: 12,
    marginLeft: "auto",
  },
  commentContent: {
    fontSize: 15,
    marginBottom: 4,
    marginTop: 2,
  },
  replyBtn: {
    color: "#007aff",
    fontSize: 14,
    marginTop: 2,
  },
});

const markdownStyles = {
  body: { fontSize: 15, color: "#333" },
  paragraph: { marginVertical: 4 },
  code_block: {
    backgroundColor: "#f5f5f5",
    padding: 4,
    borderRadius: 3,
    fontSize: 13,
  },
  code_inline: {
    backgroundColor: "#f5f5f5",
    padding: 2,
    borderRadius: 2,
    fontSize: 13,
  },
};
