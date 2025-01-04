export type EventCategory = 'games' | 'sport' | 'ehb-events' | 'creativity';
export type EventStatus = 'open' | 'full' | 'cancelled';

export interface EventData {
  id?: string;
  Event_Title: string;
  Description: string;
  Date: string;
  Location: string;
  Max_Participants: string;
  Category_id: string;
  User_ID: string;
  participants?: string[];
  Phone_Number?: string;
  status?: 'open' | 'full' | 'cancelled';
} 

// Add default export
export default function Event() {
  return null;
} 
