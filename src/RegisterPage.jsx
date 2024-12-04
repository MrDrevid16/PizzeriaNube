import React, { useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const navigate = useNavigate();

  const initialFormData = {
    nombre: "",
    email: "",
    password: "",
    telefono: "",
    fecha_naci: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `El campo ${field} es obligatorio`;
      }
    });
    if (formData.password && formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      const dataToSend = {
        ...formData,
        idrol: "1", // Asignar el valor del rol aquí
      };
      const response = await axios.post("http://localhost:3000/registro", dataToSend);
      console.log(response.data);
      navigate("/loginform"); // Redirigir al login
    } catch (error) {
      console.error(error);
      alert("Error al registrar el usuario");
    }
  };

  return (
    <RegisterPageContainer>
      <LeftSection>
        <Logo src="/image/logo_bueno.png" alt="Logo" />
      </LeftSection>
      <RightSection>
        <Form onSubmit={handleSubmit}>
          <Title>CREAR PERFIL</Title>
          <InputGroup>
            <Label>Nombre:</Label>
            <Input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
            {errors.nombre && <Error>{errors.nombre}</Error>}
          </InputGroup>
          <InputGroup>
            <Label>Email:</Label>
            <Input type="email" name="email" value={formData.email} onChange={handleChange} required />
            {errors.email && <Error>{errors.email}</Error>}
          </InputGroup>
          <InputGroup>
            <Label>Password:</Label>
            <Input type="password" name="password" value={formData.password} onChange={handleChange} required />
            {errors.password && <Error>{errors.password}</Error>}
          </InputGroup>
          <InlineInputs>
            <InputGroup>
              <Label>Teléfono:</Label>
              <Input type="text" name="telefono" value={formData.telefono} onChange={handleChange} required />
              {errors.telefono && <Error>{errors.telefono}</Error>}
            </InputGroup>
            <InputGroup>
              <Label>Fecha de Nacimiento:</Label>
              <Input type="date" name="fecha_naci" value={formData.fecha_naci} onChange={handleChange} required />
              {errors.fecha_naci && <Error>{errors.fecha_naci}</Error>}
            </InputGroup>
          </InlineInputs>
          <RegisterButton type="submit">Registrar</RegisterButton>
        </Form>
        <LoginLink>
          <span>¿Ya tienes una cuenta?</span>
          <a href="/loginform">Inicia sesión aquí</a>
        </LoginLink>
      </RightSection>
    </RegisterPageContainer>
  );
};

export default RegisterPage;

// Los estilos se mantienen igual
const RegisterPageContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: #f4f4f4;
`;

const LeftSection = styled.div`
  flex: 1;
  background-color: #ACD7FF;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const RightSection = styled.div`
  flex: 1;
  background-color: white;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Logo = styled.img`
  width: 90%;
  max-width: 520px;
`;

const Title = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #000000;
  font-family: 'Poppins', sans-serif;
  text-align: center;
`;

const Form = styled.form`
  width: 100%;
  max-width: 400px;
`;

const InputGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  color: #000;
`;

const Input = styled.input`
  width: calc(100% - 16px);
  padding: 10px;
  border: 1px solid rgba(176, 186, 195, 0.4);
  border-radius: 20px;
  background-color: rgba(176, 186, 195, 0.4);
  font-family: 'Poppins', sans-serif;
  color: #000;
`;

const Error = styled.span`
  color: red;
  font-size: 12px;
`;

const InlineInputs = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;

const RegisterButton = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #ff6600;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
`;

const LoginLink = styled.div`
  margin-top: 20px;
  text-align: center;

  span {
    margin-right: 5px;
  }

  a {
    color: #007bff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;