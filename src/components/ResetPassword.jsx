// ResetPassword.jsx
import React, { useState } from "react";
import { Auth } from 'aws-amplify';
import "./Login.css";

const ResetPassword = ({ changeView }) => {
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleResetPasswordSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      await Auth.forgotPasswordSubmit(username, code, newPassword);
      setMessage("Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.");
      changeView('login'); // Cambia a la vista de login después de restablecer la contraseña
    } catch (error) {
      setMessage("Hubo un error al restablecer la contraseña. Por favor, verifica tu código e intenta de nuevo.");
      console.error("Error al restablecer la contraseña:", error);
    }
  };

  return (
    <div className="container-login">
      <div className="card card-body shadow-lg">
        <h3>Restablecer Contraseña</h3>
        <form onSubmit={handleResetPasswordSubmit}>
          <input
            type="text"
            placeholder="Username"
            className="input-text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Código de confirmación"
            className="input-text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <input
            type="password"
            placeholder="Nueva Contraseña"
            className="input-text"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button type="submit" className="btn-form">
            Restablecer Contraseña
          </button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
