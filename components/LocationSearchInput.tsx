import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

const PHOTON_API = "https://photon.komoot.io/api/";

type PhotonFeature = {
  geometry: {
    coordinates: [number, number];
  };
  properties: {
    name?: string;
    country?: string;
    city?: string;
    state?: string;
  };
};

interface LocationSearchInputProps {
  handlePress: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;

  icon?: any;
  initialLocation?: string;
  placeholder?: string;
  containerStyle?: string;
  inputStyle?: string;
}

const LocationSearchInput = ({
  handlePress,
  icon,
  initialLocation,
  placeholder = "Where do you want to go?",
  containerStyle = "",
  inputStyle = "",
}: LocationSearchInputProps) => {
  const [query, setQuery] = useState(initialLocation || "");
  const [results, setResults] = useState<PhotonFeature[]>([]);
  const [showResults, setShowResults] = useState(false);

  const searchLocation = async (text: string) => {
    setQuery(text);

    if (!text || text.length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }

    try {
      const res = await fetch(`${PHOTON_API}?q=${text}&limit=5`);
      const data = await res.json();

      setResults(data.features || []);
      setShowResults(true);
    } catch (error) {
      console.log("Location search error:", error);
    }
  };

  const clearInput = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <View className={`relative z-50 ${containerStyle}`}>
      {/* Input */}
      <View className="flex-row items-center rounded-xl px-4 py-3">
        {/* Left icon */}
        {icon && (
          <Image source={icon} className="w-5 h-5 mr-3" resizeMode="contain" />
        )}

        <TextInput
          value={query}
          onChangeText={searchLocation}
          placeholder={placeholder}
          className={`flex-1 text-base ${inputStyle}`}
          placeholderTextColor="gray"
        />

        {/* Clear icon */}
        {query.length > 0 && (
          <TouchableOpacity onPress={clearInput}>
            <Ionicons name="close-circle" size={20} color="gray" />
          </TouchableOpacity>
        )}
      </View>

      {/* Suggestions */}
      {showResults && (
        <FlatList
          data={results}
          keyExtractor={(_, index) => index.toString()}
          className="bg-white rounded-xl mt-2"
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const [longitude, latitude] = item.geometry.coordinates;

            const label =
              item.properties.name ||
              item.properties.city ||
              item.properties.state ||
              "Unknown place";

            const address = `${label}, ${item.properties.country ?? ""}`;

            return (
              <TouchableOpacity
                className="p-4 border-b border-gray-200"
                onPress={() => {
                  setQuery(address);
                  setResults([]);
                  setShowResults(false);

                  handlePress({
                    latitude,
                    longitude,
                    address,
                  });
                }}
              >
                <Text className="text-sm font-semibold">{label}</Text>
                <Text className="text-xs text-gray-500">
                  {item.properties.country}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

export default LocationSearchInput;
