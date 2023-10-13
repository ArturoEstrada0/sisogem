import React, { useState, useEffect } from "react";
import {
  Container,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Grid,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useLocation } from "react-router-dom"; // Importa Route y Switch
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HomeIcon from "@mui/icons-material/Home";
import BookIcon from "@mui/icons-material/Book";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import EventNoteIcon from "@mui/icons-material/EventNote";
import TimerIcon from "@mui/icons-material/Timer";
import DescriptionIcon from "@mui/icons-material/Description";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import EqualizerIcon from "@mui/icons-material/Equalizer";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import MailIcon from "@mui/icons-material/Mail";
import Entidad from "./Entidad";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MarcoNormativo from "./MarcoNormativo";
import OrganoGobierno from "./OrganoGobierno";
import SesionesProgramadas from "./SesionesProgramadas";
import SesionProgreso from "./SesionProgreso";
import Archivo from "./Archivo";
import Formatos from "./Formatos";
import Indicadores from "./Indicadores";
import Repositorio from "./Repositorio";
import BuzonReportes from "./BuzonReportes";
import Login from "./Login";

const drawerWidth = 240;

const linkStyle = {
  textDecoration: "none",
  color: "inherit",
};

const iconStyle = {
  marginRight: "16px",
};

const useStyles = {
  root: {
    display: "flex",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: 16,
  },
  activeLink: {
    textDecoration: "none",
    color: "inherit",
    background: "#6A0F49",
    color: "white",
  },
};

