import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Link,
  Grid,
  Typography,
} from "@mui/material";
import { Email, Lock } from "@mui/icons-material";
import { useNavigate } from "react-router-dom"; // Importa useNavigate para la navegación

const styles = {
  container: {
    backgroundColor: "#6A0F49",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  title: {
    color: "#fff",
    marginBottom: "1.5rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    alignItems: "center",
  },
  textField: {
    backgroundColor: "white",
    borderRadius: "8px",
    width: "100%",
    marginBottom: "1rem",
  },
  inputIcon: {
    marginRight: "0.5rem",
    verticalAlign: "middle",
  },
  loginButton: {
    backgroundColor: "#6D807F",
    color: "white",
    "&:hover": {
      backgroundColor: "#FF91A9",
    },
    width: "100%",
  },
  forgotPassword: {
    marginTop: "1rem",
  },
  forgotPasswordLink: {
    color: "white",
    textDecoration: "none",
  },
  label: {
    color: "#fff",
  },
  root: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
};

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Obtiene la función de navegación
  const navigate = useNavigate();

  function handleLogin() {
    setEmailError("");
    setPasswordError("");

    if (email.trim() === "") {
      setEmailError("Por favor, ingrese un correo electrónico.");
      return;
    }

    if (password.trim() === "") {
      setPasswordError("Por favor, ingrese una contraseña.");
      return;
    }

    // Lógica de inicio de sesión
    // Después de un inicio de sesión exitoso, redirige al usuario al Dashboard
    navigate("/dashboard");
  }

  return (
    <div style={styles.root}>
      <Container maxWidth="xs" sx={styles.container}>
        <Typography variant="h4" sx={styles.title}>
          Iniciar Sesión
        </Typography>
        <form sx={styles.form}>
          <TextField
            label="Correo Electrónico"
            variant="outlined"
            InputProps={{
              startAdornment: <Email sx={styles.inputIcon} />,
              sx: {
                "& input": { backgroundColor: "white" },
                "& label": { sx: { color: "#6A0F49" } },
              },
            }}
            sx={styles.textField}
            fullWidth
            onChange={(e) => setEmail(e.target.value)}
            error={emailError !== ""}
            helperText={emailError}
          />
          <TextField
            label="Contraseña"
            type="password"
            variant="outlined"
            InputProps={{
              startAdornment: <Lock sx={styles.inputIcon} />,
              sx: {
                "& input": { backgroundColor: "white" },
                "& label": { sx: { color: "#6A0F49" } },
              },
            }}
            sx={styles.textField}
            fullWidth
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError !== ""}
            helperText={passwordError}
          />

          <Button
            variant="contained"
            sx={styles.loginButton}
            onClick={handleLogin}
          >
            Ingresar
          </Button>
        </form>
        <Grid container justifyContent="flex-end">
          <Grid item sx={styles.forgotPassword}>
            <Link to="/entidad" color="textPrimary" sx={styles.forgotPasswordLink}>
              ¿Olvidaste tu contraseña?
            </Link>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default Login;
