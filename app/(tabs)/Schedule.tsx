import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";

export default function Schedule() {
  const { medicine_name, manufacturing_date, expiry_date, description } = useLocalSearchParams();
  const [days, setDays] = useState("");
  const [reminder, setReminder] = useState("");

  const setMedicineReminder = () => {
    Alert.alert("Reminder Set", `Reminder set for ${days} days at ${reminder}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{medicine_name}</Text>
      <Text>MFD: {manufacturing_date}</Text>
      <Text>EXP: {expiry_date}</Text>
      <Text>{description}</Text>

      <TextInput
        style={styles.input}
        placeholder="Days of dosage"
        keyboardType="numeric"
        value={days}
        onChangeText={setDays}
      />

      <TextInput
        style={styles.input}
        placeholder="Reminder Time (HH:MM)"
        value={reminder}
        onChangeText={setReminder}
      />

      <Button title="Set Reminder" onPress={setMedicineReminder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: "bold" },
  input: { borderBottomWidth: 1, marginVertical: 10 },
});
