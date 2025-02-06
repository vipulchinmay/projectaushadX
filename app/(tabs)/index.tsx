import { View, StyleSheet, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import ImageViewer from "@/components/ImageViewer";
import Button from "@/components/Button";
import * as ImagePicker from "expo-image-picker";

const PlaceholderImage = require("../../assets/images/background-image.png");

export default function Index() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Denied", "Gallery access is required.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images", // Updated to remove deprecated MediaTypeOptions
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) setSelectedImage(result.assets[0].uri);
  };

  const scanImage = async () => {
    if (!selectedImage) {
      Alert.alert("No Image Selected", "Please choose a photo first.");
      return;
    }
    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = async () => {
        if (!reader.result) {
          Alert.alert("Error", "Failed to read image data.");
          return;
        }

        const base64Image = reader.result.toString().split(",")[1];
        if (!base64Image) {
          Alert.alert("Error", "Invalid image data.");
          return;
        }

        const serverResponse = await fetch("http://192.168.1.8:5000/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64Image }),
        });

        const data = await serverResponse.json();
        if (data.error) {
          Alert.alert("Error", "Failed to extract medicine details.");
          return;
        }

        router.push({
          pathname: "/Schedule",
          params: { ...data },
        });
      };

      reader.onerror = () => {
        Alert.alert("Error", "Error reading image.");
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      Alert.alert("Error", "Something went wrong while scanning.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <ImageViewer imgSource={selectedImage || PlaceholderImage} />
      </View>
      <View style={styles.footerContainer}>
        <Button label="Choose a photo" theme="primary" onPress={pickImage} />
        <Button label="Use this photo" theme="primary" onPress={scanImage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
  },
  imageContainer: {
    flex: 1,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: "center",
  },
});
