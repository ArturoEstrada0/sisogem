// src/context/UserRoleContext.js
import React, { createContext, useContext, useState } from 'react';

export const UserRoleContext = createContext();

export const UserRoleProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  return (
    <UserRoleContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserRoleContext.Provider>
  );
};

// export const useUserRole = () => {
//   const context = useContext(UserRoleContext);
//   if (!context) {
//     throw new Error('useUserRole must be used within a UserRoleProvider');
//   }
//   return context;
// };
