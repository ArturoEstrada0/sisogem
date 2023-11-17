import React, { useState } from "react";
import { Typography, Input, Button, message, Select } from "antd";
import { SendOutlined, MailOutlined } from "@ant-design/icons";
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
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "70%",
    margin: "0 auto",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    background: "#cccccc40",
  },
  titleContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "16px",
  },
  mailIcon: {
    marginRight: "8px",
    marginTop: "-10px", // Ajusta este valor para subir o bajar el ícono
    fontSize: "40px",
    color: "#6A0F49",
  },
  input: {
    width: "100%",
    marginBottom: "16px",
    border: "1px solid #cccccc40",
  },
  select: {
    width: "100%",
    marginBottom: "16px",
    border: "1px solid #cccccc40",
  },
  submitButton: {
    width: "30%",
    background: "#6A0F49",
    border: "none",
    fontSize: "14px",
    fontWeight: "bold",
    color: "white",
    marginTop: "16px",
  },
  infoText: {
    textAlign: "center",
    marginTop: "30px",
    fontSize: "16px",
    color: "#6A0F49",
  },
};

function BuzonReportes() {
  const [title, setTitle] = useState("");
  const [report, setReport] = useState("");
  const [category, setCategory] = useState("");
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [isReportFocused, setIsReportFocused] = useState(false);
  const [isCategoryFocused, setIsCategoryFocused] = useState(false);

  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleReportChange = (e) => setReport(e.target.value);
  const handleCategoryChange = (value) => setCategory(value);

  const handleSubmit = () => {
    if (!title || !report || !category) {
      message.error("Por favor, completa todos los campos antes de enviar el reporte.");
    } else {
      setTimeout(() => {
        setTitle("");
        setReport("");
        setCategory("");
        message.success("¡Gracias por tu reporte! Lo hemos recibido.");
      }, 1500);
    }
  };

  return (
    <>
      <div style={styles.container}>
        <div style={styles.titleContainer}>
          <MailOutlined style={styles.mailIcon} />
          <Typography.Title level={2} style={{ color: "#6A0F49" }}>
            Buzón de Reportes
          </Typography.Title>
        </div>
        <Input
          placeholder="Título del Reporte"
          value={title}
          onChange={handleTitleChange}
          onFocus={() => setIsTitleFocused(true)}
          onBlur={() => setIsTitleFocused(false)}
          style={{
            ...styles.input,
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
            ...styles.input,
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
      <div style={{ textAlign: "center" }}>
        <h1 style={styles.infoText}>
          Queremos que sepas que tus reportes son completamente anónimos.<br/>
          Tu privacidad es nuestra prioridad y hemos implementado medidas para garantizar que tu identidad esté protegida.<br/>
          Puedes compartir tus inquietudes con confianza, ya que solo utilizaremos la información para abordar y resolver los problemas.<br/>
          Agradecemos tu colaboración y confianza.<br/>
          Saludos Coordiales: SISOGEM.
        </h1>
      </div>
    </>
  );
}

export default BuzonReportes;
