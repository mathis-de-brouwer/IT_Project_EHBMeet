import { useContext } from 'react';
import { AuthContext } from '../../_layout';

export default function MyProfile() {
  const { user } = useContext(AuthContext);

//   return (
//     // ... now you can display user.First_Name, user.email, etc.
//   );
}
