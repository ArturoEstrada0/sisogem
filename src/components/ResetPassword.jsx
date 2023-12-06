import React, { useState, useEffect } from "react";
import { Auth } from 'aws-amplify';
import Fondo1 from "../assets/img/morelia.jpg";
import Fondo2 from "../assets/img/acue4.jpg";
import Fondo3 from "../assets/img/tara3.jpg";
import Fondo4 from "../assets/img/sanD.jpg"; 
import Icono from "../assets/img/logo_mich.png";
import Escudo from "../assets/img/image.png";
import "./Login.css";

const ResetPassword = ({ changeView }) => {
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [currentBackground, setCurrentBackground] = useState(0);

  const backgrounds = [Fondo1, Fondo2, Fondo3, Fondo4]; // Agrega imágenes según sea necesario

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBackground((prev) => (prev + 1) % backgrounds.length);
    }, 3000); // Cambia la imagen cada 5 segundos (ajusta según sea necesario)

    return () => clearInterval(timer);
  }, [backgrounds.length]);

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
    <div className="container">
      <div className="row">
        <div className="col-md-4">
    <div className="container-login">
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
          Restablecer Contraseña
          </h3>
          <img src={Icono} alt="Icono" className="profile" />
        <form onSubmit={handleResetPasswordSubmit}>
          <input
            type="text"
            placeholder="Email"
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
        <img src={Escudo} alt="Fondo" className="img-escudo" />
      </div>
    </div>
    </div>
  );
};

export default ResetPassword;
