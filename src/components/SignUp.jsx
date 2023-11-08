// SignUp.jsx
import React from "react";
import "./Login.css"; // Usando los mismos estilos que para Login

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
    <div className="container-login">
      <div className="card card-body shadow-lg">
        <h3>Registro</h3>
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
    </div>
  );
};

export default SignUp;
