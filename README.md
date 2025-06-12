# 🌿 AushadX – The Future of Smart Healthcare is Here

> **Your Medicine, Your Health, Your Hands.**
>
> AushadX is a cross-platform mobile application built with [Expo](https://expo.dev) + [React Native](https://reactnative.dev), engineered to redefine how people interact with medicines, healthcare data, and diagnostics — all from their smartphone.

---

## 🚀 What is AushadX?

AushadX is a **health-tech mobile app** that:

* Scans medicines using your phone camera or Raspberry Pi module
* Detects text, extracts dosage/expiry info via OCR
* Finds better alternatives for medicine
* Sends smart reminders to take medicine
* Shows hospitals and pharmacies near you
* Stores all your health records
* Lets you contact doctors or family instantly via SOS
* Supports **Bluetooth devices**, **face recognition**, and **AI chat**
* Works in **multiple languages**

💡 AushadX is designed for real-world use, especially in places where medical literacy is low or access to professional help is slow. It's like your **digital health assistant**, always with you.

---

## 📱 Features Breakdown

### 📸 Intelligent Medicine Scanner

* Uses camera (mobile or Raspberry Pi) to scan medicine strips.
* Guides the user with live feedback: “Move Left”, “Hold Steady”, “Zoom In”.
* OCR extracts: **Medicine name**, **Expiry date**, **Dosage**, **Batch no.**
* Suggests **cheaper & better alternatives**.

### ⏰ Smart Medicine Reminders

* Set reminders based on scanned info.
* Daily, weekly, or one-time notifications.
* Customize with voice alerts or vibration.

### 🏥 Nearby Healthcare Discovery

* Uses geolocation to find hospitals, clinics, and pharmacies within **8 km radius**.
* Google Maps integration for directions.
* Optional emergency contact for hospitals.

### 🧬 Personal Health Vault

* Store:

  * Blood reports 🦨
  * Health records 📄
  * Prescription history 💊
  * Insurance papers 🦾
* All encrypted, synced, and easily shareable via **SMS or email**.

### ❗ SOS Emergency Mode

* One-tap emergency action button.
* Sends current location, medical condition, and contact info to pre-listed numbers.

### 💬 AI-Powered Health Chat

* Ask health-related questions.
* Integrated OpenAI-powered assistant to explain medicines, symptoms, diet suggestions, and more.
* Live in \[`app/(tabs)/AIChat.tsx`].

### 🔎 Face Recognition

* Secure login via **face-api.js**
* Detect and match faces for personal account access.

### 🌐 Multilingual Interface

* Language context with easy toggling.
* Supports major Indian languages and English.

### 🔗 BLE Device Integration

* Communicate with health monitoring devices (heart rate monitors, BP cuffs).
* Scan, connect, and sync readings automatically.

### 🎨 Beautiful UI & Animations

* Built with **Lottie animations** for a fluid, delightful user experience.
* Clean design, quick navigation, and minimal clutter.

---

## 🏠 Project Structure

```bash
AushadX/
├── app/                # 📱 Main React Native app – screens, navigation, routes
├── assets/             # 🎨 Images, fonts, Lottie animations
├── components/         # 🔁 Reusable UI components
├── models/             # 🧠 ML models (face recognition, OCR, etc.)
├── bot/                # 🧐 Python backend (Flask) for image processing, NLP, etc.
├── uploads/            # 📂 Uploaded images and scanned files
├── server.js           # 🌐 Optional Node.js server
├── server.py           # 🐍 Python Flask server for advanced features
```

---

## ⚙️ How to Get Started

### 1️⃣ Install dependencies

```bash
npm install
```

### 2️⃣ Start the Expo development server

```bash
npx expo start
```

You’ll be able to launch the app in:

* 📲 [Expo Go](https://expo.dev/go)
* 🤖 Android Emulator
* 🍏 iOS Simulator
* 🛠️ Development Build (for debugging native code)

### 3️⃣ Start the Python backend (optional)

```bash
cd bot
source Scripts/activate        # Windows
# or
source bin/activate            # macOS/Linux
python ../server.py
```

---

## 📊 Scripts

| Command                 | Description                       |
| ----------------------- | --------------------------------- |
| `npm start`             | Start the Expo app                |
| `npm run dev`           | Start the Node.js backend server  |
| `npm run reset-project` | Move starter code and begin fresh |

---

## 🔐 Configuration

* **OpenAI API Key**: Add your key to `app.json` under the `extra` field:

```json
{
  "extra": {
    "openaiApiKey": "YOUR_API_KEY_HERE"
  }
}
```

* **BLE Permissions**:

  * Already pre-configured in `app.json` for Android.
  * Ensure proper runtime permission requests for iOS.

---

## 📖 Learn More

* 📖 [Expo Docs](https://docs.expo.dev/)
* ⚛️ [React Native](https://reactnative.dev/)
* 🧠 [OpenAI API](https://platform.openai.com/docs/)
* 🧽 [face-api.js](https://github.com/justadudewhohacks/face-api.js)
* 🔎 [Tesseract OCR](https://github.com/tesseract-ocr/tesseract)
* 💙 [Lottie](https://lottiefiles.com/)

---

## 👥 Community & Contributions

Come help us shape the future of medicine tech! 🌍

* ⭐ [Star this repo](https://github.com/your-repo-link)
* 🛠️ Submit a pull request or issue
* 💬 Join the [Expo Discord](https://chat.expo.dev)

---

## 🧠 Use Case: Why AushadX Matters

In India and other developing countries:

* 📦 Medicines often come without clear instructions.
* 💬 People struggle with English-based labels.
* 📱 Finding a doctor is not always immediate.
* 🗒️ Paper prescriptions get lost easily.

AushadX solves these problems by becoming a **pocket-sized health companion**. It empowers people to take control of their own treatment, track health better, and connect to care faster.

> **AushadX isn’t just an app. It’s a movement.**

---

## 🧪 What's Next?

* Integrate voice-controlled assistant 🎧
* Auto-detect symptoms using camera 🦢
* Capsule-based gamification 🏆
* Government health scheme integration 🏛️
* Offline-first support for rural areas 🚁

...existing code...

---

## 👤 Contributors

Thanks to these wonderful people for their contributions:

| Name             | GitHub Profile                | Contribution         |
|------------------|------------------------------|----------------------|
| Vipul Chinmay    | [@vipulchinmay](https://github.com/vipulchinmay) | Creator, Maintainer  |
| Shailesh Pentuker| [@spentuker](https://github.com/spentuker)       | Creator, Contributor |
| Srujana Goje     | [@Srujana1008](https://github.com/Srujana1008)   | Creator, Contributor |
| Vamshi Aelugoi   | [@vamshi0129](https://github.com/vamshi0129)     | Creator, Contributor |


> Want to contribute? Open a pull request or issue!

---

## ✨ Author

Built with heart ❤️ by **Vipul Chinmay**

> A Gen Z builder on a mission to democratize healthcare, one scan at a time.

---