function Dashboard() {
  const [open, setOpen] = useState(true);
  const location = useLocation(); // Obtiene la ubicación actual de la página

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    // Mostrar notificación de bienvenida cuando el componente se monta
    toast.info("¡Bienvenido al sistema!", {
      position: "top-center",
      autoClose: 2000, // Cierra automáticamente la notificación después de 2 segundos
    });
  }, []);

  return (
    <div style={useStyles.root}>
      <IconButton onClick={handleDrawerOpen}>
        <MenuIcon />
      </IconButton>
      <Drawer
        style={useStyles.drawer}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <List>
          <Link to="/entidad" style={linkStyle}>
            <ListItem
              button
              style={
                location.pathname === "/entidad" ? useStyles.activeLink : {}
              }
            >
              <ListItemIcon style={iconStyle}>
                <HomeIcon
                  className={
                    location.pathname === "/entidad" ? "icono-blanco" : ""
                  }
                />
              </ListItemIcon>
              <ListItemText primary="Entidad" />
            </ListItem>
          </Link>
          <Link to="/marco-normativo" style={linkStyle}>
            <ListItem
              button
              style={
                location.pathname === "/marco-normativo"
                  ? useStyles.activeLink
                  : {}
              }
            >
              <ListItemIcon style={iconStyle}>
                <BookIcon
                  className={
                    location.pathname === "/marco-normativo"
                      ? "icono-blanco"
                      : ""
                  }
                />
              </ListItemIcon>
              <ListItemText primary="Marco Normativo" />
            </ListItem>
          </Link>
          <Link to="/organos-de-gobierno" style={linkStyle}>
            <ListItem
              button
              style={
                location.pathname === "/organos-de-gobierno"
                  ? useStyles.activeLink
                  : {}
              }
            >
              <ListItemIcon style={iconStyle}>
                <AccountBalanceIcon
                  className={
                    location.pathname === "/organos-de-gobierno"
                      ? "icono-blanco"
                      : ""
                  }
                />
              </ListItemIcon>
              <ListItemText primary="Órganos de Gobierno" />
            </ListItem>
          </Link>
          <Link to="/sesiones-programadas" style={linkStyle}>
            <ListItem
              button
              style={
                location.pathname === "/sesiones-programadas"
                  ? useStyles.activeLink
                  : {}
              }
            >
              <ListItemIcon style={iconStyle}>
                <EventNoteIcon
                  className={
                    location.pathname === "/sesiones-programadas"
                      ? "icono-blanco"
                      : ""
                  }
                />
              </ListItemIcon>
              <ListItemText primary="Sesiones programadas" />
            </ListItem>
          </Link>
          <Link to="/sesion-en-progreso" style={linkStyle}>
            <ListItem
              button
              style={
                location.pathname === "/sesion-en-progreso"
                  ? useStyles.activeLink
                  : {}
              }
            >
              <ListItemIcon style={iconStyle}>
                <TimerIcon
                  className={
                    location.pathname === "/sesion-en-progreso"
                      ? "icono-blanco"
                      : ""
                  }
                />
              </ListItemIcon>
              <ListItemText primary="Sesión en progreso" />
            </ListItem>
          </Link>
          <Link to="/archivo" style={linkStyle}>
            <ListItem
              button
              style={
                location.pathname === "/archivo" ? useStyles.activeLink : {}
              }
            >
              <ListItemIcon style={iconStyle}>
                <DescriptionIcon
                  className={
                    location.pathname === "/archivo" ? "icono-blanco" : ""
                  }
                />
              </ListItemIcon>
              <ListItemText primary="Archivo" />
            </ListItem>
          </Link>
          <Link to="/formatos" style={linkStyle}>
            <ListItem
              button
              style={
                location.pathname === "/formatos" ? useStyles.activeLink : {}
              }
            >
              <ListItemIcon style={iconStyle}>
                <FormatListBulletedIcon
                  className={
                    location.pathname === "/formatos" ? "icono-blanco" : ""
                  }
                />
              </ListItemIcon>
              <ListItemText primary="Formatos" />
            </ListItem>
          </Link>
          <Link to="/indicadores" style={linkStyle}>
            <ListItem
              button
              style={
                location.pathname === "/indicadores" ? useStyles.activeLink : {}
              }
            >
              <ListItemIcon style={iconStyle}>
                <EqualizerIcon
                  className={
                    location.pathname === "/indicadores" ? "icono-blanco" : ""
                  }
                />
              </ListItemIcon>
              <ListItemText primary="Indicadores" />
            </ListItem>
          </Link>
          <Link to="/repositorio" style={linkStyle}>
            <ListItem
              button
              style={
                location.pathname === "/repositorio" ? useStyles.activeLink : {}
              }
            >
              <ListItemIcon style={iconStyle}>
                <LibraryBooksIcon
                  className={
                    location.pathname === "/repositorio" ? "icono-blanco" : ""
                  }
                />
              </ListItemIcon>
              <ListItemText primary="Repositorio" />
            </ListItem>
          </Link>
          <Link to="/buzon-de-reportes" style={linkStyle}>
            <ListItem
              button
              style={
                location.pathname === "/buzon-de-reportes"
                  ? useStyles.activeLink
                  : {}
              }
            >
              <ListItemIcon style={iconStyle}>
                <MailIcon
                  className={
                    location.pathname === "/buzon-de-reportes"
                      ? "icono-blanco"
                      : ""
                  }
                />
              </ListItemIcon>
              <ListItemText primary="Buzón de Reportes" />
            </ListItem>
          </Link>
          <Link to="/login" style={linkStyle}>
            <ListItem
              button
              style={
                location.pathname === "/login"
                  ? useStyles.activeLink
                  : {}
              }
            >
              <ListItemIcon style={iconStyle}>
                <MailIcon
                  className={
                    location.pathname === "/login"
                      ? "icono-blanco"
                      : ""
                  }
                />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
          </Link>
        </List>
      </Drawer>
      <main style={useStyles.content}>
        {/* Contenido principal de tu Dashboard */}
        <Routes>
          {/* Agrega más rutas para otros componentes */}
          <Route path="/entidad" element={<Entidad />} />
          <Route path="/marco-normativo" element={<MarcoNormativo />} />
          <Route path="/organos-de-gobierno" element={<OrganoGobierno />} />
          <Route
            path="/sesiones-programadas"
            element={<SesionesProgramadas />}
          />
          <Route path="/sesion-en-progreso" element={<SesionProgreso />} />
          <Route path="/archivo" element={<Archivo />} />
          <Route path="/formatos" element={<Formatos />} />
          <Route path="/indicadores" element={<Indicadores />} />
          <Route path="/repositorio" element={<Repositorio />} />
          <Route path="/buzon-de-reportes" element={<BuzonReportes />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
}

export default Dashboard;
