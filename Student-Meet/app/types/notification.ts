export type NotificationType = 
  | 'join_event' 
  | 'leave_event' 
  | 'event_cancelled' 
  | 'event_edited'
  | 'admin_event_edit'    
  | 'admin_profile_edit'; 

export interface Notification {
  id: string;
  type: NotificationType;
  userId: string;
  eventId?: string;
  eventTitle?: string;
  userName?: string;
  createdAt: string;
  read: boolean;
  adminReason?: string;  
}

// Add default export
export default function Notification() {
  return null;
}