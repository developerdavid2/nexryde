import { Driver, MarkerData } from "@/types/type";

// const directionsAPI = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

export const generateMarkersFromData = ({
  data,
  userLatitude,
  userLongitude,
}: {
  data: Driver[];
  userLatitude: number;
  userLongitude: number;
}): MarkerData[] => {
  return data.map((driver) => {
    const latOffset = (Math.random() - 0.5) * 0.01;
    const lngOffset = (Math.random() - 0.5) * 0.01;

    return {
      latitude: userLatitude + latOffset,
      longitude: userLongitude + lngOffset,
      title: `${driver.first_name} ${driver.last_name}`,
      ...driver,
    };
  });
};

export const calculateRegion = ({
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
}) => {
  if (!userLatitude || !userLongitude) {
    return {
      latitude: 6.5244,
      longitude: 3.3792,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }
  const minLat = Math.min(Number(userLatitude), Number(destinationLatitude));
  const maxLat = Math.max(Number(userLatitude), Number(destinationLatitude));
  const minLng = Math.min(Number(userLongitude), Number(destinationLongitude));
  const maxLng = Math.max(Number(userLongitude), Number(destinationLongitude));

  const latitudeDelta = (maxLat - minLat) * 1.3;
  const longitudeDelta = (maxLng - minLng) * 1.3;

  const latitude = (userLatitude + destinationLatitude!) / 2;
  const longitude = (userLongitude + destinationLongitude!) / 2;

  return {
    latitude,
    longitude,
    latitudeDelta,
    longitudeDelta,
  };
};

export const calculateDriverTimes = async ({
  markers,
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  markers: MarkerData[];
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
}) => {
  if (
    !userLatitude ||
    !userLongitude ||
    !destinationLatitude ||
    !destinationLongitude
  )
    return;

  const ORS_API_KEY = process.env.EXPO_PUBLIC_ORS_API_KEY;

  try {
    const timesPromises = markers.map(async (marker) => {
      // Order is [longitude, latitude]
      const responseToUser = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${marker.longitude},${marker.latitude}&end=${userLongitude},${userLatitude}&radiuses=5000;5000`,
      );
      const dataToUser = await responseToUser.json();

      // SAFETY: Check if features exist. If not, set 0 duration.
      const timeToUser =
        dataToUser?.features?.[0]?.properties?.summary?.duration || 0;

      const responseToDest = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${userLongitude},${userLatitude}&end=${destinationLongitude},${destinationLatitude}&radiuses=5000;5000`,
      );
      const dataToDest = await responseToDest.json();
      const timeToDest =
        dataToDest?.features?.[0]?.properties?.summary?.duration || 0;

      const totalTimeInMinutes = (timeToUser + timeToDest) / 60;
      const price = (totalTimeInMinutes * 0.5).toFixed(2);

      return { ...marker, time: totalTimeInMinutes, price };
    });

    return await Promise.all(timesPromises);
  } catch (error) {
    console.error("Error with OpenRouteService:", error);
    return markers.map((m) => ({ ...m, time: 15, price: "7.50" }));
  }
};

export const getDirections = async (
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
) => {
  const ORS_API_KEY = process.env.EXPO_PUBLIC_ORS_API_KEY;

  if (!ORS_API_KEY) {
    console.error("ORS API Key is missing");
    return [];
  }

  try {
    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${startLng},${startLat}&end=${endLng},${endLat}&radiuses=5000;5000`,
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("ORS API Error:", errorData);
      return [];
    }

    const data = await response.json();

    if (!data?.features || data.features.length === 0) {
      console.warn("No route found between these points");
      return [];
    }

    const points = data.features[0].geometry.coordinates.map(
      (coord: number[]) => ({
        latitude: coord[1],
        longitude: coord[0],
      }),
    );

    return points;
  } catch (error) {
    console.error("Error fetching directions:", error);
    return [];
  }
};
