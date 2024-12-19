export interface Notification {
  id: string;
  type: 'leave_event' | 'join_event' | 'event_cancelled';
  eventId: string;
  eventTitle: string;
  userId: string;
  userName: string;
  createdAt: string;
  read: boolean;
} 