import React, { useState } from "react";
import { Table, Typography, Button, Space, Input, Form, Tabs } from 'antd';
import { CloudDownloadOutlined, DownloadOutlined, CalendarOutlined, BarChartOutlined } from "@ant-design/icons";

const { Column } = Table;
const { TabPane } = Tabs;

const EditableCell = ({ editing, dataIndex, title, inputType, record, index, children, ...restProps }) => {
  let inputNode;

  if (dataIndex === 'col1') {
    // La primera columna no es editable
    inputNode = <div>{children}</div>;
  } else {
    inputNode = editing ? (
      <Form.Item
        name={dataIndex}
        style={{ margin: 0 }}
        rules={[
          {
            required: true,
            message: `Por favor, ingresa ${dataIndex}.`,
          },
        ]}
      >
        <Input />
      </Form.Item>
    ) : (
      <div onClick={restProps.onClick}>{children}</div>
    );
  }

  return <td {...restProps}>{inputNode}</td>;
};

function Indicadores() {
  const [formatoArchivo, setFormatoArchivo] = useState("xls");
  const [year, setYear] = useState(new Date().getFullYear());
  const [trimestre, setTrimestre] = useState("Q1");
  const [generating, setGenerating] = useState(false);
  const [data, setData] = useState(Array.from({ length: 5 }, (_, index) => ({
    key: index + 1,
    col1: `Dato ${index + 1}-1`,
    col2: `Dato ${index + 1}-2`,
    col3: `Dato ${index + 1}-3`,
    col4: `Dato ${index + 1}-4`,
    col5: `Dato ${index + 1}-5`,
    col6: `Dato ${index + 1}-6`,
  })));
  const [editingKey, setEditingKey] = useState(null);
  const [editingColumn, setEditingColumn] = useState(null);
  const [form] = Form.useForm(); // Utilizar el nuevo API de Hooks de antd Form

  const isEditing = (record, dataIndex) => record.key === editingKey && dataIndex === editingColumn;

  const edit = (key, dataIndex) => {
    setEditingKey(key);
    setEditingColumn(dataIndex);
  };

  const save = async (key, dataIndex) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setData(newData);
        setEditingKey(null);
        setEditingColumn(null);
      } else {
        setEditingKey(null);
        setEditingColumn(null);
      }
    } catch (error) {
      console.error("Error al validar campos del formulario:", error);
    }
  };

  const handleGenerateReport = () => {
    setGenerating(true);

    setTimeout(() => {
      setGenerating(false);
    }, 2000);
  };

  const columns = [
    {
      title: <div style={{ color: '#701e45' }}>Periodo</div>,
      dataIndex: "col1",
      key: "col1",
      width: "25%",
      render: (text, record) => <div>{text}</div>,
    },
    {
      title:  <div style={{ color: '#701e45' }}>Meta del periodo</div>,
      dataIndex: "col2",
      key: "col2",
      width: "15%",
      render: (text, record) => renderCell(text, record, "col2"),
    },
    {
      title:  <div style={{ color: '#701e45' }}>Logrado en el periodo</div>,
      dataIndex: "col3",
      key: "col3",
      width: "15%",
      render: (text, record) => renderCell(text, record, "col3"),
    },
    {
      title:  <div style={{ color: '#701e45' }}>Proyectando para el periodo en $</div>,
      dataIndex: "col4",
      key: "col4",
      width: "15%",
      render: (text, record) => renderCell(text, record, "col4"),
    },
    {
      title:  <div style={{ color: '#701e45' }}>Ingresado al corte en $</div>,
      dataIndex: "col5",
      key: "col5",
      width: "15%",
      render: (text, record) => renderCell(text, record, "col5"),
    },
    {
      title:  <div style={{ color: '#701e45' }}>Justificacion de las diferencias en metas y/o $</div>,
      dataIndex: "col6",
      key: "col6",
      width: "15%",
      render: (text, record) => renderCell(text, record, "col6"),
    },
  ];

  const renderCell = (text, record, dataIndex) => {
    const editable = isEditing(record, dataIndex);
    return editable ? (
      <Form.Item
        name={dataIndex}
        style={{ margin: 0 }}
        rules={[
          {
            required: true,
            message: `Por favor, ingresa ${dataIndex}.`,
          },
        ]}
      >
        <Input
          onPressEnter={() => save(record.key, dataIndex)}
          onBlur={() => save(record.key, dataIndex)}
        />
      </Form.Item>
    ) : (
      <div onClick={() => edit(record.key, dataIndex)}>{text}</div>
    );
  };

  // Nueva sección con otra tabla similar pero con 8 columnas
  const [data2, setData2] = useState(
    Array.from({ length: 5 }, (_, index) => ({
      key: index + 1,
      col1: `Dato ${index + 1}-1`,
      col2: `Dato ${index + 1}-2`,
      col3: `Dato ${index + 1}-3`,
      col4: `Dato ${index + 1}-4`,
      col5: `Dato ${index + 1}-5`,
      col6: `Dato ${index + 1}-6`,
      col7: `Dato ${index + 1}-7`,
      col8: `Dato ${index + 1}-8`,
    }))
  );
  const [editingKey2, setEditingKey2] = useState(null);
  const [editingColumn2, setEditingColumn2] = useState(null);
  const [form2] = Form.useForm();
  
  const isEditing2 = (record, dataIndex) =>
    record.key === editingKey2 && dataIndex === editingColumn2;
  
  const edit2 = (key, dataIndex) => {
    setEditingKey2(key);
    setEditingColumn2(dataIndex);
  };
  
  const save2 = async (key, dataIndex) => {
    try {
      const row = await form2.validateFields();
      const newData = [...data2];
      const index = newData.findIndex((item) => key === item.key);
  
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setData2(newData);
        setEditingKey2(null);
        setEditingColumn2(null);
      } else {
        setEditingKey2(null);
        setEditingColumn2(null);
      }
    } catch (error) {
      console.error("Error al validar campos del formulario:", error);
    }
  };
  
  const columns2 = [
    {
      title:  <div style={{ color: '#701e45' }}>Nombre del Programa</div>,
      dataIndex: "col1",
      key: "col1",
      width: "12.5%",
      render: (text, record) => renderCell2(text, record, "col1"),
    },
    {
      title:  <div style={{ color: '#701e45' }}>Meta anual</div>,
      dataIndex: "col2",
      key: "col2",
      width: "12.5%",
      render: (text, record) => renderCell2(text, record, "col2"),
    },
    {
      title:  <div style={{ color: '#701e45' }}>Avance al corte del periodo</div>,
      dataIndex: "col3",
      key: "col3",
      width: "12.5%",
      render: (text, record) => renderCell2(text, record, "col3"),
    },
    {
      title:  <div style={{ color: '#701e45' }}>Monto anual asignado</div>,
      dataIndex: "col4",
      key: "col4",
      width: "12.5%",
      render: (text, record) => renderCell2(text, record, "col4"),
    },
    {
      title:  <div style={{ color: '#701e45' }}>Erogacion a la fecha</div>,
      dataIndex: "col5",
      key: "col5",
      width: "12.5%",
      render: (text, record) => renderCell2(text, record, "col5"),
    },
    {
      title:  <div style={{ color: '#701e45' }}>Modificacion a metas</div>,
      dataIndex: "col6",
      key: "col6",
      width: "12.5%",
      render: (text, record) => renderCell2(text, record, "col6"),
    },
    {
      title:  <div style={{ color: '#701e45' }}>Modificacion a ROP</div>,
      dataIndex: "col7",
      key: "col7",
      width: "12.5%",
      render: (text, record) => renderCell2(text, record, "col7"),
    },
    {
      title:  <div style={{ color: '#701e45' }}>Justificacion de la modificacion</div>,
      dataIndex: "col8",
      key: "col8",
      width: "12.5%",
      render: (text, record) => renderCell2(text, record, "col8"),
    },
  ];

  const renderCell2 = (text, record, dataIndex) => {
    const editable = isEditing2(record, dataIndex);
    return editable ? (
      <Form.Item
        name={dataIndex}
        style={{ margin: 0 }}
        rules={[
          {
            required: true,
            message: `Por favor, ingresa ${dataIndex}.`,
          },
        ]}
      >
        <Input
          onPressEnter={() => save2(record.key, dataIndex)}
          onBlur={() => save2(record.key, dataIndex)}
        />
      </Form.Item>
    ) : (
      <div onClick={() => edit2(record.key, dataIndex)}>{text}</div>
    );
  };
  return (
    <div>
      <Typography.Title  level={1} align="center" style={{ color: '#6A0F49' }}>
      <BarChartOutlined style={{ marginRight: '8px' }} />
        Indicadores
      </Typography.Title>
      <Tabs tabPosition="left">
        <TabPane tab="Tabla 1" key="1">
          <p style={{ marginBottom: 32, fontSize: '1.3em', color: '#6A0F49',  fontWeight: '600'}}>Ingresos por venta de bienes y/o prestacion de servicios:</p>
          {/* Agrega la tabla de Ant Design */}
          <Form form={form} component={false}>
            <Table dataSource={data} bordered>
              {columns.map((column) => (
                <Column
                  {...column}
                  onCell={(record) => ({
                    record,
                    dataIndex: column.dataIndex,
                    title: column.title,
                    editing: isEditing(record, column.dataIndex),
                  })}
                  cell={EditableCell}
                />
              ))}
            </Table>
          </Form>
        </TabPane>
        <TabPane tab="Tabla 2" key="2">
          <p style={{ marginBottom: 32, fontSize: '1.3em',color: '#6A0F49',  fontWeight: '600' }}>Presupuesto operativo anual y metas alcanzadas:</p>
          {/* Agrega la segunda tabla de Ant Design */}
          <Form form={form2} component={false}>
            <Table dataSource={data2} bordered>
              {columns2.map((column) => (
                <Column
                  {...column}
                  onCell={(record) => ({
                    record,
                    dataIndex: column.dataIndex,
                    title: column.title,
                    editing: isEditing2(record, column.dataIndex),
                  })}
                  cell={EditableCell}
                />
              ))}
            </Table>
          </Form>
        </TabPane>
      </Tabs>
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
