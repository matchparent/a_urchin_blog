import Toast from "react-native-root-toast";

export function showToast(content: string) {
  // 显示 Toast
  Toast.show(content, {
    duration: Toast.durations.SHORT,
    position: Toast.positions.BOTTOM,
    shadow: true,
    animation: true,
    hideOnPress: true,
    delay: 0,
  });
}
