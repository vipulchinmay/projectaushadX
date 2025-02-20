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
  Alert,
  Image,
} from "react-native";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker"; // Import Document Picker
import { useLanguage } from "@/components/LanguageContext";
import translations from "@/components/translation";

const API_URL = "http://127.0.0.1:6000/profile";

export default function ProfileScreen() {
  const { language } = useLanguage();
  const t = (key: string) => translations[language]?.[key] || key;

  const [userData, setUserData] = useState({
    name: "",
    age: "",
    gender: "",
    blood_group: "",
    medical_conditions: "",
    health_insurance: "",
    date_of_birth: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // State for document uploads
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/${userData.name}`);
      if (response.data.success) {
        setUserData(response.data.user);
      }
    } catch (error) {
      if (!error.response) {
        // Network error
        console.log("Network error:", error.message);
      } else {
        // The server responded with a status code outside of the 2xx range
        console.log("Error response:", error.response.data);
        console.log("Status code:", error.response.status);
      }
    }
  };
  

  const handleSave = async () => {
    try {
      await axios.post(API_URL, userData);
      setIsEditing(false);
      Alert.alert(t("Profile Saved Successfully!")); // Alert on save
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleChange = (key: keyof typeof userData, value: string) => {
    setUserData({ ...userData, [key]: value });
  };

  // Animate button scale on press
  const animateButtonPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const animateButtonPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

   // Function to handle document uploads
   const handleDocumentUpload = async () => {
     try {
       const result = await DocumentPicker.getDocumentAsync({
         type: "*/*", // Allow all file types
         copyToCacheDirectory: false, // Don't copy to cache
       });

       if (result.type === "success") {
         setDocuments([...documents, result]); // Add selected document to state
         Alert.alert("Document Uploaded", result.name);
       }
     } catch (error) {
       console.error("Error picking document:", error);
     }
   };

   return (
     <KeyboardAvoidingView
       behavior={Platform.OS === "ios" ? "padding" : "height"}
       style={{ flex: 1 }}
     >
       <ScrollView contentContainerStyle={styles.container}>
         <Animated.Text style={[styles.header, { opacity: fadeAnim }]}>
           {t("User Profile")}
         </Animated.Text>
         
         {/* Profile Icon */}
         <Image source={require('@/assets/images/profile-icon.gif')} style={styles.profileIcon} />

         <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
           {Object.keys(userData).map((key) => (
             <View style={styles.inputContainer} key={key}>
               <Text style={styles.label}>{t(key.replace(/([A-Z])/g, " $1").trim())}</Text>
               <TextInput
                 style={[styles.input, !isEditing && styles.disabledInput]}
                 placeholder={t(`Enter ${key}`)}
                 placeholderTextColor="#888"
                 value={userData[key as keyof typeof userData]}
                 onChangeText={(text) => handleChange(key as keyof typeof userData, text)}
                 editable={isEditing}
               />
             </View>
           ))}
         </Animated.View>

         <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
           {isEditing ? (
             <TouchableOpacity
               style={styles.saveButton}
               onPress={handleSave}
               onPressIn={animateButtonPressIn}
               onPressOut={animateButtonPressOut}
             >
               <Text style={styles.saveText}>{t("Save Profile")}</Text>
             </TouchableOpacity>
           ) : (
             <TouchableOpacity
               style={styles.editButton}
               onPress={handleEdit}
               onPressIn={animateButtonPressIn}
               onPressOut={animateButtonPressOut}
             >
               <Text style={styles.editText}>{t("Edit Profile")}</Text>
             </TouchableOpacity>
           )}
         </Animated.View>

         {/* Document Upload Section */}
         <TouchableOpacity style={styles.uploadButton} onPress={handleDocumentUpload}>
           <Text style={styles.uploadText}>{t("Upload Reports/Insurance Documents")}</Text>
         </TouchableOpacity>

         {/* Display uploaded documents */}
         {documents.length > 0 && (
           <View style={styles.documentsContainer}>
             {documents.map((doc, index) => (
               <Text key={index} style={styles.documentName}>{doc.name}</Text>
             ))}
           </View>
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
   textAlign:'center',
 },
 profileIcon:{
   width :80 ,
   height :80 ,
   borderRadius :40 ,
   marginBottom :20 ,
 },
 card:{
   backgroundColor:"#333",
   width:"90%",
   borderRadius :10 ,
   padding :20 ,
   shadowColor:"#000",
   shadowOffset:{ width :0 , height :2 },
   shadowOpacity :0.2 ,
   shadowRadius :4 ,
 },
 inputContainer:{
   marginBottom :12 ,
 },
 label:{
   color:"#aaa",
   fontSize :16 ,
   fontWeight :"600",
   textTransform :"capitalize",
 },
 input:{
   backgroundColor:"#444",
   color:"#fff",
   fontSize :16 ,
   padding :10 ,
   borderRadius :6 ,
   marginTop :5 ,
 },
 disabledInput:{
   backgroundColor:"#555",
   color:"#bbb",
 },
 saveButton:{
   backgroundColor:"#00b894",
   width :"90%",
   padding :12 ,
   borderRadius :10 ,
   alignItems :"center",
   marginTop :20 ,
 },
 saveText:{
   color:"#fff",
   fontSize :18 ,
   fontWeight :"bold",
 },
 editButton:{
   backgroundColor:"#ff9f43",
   width :"90%",
   padding :12 ,
   borderRadius :10 ,
   alignItems :"center",
 },
 editText:{
   color:"#fff",
   fontSize :18 ,
   fontWeight :"bold",
 },
 uploadButton:{
   backgroundColor:"#4CAF50",
   width :"90%",
   padding :12 ,
   borderRadius :10 ,
   alignItems :"center",
   marginTop :20 ,
 },
 uploadText:{
     color:"#fff",
     fontSize :18 ,
     fontWeight :"bold",
 },
 documentsContainer:{
     marginTop :20 ,
     width :"90%",
 },
 documentName:{
     color:"#fff",
     fontSize :16 ,
     marginBottom :5 ,
 },
});
