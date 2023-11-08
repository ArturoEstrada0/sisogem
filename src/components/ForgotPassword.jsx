// ForgotPassword.jsx
import React, { useState } from "react";
import { Auth } from "aws-amplify";
import "./Login.css";

const ForgotPassword = ({ changeView }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!email) {
      setMessage("Por favor, introduce tu email.");
      return;
    }

    try {
      await Auth.forgotPassword(email);
      setMessage(
        "Se ha enviado un enlace de recuperación de contraseña a tu email."
      );
      // Aquí puedes cambiar la vista para que el usuario ingrese el código y la nueva contraseña
      changeView("resetPassword");
    } catch (error) {
      setMessage(
        "Hubo un error al intentar enviar el enlace de recuperación. Por favor, intenta de nuevo."
      );
      console.error("Error al enviar el enlace de recuperación:", error);
    }
  };

  return (
    <div className="container-login">
      <div className="card card-body shadow-lg">
        <h3>Recuperar Contraseña</h3>
        <form onSubmit={handleForgotPassword}>
          <input
            type="email"
            placeholder="Email"
            className="input-text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="btn-form">
            Enviar Enlace de Recuperación
          </button>
        </form>
        {message && <p className="message">{message}</p>}
        <div>
          <button onClick={() => changeView("login")} className="btn-switch">
            Volver al Inicio de Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
