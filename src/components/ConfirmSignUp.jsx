import React, { useState, useEffect } from "react";
import Fondo1 from "../assets/img/tara3.jpg";
import Fondo2 from "../assets/img/sanD.jpg";
import Fondo3 from "../assets/img/acue4.jpg";
import Fondo4 from "../assets/img/morelia.jpg";
import Escudo from "../assets/img/image.png";
import Icono from "../assets/img/logo_mich.png";
import "./SingUp.css";

const ConfirmSignUp = ({ confirmSignUpData, changeView, email }) => {
  const [error, setError] = useState("");
  const [code, setCode] = useState(""); // Agrega un estado para el código
  const [currentBackground, setCurrentBackground] = useState(0);
 
  const backgrounds = [Fondo1, Fondo2, Fondo3, Fondo4]; // Agrega más imágenes según sea necesario

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBackground((prev) => (prev + 1) % backgrounds.length);
    }, 5000); // Cambia la imagen cada 5 segundos (ajusta según sea necesario)

    return () => clearInterval(timer);
  }, [backgrounds.length]);

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
    <div className="container-sign">
      <div className="card card-body shadow-lg">
        <h3 className="login-title"
                  style={{
                    textAlign: "center",
                    marginBottom: "20px",
                    marginTop: "20px",
                    color: "#701e45",
                    borderBottom: "1px solid #ccc",
                    paddingBottom: "10px",
                    width: "70%",
                    margin: "0 auto",
                  }}>
                    Confirmar Registro
                    </h3>
        <img src={Icono} alt="Icono" className="profile" />
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
      <div className="col-md-8">
        {backgrounds.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Fondo ${index + 1}`}
            className={`img-fondo ${
              index === currentBackground ? "img-fondo-active" : ""
            }`}
          />
        ))}
        <img src={Escudo} alt="Fondo" className="img-escudo" />
      </div>
    </div>
  );
};

export default ConfirmSignUp;
