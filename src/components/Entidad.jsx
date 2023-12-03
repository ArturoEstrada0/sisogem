import React, { useState } from "react";
import {
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  Tooltip,
} from "@mui/material";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import BusinessIcon from "@mui/icons-material/Business";
import DoneIcon from "@mui/icons-material/Done";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContext } from "react";
import { UserRoleContext } from "../context/UserRoleContext";
import { OrganismoContext } from "../context/OrganismoContext";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Entidad = () => {

  const { currentUser } = useContext(UserRoleContext);
  const { organismo, setOrganismo } = useContext(OrganismoContext);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleCloseDialog = () => {
    if (confirmed) {
      setTimeout(() => {
        setOpenDialog(false);
      }, 1000);
    } else {
      setOpenDialog(false);
    }
  };
  return (
    <Grid
      container
      spacing={3}
      justifyContent="center"
      className="grid-container"
    >
      <Grid item xs={12}>
        <Typography variant="h4" align="center">
          <BusinessIcon fontSize="large" />
          <p>{currentUser?.name}</p>
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl variant="outlined" fullWidth>
          <InputLabel id="organismo-label">Seleccione un organismo</InputLabel>
          <Select
            labelId="organismo-label"
            id="organismo"
            value={organismo}
            onChange={(event) => setOrganismo(event.target.value)}
            label="Seleccione un organismo"
          >
            {currentUser?.organismo.map((organismo) => (
              <MenuItem value={organismo.code} key={organismo._id}>
                {organismo.name}
              </MenuItem>
            ))}

            {/* <MenuItem value="Servicios de Salud de Michoacán">
              Servicios de Salud de Michoacán
            </MenuItem>
            <MenuItem value="Sistema Integral de Financiamiento para el Desarrollo de Michoacán (SI Financia)">
              Sistema Integral de Financiamiento para el Desarrollo de Michoacán
              (SI Financia)
            </MenuItem>
            <MenuItem value="Sistema Michoacano de Radio y Televisión SMRyTV">
              Sistema Michoacano de Radio y Televisión SMRyTV
            </MenuItem>
            <MenuItem value="Sistema para el Desarrollo Integral de la Familia, Michoacán">
              Sistema para el Desarrollo Integral de la Familia, Michoacán
            </MenuItem>
            <MenuItem value="Telebachillerato Michoacán">
              Telebachillerato Michoacán
            </MenuItem>
            <MenuItem value="Universidad de la Ciénega del Estado de Michoacán de Ocampo (UCEMICH)">
              Universidad de la Ciénega del Estado de Michoacán de Ocampo
              (UCEMICH)
            </MenuItem>
            <MenuItem value="Universidad Intercultural Indígena del Estado de Michoacán">
              Universidad Intercultural Indígena del Estado de Michoacán
            </MenuItem>
            <MenuItem value="Universidad Politécnica de Lázaro Cárdenas Michoacán">
              Universidad Politécnica de Lázaro Cárdenas Michoacán
            </MenuItem>
            <MenuItem value="Universidad Politécnica de Uruapan">
              Universidad Politécnica de Uruapan
            </MenuItem>
            <MenuItem value="Universidad Tecnológica de Morelia (UTM)">
              Universidad Tecnológica de Morelia (UTM)
            </MenuItem>
            <MenuItem value="Universidad Tecnológica del Oriente de Michoacán (UTOM)">
              Universidad Tecnológica del Oriente de Michoacán (UTOM)
            </MenuItem>
            <MenuItem value="Universidad Virtual de Michoacán (UNIVIM)">
              Universidad Virtual de Michoacán (UNIVIM)
            </MenuItem>
            <MenuItem value="Compañía Inmobiliaria Fomento Turistico de Michoacán SA de CV">
              Compañía Inmobiliaria Fomento Turistico de Michoacán SA de CV
            </MenuItem> */}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Tooltip title="Firma Electrónica">
          <Button
            variant="contained"
            style={{ backgroundColor: "#701e45", color: "white" }}
            fullWidth
            onClick={() => {
              if (organismo) {
                setOpenDialog(true);
              } else {
                toast.error(
                  "Por favor, seleccione un organismo antes de agregar la firma."
                );
              }
            }}
          >
            <FingerprintIcon />
            Agregar Firma Electrónica
          </Button>
        </Tooltip>
      </Grid>

      <Dialog
        open={openDialog}
        TransitionComponent={Transition}
        onClose={handleCloseDialog}
        aria-labelledby="dialog-title"
        PaperProps={{
          style: {
            width: "100%",
          },
        }}
      >
        <DialogTitle id="dialog-title">Confirmación</DialogTitle>
        <DialogContent>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {confirmed ? (
              <>
                <DoneIcon style={{ fontSize: 48, color: "green" }} />
                <Typography variant="body1">
                  Firma electrónica agregada
                </Typography>
              </>
            ) : (
              <Typography variant="body1">
                ¿Está seguro de que desea agregar la firma electrónica?
              </Typography>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Tooltip title="Cerrar">
            <Button
              onClick={handleCloseDialog}
              color="primary"
              style={{ backgroundColor: "#7c858c", color: "white" }}
            >
              Cerrar
            </Button>
          </Tooltip>
          {!confirmed && (
            <Tooltip title="Confirmar">
              <Button
                onClick={() => {
                  setConfirmed(true);
                  setTimeout(() => {
                    setOpenDialog(false);
                  }, 2500);
                }}
                color="primary"
                style={{ backgroundColor: "#701e45", color: "white" }}
              >
                Confirmar
              </Button>
            </Tooltip>
          )}
        </DialogActions>
      </Dialog>

      <ToastContainer position="bottom-right" autoClose={2000} />
    </Grid>
  );
};

export default Entidad;
