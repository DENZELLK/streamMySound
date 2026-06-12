// src/firebase/userDoc.js
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

export async function createUserDocIfNotExists(user) {
  if (!user || !user.uid) return;
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email || null,
      name: user.displayName || null,
      photoURL: user.photoURL || null,
      provider: user.providerData?.[0]?.providerId || null,
      createdAt: serverTimestamp()
    });
  } else {
    await setDoc(ref, { lastLoginAt: serverTimestamp(), photoURL: user.photoURL }, { merge: true });
  }
}
