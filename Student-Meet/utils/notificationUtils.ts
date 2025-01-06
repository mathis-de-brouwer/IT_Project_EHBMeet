import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { NotificationType } from '../app/types/notification';

export const sendAdminNotification = async ({
  userId,
  type,
  eventId,
  eventTitle,
  adminName,
  reason
}: {
  userId: string;
  type: 'admin_event_edit' | 'admin_profile_edit';
  eventId?: string;
  eventTitle?: string;
  adminName: string;
  reason: string;
}) => {
  try {
    await addDoc(collection(db, 'Notifications'), {
      userId,
      type,
      eventId,
      eventTitle,
      userName: adminName,
      adminReason: reason,
      createdAt: new Date().toISOString(),
      read: false
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}; 