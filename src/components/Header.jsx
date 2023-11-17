import React from "react";
import { Menu, Dropdown } from "antd";
import { LogoutOutlined, QuestionCircleOutlined, UserOutlined } from "@ant-design/icons";
import logo from "../assets/img/EscudoMichoacanHorizontal6.png";
import { useContext } from "react";
import { UserRoleContext } from "../context/UserRoleContext";

const Header = ({ signOut }) => {
  const { currentUser } = useContext(UserRoleContext);
  const headerStyle = {
    backgroundColor: "#6A0F49",
    color: "white",
    padding: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "70px",
  };

  const logoStyle = {
    width: "150px",
    height: "auto",
    marginLeft: "10px",
  };

  const navigationStyle = {
    listStyle: "none",
    display: "flex",
    margin: 0,
    padding: 0,
    alignItems: "center",
  };

  const listItemStyle = {
    margin: "0 10px",
  };

  const buttonStyle = {
    marginLeft: "auto",
  };

  const menuStyle = {
    color: "#701e45", // Color rojo para el texto del menú desplegable
  };

  const menu = (
    <Menu>
      <Menu.Item
        key="1"
        onClick={signOut}
        icon={<LogoutOutlined />}
        style={menuStyle}
      >
        Cerrar Sesión
      </Menu.Item>
    </Menu>
  );

  const faqStyle = {
    marginRight: '10px', // Adjust margin as needed
  };

  const cuentaIconStyle = {
    fontSize: '16px',
    marginRight: '5px',
  };

  const cuentaStyle = {
    color: "white",
    textDecoration: "none",
    cursor: "pointer",
  };

  return (
    <header style={headerStyle} className="header">
      <div>
        <img src={logo} alt="Escudo Michoacán" style={logoStyle} />
      </div>
      <p style={{ fontSize: "20px" }}>
        Sistema de Seguimiento a Órganos de Gobierno del Estado de Michoacán
      </p>
      <nav>
        <ul style={navigationStyle}>
          <li style={{ ...listItemStyle, ...faqStyle }}>
            <QuestionCircleOutlined style={{ fontSize: '20px', color: 'white' }} />
          </li>
          <li style={listItemStyle}>
            <Dropdown trigger={["click"]} overlay={menu} placement="bottomRight" arrow>
              <a
                className="ant-dropdown-link"
                style={cuentaStyle}
                onClick={(e) => e.preventDefault()}
              >
                <UserOutlined style={cuentaIconStyle} />
                Cuenta
              </a>
            </Dropdown>
          </li>
        </ul>
      </nav>
    </header>
  );
};
export default Header;

