import React from 'react';
import logo from '../assets/img/EscudoMichoacanHorizontal6.png'; // Importa la imagen

const Header = () => {
  const headerStyle = {
    backgroundColor: '#6A0F49',
    color: 'white',
    padding: '10px', // Aumenta el relleno
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '70px', // Reduce la altura del encabezado
  };

  const logoStyle = {
    width: '150px', // Ajusta el ancho de la imagen
    height: 'auto', // Mantiene la relación de aspecto
    marginLeft: '10px', // Desplaza la imagen hacia la derecha
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
        <img src={logo} alt="Escudo Michoacán" style={logoStyle} />
      </div>
      <p style={{ fontSize: "20px" }}>Sistema de Seguimiento a Órganos de Gobierno del Estado de Michoacán</p>
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
