import React from "react";

import styles from "./style";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Button, SocialIcon } from "react-native-elements";
import * as Facebook from "expo-facebook";

const appId = "1047121222092614";

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const onLoginPress = () => {};

  const onFbLoginPress = async () => {
    Alert.alert(
      `Please use our React Native Starer Kit instead. You can download it for free at https://instamobile.io`
    );
    // try {
    //   await Facebook.initializeAsync({
    //     appId,
    //   });
    //   const { type, token } = await Facebook.logInWithReadPermissionsAsync({
    //     permissions: ["public_profile", "email"],
    //   });
    //   if (type === "success") {
    //     const response = await fetch(
    //       `https://graph.facebook.com/me?access_token=${token}`
    //     );
    //     Alert.alert("Logged in!", `Hi ${(await response.json()).name}!`);
    //   }
    // } catch ({ message }) {
    //   Alert.alert(`Facebook Login Error: ${message}`);
    // }
  };

  const onForgotPasswordPress = () => {
    Alert.alert("Forgot Password", "Reset instructions have been sent to your email.");
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <KeyboardAvoidingView style={styles.containerView} behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.loginScreenContainer}>
          <View style={styles.loginFormContainer}>
            <Text style={styles.logoText}>Instamobile</Text>
            <TextInput
              placeholder="Username"
              placeholderColor="#c4c3cb"
              style={styles.loginFormTextInput}
            />
            <TextInput
              placeholder="Password"
              placeholderColor="#c4c3cb"
              style={styles.loginFormTextInput}
              secureTextEntry={!showPassword}
            />
            {/* Toggle show/hide password */}
            <Text style={styles.forgotPasswordText} onPress={toggleShowPassword}>
              {showPassword ? "Hide Password" : "Show Password"}
            </Text>
            <Button
              buttonStyle={styles.loginButton}
              onPress={onLoginPress}
              title="Login"
            />
            <Button
              containerStyle={styles.fbLoginButton}
              type="clear"
              onPress={onFbLoginPress}
              title="Login With Facebook"
            />
            {/* Forgot Password link */}
            <Text style={styles.forgotPasswordText} onPress={onForgotPasswordPress}>
              Forgot Password?
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
