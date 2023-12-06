import React, { useState, useContext, useEffect } from "react";
import { Table, Typography, Input, Form, Popconfirm, Button } from "antd";

const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const form = useContext(EditableContext);
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    if (editing) {
      form.setFieldsValue({
        [dataIndex]: record[dataIndex],
      });
    }
  }, [editing, form, dataIndex, record]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} es requerido.`,
          },
        ]}
      >
        <Input
          prefix={dataIndex === "proyectadoPeriodo" ? "$" : ""}
          onPressEnter={save}
          onBlur={save}
        />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

function Indicadores() {
  const [dataSource, setDataSource] = useState([
    {
      key: "1",
      periodo: "Enero-Marzo 2023",
      metaPeriodo: "",
      logradoPeriodo: "",
      proyectadoPeriodo: "",
      ingresadoCorte: "",
      justificacionDiferencias: "",
    },
    {
      key: "2",
      periodo: "Abril-Junio 2023",
      metaPeriodo: "",
      logradoPeriodo: "",
      proyectadoPeriodo: "",
      ingresadoCorte: "",
      justificacionDiferencias: "",
    },
    {
      key: "3",
      periodo: "Julio-Septiembre 2023",
      metaPeriodo: "",
      logradoPeriodo: "",
      proyectadoPeriodo: "",
      ingresadoCorte: "",
      justificacionDiferencias: "",
    },
    {
      key: "4",
      periodo: "Octubre-Diciembre 2023",
      metaPeriodo: "",
      logradoPeriodo: "",
      proyectadoPeriodo: "",
      ingresadoCorte: "",
      justificacionDiferencias: "",
    },
  ]);
  const [count, setCount] = useState(2);

  const handleDelete = (key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
  };

  const handleAdd = () => {
    const newData = {
      key: count,
      periodo: `Nuevo Periodo ${count}`,
      metaPeriodo: "",
      logradoPeriodo: "",
      proyectadoPeriodo: "",
      ingresadoCorte: "",
      justificacionDiferencias: "",
    };
    setDataSource([...dataSource, newData]);
    setCount(count + 1);
  };

  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    setDataSource(newData);
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = [
    {
      title: "Periodo",
      dataIndex: "periodo",
      width: "30%",
      editable: false,
    },
    {
      title: "Meta del Periodo",
      dataIndex: "metaPeriodo",
      editable: true,
    },
    {
      title: "Logrado en el Periodo",
      dataIndex: "logradoPeriodo",
      editable: true,
    },
    {
      title: "Proyectado para el periodo en $",
      dataIndex: "proyectadoPeriodo",
      editable: true,
    },
    {
      title: "Ingresado al corte en $",
      dataIndex: "ingresadoCorte",
      editable: true,
    },
    {
      title: "Justificación de las diferencias en metas y/o $",
      dataIndex: "justificacionDiferencias",
      editable: true,
    },
    
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave: handleSave,
      }),
    };
  });

  return (
    <div>

      <Table
        components={components}
        rowClassName={() => "editable-row"}
        bordered
        dataSource={dataSource}
        columns={mergedColumns}
      />
    </div>
  );
}

export default Indicadores;
