import React, { useState } from "react";
import { Container, Typography, Button, Grid, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { DownloadOutlined, CalendarOutlined, BookOutlined } from "@ant-design/icons";
import { Button as AntButton, Radio, Space } from 'antd';

function Indicadores() {
  const [formatoArchivo, setFormatoArchivo] = useState("xls");
  const [year, setYear] = useState(new Date().getFullYear());
  const [trimestre, setTrimestre] = useState("Q1");
  const [generating, setGenerating] = useState(false);

  const handleGenerateReport = () => {
    setGenerating(true);

    setTimeout(() => {
      setGenerating(false);
    }, 2000);
  };

  return (
    <Container>
      <Typography variant="h4" align="center" style={{ marginBottom: 16 }}>
        Indicadores
      </Typography>
      <p style={{ marginBottom: 32 }}>Selecciona las opciones y genera el informe de indicadores:</p>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel htmlFor="formato-archivo">Formato de Archivo</InputLabel>
            <Select
              label="Formato de Archivo"
              id="formato-archivo"
              value={formatoArchivo}
              onChange={(e) => setFormatoArchivo(e.target.value)}
            >
              <MenuItem value="xls">.xls</MenuItem>
              <MenuItem value="csv">.csv</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel htmlFor="anio">Año</InputLabel>
            <Select
              label="Año"
              id="anio"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <MenuItem value={new Date().getFullYear()}>Año Actual</MenuItem>
              <MenuItem value={new Date().getFullYear() - 1}>Año Anterior</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel htmlFor="trimestre">Trimestre</InputLabel>
            <Select
              label="Trimestre"
              id="trimestre"
              value={trimestre}
              onChange={(e) => setTrimestre(e.target.value)}
            >
              <MenuItem value="Q1">Q1</MenuItem>
              <MenuItem value="Q2">Q2</MenuItem>
              <MenuItem value="Q3">Q3</MenuItem>
              <MenuItem value="Q4">Q4</MenuItem>
              <MenuItem value="Todo el Historial">Todo el Historial</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Button
        variant="contained"
        color="primary"
        startIcon={<CloudDownloadIcon />}
        onClick={handleGenerateReport}
        disabled={generating}
        style={{ marginTop: 32 }}
      >
        {generating ? "Generando..." : "Generar Informe"}
      </Button>
      {generating && <p>Generando informe, por favor espera...</p>}
      <p style={{ marginTop: 32 }}>Alternativamente, puedes usar estos botones:</p>
      <Space size={16} style={{ marginTop: 16 }}>
        <AntButton
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleGenerateReport}
          disabled={generating}
        >
          {generating ? "Generando..." : "Descargar .xls"}
        </AntButton>
        <AntButton
          type="primary"
          icon={<CalendarOutlined />}
          onClick={handleGenerateReport}
          disabled={generating}
        >
          {generating ? "Generando..." : "Descargar .csv"}
        </AntButton>
      </Space>
    </Container>
  );
}

export default Indicadores;
