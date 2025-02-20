const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Enable CORS with specific origins (Optional: Replace "*" with frontend URL)
app.use(cors({ origin: "*" }));
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/profile", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// Define User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: String, required: true },
  gender: { type: String, required: true },
  blood_group: { type: String, required: true },
  medical_conditions: String,
  health_insurance: String,
  date_of_birth: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Save or Update Profile (Uses _id instead of name)
app.post("/profile", async (req, res) => {
  try {
    const { _id, name, age, gender, blood_group, medical_conditions, health_insurance, date_of_birth } = req.body;

    // Basic Validation
    if (!name || !age || !gender || !blood_group || !date_of_birth) {
      return res.status(400).json({ success: false, message: "Missing required fields!" });
    }

    let user;
    if (_id) {
      // Update Existing User
      user = await User.findByIdAndUpdate(
        _id,
        { name, age, gender, blood_group, medical_conditions, health_insurance, date_of_birth },
        { new: true }
      );
    } else {
      // Create New User
      user = new User(req.body);
      await user.save();
    }

    res.json({ success: true, message: "Profile saved successfully!", user });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Fetch Profile by ID
app.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Fetch All Profiles (Optional)
app.get("/profiles", async (req, res) => {
  try {
    const users = await User.find();
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Delete Profile
app.delete("/profile/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, message: "Profile deleted successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

const PORT = 6000;
app.listen(PORT, () => console.log(`🚀 Server running on http://127.0.0.1:${PORT}`));
