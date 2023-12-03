import React, { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Amplify, Auth } from "aws-amplify";
import awsExports from "./aws-exports";
import awsconfig from "./aws-exports"; // Asegúrate de que este archivo existe

import "./App.css";
// Componentes de autenticación
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import ConfirmSignUp from "./components/ConfirmSignUp";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import { UserRoleProvider } from "./context/UserRoleContext";
import { OrganismoProvider } from "./context/OrganismoContext";

Amplify.configure(awsconfig);
Amplify.configure(awsExports);

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("login");
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState(""); // Estado para almacenar el email durante el proceso de registro

  // Efecto para verificar el usuario actual cuando el componente se monta
  useEffect(() => {
    checkCurrentUser();
  }, []);

  async function checkCurrentUser() {
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      setUser(currentUser);
      setView("dashboard"); // Cambiar a vista del dashboard si el usuario está autenticado
    } catch (err) {
      console.error(err);
      setUser(null); // No hay usuario autenticado
    }
  }

  async function handleSignOut() {
    try {
      await Auth.signOut();
      setUser(null);
      setEmail(""); // Asegurarse de limpiar el email
      setView("login"); // Volver a la vista de login después de cerrar sesión
    } catch (error) {
      console.error("error signing out: ", error);
    }
  }

  async function setSignUpData(signUpData) {
    try {
      const { email, password } = signUpData;
      // TODO: HACER PETICION A LA API PARA VALIDAR QUE EL USUARIO YA FUE DADO DE ALTA
      await Auth.signUp({ username: email, password });
      setEmail(email); // Guarda el email en el estado para usarlo después en la confirmación
      setView("confirmSignUp");
    } catch (error) {
      console.error("error during sign up:", error);
    }
  }

  async function confirmSignUpData(email, code) {
    try {
      await Auth.confirmSignUp(email, code);
      setView("login");
    } catch (error) {
      console.error("error confirming sign up:", error);
    }
  }

  async function handleResetPassword(email) {
    try {
      await Auth.forgotPassword(email);
      setView("resetPassword");
    } catch (error) {
      console.error("error sending reset password email:", error);
    }
  }

  const changeView = (viewName) => {
    setView(viewName);
  };

  // Forzar una re-renderización cuando el estado 'user' cambie
  useEffect(() => {
    if (user) {
      setView("dashboard");
    }
  }, [user]);

  // Función que maneja el envío del correo electrónico para restablecer la contraseña
  const handleForgotPassword = async (email) => {
    try {
      await Auth.forgotPassword(email);
      setView("resetPassword"); // Cambiar a la vista para ingresar el código y la nueva contraseña
    } catch (error) {
      console.error("error sending forgot password email:", error);
    }
  };

  // Función que maneja la confirmación del nuevo password
  const handleResetPasswordSubmit = async (username, code, newPassword) => {
    try {
      await Auth.forgotPasswordSubmit(username, code, newPassword);
      setView("login"); // Cambiar a la vista de login después de restablecer la contraseña
    } catch (error) {
      console.error("error setting new password:", error);
    }
  };

  return (
    <UserRoleProvider>
      <OrganismoProvider>
        <Router key={user ? user.username : "login"}>
          <div>
            {view === "dashboard" && user && (
              <>
                <Header user={user} signOut={handleSignOut} userRole={role} />
                <Dashboard userRole={role} />
              </>
            )}
            {view === "login" && !user && (
              <Login setUser={setUser} setRole={setRole} changeView={setView} />
            )}
            {view === "signup" && (
              <SignUp setSignUpData={setSignUpData} changeView={setView} />
            )}
            {view === "confirmSignUp" && (
              <ConfirmSignUp
                confirmSignUpData={confirmSignUpData}
                email={email}
                changeView={setView}
              />
            )}
            {view === "forgotPassword" && (
              <ForgotPassword
                onResetPassword={handleForgotPassword}
                changeView={setView}
              />
            )}
            {view === "resetPassword" && (
              <ResetPassword
                onResetPasswordSubmit={handleResetPasswordSubmit}
                changeView={setView}
              />
            )}
            {/* Aquí puedes agregar la lógica de la vista 'resetPassword' si es necesario */}
          </div>
        </Router>{" "}
      </OrganismoProvider>
    </UserRoleProvider>
  );
}

export default App;
