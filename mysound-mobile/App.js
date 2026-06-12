// App.js
import React, { useEffect, useState } from "react";
import { Button, View, Text, Image } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "./src/firebase/config";
import { createUserDocIfNotExists } from "./src/firebase/userDoc";

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [userInfo, setUserInfo] = useState(null);

  // Replace this with your Google Web Client ID (create in Google Cloud Console)
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserInfo(user ? {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL
      } : null);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(({ user }) => createUserDocIfNotExists(user))
        .catch(console.error);
    }
  }, [response]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>MySound (Expo)</Text>

      {userInfo ? (
        <View style={{ alignItems: "center" }}>
          {userInfo.photoURL ? <Image source={{ uri: userInfo.photoURL }} style={{ width: 80, height: 80, borderRadius: 40 }} /> : null}
          <Text style={{ marginTop: 10 }}>Hello, {userInfo.name || userInfo.email}</Text>
          <Button title="Sign Out" onPress={() => auth.signOut()} />
        </View>
      ) : (
        <Button
          disabled={!request}
          title="Sign in with Google"
          onPress={() => {
            promptAsync();
          }}
        />
      )}
    </View>
  );
}
