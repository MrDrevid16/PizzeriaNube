import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const LoginContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: #f0f0f0;
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50%;
  background-color: #ACD7FF;
`;

const Logo = styled.img`
  width: 90%;
  max-width: 515px;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 50%;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  margin-bottom: 20px;
  text-align: center;
  color: #000000;
  font-family: 'Poppins', sans-serif;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 80%;
`;

const Input = styled.input`
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid rgba(176, 186, 195, 0.4);
  border-radius: 20px;
  color: #000;
  background-color: rgba(176, 186, 195, 0.4);
  font-family: 'Poppins', sans-serif;
  width: 100%;
  max-width: 300px;
  align-self: center;
`;

const Button = styled.button`
  padding: 10px;
  border: none;
  border-radius: 5px;
  background-color: #ff4500;
  color: white;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
  max-width: 300px;
  align-self: center;
  margin-top: 10px;
  
  &:hover {
    background-color: #e63e00;
  }
`;

const Link = styled.a`
  margin-top: 10px;
  text-decoration: none;
  color: #1a73e8;
`;

const Message = styled.p`
  margin-top: 10px;
  color: ${(props) => (props.error ? "red" : "green")};
  text-align: center;
`;

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Solicitar permiso para notificaciones al cargar el componente
    if ('Notification' in window) {
      Notification.requestPermission().then(function(permission) {
        console.log('Permiso de notificación:', permission);
      });
    }

    // Configurar detectores de conexión
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleOffline = () => {
    if (Notification.permission === 'granted') {
      new Notification('Saborretti', {
        body: 'No hay conexión a Internet. Por favor, verifica tu conexión.',
        icon: '/image/logo_bueno.png',
        badge: '/image/logo_bueno.png',
        vibrate: [200, 100, 200]
      });
    }
  };

  const handleOnline = () => {
    if (Notification.permission === 'granted') {
      new Notification('Saborretti', {
        body: 'Conexión a Internet detectada. Ya puedes iniciar sesión.',
        icon: '/image/logo_bueno.png',
        badge: '/image/logo_bueno.png',
        vibrate: [200, 100, 200]
      });
    }
  };

  const showErrorNotification = (message) => {
    if (Notification.permission === 'granted') {
      new Notification('Error de inicio de sesión', {
        body: message,
        icon: '/image/logo_bueno.png',
        badge: '/image/logo_bueno.png',
        vibrate: [200, 100, 200]
      });
    }
  };

  const showSuccessNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('Saborretti', {
        body: '¡Inicio de sesión exitoso! Bienvenido.',
        icon: '/image/logo_bueno.png',
        badge: '/image/logo_bueno.png',
        vibrate: [200, 100, 200]
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Verificar conexión antes de intentar el login
    if (!navigator.onLine) {
      handleOffline();
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/login", {
        email,
        password,
      });

      const { idusuario, idrol, nombre, message } = response.data;

      // Almacena idusuario, idrol y nombre en las cookies
      Cookies.set("userID", idusuario, { expires: 7 });
      Cookies.set("userRole", idrol, { expires: 7 });
      Cookies.set("userName", nombre, { expires: 7 });

      setMessage(message);
      showSuccessNotification(); // Mostrar notificación de éxito
      navigate("/home");

    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error al iniciar sesión";
      setMessage(errorMessage);
      showErrorNotification(errorMessage);
    }
  };

  return (
    <LoginContainer>
      <LogoContainer>
        <Logo src="/image/logo_bueno.png" alt="Saborretti Logo" />
      </LogoContainer>
      <FormContainer>
        <Title>Ingrese sus datos</Title>
        <Form onSubmit={handleLogin}>
          <Input 
            className="botones"
            type="email"
            placeholder="Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Contraseña"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit">Iniciar Sesión</Button>
        </Form>
        {message && <Message error={message.includes("Error")}>{message}</Message>}
        <Link href="/RegisterPage">Crea tu cuenta con nosotros</Link>
      </FormContainer>
    </LoginContainer>
  );
};

export default LoginForm;