import {
  BackHandler,
  Image,
  Keyboard,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { router, usePathname } from "expo-router";
import { icons } from "@/constants";
import Map from "@/components/Map";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { SafeAreaView } from "react-native-safe-area-context";

interface RideLayoutProps {
  title: string;
  children: ReactNode;
  snapPoints?: string[];
}

const RideLayout = ({ title, snapPoints, children }: RideLayoutProps) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const pathname = usePathname();

  const memoizedSnapPoints = useMemo(
    () => snapPoints || ["50%", "85%"],
    [snapPoints],
  );

  // Handle keyboard events
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener("keyboardDidShow", () => {
      bottomSheetRef.current?.snapToIndex(1);
    });

    const keyboardWillHide = Keyboard.addListener("keyboardDidHide", () => {
      bottomSheetRef.current?.snapToIndex(0);
    });

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const handleBackPress = useCallback(() => {
    // ✅ Define explicit navigation routes
    if (pathname === "/(root)/confirm-ride") {
      router.replace("/(root)/find-ride");
      return;
    }

    if (pathname === "/(root)/find-ride") {
      router.replace("/(root)/(tabs)/home");
      return;
    }

    // ✅ Fallback for any other screen
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(root)/(tabs)/home");
    }
  }, [pathname]);

  // ✅ Handle Android hardware back button
  useEffect(() => {
    if (Platform.OS === "android") {
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          handleBackPress();
          return true;
        },
      );

      return () => backHandler.remove();
    }
  }, [handleBackPress, pathname]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 bg-blue-500">
          <View className="absolute z-10 top-2 flex-row items-center px-5">
            <TouchableOpacity onPress={handleBackPress}>
              <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
                <Image source={icons.backArrow} className="w-6 h-6" />
              </View>
            </TouchableOpacity>

            <Text className="text-xl font-JakartaSemiBold ml-5">{title}</Text>
          </View>

          <Map />
        </View>

        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={memoizedSnapPoints}
          index={0}
          enableDynamicSizing={false}
          enablePanDownToClose={false}
          enableOverDrag={false}
          keyboardBehavior="extend"
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustResize"
        >
          {/* ✅ Use BottomSheetView instead of BottomSheetScrollView
              This allows children to manage their own scrolling */}
          <BottomSheetScrollView
            contentContainerStyle={{ padding: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </BottomSheetScrollView>
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default RideLayout;
