# Kyool Frontend

This is the frontend for the Kyool health and lifestyle app, built with React, Vite, and TypeScript.

## Project Structure

- `src/` — Main source code
  - `components/` — React components
  - `api/` — API calls to backend
  - `assets/` — Images and static files
  - `styles/` — Global CSS
  - `utils/` — Utility functions
- `index.html` — Main HTML entry point
- `package.json` — Project dependencies and scripts
- `.env` — Environment variables

## Prerequisites

- Node.js (v18+ recommended)
- npm (v9+ recommended)
- Firebase CLI (`npm install -g firebase-tools`)

## Local Development

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Updating the Live Website

1. Make your code changes in the `src/` directory.
2. Build the production site:
   ```sh
   npm run build
   ```
   This creates a `dist/` folder with the production build.
3. Deploy to Firebase Hosting:
   ```sh
   firebase deploy --only hosting
   ```
   This will update the live website with your latest changes.

## Environment Variables

- Store sensitive keys and API URLs in `.env` (not committed to git).
- Example:
  ```env
  VITE_API_URL=https://your-backend-url.a.run.app
  ```

## API Integration

- Update API URLs in `.env` or in `src/api/user_api.js` to point to your deployed backend.

## Troubleshooting

- If you see the default Firebase Hosting page, make sure you are deploying the correct build folder (`dist/`).
- For deployment errors, check your Firebase project settings and CLI authentication.

## License

MIT

backend url: https://kyool-backend-606917950237.us-central1.run.app