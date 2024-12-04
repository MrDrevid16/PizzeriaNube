import React, { useState, useEffect } from 'react';

const Usuario = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [idrol, setIdrol] = useState('');
  const [foto, setFoto] = useState('');
  const [fecha_naci, setFechaNaci] = useState('');

  // Fetch users
  const fetchUsuarios = async () => {
    try {
      const response = await fetch('http://localhost:3000/usuarios');
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const usuarioData = {
      nombre,
      email,
      password,
      idrol,
      foto,
      fecha_naci,
    };

    try {
      const response = await fetch('http://localhost:3000/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usuarioData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Usuario registrado exitosamente');
        fetchUsuarios();
        clearForm();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      alert('Hubo un problema con la solicitud.');
    }
  };

  // Handle user update
  const updateUsuario = async () => {
    try {
      const response = await fetch(`http://localhost:3000/usuarios/${selectedUsuario.idusuario}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, email, password, idrol, foto, fecha_naci }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Usuario actualizado exitosamente');
        fetchUsuarios();
        clearForm();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      alert('Hubo un problema con la solicitud.');
    }
  };

  // Handle user delete
  const deleteUsuario = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/usuarios/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        alert('Usuario eliminado exitosamente');
        fetchUsuarios();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      alert('Hubo un problema con la solicitud.');
    }
  };

  // Handle user selection for editing
  const handleEdit = (usuario) => {
    setSelectedUsuario(usuario);
    setNombre(usuario.nombre);
    setEmail(usuario.email);
    setPassword(usuario.password);
    setIdrol(usuario.idrol);
    setFoto(usuario.foto);
    // Manejar la fecha de nacimiento en formato YYYY-MM-DD
    // Asumiendo que `fecha_naci` es un string en formato ISO desde el backend
    setFechaNaci(usuario.fecha_naci.substring(0, 10)); // Esto asume que `fecha_naci` es "YYYY-MM-DD"
  };

  // Clear form after submission
  const clearForm = () => {
    setSelectedUsuario(null);
    setNombre('');
    setEmail('');
    setPassword('');
    setIdrol('');
    setFoto('');
    setFechaNaci('');
  };

  return (
    <div>
      <h2>{selectedUsuario ? 'Editar Usuario' : 'Registrar Usuario'}</h2>
      <form onSubmit={selectedUsuario ? updateUsuario : handleSubmit}>
        <div>
          <label>Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>ID Rol:</label>
          <input
            type="number"
            value={idrol}
            onChange={(e) => setIdrol(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Foto:</label>
          <input
            type="text"
            value={foto}
            onChange={(e) => setFoto(e.target.value)}
          />
        </div>
        <div>
          <label>Fecha de Nacimiento:</label>
          <input
            type="date"
            value={fecha_naci}
            onChange={(e) => setFechaNaci(e.target.value)}
          />
        </div>
        <button type="submit">{selectedUsuario ? 'Actualizar Usuario' : 'Registrar Usuario'}</button>
        {selectedUsuario && (
          <button type="button" onClick={clearForm}>
            Cancelar
          </button>
        )}
      </form>

      <h2>Lista de Usuarios</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Password</th>
            <th>ID Rol</th>
            <th>Foto</th>
            <th>Fecha de Nacimiento</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.idusuario}>
              <td>{usuario.idusuario}</td>
              <td>{usuario.nombre}</td>
              <td>{usuario.email}</td>
              <td>{usuario.password}</td>
              <td>{usuario.idrol}</td>
              <td>{usuario.foto}</td>
              <td>{usuario.fecha_naci}</td>
              <td>
                <button onClick={() => handleEdit(usuario)}>Editar</button>
                <button onClick={() => deleteUsuario(usuario.idusuario)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Usuario;
