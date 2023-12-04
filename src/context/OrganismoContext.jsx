import React, { createContext, useState } from 'react'

export const OrganismoContext = createContext()

export const OrganismoProvider = ({ children }) => {
  const [organismo, setOrganismo] = useState('')

  console.log('Organismo selecccionado: ', organismo)

  return (
    <OrganismoContext.Provider value={{ organismo, setOrganismo }}>
      {children}
    </OrganismoContext.Provider>
  )
}
