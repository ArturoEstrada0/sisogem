import React, { useState, useEffect } from "react";
import { Auth } from "aws-amplify";
import Fondo1 from "../assets/img/acue4.jpg";
import Fondo2 from "../assets/img/morelia.jpg";
import Fondo3 from "../assets/img/tara3.jpg";
import Fondo4 from "../assets/img/sanD.jpg";
import Icono from "../assets/img/logo_mich.png";
import Escudo from "../assets/img/image.png";
import "./ForgotPassword.css";

const ForgotPassword = ({ changeView }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [showEmptyFieldsAlert, setShowEmptyFieldsAlert] = useState(false);
  const [currentBackground, setCurrentBackground] = useState(0);

  const backgrounds = [Fondo1, Fondo2, Fondo3, Fondo4]; // Agrega más imágenes según sea necesario

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBackground((prev) => (prev + 1) % backgrounds.length);
    }, 3000); // Cambia la imagen cada 5 segundos (ajusta según sea necesario)

    return () => clearInterval(timer);
  }, [backgrounds.length]);

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!email) {
      setMessage("");
      setShowEmptyFieldsAlert(true); // Show the empty fields alert
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
              {showEmptyFieldsAlert && (
                <div className="alert alert-danger" role="alert">
                  ¡Por favor, proporciona tu correo electrónico!
                </div>
              )}
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
          {backgrounds.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Fondo ${index + 1}`}
              className={`img-forgot ${
                index === currentBackground ? "img-forgot-active" : ""
              }`}
            />
          ))}
          <img src={Escudo} alt="Fondo" className="img-fore" />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
