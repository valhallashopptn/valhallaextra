
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';

// Get a specific setting value
export const getSetting = async (key: string, defaultValue: string = ''): Promise<string> => {
  const docRef = doc(db, 'settings', key);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data().value;
  } else {
    // If the setting doesn't exist, you might want to create it with a default
    // For now, we'll just return the provided default value
    return defaultValue;
  }
};

// Update or create a specific setting
export const updateSetting = async (key: string, value: string) => {
  const docRef = doc(db, 'settings', key);
  return await setDoc(docRef, { 
    value: value,
    updatedAt: serverTimestamp()
  }, { merge: true });
};
