import React, { useState } from "react";
import { Typography, Input, Button, message, Select } from "antd";
import { SendOutlined } from "@ant-design/icons";
import "./BuzonReportes.css";

const { TextArea } = Input;
const { Option } = Select;

const categories = [
  "Malfuncionamiento de la página",
  "Marco normativo",
  "Organos del gobierno",
  "Sesiones programadas",
  "Sesion en progreso",
  "Archivo",
  "Formatos",
  "Indicadores",
  "Repositorio",
  "Login",
];

const styles = {
  container: {
    width: "100%",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    background: "linear-gradient(to bottom, #F7FAFC, #E9F1F7)",
  },
  titleInput: {
    width: "100%",
    marginBottom: "16px",
  },
  reportInput: {
    width: "100%",
    marginBottom: "16px",
  },
  select: {
    width: "100%",
    marginBottom: "16px",
  },
  submitButton: {
    width: "100%",
    background: "#701e45",
    border: "none",
    fontSize: "16px",
    fontWeight: "bold",
    color: "white",
  },
};

function BuzonReportes() {
  const [title, setTitle] = useState("");
  const [report, setReport] = useState("");
  const [category, setCategory] = useState("");
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [isReportFocused, setIsReportFocused] = useState(false);
  const [isCategoryFocused, setIsCategoryFocused] = useState(false);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleReportChange = (e) => {
    setReport(e.target.value);
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
  };

  const handleSubmit = () => {
    setTimeout(() => {
      setTitle("");
      setReport("");
      setCategory("");
      message.success("¡Gracias por tu reporte! Lo hemos recibido.");
    }, 1500);
  };

  return (
    <div style={styles.container}>
      <Typography.Title level={2} style={{ marginBottom: "16px" }}>
        Buzón de Reportes
      </Typography.Title>
      <Input
        placeholder="Título del Reporte"
        value={title}
        onChange={handleTitleChange}
        onFocus={() => setIsTitleFocused(true)}
        onBlur={() => setIsTitleFocused(false)}
        style={{
          ...styles.titleInput,
          border: isTitleFocused ? "2px solid #F1CDD3" : "2px solid #d9d9d9",
        }}
      />
      <Select
        placeholder="Selecciona la categoría de tu reporte"
        value={category || undefined}
        onChange={handleCategoryChange}
        onFocus={() => setIsCategoryFocused(true)}
        onBlur={() => setIsCategoryFocused(false)}
        style={{
          ...styles.select,
          border: isCategoryFocused ? "2px solid #F1CDD3" : "2px solid #d9d9d9",
        }}
        dropdownClassName="custom-dropdown" // Agregar esta línea para el estilo personalizado del menú desplegable
      >
        {categories.map((item) => (
          <Option key={item} value={item}>
            {item}
          </Option>
        ))}
      </Select>
      <TextArea
        rows={6}
        placeholder="Ingresa tu reporte"
        value={report}
        onChange={handleReportChange}
        onFocus={() => setIsReportFocused(true)}
        onBlur={() => setIsReportFocused(false)}
        style={{
          ...styles.reportInput,
          border: isReportFocused ? "2px solid #F1CDD3" : "2px solid #d9d9d9",
        }}
      />
      <Button
        icon={<SendOutlined />}
        onClick={handleSubmit}
        style={styles.submitButton}
      >
        Enviar Reporte
      </Button>
    </div>
  );
}

export default BuzonReportes;
