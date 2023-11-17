import { Auth } from "aws-amplify";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import "./Login.css";
import Fondo from "../assets/img/morelia.jpg";
import Icono from "../assets/img/logo_mich.png";
import Escudo from "../assets/img/image.png";
import { useState } from "react";
import { UserService } from "../services/UserService";
import { useContext } from "react";
import { UserRoleContext } from '../context/UserRoleContext';

const Login = ({ setUser, setRole, changeView }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEmptyFieldsAlert, setShowEmptyFieldsAlert] = useState(false);
  const [showAuthErrorAlert, setShowAuthErrorAlert] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { setCurrentUser } = useContext(UserRoleContext);

  const signIn = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      setShowEmptyFieldsAlert(true);
      return;
    }

    try {
      const user = await Auth.signIn(email, password);
      const { email: emailCognito } = user.attributes;
      const response = await UserService.getUserInfoByEmail(emailCognito);
      console.log(response);
      setRole(response.roles);
      setCurrentUser(response);
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
                  <span className="password-icon" onClick={toggleShowPassword}>
                    {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
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
          <img src={Fondo} alt="Fondo" className="img-fondo" />
          <img src={Escudo} alt="Fondo" className="img-escudo" />
        </div>
      </div>
    </div>
  );
};

export default Login;
