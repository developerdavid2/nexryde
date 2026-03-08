/* eslint-disable prettier/prettier */
import { useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Map from "@/components/Map";
import { useFetch } from "@/lib/fetch";
import { Ride } from "@/types/type";
import RideCard from "@/components/RideCard";

const RideDetails = () => {
  const { id } = useLocalSearchParams();
  const { data: ride, loading } = useFetch<Ride>(`/(api)/ride/${id}`);

  if (loading || !ride) {
    return (
      <SafeAreaView className="flex-1 justify-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Top: Map Section (40% height) */}
        <View className="h-[40%] w-full">
          <Map
            initialLocation={{
              latitude: ride.origin_latitude,
              longitude: ride.origin_longitude,
            }}
            destinationLocation={{
              latitude: ride.destination_latitude,
              longitude: ride.destination_longitude,
            }}
          />
        </View>

        {/* Bottom: Details Section */}
        <ScrollView className="p-5">
          <Text className="text-2xl font-JakartaBold mb-5">Ride Details</Text>
          <RideCard ride={ride} />

          <View className="mt-5 p-4 bg-general-600 rounded-xl">
            <Text className="text-lg font-JakartaBold mb-2">Payment Info</Text>
            <View className="flex-row justify-between">
              <Text className="text-gray-500">Ride Price</Text>
              <Text className="font-JakartaBold">${ride.fare_price}</Text>
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className="text-gray-500">Status</Text>
              <Text className="capitalize text-green-600">
                {ride.payment_status}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default RideDetails;
