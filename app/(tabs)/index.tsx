import { View, StyleSheet, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router"; // Import router for navigation
import ImageViewer from "@/components/ImageViewer";
import Button from "@/components/Button";
import * as ImagePicker from "expo-image-picker";

const PlaceholderImage = require("../../assets/images/background-image.png");

export default function Index() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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

  // Function to scan the selected image and navigate to Schedule page
  const scanImage = async () => {
    if (!selectedImage) {
      Alert.alert("No Image Selected", "Please choose a photo first.");
      return;
    }
  
    try {
      // Convert Image to Base64
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      reader.onloadend = async () => {
        const base64Image = reader.result.split(",")[1]; // Get only Base64 part
  
        const serverResponse = await fetch("http://192.168.1.8:5000/scan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: base64Image }),
        });
  
        const data = await serverResponse.json();
  
        if (data.error) {
          Alert.alert("Error", "Failed to extract medicine details.");
          return;
        }
  
        router.push({
          pathname: "/Schedule",
          params: {
            medicine_name: data.medicine_name,
            manufacturing_date: data.manufacturing_date,
            expiry_date: data.expiry_date,
            description: data.description,
          },
        });
      };
    } catch (error) {
      console.error("Error scanning image:", error);
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
