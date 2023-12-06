import { Auth } from "aws-amplify";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import "./Login.css";
import Icono from "../assets/img/logo_mich.png";
import Escudo from "../assets/img/image.png";
import { useState, useEffect } from "react";
import Fondo1 from "../assets/img/morelia.jpg";
import Fondo2 from "../assets/img/acue4.jpg";
import Fondo3 from "../assets/img/tara3.jpg";
import Fondo4 from "../assets/img/sanD.jpg"; // Agrega más imágenes según sea necesario

const Login = ({ setUser, changeView }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEmptyFieldsAlert, setShowEmptyFieldsAlert] = useState(false);
  const [showAuthErrorAlert, setShowAuthErrorAlert] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentBackground, setCurrentBackground] = useState(0);

  const backgrounds = [Fondo1, Fondo2, Fondo3, Fondo4]; // Agrega más imágenes según sea necesario

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBackground((prev) => (prev + 1) % backgrounds.length);
    }, 3000); // Cambia la imagen cada 5 segundos (ajusta según sea necesario)

    return () => clearInterval(timer);
  }, [backgrounds.length]);

  const signIn = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      setShowEmptyFieldsAlert(true);
      return;
    }

    try {
      const user = await Auth.signIn(email, password);
      setUser(user);
    } catch (error) {
      console.error("Error signing in", error);

      setShowEmptyFieldsAlert(false);

      if (
        error.code === "UserNotFoundException" ||
        error.code === "NotAuthorizedException"
      ) {
        setAuthErrorMessage(
          "Credenciales incorrectas. Por favor, verifica tu email y contraseña."
        );
        setShowAuthErrorAlert(true);
      } else {
        setAuthErrorMessage(
          "Error de autenticación. Por favor, inténtalo de nuevo."
        );
        setShowAuthErrorAlert(true);
      }
    }
  };

  const handleInputChange = (e) => {
    if (e.target.id === "email") {
      setEmail(e.target.value);
    } else if (e.target.id === "password") {
      setPassword(e.target.value);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-4">
          <div className="container-login">
            <div className="card card-body shadow-lg">
              <h2
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
                Inicio de Sesión
              </h2>
              <img src={Icono} alt="Icono" className="profile" />
              <form onSubmit={signIn}>
                <input
                  type="text"
                  placeholder="Email"
                  className="input-text"
                  id="email"
                  value={email}
                  onChange={handleInputChange}
                />
                <div className="password-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="input-text"
                    id="password"
                    value={password}
                    onChange={handleInputChange}
                  />
                  <span
                    className="password-icon"
                    onClick={toggleShowPassword}
                    style={{
                      position: "absolute",
                      right: "30px",
                      top: "62%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                    }}
                  >
                    {showPassword ? (
                      <EyeInvisibleOutlined />
                    ) : (
                      <EyeOutlined />
                    )}
                  </span>
                </div>
                <button type="submit" className="btn-form">
                  Iniciar Sesión
                </button>
              </form>
              {showEmptyFieldsAlert && (
                <div className="alert alert-danger" role="alert">
                  ¡Por favor, complete todos los campos!
                </div>
              )}
              {showAuthErrorAlert && (
                <div className="alert alert-danger" role="alert">
                  {authErrorMessage}
                </div>
              )}
              <div>
                <button
                  onClick={() => changeView("forgotPassword")}
                  className="btn-switch"
                >
                  Olvidé mi contraseña
                </button>
              </div>
              <div>
                <button
                  onClick={() => changeView("signup")}
                  className="btn-switch"
                >
                  Registrarse
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
              className={`img-fondo ${
                index === currentBackground ? "img-fondo-active" : ""
              }`}
            />
          ))}
          <img src={Escudo} alt="Fondo" className="img-escudo" />
        </div>
      </div>
    </div>
  );
};

export default Login;
