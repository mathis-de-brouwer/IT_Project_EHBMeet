export interface UserData {
  First_Name: string;
  Second_name: string;
  email: string;
  User_ID: string;
  Password: string;
  Blacklisted: boolean;
  Description?: string;
  Profile_Picture?: string;
  Steam_name?: string;
  Discord_name?: string;
  role: 'student' | 'admin';
}

// Add a default export with an empty component to satisfy the router
export default function User() {
  return null;
} 