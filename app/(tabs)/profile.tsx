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
  Easing,
  Switch,
  ActivityIndicator,
  Modal,
  FlatList,
  Dimensions,
} from "react-native";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useLanguage } from "@/components/LanguageContext";
import translations from "@/components/translation";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from 'expo-file-system';
import 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

// Base API URL for all requests
const API_URL = "http://192.168.1.177:5000";

// Interface for recent contacts
interface RecentContact {
  name: string;
  phoneNumber: string;
  relation: string;
  timestamp: number;
}

// Interface for user data
interface UserData {
  name: string;
  age: string;
  gender: string;
  blood_group: string;
  medical_conditions: string;
  date_of_birth: string;
  photo: string | null;
  _id?: string;
}

// Health Analytics Interface
interface HealthAnalytics {
  overall_health_score: number;
  health_status: string;
  key_findings: string[];
  risk_factors: Array<{
    factor: string;
    level: string;
    description: string;
  }>;
  vital_signs_analysis: any;
  dietary_recommendations: any;
  exercise_recommendations: any;
  lifestyle_recommendations: string[];
  health_metrics: {
    cardiovascular_health: number;
    metabolic_health: number;
    immune_system: number;
    mental_health: number;
    nutritional_status: number;
  };
  analysis_date: string;
}

