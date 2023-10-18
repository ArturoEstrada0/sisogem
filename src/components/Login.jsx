import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import ReCAPTCHA from 'react-google-recaptcha';

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState(null);

  const onFinish = (values) => {
    // Lógica de inicio de sesión
    console.log('Valores del formulario:', values);
    console.log('Valor del CAPTCHA:', recaptchaValue);
  };

  const formStyle = {
    width: '80%',
    maxWidth: '400px',
    margin: '0 auto',
  };

  const containerStyle = {
    width: '80%',
    maxWidth: '400px',
    margin: '0 auto',
    background: 'url(./assets/img/escudo.png)', // Reemplaza "URL_DE_LA_IMAGEN" con la ruta o URL de tu imagen de fondo
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    padding: '20px', // Espacio interno para el formulario
  };

  const titleStyle = {
    color: '#6A0F49',
    fontSize: '32px',
    marginBottom: '20px',
    textAlign: 'center',
  };

  // Definir las funciones setInputStyle y setButtonStyle
  const [inputStyle, setInputStyle] = useState({
    borderColor: '#7c858c',
    width: '100%',
    marginBottom: '10px',
    transition: 'border-color 0.3s',
  });

  const [buttonStyle, setButtonStyle] = useState({
    backgroundColor: '#6A0F49',
    borderColor: '#6A0F49',
    color: 'white',
    width: '100%',
  });

  const inputHoverStyle = {
    borderColor: '#6A0F49',
  };

  const buttonHoverStyle = {
    backgroundColor: '#5B0D3C',
  };

  return (
    <div style={formStyle}>
      <h2 style={titleStyle}>Iniciar Sesión</h2>
      <Form
        name="login-form"
        onFinish={onFinish}
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Por favor ingresa tu dirección de correo electrónico' },
            { type: 'email', message: 'Por favor ingresa una dirección de correo electrónico válida' }
          ]}
        >
          <Input
            prefix={<MailOutlined style={{ color: '#7c858c' }} />}
            placeholder="Correo Electrónico"
            style={inputStyle}
            onMouseEnter={() => setInputStyle({ ...inputStyle, ...inputHoverStyle })}
            onMouseLeave={() => setInputStyle({ ...inputStyle })}
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Por favor ingresa tu contraseña' }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#7c858c' }} />}
            placeholder="Contraseña"
            style={inputStyle}
            onMouseEnter={() => setInputStyle({ ...inputStyle, ...inputHoverStyle })}
            onMouseLeave={() => setInputStyle({ ...inputStyle })}
          />
        </Form.Item>
        <Form.Item>
          <ReCAPTCHA
            sitekey="TU_SITE_KEY" // Reemplaza con tu clave de sitio reCAPTCHA
            onChange={(value) => setRecaptchaValue(value)}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={buttonStyle}
            onMouseEnter={() => setButtonStyle({ ...buttonStyle, ...buttonHoverStyle })}
            onMouseLeave={() => setButtonStyle({ ...buttonStyle })}
          >
            Iniciar Sesión
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
