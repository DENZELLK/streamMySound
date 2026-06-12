# streamMySound

Music streaming and listening app

## Repository structure

- `backend/` – Firebase / Vercel backend APIs and data connectors
- `mysound-web/` – React web application for desktop and mobile browsers
- `mysound-mobile/` – Expo React Native mobile application
- `.gitignore` – shared ignore rules for sensitive files and build artifacts
- `vercel.json` – deployment configuration for Vercel

## Getting started

### Backend

```powershell
cd backend
npm install
npm run dev
```

The backend uses Firebase Admin, Vercel serverless functions, and a local development server via `vercel dev`.

### Web app

```powershell
cd mysound-web
npm install
npm start
```

This runs the React web app locally with `react-scripts`.

### Mobile app

```powershell
cd mysound-mobile
npm install
npm start
```

This runs the Expo mobile application for iOS, Android, and web.

## Notes

- Sensitive data should never be committed. Use `.env` files and keep them out of Git.
- The repository is configured to ignore API keys, Firebase credentials, and local build artifacts.
- If you need to deploy, configure your environment variables in the hosting platform instead of committing them.

## GitHub repository

Pushed to: `https://github.com/DENZELLK/streamMySound`
