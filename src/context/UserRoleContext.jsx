// src/context/UserRoleContext.js
import React, { createContext, useState } from 'react';

export const UserRoleContext = createContext();

export const UserRoleProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  return (
    <UserRoleContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserRoleContext.Provider>
  );
};
