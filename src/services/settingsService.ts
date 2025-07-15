
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  where,
  documentId,
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

// Get multiple settings at once
export const getSettings = async (keys: string[]): Promise<Record<string, any>> => {
    const settings: Record<string, any> = {};
    
    // Create a default structure for all requested keys
    keys.forEach(key => settings[key] = undefined);

    const settingsCollectionRef = collection(db, 'settings');
    const q = query(settingsCollectionRef, where(documentId(), 'in', keys));
    
    try {
        const snapshot = await getDocs(q);
        snapshot.forEach(doc => {
            settings[doc.id] = doc.data().value;
        });
    } catch (e) {
        // Fallback for when where-in on documentId is not supported/enabled.
        // This is less efficient as it reads all settings.
        console.warn("Falling back to fetching all settings due to query error:", e);
        const allDocsSnapshot = await getDocs(collection(db, 'settings'));
        allDocsSnapshot.forEach(doc => {
            if (keys.includes(doc.id)) {
                settings[doc.id] = doc.data().value;
            }
        });
    }


    return settings;
};

// Update or create a specific setting
export const updateSetting = async (key: string, value: any) => {
  const docRef = doc(db, 'settings', key);
  return await setDoc(docRef, { 
    value: value,
    updatedAt: serverTimestamp()
  }, { merge: true });
};
