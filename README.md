# Urchin Blog

A cross-platform (Android/iOS/Web) personal blog app built with React Native, Expo, and TypeScript.  
Features user authentication, profile management, blog writing/preview, comments, and more.

## Features

- **User Authentication**: Register, login, and secure session management.
- **Profile Center**: View and update profile info, avatar upload, change password.
- **Blog System**: Write blogs in Markdown, preview before publishing, view all blogs with pagination and pull-to-refresh.
- **My Blogs**: View and manage your own published blogs.
- **Blog Detail**: View full blog content, including comments and nested replies.
- **Comment System**: Post comments and replies, with login check and real-time UI update.
- **Modern UI**: Responsive, themed, and mobile-friendly interface.
- **Android/iOS/Web**: Runs on all major platforms via Expo.

## Project Structure

```
a_urchin_blog/
  app/                # Main app screens and navigation (Expo Router)
    (tabs)/           # Tab navigation: Home, Profile, Write
    blogDetail.tsx    # Blog detail page
    login.tsx         # Login page
    register.tsx      # Register page
    myBlogs.tsx       # My blogs page
    updateProfile.tsx # Update profile info
    updatePassword.tsx# Update password
  components/         # Reusable UI components
  constants/          # Theme and color constants
  hooks/              # Custom React hooks
  utils/              # Utility functions (API, Toast, etc.)
  assets/             # Images, fonts, icons
  android/            # (Ignored by git) Native Android project
  ios/                # (Ignored by git) Native iOS project
```

## Tech Stack

- **React Native 0.79+**
- **Expo 53+**
- **TypeScript**
- **Expo Router** (file-based navigation)
- **Axios** (API requests)
- **AsyncStorage** (local storage)
- **expo-image-picker** (avatar upload)
- **react-native-markdown-display** (Markdown preview)
- **Other Expo/React Native libraries** (see `package.json`)
