// src/RegisterForm.jsx
import React, { useState } from "react";
import axios from "axios";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    idrol: "",
    foto: "",
    fecha_naci: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/registro", formData);
      console.log(response.data);
      alert("Usuario registrado exitosamente");
    } catch (error) {
      console.error(error);
      alert("Error al registrar el usuario");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Nombre:</label>
        <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
      </div>
      <div>
        <label>Email:</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} required />
      </div>
      <div>
        <label>Id Rol:</label>
        <input type="text" name="idrol" value={formData.idrol} onChange={handleChange} required />
      </div>
      <div>
        <label>Foto:</label>
        <input type="text" name="foto" value={formData.foto} onChange={handleChange} required />
      </div>
      <div>
        <label>Fecha de Nacimiento:</label>
        <input type="date" name="fecha_naci" value={formData.fecha_naci} onChange={handleChange} required />
      </div>
      <button type="submit">Registrar</button>
    </form>
  );
};

export default RegisterForm;
