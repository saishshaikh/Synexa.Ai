import React from 'react';
import Home from './pages/home';
import { useGetCurrentUser } from './hooks/useGetCurrentUser';

const App = () => {
    useGetCurrentUser(); // <-- Hook call karo, data khud store ho jayega!

    return (
        <div>
            <Home />
        </div>
    );
};

// ✅ 'export default' LIKHNA ZAROORI HAI!
export default App;