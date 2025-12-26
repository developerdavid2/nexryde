import React, { useEffect, useState } from "react";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { calculateRegion, generateMarkersFromData } from "@/lib/map";
import { useDriverStore, useLocationStore } from "@/store";
import { Driver, MarkerData } from "@/types/type";
import { icons } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { ActivityIndicator, Platform, Text, View } from "react-native";

const Map = () => {
  const {
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();

  const { data: drivers, loading, error } = useFetch<Driver[]>("/(api)/driver");
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const { selectedDriver, setDrivers } = useDriverStore();

  useEffect(() => {
    if (!userLatitude || !userLongitude || !drivers) {
      return;
    }

    try {
      const newMarkers = generateMarkersFromData({
        data: drivers as Driver[],
        userLatitude,
        userLongitude,
      });
      setMarkers(newMarkers);

      setDrivers(newMarkers!);
    } catch (err) {
      console.error("Error generating markers:", err);
    }
  }, [drivers, setDrivers, userLatitude, userLongitude]);

  // useEffect(() => {
  //   if (
  //     markers.length > 0 &&
  //     destinationLatitude !== undefined &&
  //     destinationLongitude !== undefined
  //   ) {
  //     calculateDriverTimes({
  //       markers,
  //       userLatitude,
  //       userLongitude,
  //       destinationLatitude,
  //       destinationLongitude,
  //     })
  //       .then((drivers) => {
  //         setDrivers(drivers as MarkerData[]);
  //       })
  //       .catch((err) => {
  //         console.error("Error calculating driver times:", err);
  //       });
  //   }
  // }, [
  //   markers,
  //   destinationLatitude,
  //   destinationLongitude,
  //   userLatitude,
  //   userLongitude,
  //   setDrivers,
  // ]);

  const region = calculateRegion({
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  });

  // Show loading state
  if (loading || (!userLatitude && !userLongitude)) {
    return (
      <View className="flex justify-center items-center w-full h-full">
        <ActivityIndicator size="large" color="#000" />
        <Text className="mt-4">Loading map...</Text>
      </View>
    );
  }

  // Show error state with more details
  if (error) {
    return (
      <View className="flex justify-center items-center w-full h-full p-4">
        <Text className="text-red-500 font-bold mb-2">Error Loading Map</Text>
        <Text className="text-center">{error}</Text>
        <Text className="text-xs text-gray-500 mt-4">
          Check console for details
        </Text>
      </View>
    );
  }

  // MapView only works on native platforms
  if (Platform.OS === "web") {
    return (
      <View className="flex justify-center items-center w-full h-full">
        <Text>Map view is only available on mobile devices</Text>
      </View>
    );
  }

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      className="w-full h-full rounded-2xl"
      style={{ width: "100%", height: "100%" }}
      mapType="standard"
      showsPointsOfInterest={false}
      initialRegion={region}
      showsUserLocation={true}
      userInterfaceStyle="light"
      customMapStyle={[]}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          title={marker.title}
          image={
            selectedDriver === marker.id ? icons.selectedMarker : icons.marker
          }
        />
      ))}
    </MapView>
  );
};

export default Map;
