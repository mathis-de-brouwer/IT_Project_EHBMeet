export type UserRole = 'student' | 'admin' | 'ehb' | 'enigma';

export interface UserData {
  User_ID: string;
  email: string;
  First_Name: string;
  Second_name: string;
  Password: string;
  Blacklisted: boolean;
  Description?: string;
  Department?: string;
  Date_Of_Birth?: string;
  Gender?: string;
  Region?: string;
  Profile_Picture?: string;
  Steam_name?: string;
  Discord_name?: string;
  role: UserRole;
}

// Add a default export with an empty component to satisfy the router
export default function User() {
  return null;
} 