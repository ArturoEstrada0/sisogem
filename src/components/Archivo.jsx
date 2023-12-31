import React, { useState } from "react";
import {
  Container,
  Button,
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  Paper,
} from "@mui/material";
import { styled } from "@mui/system";
import EventIcon from "@mui/icons-material/Event";
import MenuBookIcon from "@mui/icons-material/MenuBook";

const HeaderTypography = styled(Typography)({
  textAlign: "center",
  fontFamily: "Gibson, sans-serif",
  color: "#6A0F49",
  fontSize: "32px",
  margin: "16px 0",
  borderBottom: "2px solid #6A0F49",
  paddingBottom: "8px",
  transition: "color 0.3s",
  "&:hover": {
    color: "#6A0F49",
  },
});

const ButtonContainer = styled(Box)({
  display: "flex",
  justifyContent: "center",
  marginBottom: "16px",
});

const CustomButton = styled(Button)(({ selected }) => ({
  margin: "0 16px",
  backgroundColor: selected ? "#6A0F49" : "#7c858c",
  color: "white",
  fontFamily: "Gibson, sans-serif",
  transition: "background-color 0.3s",
  "&:hover": {
    backgroundColor: "#6A0F49",
  },
}));

const InfoCard = styled(Card)({
  textAlign: "center",
  padding: "16px",
  fontFamily: "Gibson, sans-serif",
  backgroundColor: "#f1f1f1",
  marginBottom: "16px",
  transition: "transform 0.3s",
  "&:hover": {
    transform: "scale(1.02)",
  },
});

const TableGrid = styled(Grid)({
  display: "flex",
  justifyContent: "space-between",
  backgroundColor: "#6A0F49",
  color: "white",
  padding: "8px",
  fontFamily: "Gibson, sans-serif",
  borderRadius: "8px 8px 0 0",
});

const DataRowGrid = styled(Grid)({
  display: "flex",
  justifyContent: "space-between",
  backgroundColor: "#f1f1f1",
  padding: "16px 8px",
  marginBottom: "16px",
  alignItems: "center",
  transition: "background-color 0.3s",
  borderRadius: "0 0 8px 8px",
  boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
  "&:hover": {
    backgroundColor: "#e3e3e3",
  },
});

const Archivo = () => {
  const [selectedFileType, setSelectedFileType] = useState(null);

  const handleFileTypeClick = (type) => {
    setSelectedFileType(type);
  };

  return (
    <Container>
      <HeaderTypography variant="h4">Archivo</HeaderTypography>

      <InfoCard>
        <CardContent>
          <Typography variant="body1">
            Se muestran las actas y documentos relativos a las sesiones
            celebradas por el órgano de gobierno.
          </Typography>
        </CardContent>
      </InfoCard>
      <TableGrid container>
        <Grid item xs={4}>
          <Typography variant="h6">Fecha registro</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="h6">Sesión</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="h6">Adjuntos de la sesión</Typography>
        </Grid>
      </TableGrid>
      <DataRowGrid>
        <Grid item xs={4}>
          2022-11-30
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">Segunda Ordinaria</Typography>
          <Typography variant="body2">Fecha celebrada: 2022-12-01</Typography>
          <Typography variant="body2">Hora: 12:23</Typography>
          <Typography variant="body2">Lugar: Fewfef</Typography>
        </Grid>
        <Grid item xs={4}>
          <CustomButton
            variant="contained"
            style={{ backgroundColor: "#6A0F49", color: "white" }}
          >
            <EventIcon style={{ marginRight: "8px" }} />
            Orden del Día
          </CustomButton>
          <CustomButton
            variant="contained"
            style={{ backgroundColor: "#6A0F49", color: "white" }}
          >
            <MenuBookIcon style={{ marginRight: "8px" }} />
            Cuadernillo de Trabajo
          </CustomButton>
        </Grid>
      </DataRowGrid>
    </Container>
  );
};

export default Archivo;
