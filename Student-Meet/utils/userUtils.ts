import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const getUserById = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'Users', userId));
    if (userDoc.exists()) {
      return {
        User_ID: userDoc.id,
        ...userDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}; 