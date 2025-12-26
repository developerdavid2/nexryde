import { FlatList, Text, View } from "react-native";
import React from "react";
import RideLayout from "@/components/RideLayout";
import DriverCard from "@/components/DriverCard";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import { useDriverStore } from "@/store";

const ConfirmRide = () => {
  const { drivers, selectedDriver, setSelectedDriver } = useDriverStore();
  // console.log("Drivers from COnfirm Ride", drivers);

  const handleSelectDriver = () => {
    if (!selectedDriver) {
      alert("Please select a driver");
      return;
    }

    router.push("/(root)/book-ride");
  };

  return (
    <RideLayout title="Choose a Driver" snapPoints={["65%", "85%"]}>
      <FlatList
        data={drivers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          return (
            <DriverCard
              item={item}
              selected={selectedDriver!}
              setSelected={() => {
                setSelectedDriver(item.id);
              }}
            />
          );
        }}
        ListEmptyComponent={() => (
          <View className="flex items-center justify-center py-10">
            <Text className="text-base text-gray-500">
              No drivers available
            </Text>
          </View>
        )}
      />

      <View className="mt-5 mb-5">
        <CustomButton title="Select Ride" onPress={handleSelectDriver} />
      </View>
    </RideLayout>
  );
};

export default ConfirmRide;
