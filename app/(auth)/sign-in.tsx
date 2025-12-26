import { useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { icons, images } from "@/constants";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import { Link, useRouter } from "expo-router";
import OAuth from "@/components/OAuth";
import { useSignIn } from "@clerk/clerk-react";

const SignIn = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const onSignInPress = async () => {
    if (!isLoaded) return;

    if (!form.email || !form.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(root)/(tabs)/home");
      } else {
        Alert.alert(
          "Sign In Incomplete",
          "Please complete the additional steps required.",
        );
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        "Invalid email or password";

      Alert.alert("Sign In Failed", errorMessage);
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsSubmitting(false);
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
      {/* Header Image & Title */}
      <View className="relative w-full h-[200px]">
        <Image
          source={images.signUpCar}
          className="z-0 w-full h-[200px]"
          resizeMode="cover"
        />
        <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
          Welcome 👋
        </Text>
      </View>

      {/* Form Content */}
      <View className="p-5">
        <InputField
          label="Email"
          placeholder="Enter your email"
          icon={icons.email}
          value={form.email}
          onChangeText={(value) => setForm({ ...form, email: value })}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isSubmitting}
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
          editable={!isSubmitting}
          iconRight={showPassword ? icons.eyecross : icons.eye}
          onIconRightPress={() => setShowPassword(!showPassword)}
        />

        <CustomButton
          title="Sign In"
          className="my-6"
          onPress={onSignInPress}
          isLoading={isSubmitting}
          disabled={isSubmitting || !form.email || !form.password}
        />

        <OAuth />

        <Link
          href="/sign-up"
          className="text-lg text-center text-general-200 mt-6 mb-5"
        >
          <Text>Don&apos;t have an account? </Text>
          <Text className="text-primary-500 font-bold">Sign Up</Text>
        </Link>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default SignIn;
