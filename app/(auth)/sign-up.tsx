import { useState } from "react";
import {
  Alert,
  Image,
  Modal as RNModal,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { icons, images } from "@/constants";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import { Link, useRouter } from "expo-router";
import OAuth from "@/components/OAuth";
import { useSignUp } from "@clerk/clerk-react";
import { fetchAPI } from "@/lib/fetch";

const SignUp = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [verification, setVerification] = useState({
    state: "default" as "default" | "pending" | "failed",
    error: "",
    code: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Verification Modal States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    setIsSubmitting(true);
    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setVerification({
        state: "pending",
        error: "",
        code: "",
      });
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.errors?.[0]?.longMessage || "Something went wrong",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    setIsVerifying(true);
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });

      if (signUpAttempt.status === "complete") {
        await fetchAPI("/(api)/user", {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            clerkId: signUpAttempt.createdUserId,
          }),
        });

        await setActive({ session: signUpAttempt.createdSessionId });

        setVerification({
          state: "default",
          error: "",
          code: "",
        });
        setShowSuccessModal(true);
      } else {
        setVerification({
          state: "failed",
          error: "Verification failed.",
          code: "",
        });
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setVerification({
        state: "failed",
        error: err.errors?.[0]?.longMessage || "Invalid code",
        code: "",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={60}
    >
      {/* Header */}
      <View className="relative w-full h-[200px]">
        <Image
          source={images.signUpCar}
          className="z-0 w-full h-[200px]"
          resizeMode="cover"
        />
        <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
          Create Your Account
        </Text>
      </View>

      {/* Form */}
      <View className="p-5">
        <InputField
          label="Name"
          placeholder="Enter your name"
          icon={icons.person}
          value={form.name}
          onChangeText={(value) => setForm({ ...form, name: value })}
        />

        <InputField
          label="Email"
          placeholder="Enter your email"
          icon={icons.email}
          value={form.email}
          onChangeText={(value) => setForm({ ...form, email: value })}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <InputField
          label="Password"
          placeholder="Enter your password"
          icon={icons.lock}
          value={form.password}
          onChangeText={(value) => setForm({ ...form, password: value })}
          secureTextEntry={!showPassword}
          textContentType="none"
          autoComplete="off"
          iconRight={showPassword ? icons.eyecross : icons.eye}
          onIconRightPress={() => setShowPassword(!showPassword)}
        />

        <CustomButton
          title="Sign Up"
          onPress={onSignUpPress}
          isLoading={isSubmitting}
          className="my-6"
        />

        <OAuth />

        <Link
          href="/sign-in"
          className="text-lg text-center text-general-200 mt-6 mb-5"
        >
          <Text>Already have an account? </Text>
          <Text className="text-primary-500 font-bold">Log In</Text>
        </Link>
      </View>

      {/* Verification Modal */}
      <RNModal
        visible={verification.state === "pending"}
        transparent={true}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={() => {}}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View className="bg-white w-11/12 max-w-md px-7 py-9 rounded-2xl">
              <Text className="font-JakartaExtraBold text-2xl mb-2">
                Verification
              </Text>
              <Text className="font-Jakarta mb-5">
                We&#39;ve sent a verification code to {form.email}.
              </Text>

              <InputField
                label="Code"
                icon={icons.lock}
                placeholder="12345"
                value={verification.code}
                keyboardType="numeric"
                onChangeText={(code) =>
                  setVerification({ ...verification, code })
                }
              />

              {verification.error && (
                <Text className="text-red-500 text-sm mt-1">
                  {verification.error}
                </Text>
              )}

              <CustomButton
                title="Verify Email"
                onPress={onVerifyPress}
                isLoading={isVerifying}
                className="mt-5"
                bgVariant="success"
              />
            </View>
          </View>
        </View>
      </RNModal>

      {/* Success Modal */}
      <RNModal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => {}}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View className="bg-white w-11/12 max-w-md px-7 py-9 rounded-2xl">
              <Image
                source={images.check}
                className="w-[60px] h-[60px] mx-auto my-5"
                resizeMode="contain"
              />
              <Text className="text-3xl font-JakartaBold text-center">
                Verified
              </Text>
              <Text className="text-base text-gray-500 font-Jakarta text-center mt-2">
                You have successfully verified your account.
              </Text>

              <CustomButton
                title="Browse Home"
                onPress={() => router.push("/(root)/(tabs)/home")}
                className="mt-5"
              />
            </View>
          </View>
        </View>
      </RNModal>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: "100%",
    alignItems: "center",
  },
});

export default SignUp;
