import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, ActivityIndicator, FlatList, TouchableOpacity, Linking } from "react-native";
import * as Location from "expo-location";

export default function DoctorConsultScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Allow location access to find hospitals.");
        setLoading(false);
        return;
      }
      try {
        const userLocation = await Location.getCurrentPositionAsync({});
        setLocation(userLocation);

        const { latitude, longitude } = userLocation.coords;
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=8000&type=hospital&key=AIzaSyCMrNFVUYbfMsVRWl7J8NbmOaN3qc5v6vo`
        );
        const data = await response.json();

        if (data.results && data.results.length > 0) {
          const enrichedHospitals = await Promise.all(
            data.results.map(async (hospital: any) => {
              const detailsResponse = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${hospital.place_id}&fields=name,vicinity,formatted_phone_number,rating,geometry&key=AIzaSyCMrNFVUYbfMsVRWl7J8NbmOaN3qc5v6vo`
              );
              const detailsData = await detailsResponse.json();
              if (detailsData.result) {
                return {
                  ...detailsData.result,
                  distance: calculateDistance(
                    latitude,
                    longitude,
                    detailsData.result.geometry.location.lat,
                    detailsData.result.geometry.location.lng
                  ),
                };
              }
              return null;
            })
          );

          setHospitals(enrichedHospitals.filter((h) => h !== null));
        } else {
          setHospitals([]);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to fetch hospital details.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Function to calculate distance using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2); // Distance in km
  };

  // Function to handle calling the hospital
  const makeCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : hospitals.length > 0 ? (
        <FlatList
          data={hospitals}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) =>
            item && item.name && item.vicinity ? (
              <View style={styles.card}>
                <Text style={styles.text}>🏥 {item.name}</Text>
                <Text style={styles.text}>📍 {item.vicinity}</Text>
                {item.formatted_phone_number && (
                  <View>
                    <Text style={styles.text}>📞 {item.formatted_phone_number}</Text>
                    <TouchableOpacity
                      style={styles.callButton}
                      onPress={() => makeCall(item.formatted_phone_number)}
                    >
                      <Text style={styles.callButtonText}>Call</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {item.rating && <Text style={styles.text}>⭐ Rating: {item.rating}/5</Text>}
                {item.distance && <Text style={styles.text}>📏 Distance: {item.distance} km</Text>}
              </View>
            ) : null
          }
        />
      ) : (
        <Text style={styles.text}>No hospitals found.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  card: {
    backgroundColor: "#333",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    width: "100%",
    position: "relative",
  },
  text: {
    color: "#fff",
    fontSize: 16,
  },
  callButton: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  callButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
