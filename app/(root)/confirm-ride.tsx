import CustomButton from "@/components/CustomButton";
import DriverCard from "@/components/DriverCard";
import RideLayout from "@/components/RideLayout";
import { useDriverStore } from "@/store";
import { MarkerData } from "@/types/type";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const ConfirmRide = () => {
  const { drivers, selectedDriver, setSelectedDriver } = useDriverStore();

  const handleSelectDriver = () => {
    if (!selectedDriver) {
      alert("Please select a driver");
      return;
    }

    router.push("/(root)/book-ride");
  };

  return (
    <RideLayout
      title="Choose a Driver"
      snapPoints={["50%"]}
      isScrollable={true}
    >
      <BottomSheetFlatList
        data={drivers}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item: MarkerData) => item.id.toString()}
        renderItem={({ item }: { item: MarkerData }) => {
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

      <View className="my-5">
        <CustomButton title="Select Ride" onPress={handleSelectDriver} />
      </View>
    </RideLayout>
  );
};

export default ConfirmRide;
