import { View, StyleSheet, Alert, ActivityIndicator, Text } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import ImageViewer from "@/components/ImageViewer";
import Button from "@/components/Button";  // Importing the Button component
import * as ImagePicker from "expo-image-picker";

const PlaceholderImage = require("../../assets/images/background-image.png");

export default function Index() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const router = useRouter();

  // Function to pick an image from the gallery
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Denied", "You need to grant gallery access to select a photo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // Function to abort the image processing
  const abortProcessing = () => {
    if (abortController) {
      abortController.abort();
      setLoading(false);
      setAbortController(null);
      Alert.alert("Processing Aborted", "Image processing has been stopped.");
    }
  };

  // Function to scan the selected image and navigate to Schedule page
  const scanImage = async () => {
    if (!selectedImage) {
      Alert.alert("No Image Selected", "Please choose a photo first.");
      return;
    }

    const controller = new AbortController();
    setAbortController(controller);
    setLoading(true);

    try {
      // Convert Image to Base64
      const response = await fetch(selectedImage, { signal: controller.signal });
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);

      reader.onloadend = async () => {
        const base64Image = reader.result.split(",")[1];

        const serverResponse = await fetch("http://172.20.10.2:5000/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64Image }),
          signal: controller.signal,
        });

        const data = await serverResponse.json();
        setLoading(false);

        if (data.error) {
          Alert.alert("Error", "Failed to extract medicine details.");
          return;
        }

        router.push({
          pathname: "/Schedule",
          params: { raw_response: data.raw_response },
        });
      };
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Image processing was aborted.");
      } else {
        console.error("Error scanning image:", error);
        Alert.alert("Error", "Something went wrong while scanning.");
      }
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <ImageViewer imgSource={selectedImage || PlaceholderImage} />
      </View>

      <View style={styles.footerContainer}>
        <Button
          label="Choose a photo"
          theme="primary"
          onPress={pickImage}
          disabled={loading}
        />
        <Button
          label={loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="white" />
              <Text style={styles.loadingText}>Processing...</Text>
            </View>
          ) : (
            "Use this photo"
          )}
          onPress={scanImage}
          disabled={loading || !selectedImage}
        />
        {loading && (
          <Button
            label="Abort"
            onPress={abortProcessing}
            style={[styles.abortButton, styles.smallButton]}  // Added small button style
            disabled={!loading}  // Disabled if not in loading state
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
    paddingBottom: 20,
  },
  imageContainer: {
    flex: 1,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: "center",
    marginBottom: 20,
  },
  loadingText: {
    color: "white",
    marginLeft: 10,
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  smallButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  abortButton: {
    borderColor: "red",
    borderWidth: 2,
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
});
