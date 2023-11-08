// ConfirmSignUp.jsx
import React, { useState } from "react";
import "./Login.css";

const ConfirmSignUp = ({ confirmSignUpData, changeView, email }) => {
  const [error, setError] = useState("");
  const [code, setCode] = useState(""); // Agrega un estado para el código

  const handleConfirmSignUp = async (event) => {
    event.preventDefault();
    if (!code) {
      setError("El código de verificación no puede estar vacío.");
      return;
    }

    try {
      await confirmSignUpData(email, code);
      changeView("login"); // Cambio de vista si la confirmación es exitosa
      setError("");
    } catch (error) {
      setError("Código de verificación inválido. Intente de nuevo.");
    }
  };

  return (
    <div className="container-login">
      <div className="card card-body shadow-lg">
        <h3>Confirmar Registro</h3>
        <form onSubmit={handleConfirmSignUp}>
          <input
            type="text"
            placeholder="Código de confirmación"
            className="input-text"
            id="code"
            value={code} // Controla el valor con el estado
            onChange={(e) => setCode(e.target.value)} // Actualiza el estado cuando cambia el input
            min="0" // Solo números positivos
          />
          <button type="submit" className="btn-form">
            Confirmar
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        <div>
          <button onClick={() => changeView("login")} className="btn-switch">
            Volver al Inicio de Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSignUp;
