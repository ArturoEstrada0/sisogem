import React, { useState } from "react";
import { Table, Card, Row, Col, Input, Select, Button } from "antd";
import "antd/dist/reset.css";
import { FolderOutlined } from "@ant-design/icons";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const { Search } = Input;
const { Option } = Select;

const data = [
  {
    key: "1",
    nombreArchivo: "Archivo 2021-01.xls",
    fecha: "2021-01-05",
    tipo: "xls",
    tamanio: "123 KB",
    ruta: "C:\\Users\\ASUS\\Desktop\\universidad\\Topicos selectos de ingenieria de software\\recursos\\Manual de Contabilidad Gubernamental.pdf",
  },
  {
    key: "2",
    nombreArchivo: "Archivo 2021-02.csv",
    fecha: "2021-02-15",
    tipo: "csv",
    tamanio: "87 KB",
  },
  {
    key: "3",
    nombreArchivo: "Archivo 2021-03.xls",
    fecha: "2021-03-25",
    tipo: "xls",
    tamanio: "156 KB",
  },
  {
    key: "4",
    nombreArchivo: "Archivo 2022-01.xls",
    fecha: "2022-01-10",
    tipo: "xls",
    tamanio: "110 KB",
  },
  {
    key: "5",
    nombreArchivo: "Archivo 2022-02.csv",
    fecha: "2022-02-20",
    tipo: "csv",
    tamanio: "92 KB",
  },
  {
    key: "6",
    nombreArchivo: "Archivo 2022-03.xls",
    fecha: "2022-03-30",
    tipo: "xls",
    tamanio: "167 KB",
  },
  {
    key: "7",
    nombreArchivo: "Archivo 2023-01.xlsx",
    fecha: "2023-01-10",
    tipo: "xlsx",
    tamanio: "145 KB",
  },
  {
    key: "8",
    nombreArchivo: "Archivo 2023-02.csv",
    fecha: "2023-02-18",
    tipo: "csv",
    tamanio: "102 KB",
  },
];

const columns = [
  {
    title: "Nombre de Archivo",
    dataIndex: "nombreArchivo",
    key: "nombreArchivo",
  },
  {
    title: "Fecha",
    dataIndex: "fecha",
    key: "fecha",
  },
  {
    title: "Tipo",
    dataIndex: "tipo",
    key: "tipo",
  },
  {
    title: "Tamaño",
    dataIndex: "tamanio",
    key: "tamanio",
  },
];

function Repositorio() {
  const [yearFilter, setYearFilter] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);

  const handleChangeYearFilter = (value) => {
    setYearFilter(value);
    setSelectedYear(value);
  };

  const handleSearch = (value) => {
    setSearchText(value.toLowerCase());
  };

  const handleFilterChange = (value) => {
    setSelectedFilters(value);
  };

  const years = [...new Set(data.map((item) => item.fecha.split("-")[0]))];

  const filteredData = data.filter(
    (item) =>
      (yearFilter ? item.fecha.includes(yearFilter) : true) &&
      (searchText
        ? item.nombreArchivo.toLowerCase().includes(searchText)
        : true) &&
      (selectedFilters.length > 0
        ? selectedFilters.includes(item.tipo)
        : true)
  );

  // Función para crear y descargar el archivo ZIP
  const exportToZIP = () => {
    const zip = new JSZip();
    const csvData = filteredData.map((item) => ({
      "Nombre de Archivo": item.nombreArchivo,
      Fecha: item.fecha,
      Tipo: item.tipo,
      Tamaño: item.tamanio,
    }));

    // Agrega un archivo CSV con todos los datos al ZIP
    //zip.file("data.csv", CSVLink.createCSV(csvData, { headers: csvData[0] }));

    // Crea y descarga el archivo ZIP
    zip.generateAsync({ type: "blob" }).then((content) => {
      const zipName = "archivos.zip"; // Cambia el nombre del archivo ZIP si es necesario
      saveAs(content, zipName);
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ textAlign: "center" }}>Repositorio de Archivos</h2>
      <Row gutter={[16, 16]}>
        {years.map((year) => (
          <Col span={8} key={year}>
            <Card
              onClick={() => handleChangeYearFilter(year)}
              hoverable
              style={{
                cursor: "pointer",
                margin: "10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                border: selectedYear === year ? "2px solid #F1CDD3" : "2px solid transparent",
              }}
            >
              <FolderOutlined style={{ fontSize: 48 }} />
              <h3 style={{ marginTop: "10px" }}>{year}</h3>
            </Card>
          </Col>
        ))}
      </Row>
      {yearFilter && (
        <div style={{ marginTop: "20px", marginLeft: "10px" }}>
          <h3>Archivos de {yearFilter}</h3>
          <div>
            <Search
              placeholder="Buscar por nombre de archivo"
              onSearch={handleSearch}
              style={{ width: 300, marginBottom: "10px" }}
            />
          </div>
          <Select
            mode="multiple"
            placeholder="Filtrar por tipo"
            style={{ width: 200, marginBottom: "10px" }}
            onChange={handleFilterChange}
          >
            <Option value="xls">xls</Option>
            <Option value="csv">csv</Option>
            <Option value="xlsx">xlsx</Option>
          </Select>
          <Button onClick={exportToZIP}>Exportar a ZIP</Button> {/* Botón para exportar a ZIP */}
          <Table dataSource={filteredData} columns={columns} />
        </div>
      )}
    </div>
  );
}

export default Repositorio;
