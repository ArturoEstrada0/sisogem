
// SignUp.jsx
import React from "react";
import Fondo from "../assets/img/tara3.jpg";
import Escudo from "../assets/img/image.png";
import Icono from "../assets/img/logo_mich.png";
import "./SingUp.css";// Usando los mismos estilos que para Login

const SignUp = ({ setSignUpData, changeView }) => { // Asegúrate de incluir changeView como prop
  const handleSignUp = (event) => {
    event.preventDefault();
    // Aquí deberías recoger los datos del formulario y manejar la lógica de registro
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    // Suponiendo que pasas los datos al estado padre para manejarlos
    setSignUpData({ email, password });
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
          {/* Usar changeView para navegar a la vista de inicio de sesión */}
          <button onClick={() => changeView('login')} className='btn-switch'>Ya tengo una cuenta</button>
        </div>
      </div>
      <div className="col-md-8">
            <img src={Fondo} alt="Fondo" className="img-fondo" />
            <img src={Escudo} alt="Fondo" className="img-escudo" />
          </div>
    </div>
  );
};

export default SignUp;