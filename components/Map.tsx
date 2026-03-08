import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, Polyline } from "react-native-maps";

import { icons } from "@/constants";
import { useFetch } from "@/lib/fetch";
import {
  calculateDriverTimes,
  calculateRegion,
  generateMarkersFromData,
  getDirections,
} from "@/lib/map";
import { useDriverStore, useLocationStore } from "@/store";
import { Driver, MarkerData } from "@/types/type";

interface MapProps {
  initialLocation?: { latitude: number; longitude: number };
  destinationLocation?: { latitude: number; longitude: number };
}

const Map = ({ initialLocation, destinationLocation }: MapProps) => {
  const mapRef = useRef<MapView>(null);
  const storeLocation = useLocationStore();
  const { selectedDriver, setDrivers } = useDriverStore();

  // Determine if we use Props (History) or Store (Live)
  const userLatitude = initialLocation?.latitude || storeLocation.userLatitude;
  const userLongitude =
    initialLocation?.longitude || storeLocation.userLongitude;
  const destLat =
    destinationLocation?.latitude || storeLocation.destinationLatitude;
  const destLon =
    destinationLocation?.longitude || storeLocation.destinationLongitude;

  const isHistoryView = !!initialLocation;

  const { data: drivers, loading } = useFetch<Driver[]>("/(api)/driver");

  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [routeCoordinates, setRouteCoordinates] = useState<
    { latitude: number; longitude: number }[]
  >([]);

  const region = useMemo(
    () =>
      calculateRegion({
        userLatitude,
        userLongitude,
        destinationLatitude: destLat,
        destinationLongitude: destLon,
      }),
    [userLatitude, userLongitude, destLat, destLon],
  );

  // Effect 1: Generate Markers initially
  useEffect(() => {
    if (!isHistoryView && drivers && userLatitude && userLongitude) {
      const newMarkers = generateMarkersFromData({
        data: drivers,
        userLatitude,
        userLongitude,
      });
      setMarkers(newMarkers);
      setDrivers(newMarkers);
    }
  }, [drivers, userLatitude, userLongitude, isHistoryView, setDrivers]);

  // Effect 2: Calculate Driver Times and Prices
  useEffect(() => {
    if (!isHistoryView && markers.length > 0 && destLat && destLon) {
      calculateDriverTimes({
        markers,
        userLatitude,
        userLongitude,
        destinationLatitude: destLat,
        destinationLongitude: destLon,
      }).then((updatedMarkers) => {
        if (updatedMarkers) {
          setDrivers(updatedMarkers as MarkerData[]);
        }
      });
    }
  }, [
    markers.length,
    destLat,
    destLon,
    isHistoryView,
    markers,
    userLatitude,
    userLongitude,
    setDrivers,
  ]);

  // Effect 3: Route & Animation
  useEffect(() => {
    if (userLatitude && userLongitude && destLat && destLon) {
      getDirections(userLatitude, userLongitude, destLat, destLon).then(
        (coords) => {
          setRouteCoordinates(coords || []);
          mapRef.current?.animateToRegion(region, 1000);
        },
      );
    }
  }, [destLat, destLon, userLatitude, userLongitude, region]);

  if (loading || (!userLatitude && !userLongitude)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={!isHistoryView}
        userInterfaceStyle="light"
      >
        {/* Driver Markers (Live Only) */}
        {!isHistoryView &&
          markers.map((marker) => (
            <Marker
              key={`driver-${marker.id}`}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              image={
                selectedDriver === marker.id
                  ? icons.selectedMarker
                  : icons.marker
              }
            />
          ))}

        {isHistoryView && (
          <Marker
            key="start"
            coordinate={{ latitude: userLatitude!, longitude: userLongitude! }}
            image={icons.marker}
          />
        )}

        {/* Destination Point */}
        {destLat && destLon && (
          <Marker
            key="dest"
            coordinate={{ latitude: destLat, longitude: destLon }}
            image={icons.pin}
          />
        )}

        {/* Route Line */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#0286FF"
            strokeWidth={3}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    borderRadius: 20,
    overflow: "hidden",
  },
  map: { width: "100%", height: "100%" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default Map;
