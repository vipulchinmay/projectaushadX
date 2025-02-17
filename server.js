const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/profile", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Define User Schema
const userSchema = new mongoose.Schema({
  name: String,
  age: String,
  gender: String,
  blood_group: String,
  medical_conditions: String,
  health_insurance: String,
  date_of_birth: String,
});

const User = mongoose.model("User", userSchema);

// API Routes

// Save or Update Profile
app.post("/profile", async (req, res) => {
  try {
    const { name, age, gender, blood_group, medical_conditions, health_insurance, date_of_birth } = req.body;
    let user = await User.findOne({ name });

    if (user) {
      user.age = age;
      user.gender = gender;
      user.blood_group = blood_group;
      user.medical_conditions = medical_conditions;
      user.health_insurance = health_insurance;
      user.date_of_birth = date_of_birth;
    } else {
      user = new User(req.body);
    }

    await user.save();
    res.json({ success: true, message: "Profile saved successfully!", user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Fetch Profile
app.get("/profile/:name", async (req, res) => {
  try {
    const user = await User.findOne({ name: req.params.name });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const PORT = 6000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
