import "./Login.css";
import Fondo from "../assets/img/mich2.png";
import Icono from "../assets/img/logo_mich.png";
import { Auth } from "aws-amplify";
import { UserService } from "../services/UserService";

const Login = ({ setUser, setRole, changeView }) => { // Asegúrate de recibir changeView como una prop
  const signIn = async (event) => {
    event.preventDefault(); // para prevenir la recarga de la página
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const user = await Auth.signIn(email, password);
      const { email: emailCognito } = user.attributes
      const response = await UserService.getUserInfoByEmail(emailCognito)
      setRole(response.roles)
      setUser(user); // Actualizar el estado del usuario en el componente padre
    } catch (error) {
      console.log("error signing in", error);
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-4">
          <div className="container-login">
            <div className="card card-body shadow-lg">
              <img src={Icono} alt="Icono" className="profile" />
              <form onSubmit={signIn}>
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
                  Iniciar Sesión
                </button>
              </form>
              <div>
                {/* Usar changeView para navegar a otras vistas */}
                <button onClick={() => changeView('forgotPassword')} className='btn-switch'>Olvidé mi contraseña</button>
                <button onClick={() => changeView('signup')} className='btn-switch'>Registrarse</button>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <img src={Fondo} alt="Fondo" className="img-fondo" />
        </div>
      </div>
    </div>
  );
};

export default Login;
