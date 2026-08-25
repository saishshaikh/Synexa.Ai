import React, { useEffect } from 'react';
import Home from './pages/home';
import { getCurrentUser } from './pages/features/getCurrentUser';

const App = () => {

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await getCurrentUser(); // Backend se user fetch kar rahe hain
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    
    fetchUser(); // Function ko call karo
  }, []); // <--- Yeh [] bahut zaroori hai, warna yeh baar-baar chalega

  return (
    <div>
      <Home />  
    </div>
  );
};

export default App;