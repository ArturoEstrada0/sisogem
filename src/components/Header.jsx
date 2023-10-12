import React from 'react';

const Header = () => {
  const headerStyle = {
    backgroundColor: '#6A0F49',
    color: 'white',
    padding: '0px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const navigationStyle = {
    listStyle: 'none',
    display: 'flex',
    margin: 0,
    padding: 0,
  };

  const listItemStyle = {
    margin: '0 10px',
  };

  return (
    <header style={headerStyle}>
      <div>
        <h1>SISOGEM</h1>
      </div>
      <p style={{paddingLeft: "250px", fontSize: "25x"}}>Sistema de Seguimiento a Órganos de Gobierno del Estado de Michoacán
      </p>
      <nav>
        <ul style={navigationStyle}>
          <li style={listItemStyle}>FAQ</li>
          <li style={listItemStyle}>Cuenta</li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
