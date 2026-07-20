import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase using the provisioned credentials
const app = initializeApp(firebaseConfig);

// Mendukung database kustom dari AI Studio ataupun database bawaan '(default)' dari milik Anda sendiri
const db = ('firestoreDatabaseId' in firebaseConfig && firebaseConfig.firestoreDatabaseId)
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId as string)
  : getFirestore(app);

export { app, db };
