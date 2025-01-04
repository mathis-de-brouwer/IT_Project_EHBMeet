export type EventCategory = 'games' | 'sport' | 'ehb-events' | 'creativity';

export interface EventData {
  Category_id: EventCategory;
  Date: string;
  Description: string;
  Event_Title: string;
  Event_picture?: string;
  Location: string;
  Max_Participants: string;
  Phone_Number?: string;
  User_ID: string;
  Created_At: string;
} 