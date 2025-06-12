# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

# AushadX

AushadX is a cross-platform mobile app built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev), featuring AI-powered chat, face recognition, camera integration, and BLE device support. The project also includes a Python backend for advanced processing.

## Features

- 📱 **Expo + React Native**: Universal app for Android, iOS, and web.
- 🤖 **AI Chat**: Chat interface powered by OpenAI (see `app/(tabs)/AIChat.tsx`).
- 🖼️ **Image Capture & Viewer**: Capture and view images with the device camera.
- 🧑‍💻 **Face Recognition**: Uses [face-api.js](models/face-api.js-master/) for face detection and recognition.
- 🌐 **Multilingual Support**: Switch languages using the built-in context.
- 🔗 **BLE Integration**: Communicate with Bluetooth Low Energy devices.
- 🐍 **Python Backend**: Server-side processing with Flask (see `server.py`).
- 📤 **File Uploads**: Upload and process images.
- 🎨 **Lottie Animations**: Smooth UI animations with Lottie.

## Project Structure

```
app/                # Main React Native app (screens, navigation, components)
assets/             # Images, fonts, animations
bot/                # Python backend (virtualenv, scripts, models)
components/         # Reusable React Native components
models/             # ML models (face-api.js, etc.)
uploads/            # Uploaded images
server.js           # Node.js/Express server
server.py           # Python/Flask server
```

## Get Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the Expo app**

   ```bash
   npx expo start
   ```

3. **Start the Python backend** (optional, for advanced features)

   ```bash
   cd bot
   source Scripts/activate  # or `source bin/activate` on Unix
   python ../server.py
   ```

## Scripts

- `npm run start` – Start Expo app
- `npm run dev` – Start Node.js backend (`server.js`)
- `npm run reset-project` – Reset app directory to blank state

## Configuration

- **OpenAI API Key**: Set in [`app.json`](app.json) under `extra.openaiApiKey`.
- **BLE Permissions**: Configured in [`app.json`](app.json) for Android.

## Learn More

- [Expo documentation](https://docs.expo.dev/)
- [React Native docs](https://reactnative.dev/)
- [face-api.js](https://github.com/justadudewhohacks/face-api.js)
- [OpenAI API](https://platform.openai.com/docs/)

## Community

- [Expo on GitHub](https://github.com/expo/expo)
- [Discord community](https://chat.expo.dev)
