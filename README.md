# Hobyay

Turn "I want to learn X" into a focused, trackable curriculum of 5–8 techniques, complete with AI-generated structures and lazy-loaded YouTube tutorial resources.

## Features

- **AI Curriculum Generator**: Get a bespoke, dependency-ordered checklist of 5–8 techniques calibrated to your target level (_Casual_, _Hobbyist_, _Serious_).
- **Haptic Swipe Tracking**: Swipe right to master, swipe left to skip. Fully animated progress rings and satisfying haptic transitions.
- **Lazy YouTube Resources**: The detail view for each technique pulls high-quality video tutorials on-demand, caching them locally to protect API quotas.
- **Offline Resilience**: App stores all generated curricula and resource caches locally using segmented AsyncStorage keys for instant, offline load times.

## Tech Stack

| Component                | Technology                                  | Description                                                         |
| ------------------------ | ------------------------------------------- | ------------------------------------------------------------------- |
| **App Shell**            | Expo SDK 54 (React Native 0.81, React 19.1) | Clean typescript codebase running Expo Router for modal stacks      |
| **Animation & Gestures** | Reanimated v4 + Worklets + Gesture Handler  | Dynamic springs, pulse shimmers, swiping & custom particle confetti |
| **Backend**              | Node.js + Express + TypeScript              | Lightweight proxy backend                                           |
| **Generative AI**        | Gemini 2.0 Flash (SDK)                      | Structured JSON outputs for learning plans                          |
| **Video Retrieval**      | YouTube Data API v3                         | Keyword query search + duration resolving                           |
| **Local Cache**          | AsyncStorage                                | Key-value store (segmented by hobby index)                          |

## Prerequisites

- **Node.js** ≥ 20.19.4
- **npm** or **yarn**
- **Expo Go** app installed on your physical device (iOS or Android)
- **API Keys**:
  - A Google Gemini API key
  - A YouTube Data API v3 key

## Project Structure

```
obyay/
├── app/                  # Expo SDK 54 mobile application
│   ├── app/              # Screen routes (index.tsx, new.tsx, hobby/[id].tsx)
│   └── src/              # Components, hooks, store & theme tokens
├── server/               # Express + TypeScript proxy backend
│   ├── src/routes/       # POST /api/plan & GET /api/resources
│   └── src/services/     # Gemini & YouTube api client services
└── README.md
```

## Setup & Running

### 1. Server Setup

1. Open a terminal and navigate to the server folder:
   ```bash
   cd server
   npm install
   ```
2. Open `.env` and fill in your keys:
   ```env
   GEMINI_API_KEY=your_gemini_key_here
   YOUTUBE_API_KEY=your_youtube_key_here
   PORT=3000
   ```
3. Start the server in development mode:
   ```bash
   npm run dev
   ```

### 2. App Setup

1. Open another terminal and navigate to the app folder:
   ```bash
   cd app
   npm install
   cp .env.example .env
   ```
2. Open `.env` and configure your API URL.
   > [!IMPORTANT]
   > For physical devices running Expo Go, use your computer's local area network (LAN) IP instead of `localhost` (e.g. `http://192.168.1.50:3000`).
   ```env
   EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:3000
   ```
3. Start the Expo packager:
   ```bash
   npx expo start
   ```
4. Run on a simulator or device:
   - **Android**: Press `a` in the terminal to load in the Android emulator, or scan the QR code using the Expo Go app.
   - **iOS**: Press `i` in the terminal to run on the iOS simulator, or scan the QR code using your Camera app.

### 3. Running on macOS (Desktop App)

Hobyay supports running on macOS via two primary methods:

#### Option A: Mac Catalyst (Native iOS-on-Mac - Recommended)
Since the app utilizes native Expo modules, compiling the app via Mac Catalyst lets you run the native iOS workspace directly as a desktop application on your Mac with full plugin compatibility:
1. Generate the native iOS workspace:
   ```bash
   cd app
   npx expo prebuild --platform ios
   ```
2. Open the iOS workspace in Xcode:
   ```bash
   open ios/app.xcworkspace
   ```
3. Under **General** -> **Supported Destinations**, click the `+` button and add **Mac (Catalyst)**.
4. Select **My Mac (Mac Catalyst)** in the top scheme bar and press `Cmd + R` to compile and run.

#### Option B: Native macOS AppKit (Via `react-native-macos`)
The workspace includes a native AppKit desktop configuration under the `app/macos/` directory:
1. Install macOS peer dependencies and run CocoaPods:
   ```bash
   cd app
   npm install --save "react-native-macos@0.81.7" --legacy-peer-deps
   npm install --save-dev @react-native-community/cli --legacy-peer-deps
   cd macos && pod install
   ```
2. Start the Metro bundler packager:
   ```bash
   npx react-native start
   ```
3. Compile and launch the app:
   ```bash
   npx react-native run-macos
   # Or launch workspace directly in Xcode:
   open macos/app.xcworkspace
   ```
   *(Note: iOS-specific Expo SDK libraries, like expo-camera, do not support AppKit native desktop components out of the box. Use Catalyst or Web exports if you require these features).*

## Environment Variables

| Variable              | Scope  | Purpose                                               | Source               |
| --------------------- | ------ | ----------------------------------------------------- | -------------------- |
| `GEMINI_API_KEY`      | Server | Authenticates calls to Gemini 2.0 Flash               | Google AI Studio     |
| `YOUTUBE_API_KEY`     | Server | Query searches and durations                          | Google Cloud Console |
| `PORT`                | Server | Specifies port the backend listens on (Default: 3000) | Local preference     |
| `EXPO_PUBLIC_API_URL` | App    | URL where the backend is hosted                       | Local server IP      |

## Running Tests

Unit tests are configured inside both packages:

- **Server Tests**: Runs validation schema checks, Markdown fence stripping, and YouTube duration parsers.
  ```bash
  cd server && npm test
  ```
- **App Tests**: Verifies progress calculators.
  ```bash
  cd app && npm test
  ```

## Known Limitations

- **No Cloud Auth**: All data is saved inside native AsyncStorage. Uninstalling the app will clear your hobbies.
- **YouTube API Quota limits**: Daily search quota is capped (10,000 units). The server uses a 24-hour LRU in-memory cache to conserve units. If the daily quota is exhausted, Hobyay degrades gracefully by prompting search links to YouTube directly.

## Design Credits & Attributions

- Built with Google Gemini Flash 2.0 & YouTube Data API v3.
- Level badges and cards are customized from HSL design palettes.
- Particle animations built natively with React Native Reanimated.

## License

MIT
