import { useAuth, useUser } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RideCard from "@/components/RideCard";
import { icons, images } from "@/constants";
import LocationSearchInput from "@/components/LocationSearchInput";
import Map from "@/components/Map";
import { useLocationStore } from "@/store";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useFetch } from "@/lib/fetch";
import { Ride } from "@/types/type";

export default function Page() {
  const { setUserLocation, setDestinationLocation } = useLocationStore();
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const [hasPermissions, setHasPermissions] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const { data: recentRides, loading } = useFetch<Ride[]>(
    `/(api)/ride/${user?.id}`,
  );

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/sign-in");
  };

  const handleDestinationPress = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setDestinationLocation(location);
    router.replace("/(root)/find-ride");
  };

  useEffect(() => {
    const requestLocation = async () => {
      try {
        // Request permission
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setHasPermissions(false);
          setLocationError("Location permission denied");
          Alert.alert(
            "Permission Required",
            "Please enable location permissions to use this app",
          );
          return;
        }

        setHasPermissions(true);

        // Get current location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = location.coords;

        console.log("Got location:", { latitude, longitude });

        // Try to get address with error handling
        let addressText = "Current Location";

        try {
          const address = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });

          if (address && address[0]) {
            addressText =
              `${address[0].name || address[0].street || ""}, ${address[0].region || address[0].city || ""}`.trim();
            // Clean up if starts/ends with comma
            addressText =
              addressText.replace(/^,\s*|,\s*$/g, "") || "Current Location";
          }
        } catch (geocodeError) {
          console.warn(
            "Geocoding failed, using coordinates only:",
            geocodeError,
          );
          // Continue without address - not critical
          addressText = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }

        // Set location even if geocoding failed
        setUserLocation({
          latitude,
          longitude,
          address: addressText,
        });

        console.log("Location set successfully:", addressText);
      } catch (error) {
        console.error("Location request failed:", error);
        setLocationError("Failed to get location");
        Alert.alert(
          "Location Error",
          "Unable to get your current location. Please check your settings.",
        );
      }
    };

    if (user?.id) {
      requestLocation();
    }
  }, [user?.id, setUserLocation]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={recentRides?.slice(0, 5)}
        renderItem={({ item }) => <RideCard ride={item} />}
        className="px-5"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center">
            {!loading ? (
              <>
                <Image
                  source={images.noResult}
                  className="w-40 h-40"
                  alt="No recent rides found"
                  resizeMode="contain"
                />
                <Text className="text-sm">No recent rides found</Text>
              </>
            ) : (
              <ActivityIndicator size="small" color="#000" />
            )}
          </View>
        )}
        ListHeaderComponent={() => (
          <>
            <View className="flex flex-row items-center justify-between my-5">
              <Text className="text-xl capitalize font-JakartaExtraBold">
                Welcome{", "}
                {user?.firstName ||
                  user?.emailAddresses[0].emailAddress.split("@")[0]}{" "}
                👋
              </Text>
              <TouchableOpacity
                onPress={handleSignOut}
                className="justify-center items-center w-10 h-10 rounded-full bg-white"
              >
                <Image source={icons.out} className="w-4 h-4" />
              </TouchableOpacity>
            </View>

            {/* Google Text Input */}
            <LocationSearchInput
              placeholder="Where do you want to go?"
              handlePress={handleDestinationPress}
              icon={icons.search}
              containerStyle="bg-neutral-100 rounded-xl shadow-xl"
            />

            {/* Location Error Message */}
            {locationError && (
              <View className="bg-red-100 p-3 rounded-lg mt-3">
                <Text className="text-red-600 text-sm">{locationError}</Text>
              </View>
            )}

            {/* Map Section */}
            <>
              <Text className="text-xl font-JakartaBold mt-5 mb-3">
                Your Current Location
              </Text>
              <View className="flex flex-row items-center bg-transparent h-[300px]">
                {hasPermissions ? (
                  <Map />
                ) : (
                  <View className="flex-1 justify-center items-center bg-gray-100 rounded-xl">
                    <Text className="text-gray-500 text-center px-4">
                      Location permission required to show map
                    </Text>
                  </View>
                )}
              </View>
            </>

            <Text className="text-xl font-JakartaBold mt-5 mb-3">
              Recent Rides
            </Text>
          </>
        )}
      />
    </SafeAreaView>
  );
}
