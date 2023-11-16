import React, { useState } from "react";
import { Auth } from "aws-amplify";
import Fondo from "../assets/img/acue4.jpg";
import Icono from "../assets/img/logo_mich.png";
import Escudo from "../assets/img/image.png";
import './ForgotPassword.css';

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
    <div className="container">
      <div className="row">
        <div className="col-md-4">
          <div className="container-forgot">
            <div className="card card-body shadow-lg">
              <h3
                className="login-title"
                style={{
                  textAlign: "center",
                  marginBottom: "20px",
                  marginTop: "20px",
                  color: "#701e45",
                  borderBottom: "1px solid #ccc",
                  paddingBottom: "10px",
                  width: "70%",
                  margin: "0 auto",
                }}
              >
                Recuperar Contraseña
              </h3>
              <img src={Icono} alt="Icono" className="profile" />
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
                <button
                  onClick={() => changeView("login")}
                  className="btn-switch"
                >
                  Volver al Inicio de Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <img src={Fondo} alt="Fondo" className="img-forgot" />
          <img src={Escudo} alt="Fondo" className="img-fore" />
        </div>
      </div>
    </div>
  );
  
};

export default ForgotPassword;
