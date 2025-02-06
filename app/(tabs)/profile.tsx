import { useState, useRef, useEffect } from "react";
import { 
  Text, 
  View, 
  TextInput, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Animated, 
  KeyboardAvoidingView, 
  Platform, 
  Alert 
} from "react-native";

export default function ProfileScreen() {
  const [userData, setUserData] = useState({
    name: "",
    age: "",
    gender: "",
    bloodGroup: "",
    medicalConditions: "",
    healthInsurance: "",
    dateOfBirth: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  // Animation reference
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert("Profile Saved Successfully!");
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleChange = (key: keyof typeof userData, value: string) => {
    setUserData({ ...userData, [key]: value });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Animated.Text style={[styles.header, { opacity: fadeAnim }]}>
          User Profile
        </Animated.Text>
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          {Object.keys(userData).map((key) => (
            <View style={styles.inputContainer} key={key}>
              <Text style={styles.label}>{key.replace(/([A-Z])/g, ' $1').trim()}</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.disabledInput]}
                placeholder={`Enter ${key}`}
                placeholderTextColor="#888"
                value={userData[key as keyof typeof userData]}
                onChangeText={(text) => handleChange(key as keyof typeof userData, text)}
                editable={isEditing}
              />
            </View>
          ))}
        </Animated.View>

        {isEditing ? (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>Save Profile</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
    paddingVertical: 20,
  },
  header: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#333",
    width: "90%",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    color: "#aaa",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  input: {
    backgroundColor: "#444",
    color: "#fff",
    fontSize: 16,
    padding: 10,
    borderRadius: 6,
    marginTop: 5,
  },
  disabledInput: {
    backgroundColor: "#555",
    color: "#bbb",
  },
  saveButton: {
    backgroundColor: "#00b894",
    width: "90%",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  editButton: {
    backgroundColor: "#ff9f43",
    width: "90%",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  editText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
