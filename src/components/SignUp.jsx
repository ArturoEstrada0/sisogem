import React, { useState, useEffect } from "react";
import Fondo1 from "../assets/img/tara3.jpg";
import Fondo2 from "../assets/img/sanD.jpg";
import Fondo3 from "../assets/img/acue4.jpg";
import Fondo4 from "../assets/img/morelia.jpg";
import Escudo from "../assets/img/image.png";
import Icono from "../assets/img/logo_mich.png";
import "./SingUp.css"; // Usando los mismos estilos que para Login

const SignUp = ({ setSignUpData, changeView }) => {
  const [currentBackground, setCurrentBackground] = useState(0);

  const backgrounds = [Fondo1, Fondo2, Fondo3, Fondo4]; // Agrega más imágenes según sea necesario

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBackground((prev) => (prev + 1) % backgrounds.length);
    }, 5000); // Cambia la imagen cada 5 segundos (ajusta según sea necesario)

    return () => clearInterval(timer);
  }, [backgrounds.length]);

  const handleSignUp = (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    setSignUpData({ email, password });
  };

  return (
    <div className="container-sign">
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
          Registro
        </h3>
        <img src={Icono} alt="Icono" className="profile" />
        <form onSubmit={handleSignUp}>
          <input
            type="text"
            placeholder="Email"
            className="input-text"
            id="email"
          />
          <input
            type="password"
            placeholder="Password"
            className="input-text"
            id="password"
          />
          
          <button type="submit" className="btn-form">
            Registrarse
          </button>
        </form>
        <div>
          <button
            onClick={() => changeView("login")}
            className="btn-switch"
          >
            Ya tengo una cuenta
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

export default SignUp;
