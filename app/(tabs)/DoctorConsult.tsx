import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, ActivityIndicator, FlatList } from "react-native";
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
          setHospitals(data.results);
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
  },
  text: {
    color: "#fff",
    fontSize: 16,
  },
});
