export type NotificationType = 
  | 'join_event' 
  | 'leave_event' 
  | 'event_cancelled' 
  | 'event_edited'
  | 'admin_event_edit'    // New type for admin edits
  | 'admin_profile_edit'; // New type for profile edits

export interface Notification {
  id: string;
  type: NotificationType;
  userId: string;
  eventId?: string;
  eventTitle?: string;
  userName?: string;
  createdAt: string;
  read: boolean;
  adminReason?: string;  // New field for admin edit reason
}

// Add default export
export default function Notification() {
  return null;
}