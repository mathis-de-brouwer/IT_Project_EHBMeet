export interface Notification {
  id: string;
  type: 'join_event' | 'leave_event' | 'event_cancelled';
  userId: string;
  userName: string;
  eventId: string;
  eventTitle: string;
  createdAt: string;
  read: boolean;
} 