import React, { useState } from "react";
import { Table, Typography, Button, Space, Input, Select } from 'antd';
import { CloudDownloadOutlined, DownloadOutlined, CalendarOutlined } from "@ant-design/icons";

const { Column } = Table;

const EditableCell = ({ editing, dataIndex, title, inputType, record, index, children, ...restProps }) => {
  let inputNode;

  if (dataIndex === 'col1') {
    // La primera columna no es editable
    inputNode = <div>{children}</div>;
  } else {
    inputNode = <Input />;
  }

  return <td {...restProps}>{inputNode}</td>;
};

function Indicadores() {
  const [formatoArchivo, setFormatoArchivo] = useState("xls");
  const [year, setYear] = useState(new Date().getFullYear());
  const [trimestre, setTrimestre] = useState("Q1");
  const [generating, setGenerating] = useState(false);
  const [editingKey, setEditingKey] = useState('');

  const isEditing = (record) => record.key === editingKey;

  const edit = (key) => {
    setEditingKey(key);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = (form, key) => {
    form.validateFields().then((row) => {
      // Aquí puedes manejar la lógica de guardar los datos editados
      console.log(row);

      setEditingKey('');
    });
  };

  const handleGenerateReport = () => {
    setGenerating(true);

    setTimeout(() => {
      setGenerating(false);
    }, 2000);
  };

  // Datos de ejemplo para la tabla
  const data = Array.from({ length: 5 }, (_, index) => ({
    key: index + 1,
    col1: `Dato ${index + 1}-1 (no editable)`,
    col2: `Dato ${index + 1}-2`,
    col3: `Dato ${index + 1}-3`,
    col4: `Dato ${index + 1}-4`,
    col5: `Dato ${index + 1}-5`,
    col6: `Dato ${index + 1}-6`,
  }));

  return (
    <div>
      <Typography variant="h4" align="center" style={{ marginBottom: 16 }}>
        Indicadores
      </Typography>
      <p style={{ marginBottom: 32 }}>Selecciona las opciones y genera el informe de indicadores:</p>
      {/* Agrega la tabla de Ant Design */}
      <Table dataSource={data} bordered>
        <Column
          title="Columna 1 (no editable)"
          dataIndex="col1"
          key="col1"
          width="25%"
          editable={false}
        />
        <Column
          title="Columna 2"
          dataIndex="col2"
          key="col2"
          width="15%"
          editable={true}
          render={(text, record) => (
            <span>
              {text}
              {isEditing(record) ? (
                <Button type="link" onClick={() => save(record.form, record.key)}>
                  Guardar
                </Button>
              ) : (
                <Button type="link" disabled={editingKey !== ''} onClick={() => edit(record.key)}>
                  Editar
                </Button>
              )}
            </span>
          )}
        />
        <Column
          title="Columna 3"
          dataIndex="col3"
          key="col3"
          width="15%"
          editable={true}
          render={(text, record) => (
            <span>
              {text}
              {isEditing(record) ? (
                <Button type="link" onClick={() => save(record.form, record.key)}>
                  Guardar
                </Button>
              ) : (
                <Button type="link" disabled={editingKey !== ''} onClick={() => edit(record.key)}>
                  Editar
                </Button>
              )}
            </span>
          )}
        />
        <Column
          title="Columna 4"
          dataIndex="col4"
          key="col4"
          width="15%"
          editable={true}
          render={(text, record) => (
            <span>
              {text}
              {isEditing(record) ? (
                <Button type="link" onClick={() => save(record.form, record.key)}>
                  Guardar
                </Button>
              ) : (
                <Button type="link" disabled={editingKey !== ''} onClick={() => edit(record.key)}>
                  Editar
                </Button>
              )}
            </span>
          )}
        />
        <Column
          title="Columna 5"
          dataIndex="col5"
          key="col5"
          width="15%"
          editable={true}
          render={(text, record) => (
            <span>
              {text}
              {isEditing(record) ? (
                <Button type="link" onClick={() => save(record.form, record.key)}>
                  Guardar
                </Button>
              ) : (
                <Button type="link" disabled={editingKey !== ''} onClick={() => edit(record.key)}>
                  Editar
                </Button>
              )}
            </span>
          )}
        />
        <Column
          title="Columna 6"
          dataIndex="col6"
          key="col6"
          width="15%"
          editable={true}
          render={(text, record) => (
            <span>
              {text}
              {isEditing(record) ? (
                <Button type="link" onClick={() => save(record.form, record.key)}>
                  Guardar
                </Button>
              ) : (
                <Button type="link" disabled={editingKey !== ''} onClick={() => edit(record.key)}>
                  Editar
                </Button>
              )}
            </span>
          )}
        />
      </Table>
      <Button
        variant="contained"
        color="primary"
        icon={<CloudDownloadOutlined />}
        onClick={handleGenerateReport}
        disabled={generating}
        style={{ marginTop: 32 }}
      >
        {generating ? "Generando..." : "Generar Informe"}
      </Button>
      {generating && <p>Generando informe, por favor espera...</p>}
      <p style={{ marginTop: 32 }}>Alternativamente, puedes usar estos botones:</p>
      <Space size={16} style={{ marginTop: 16 }}>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleGenerateReport}
          disabled={generating}
        >
          {generating ? "Generando..." : "Descargar .xls"}
        </Button>
        <Button
          type="primary"
          icon={<CalendarOutlined />}
          onClick={handleGenerateReport}
          disabled={generating}
        >
          {generating ? "Generando..." : "Descargar .csv"}
        </Button>
      </Space>
    </div>
  );
}

export default Indicadores;