export default function ProfileScreen() {
  const { language } = useLanguage();
  const t = (key: string) => translations[language]?.[key] || key;
  const navigation = useNavigation();

  // User data state
  const [userData, setUserData] = useState<UserData>({
    name: "",
    age: "",
    gender: "",
    blood_group: "",
    medical_conditions: "",
    date_of_birth: "",
    photo: null,
  });

  // UI state variables
  const [isEditing, setIsEditing] = useState(true);
  const [isRegistering, setIsRegistering] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isInsuranceCovered, setIsInsuranceCovered] = useState(false);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [sharePhoneNumber, setSharePhoneNumber] = useState("");
  const [shareRelation, setShareRelation] = useState("");
  const [recentContacts, setRecentContacts] = useState<RecentContact[]>([]);
  const [showRecentContacts, setShowRecentContacts] = useState(false);
  const [loading, setLoading] = useState(false);

  // Health Analytics States
  const [isAnalyticsModalVisible, setIsAnalyticsModalVisible] = useState(false);
  const [healthAnalytics, setHealthAnalytics] = useState<HealthAnalytics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyticsHistory, setAnalyticsHistory] = useState([]);

  // Document states
  const [medicalReports, setMedicalReports] = useState<any[]>([]);
  const [insuranceDocuments, setInsuranceDocuments] = useState<any[]>([]);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Auto-save user data to AsyncStorage
  useEffect(() => {
    const saveUserDataAsync = async () => {
      try {
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
      } catch (error) {
        console.error('Error saving user data:', error);
      }
    };

    if (userData.name || userData.age || userData.gender) {
      saveUserDataAsync();
    }
  }, [userData]);

  // Load user data from AsyncStorage on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedUserData = await AsyncStorage.getItem('userData');
        if (savedUserData) {
          const parsedData = JSON.parse(savedUserData);
          setUserData(parsedData);
          if (parsedData._id) {
            setUserId(parsedData._id);
            setIsRegistering(false);
            setIsEditing(false);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  // Animation and permission setup
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // Request both camera and media library permissions
    (async () => {
      try {
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        const mediaLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (cameraStatus.status !== 'granted') {
          Alert.alert('Camera Permission', 'Camera permission is needed to take photos');
        }
        if (mediaLibraryStatus.status !== 'granted') {
          Alert.alert('Media Library Permission', 'Media library permission is needed to save photos');
        }
      } catch (error) {
        console.error('Error requesting permissions:', error);
      }
    })();

    loadRecentContacts();
  }, []);

  // Load recent contacts from AsyncStorage
  const loadRecentContacts = async () => {
    try {
      const recentContactsData = await AsyncStorage.getItem('recentContacts');
      if (recentContactsData) {
        const parsedContacts = JSON.parse(recentContactsData);
        setRecentContacts(parsedContacts);
      }
    } catch (error) {
      console.error("Error loading recent contacts:", error);
    }
  };

  // Save recent contacts to AsyncStorage
  const saveRecentContact = async (contact: RecentContact) => {
    try {
      const updatedContacts = [...recentContacts];
      const existingIndex = updatedContacts.findIndex(c => c.phoneNumber === contact.phoneNumber);
      
      if (existingIndex !== -1) {
        updatedContacts[existingIndex] = {
          ...contact,
          timestamp: Date.now()
        };
      } else {
        updatedContacts.unshift({
          ...contact,
          timestamp: Date.now()
        });
      }
      
      const limitedContacts = updatedContacts.slice(0, 10);
      
      setRecentContacts(limitedContacts);
      await AsyncStorage.setItem('recentContacts', JSON.stringify(limitedContacts));
    } catch (error) {
      console.error("Error saving recent contact:", error);
    }
  };

  // Convert file to base64
  const convertToBase64 = async (uri: string) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error('Error converting to base64:', error);
      return null;
    }
  };

  // Generate Health Analytics
  const generateHealthAnalytics = async () => {
    if (medicalReports.length === 0) {
      Alert.alert(
        t("No Medical Reports"), 
        t("Please upload medical reports first to generate health analytics.")
      );
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Convert medical reports to base64
      const reportsWithBase64 = await Promise.all(
        medicalReports.map(async (report) => {
          const base64 = await convertToBase64(report.uri);
          return {
            name: report.name,
            base64: base64
          };
        })
      );

      const filteredReports = reportsWithBase64.filter(report => report.base64 !== null);

      if (filteredReports.length === 0) {
        Alert.alert(t("Error"), t("Could not process medical reports. Please try again."));
        setIsAnalyzing(false);
        return;
      }

      const requestData = {
        userData: userData,
        medicalReports: filteredReports
      };

      console.log('Sending health analytics request...');
      const response = await axios.post(`${API_URL}/analyze-medical-reports`, requestData, {
        timeout: 120000, // 2 minutes timeout
      });

      if (response.data.success) {
        setHealthAnalytics(response.data.analytics);
        
        // Save analytics to AsyncStorage
        await AsyncStorage.setItem(
          `healthAnalytics_${userId}`, 
          JSON.stringify(response.data.analytics)
        );
        
        // Save to server for history
        if (userId) {
          await axios.post(`${API_URL}/save-analytics`, {
            user_id: userId,
            analytics: response.data.analytics
          });
        }
        
        setIsAnalyticsModalVisible(true);
        Alert.alert(t("Success"), t("Health analytics generated successfully!"));
      } else {
        Alert.alert(t("Error"), t("Failed to generate health analytics."));
      }
    } catch (error) {
      console.error('Error generating health analytics:', error);
      Alert.alert(
        t("Error"), 
        t("Failed to generate health analytics. Please check your connection and try again.")
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Load Analytics History
  const loadAnalyticsHistory = async () => {
    if (!userId) return;
    
    try {
      const response = await axios.get(`${API_URL}/get-analytics-history/${userId}`);
      setAnalyticsHistory(response.data.analytics_history || []);
    } catch (error) {
      console.error('Error loading analytics history:', error);
    }
  };

  // Render Health Score Circle
  const renderHealthScoreCircle = (score: number) => {
    const radius = 60;
    const strokeWidth = 8;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <View style={styles.healthScoreContainer}>
        <View style={styles.healthScoreCircle}>
          <Text style={styles.healthScoreText}>{score}</Text>
          <Text style={styles.healthScoreLabel}>Health Score</Text>
        </View>
      </View>
    );
  };

  // Render Health Metrics Bar Chart
  const renderHealthMetrics = (metrics: any) => {
    const metricNames = {
      cardiovascular_health: 'Cardio',
      metabolic_health: 'Metabolic',
      immune_system: 'Immune',
      mental_health: 'Mental',
      nutritional_status: 'Nutrition'
    };

    return (
      <View style={styles.metricsContainer}>
        <Text style={styles.sectionTitle}>Health Metrics</Text>
        {Object.entries(metrics).map(([key, value]) => (
          <View key={key} style={styles.metricRow}>
            <Text style={styles.metricLabel}>
              {metricNames[key as keyof typeof metricNames]}
            </Text>
            <View style={styles.metricBarContainer}>
              <View 
                style={[
                  styles.metricBar, 
                  { width: `${(value as number) * 10}%` }
                ]} 
              />
            </View>
            <Text style={styles.metricValue}>{value}/10</Text>
          </View>
        ))}
      </View>
    );
  };

  // Save user profile
  const handleSave = async () => {
    try {
      setLoading(true);
      const requiredFields = ['name', 'age', 'gender', 'blood_group', 'date_of_birth'];
      const missingFields = requiredFields.filter(field => !userData[field as keyof UserData]);
      
      if (missingFields.length > 0) {
        Alert.alert(t("Missing Information"), t(`Please fill in the following fields: ${missingFields.join(', ')}`));
        setLoading(false);
        return;
      }

      if (!userData.photo && isRegistering) {
        Alert.alert(t("Missing Photo"), t("Please take a profile photo"));
        setLoading(false);
        return;
      }

      const formData = new FormData();
      
      Object.keys(userData).forEach(key => {
        if (key === 'photo' && userData.photo) {
          const filename = userData.photo.split('/').pop();
          const match = /\.(\w+)$/.exec(filename || '');
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          
          formData.append('photo', {
            uri: userData.photo,
            type: type,
            name: filename || 'profile.jpg',
          } as any);
        } else if (key !== 'photo') {
          formData.append(key, userData[key as keyof UserData] as string);
        }
      });

      // Add medical reports to form data
      if (medicalReports.length > 0) {
        medicalReports.forEach((report, index) => {
          const filename = report.name || `medical_report_${index}`;
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `application/${match[1]}` : 'application/pdf';
          
          formData.append('medical_reports', {
            uri: report.uri,
            type: type,
            name: filename,
          } as any);
        });
      }

      // Add insurance documents to form data
      if (insuranceDocuments.length > 0) {
        insuranceDocuments.forEach((doc, index) => {
          const filename = doc.name || `insurance_doc_${index}`;
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `application/${match[1]}` : 'application/pdf';
          
          formData.append('insurance_documents', {
            uri: doc.uri,
            type: type,
            name: filename,
          } as any);
        });
      }

      formData.append('is_insurance_covered', isInsuranceCovered.toString());

      let response;
      if (isRegistering) {
        response = await axios.post(`${API_URL}/register`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await axios.put(`${API_URL}/users/${userId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      if (response.data.success) {
        if (isRegistering) {
          setUserId(response.data.user._id);
          setIsRegistering(false);
          
          // Save user data with ID to AsyncStorage
          const updatedUserData = { ...userData, _id: response.data.user._id };
          await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
          setUserData(updatedUserData);
        }
        
        setIsEditing(false);
        Alert.alert(t("Success"), t("Profile saved successfully!"));
      } else {
        Alert.alert(t("Error"), t("Failed to save profile"));
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert(t("Error"), t("Failed to save profile. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  // Take photo - FIXED VERSION
  const takePhoto = async () => {
    try {
      // Check permissions first
      const cameraPermission = await ImagePicker.getCameraPermissionsAsync();
      if (!cameraPermission.granted) {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
          Alert.alert(t("Permission Required"), t("Camera permission is required to take photos"));
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Fixed: Use MediaTypeOptions instead of MediaType
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      console.log('Camera result:', result); // Debug log

      // Fixed: Use 'canceled' instead of 'cancelled'
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log('Image URI:', imageUri); // Debug log
        setUserData(prev => ({ ...prev, photo: imageUri }));
        Alert.alert(t("Success"), t("Photo captured successfully!"));
      } else {
        console.log('Photo capture was canceled or failed');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert(
        t("Error"), 
        t("Failed to take photo. Please check camera permissions and try again.")
      );
    }
  };

  // Alternative: Pick from gallery
  const pickFromGallery = async () => {
    try {
      // Check permissions first
      const mediaLibraryPermission = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (!mediaLibraryPermission.granted) {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
          Alert.alert(t("Permission Required"), t("Media library permission is required to select photos"));
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      console.log('Gallery result:', result); // Debug log

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log('Image URI:', imageUri); // Debug log
        setUserData(prev => ({ ...prev, photo: imageUri }));
        Alert.alert(t("Success"), t("Photo selected successfully!"));
      }
    } catch (error) {
      console.error('Error picking from gallery:', error);
      Alert.alert(t("Error"), t("Failed to select photo from gallery"));
    }
  };

  // Show photo options
  const showPhotoOptions = () => {
    Alert.alert(
      t("Select Photo"),
      t("Choose how you want to add your photo"),
      [
        {
          text: t("Camera"),
          onPress: takePhoto,
        },
        {
          text: t("Gallery"),
          onPress: pickFromGallery,
        },
        {
          text: t("Cancel"),
          style: "cancel",
        },
      ]
    );
  };

  // Pick documents - FIXED VERSION
  const pickMedicalReport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        multiple: true,
      });

      console.log('Document picker result:', result); // Debug log

      // Fixed: Use 'canceled' instead of 'cancelled'
      if (!result.canceled && result.assets) {
        const newReports = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/pdf',
          size: asset.size,
        }));
        setMedicalReports(prev => [...prev, ...newReports]);
        Alert.alert(t("Success"), t("Medical reports added successfully!"));
      }
    } catch (error) {
      console.error('Error picking medical report:', error);
      Alert.alert(t("Error"), t("Failed to pick medical report"));
    }
  };

  const pickInsuranceDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        multiple: true,
      });

      console.log('Insurance document picker result:', result); // Debug log

      // Fixed: Use 'canceled' instead of 'cancelled'
      if (!result.canceled && result.assets) {
        const newDocs = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/pdf',
          size: asset.size,
        }));
        setInsuranceDocuments(prev => [...prev, ...newDocs]);
        Alert.alert(t("Success"), t("Insurance documents added successfully!"));
      }
    } catch (error) {
      console.error('Error picking insurance document:', error);
      Alert.alert(t("Error"), t("Failed to pick insurance document"));
    }
  };

  // Remove document
  const removeMedicalReport = (index: number) => {
    setMedicalReports(prev => prev.filter((_, i) => i !== index));
  };

  const removeInsuranceDocument = (index: number) => {
    setInsuranceDocuments(prev => prev.filter((_, i) => i !== index));
  };

  // Share profile functionality
  const handleShareProfile = async () => {
    if (!sharePhoneNumber.trim()) {
      Alert.alert(t("Error"), t("Please enter a phone number"));
      return;
    }

    if (!shareRelation.trim()) {
      Alert.alert(t("Error"), t("Please enter your relation"));
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/share-profile`, {
        user_id: userId,
        phone_number: sharePhoneNumber,
        relation: shareRelation,
      });

      if (response.data.success) {
        Alert.alert(t("Success"), t("Profile shared successfully!"));
        
        // Save to recent contacts
        await saveRecentContact({
          name: shareRelation,
          phoneNumber: sharePhoneNumber,
          relation: shareRelation,
          timestamp: Date.now()
        });

        setIsShareModalVisible(false);
        setSharePhoneNumber("");
        setShareRelation("");
      } else {
        Alert.alert(t("Error"), t("Failed to share profile"));
      }
    } catch (error) {
      console.error('Error sharing profile:', error);
      Alert.alert(t("Error"), t("Failed to share profile. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  // Select recent contact
  const selectRecentContact = (contact: RecentContact) => {
    setSharePhoneNumber(contact.phoneNumber);
    setShareRelation(contact.relation);
    setShowRecentContacts(false);
  };

  // Button animation
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isRegistering ? t("Create Profile") : t("My Profile")}
            </Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => {
                setIsEditing(!isEditing);
                animateButton();
              }}
            >
              <Ionicons 
                name={isEditing ? "checkmark" : "pencil"} 
                size={24} 
                color="#fff" 
              />
            </TouchableOpacity>
          </View>

          {/* Profile Photo Section */}
          <View style={styles.photoSection}>
            <TouchableOpacity 
              style={styles.photoContainer}
              onPress={isEditing ? showPhotoOptions : undefined} // Changed to show options
              disabled={!isEditing}
            >
              {userData.photo ? (
                <Image source={{ uri: userData.photo }} style={styles.profilePhoto} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera" size={40} color="#ccc" />
                  <Text style={styles.photoPlaceholderText}>
                    {isEditing ? t("Add Photo") : t("No Photo")}
                  </Text>
                </View>
              )}
              {isEditing && (
                <View style={styles.cameraOverlay}>
                  <Ionicons name="camera" size={24} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("Personal Information")}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("Full Name")}</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={userData.name}
                onChangeText={(text) => setUserData(prev => ({ ...prev, name: text }))}
                placeholder={t("Enter your full name")}
                editable={isEditing}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>{t("Age")}</Text>
                <TextInput
                  style={[styles.input, !isEditing && styles.inputDisabled]}
                  value={userData.age}
                  onChangeText={(text) => setUserData(prev => ({ ...prev, age: text }))}
                  placeholder={t("Age")}
                  keyboardType="numeric"
                  editable={isEditing}
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>{t("Gender")}</Text>
                <TextInput
                  style={[styles.input, !isEditing && styles.inputDisabled]}
                  value={userData.gender}
                  onChangeText={(text) => setUserData(prev => ({ ...prev, gender: text }))}
                  placeholder={t("Gender")}
                  editable={isEditing}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>{t("Blood Group")}</Text>
                <TextInput
                  style={[styles.input, !isEditing && styles.inputDisabled]}
                  value={userData.blood_group}
                  onChangeText={(text) => setUserData(prev => ({ ...prev, blood_group: text }))}
                  placeholder={t("Blood Group")}
                  editable={isEditing}
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>{t("Date of Birth")}</Text>
                <TextInput
                  style={[styles.input, !isEditing && styles.inputDisabled]}
                  value={userData.date_of_birth}
                  onChangeText={(text) => setUserData(prev => ({ ...prev, date_of_birth: text }))}
                  placeholder="YYYY-MM-DD"
                  editable={isEditing}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("Medical Conditions")}</Text>
              <TextInput
                style={[styles.input, styles.textArea, !isEditing && styles.inputDisabled]}
                value={userData.medical_conditions}
                onChangeText={(text) => setUserData(prev => ({ ...prev, medical_conditions: text }))}
                placeholder={t("Any existing medical conditions...")}
                multiline
                numberOfLines={3}
                editable={isEditing}
              />
            </View>
          </View>

          {/* Insurance Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("Insurance Information")}</Text>
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>{t("Have Insurance Coverage?")}</Text>
              <Switch
                value={isInsuranceCovered}
                onValueChange={setIsInsuranceCovered}
                disabled={!isEditing}
                trackColor={{ false: '#ccc', true: '#4CAF50' }}
                thumbColor={isInsuranceCovered ? '#fff' : '#f4f3f4'}
              />
            </View>

            {isInsuranceCovered && (
              <View style={styles.documentSection}>
                <Text style={styles.documentTitle}>{t("Insurance Documents")}</Text>
                
                {isEditing && (
                  <TouchableOpacity 
                    style={styles.uploadButton}
                    onPress={pickInsuranceDocument}
                  >
                    <Ionicons name="cloud-upload" size={20} color="#fff" />
                    <Text style={styles.uploadButtonText}>
                      {t("Upload Insurance Documents")}
                    </Text>
                  </TouchableOpacity>
                )}

                {insuranceDocuments.map((doc, index) => (
                  <View key={index} style={styles.documentItem}>
                    <Ionicons name="document" size={20} color="#4CAF50" />
                    <Text style={styles.documentName} numberOfLines={1}>
                      {doc.name}
                    </Text>
                    {isEditing && (
                      <TouchableOpacity 
                        onPress={() => removeInsuranceDocument(index)}
                        style={styles.removeButton}
                      >
                        <Ionicons name="trash" size={16} color="#f44336" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Medical Reports Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("Medical Reports")}</Text>
            
            {isEditing && (
              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={pickMedicalReport}
              >
                <Ionicons name="cloud-upload" size={20} color="#fff" />
                <Text style={styles.uploadButtonText}>
                  {t("Upload Medical Reports")}
                </Text>
              </TouchableOpacity>
            )}

            {medicalReports.map((report, index) => (
              <View key={index} style={styles.documentItem}>
                <Ionicons name="document-text" size={20} color="#2196F3" />
                <Text style={styles.documentName} numberOfLines={1}>
                  {report.name}
                </Text>
                {isEditing && (
                  <TouchableOpacity 
                    onPress={() => removeMedicalReport(index)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="trash" size={16} color="#f44336" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* Health Analytics Section */}
          {!isRegistering && medicalReports.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("Health Analytics")}</Text>
              
              <TouchableOpacity 
                style={[styles.analyticsButton, isAnalyzing && styles.buttonDisabled]}
                onPress={generateHealthAnalytics}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Ionicons name="analytics" size={20} color="#fff" />
                )}
                <Text style={styles.analyticsButtonText}>
                  {isAnalyzing ? t("Analyzing...") : t("Generate Health Analytics")}
                </Text>
              </TouchableOpacity>

              {healthAnalytics && (
                <TouchableOpacity 
                  style={styles.viewAnalyticsButton}
                  onPress={() => setIsAnalyticsModalVisible(true)}
                >
                  <Ionicons name="bar-chart" size={20} color="#4CAF50" />
                  <Text style={styles.viewAnalyticsButtonText}>
                    {t("View Latest Analytics")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {isEditing && (
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity 
                  style={[styles.saveButton, loading && styles.buttonDisabled]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Ionicons name="save" size={20} color="#fff" />
                  )}
                  <Text style={styles.saveButtonText}>
                    {loading ? t("Saving...") : (isRegistering ? t("Register") : t("Save Changes"))}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {!isRegistering && !isEditing && (
              <TouchableOpacity 
                style={styles.shareButton}
                onPress={() => setIsShareModalVisible(true)}
              >
                <Ionicons name="share" size={20} color="#fff" />
                <Text style={styles.shareButtonText}>{t("Share Profile")}</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </Animated.View>

      {/* Share Profile Modal */}
      <Modal
        visible={isShareModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsShareModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("Share Profile")}</Text>
              <TouchableOpacity 
                onPress={() => setIsShareModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("Phone Number")}</Text>
                <TextInput
                  style={styles.input}
                  value={sharePhoneNumber}
                  onChangeText={setSharePhoneNumber}
                  placeholder={t("Enter phone number")}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("Relation")}</Text>
                <TextInput
                  style={styles.input}
                  value={shareRelation}
                  onChangeText={setShareRelation}
                  placeholder={t("e.g., Doctor, Family Member")}
                />
              </View>

              {/* Recent Contacts Toggle */}
              <TouchableOpacity 
                style={styles.recentContactsToggle}
                onPress={() => setShowRecentContacts(!showRecentContacts)}
              >
                <Text style={styles.recentContactsText}>
                  {t("Recent Contacts")}
                </Text>
                <Ionicons 
                  name={showRecentContacts ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>

              {/* Recent Contacts List */}
              {showRecentContacts && recentContacts.length > 0 && (
                <FlatList
                  data={recentContacts}
                  keyExtractor={(item, index) => index.toString()}
                  style={styles.recentContactsList}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={styles.recentContactItem}
                      onPress={() => selectRecentContact(item)}
                    >
                      <View style={styles.contactInfo}>
                        <Text style={styles.contactName}>{item.relation}</Text>
                        <Text style={styles.contactPhone}>{item.phoneNumber}</Text>
                      </View>
                      <Ionicons name="arrow-forward" size={16} color="#666" />
                    </TouchableOpacity>
                  )}
                />
              )}

              <TouchableOpacity 
                style={[styles.shareConfirmButton, loading && styles.buttonDisabled]}
                onPress={handleShareProfile}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Ionicons name="send" size={20} color="#fff" />
                )}
                <Text style={styles.shareConfirmButtonText}>
                  {loading ? t("Sharing...") : t("Share")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Health Analytics Modal */}
      <Modal
        visible={isAnalyticsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAnalyticsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.analyticsModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("Health Analytics")}</Text>
              <TouchableOpacity 
                onPress={() => setIsAnalyticsModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {healthAnalytics && (
              <ScrollView style={styles.analyticsScrollView}>
                {/* Health Score */}
                <View style={styles.analyticsSection}>
                  {renderHealthScoreCircle(healthAnalytics.overall_health_score)}
                  <Text style={styles.healthStatusText}>
                    {healthAnalytics.health_status}
                  </Text>
                </View>

                {/* Health Metrics */}
                {healthAnalytics.health_metrics && (
                  <View style={styles.analyticsSection}>
                    {renderHealthMetrics(healthAnalytics.health_metrics)}
                  </View>
                )}

                {/* Key Findings */}
                {healthAnalytics.key_findings && healthAnalytics.key_findings.length > 0 && (
                  <View style={styles.analyticsSection}>
                    <Text style={styles.sectionTitle}>{t("Key Findings")}</Text>
                    {healthAnalytics.key_findings.map((finding, index) => (
                      <View key={index} style={styles.findingItem}>
                        <Ionicons name="information-circle" size={16} color="#2196F3" />
                        <Text style={styles.findingText}>{finding}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Risk Factors */}
                {healthAnalytics.risk_factors && healthAnalytics.risk_factors.length > 0 && (
                  <View style={styles.analyticsSection}>
                    <Text style={styles.sectionTitle}>{t("Risk Factors")}</Text>
                    {healthAnalytics.risk_factors.map((risk, index) => (
                      <View key={index} style={styles.riskItem}>
                        <View style={[
                          styles.riskLevel, 
                          { backgroundColor: risk.level === 'High' ? '#f44336' : 
                                           risk.level === 'Medium' ? '#ff9800' : '#4CAF50' }
                        ]}>
                          <Text style={styles.riskLevelText}>{risk.level}</Text>
                        </View>
                        <View style={styles.riskContent}>
                          <Text style={styles.riskFactor}>{risk.factor}</Text>
                          <Text style={styles.riskDescription}>{risk.description}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Recommendations */}
                {healthAnalytics.lifestyle_recommendations && healthAnalytics.lifestyle_recommendations.length > 0 && (
                  <View style={styles.analyticsSection}>
                    <Text style={styles.sectionTitle}>{t("Lifestyle Recommendations")}</Text>
                    {healthAnalytics.lifestyle_recommendations.map((recommendation, index) => (
                      <View key={index} style={styles.recommendationItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                        <Text style={styles.recommendationText}>{recommendation}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Analysis Date */}
                <View style={styles.analyticsFooter}>
                  <Text style={styles.analysisDate}>
                    {t("Analysis generated on")}: {new Date(healthAnalytics.analysis_date).toLocaleDateString()}
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2196F3',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  editButton: {
    padding: 8,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    position: 'relative',
  },
  profilePhoto: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  photoPlaceholderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2196F3',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputDisabled: {
    backgroundColor: '#f9f9f9',
    color: '#666',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  documentSection: {
    marginTop: 15,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    justifyContent: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  documentName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  removeButton: {
    padding: 8,
  },
  analyticsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: 'center',
  },
  analyticsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  viewAnalyticsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
    justifyContent: 'center',
  },
  viewAnalyticsButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  actionButtons: {
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
    justifyContent: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9C27B0',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
    justifyContent: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: width * 0.9,
    maxHeight: '80%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  analyticsModalContent: {
    maxHeight: '90%',
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalBody: {
    padding: 20,
  },
  recentContactsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 10,
  },
  recentContactsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  recentContactsList: {
    maxHeight: 150,
    marginVertical: 10,
  },
  recentContactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 8,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  shareConfirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9C27B0',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
    justifyContent: 'center',
    marginTop: 20,
  },
  shareConfirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  analyticsScrollView: {
    flex: 1,
    padding: 20,
  },
  analyticsSection: {
    marginBottom: 25,
  },
  healthScoreContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  healthScoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  healthScoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  healthScoreLabel: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
  },
  healthStatusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 15,
  },
  metricsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 80,
  },
  metricBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  metricBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 35,
    textAlign: 'right',
  },
  findingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  findingText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    lineHeight: 20,
  },
  riskItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  riskLevel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginRight: 12,
  },
  riskLevelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  riskContent: {
    flex: 1,
  },
  riskFactor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  riskDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f1f8e9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    lineHeight: 20,
  },
  analyticsFooter: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 20,
  },
  analysisDate: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});