import React from 'react';
import { Button, Space } from 'antd';
import {
  FileAddOutlined,
  ScheduleOutlined,
  SolutionOutlined,
  DollarCircleOutlined,
} from '@ant-design/icons';

const FormatosMenu = () => {
  const formatos = [
    { name: 'Convocatoria', icon: <FileAddOutlined style={{ fontSize: '50px' }} /> },
    { name: 'Orden del día', icon: <ScheduleOutlined style={{ fontSize: '50px' }} /> },
    { name: 'Acta de sesión', icon: <SolutionOutlined style={{ fontSize: '50px' }} /> },
    { name: 'Estados financieros', icon: <DollarCircleOutlined style={{ fontSize: '50px' }} /> },
  ];

  return (
    <div>
      <h2>Formatos editables</h2>
      <Space size={20}>
        {formatos.map((formato, index) => (
          <Button
            key={index}
            icon={formato.icon}
            size="large"
            style={{
              width: '220px',
              height: '120px',
              display: 'flex',
              flexDirection: 'column',
              borderColor: '#6A0F49', // Cambiamos el color del contorno
              color: '#6A0F49', // Cambiamos el color del texto
            }}
          >
            {formato.name}
          </Button>
        ))}
      </Space>
    </div>
  );
};

export default FormatosMenu;
