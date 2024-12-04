import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Dashboard from './Dashboard';

Modal.setAppElement('#root');

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    nombre: '',
    email: '',
    password: '',
    idrol: '',
    telefono: '',
    fecha_naci: '',
  });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/usuarios');
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      setError('Error fetching users');
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('http://localhost:3000/roles');
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const openModal = () => {
    setNewUser({
      nombre: '',
      email: '',
      password: '',
      idrol: '',
      telefono: '',
      fecha_naci: '',
    });
    setSelectedUser(null);
    setModalIsOpen(true);
  };

  const openEditModal = (user) => {
    const formattedDate = user.fecha_naci ? new Date(user.fecha_naci).toISOString().split('T')[0] : '';
    setNewUser({
      ...user,
      fecha_naci: formattedDate
    });
    setSelectedUser(user);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setDeleteModalIsOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalIsOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const options = {
        method: selectedUser ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      };
      const url = selectedUser
        ? `http://localhost:3000/usuarios/${selectedUser.idusuario}`
        : 'http://localhost:3000/usuarios';

      await fetch(url, options);

      setSuccess('Usuario guardado correctamente');
      fetchUsers();
      closeModal();
    } catch (error) {
      setError('Error saving user');
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`http://localhost:3000/usuarios/${userToDelete.idusuario}`, { method: 'DELETE' });
      setSuccess('Usuario eliminado correctamente');
      fetchUsers();
      closeDeleteModal();
    } catch (error) {
      setError('Error deleting user');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#fff',
      borderRadius: '8px',
      padding: '20px',
      maxWidth: '500px',
      width: '100%',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)'
    }
  };

  return (
    <Dashboard>
      <h1 className="text-[#f54703] font-bold text-[32px] text-center mt-[100px] mb-[44px]">Usuarios</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      <div className="flex justify-end mb-6">
        <button 
          onClick={openModal} 
          className="bg-[#1446a0] text-white font-bold py-2 px-4 rounded"
        >
          Agregar Usuario
        </button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="overflow-x-auto p-[36px]">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[#f54703]">
                <th className="py-2 text-left font-bold text-[16px]">Nombre</th>
                <th className="py-2 text-left font-bold text-[16px]">Email</th>
                <th className="py-2 text-left font-bold text-[16px]">Contraseña</th>
                <th className="py-2 text-left font-bold text-[16px]">Id rol</th>
                <th className="py-2 text-left font-bold text-[16px]">Teléfono</th>
                <th className="py-2 text-left font-bold text-[16px]">Fecha de nacimiento</th>
                <th className="py-2 text-left font-bold text-[16px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.idusuario}>
                  <td className="py-2 text-[16px]">{user.nombre}</td>
                  <td className="py-2 text-[16px]">{user.email}</td>
                  <td className="py-2 text-[16px]">{user.password}</td>
                  <td className="py-2 text-[16px]">{roles.find(role => role.idrol === user.idrol)?.nombre || user.idrol}</td>
                  <td className="py-2 text-[16px]">{user.telefono}</td>
                  <td className="py-2 text-[16px]">{formatDate(user.fecha_naci)}</td>
                  <td className="py-2">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openEditModal(user)} 
                        className="bg-[#1446a0] text-white font-bold py-1 px-2 rounded mr-[18px]"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => openDeleteModal(user)} 
                        className="bg-[#1446a0] text-white font-bold py-1 px-2 rounded"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Agregar/Editar Usuario"
      >
        <h2 className="text-[#f54703] font-bold text-2xl mb-5">{selectedUser ? 'Editar Usuario' : 'Agregar Usuario'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Nombre:</label>
            <input
              type="text"
              name="nombre"
              value={newUser.nombre}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Email:</label>
            <input
              type="email"
              name="email"
              value={newUser.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Contraseña:</label>
            <input
              type="password"
              name="password"
              value={newUser.password}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Rol:</label>
            <select
              name="idrol"
              value={newUser.idrol}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Seleccione un rol</option>
              {roles.map((role) => (
                <option key={role.idrol} value={role.idrol}>
                  {role.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">Teléfono:</label>
            <input
              type="text"
              name="telefono"
              value={newUser.telefono}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Fecha de Nacimiento:</label>
            <input
              type="date"
              name="fecha_naci"
              value={newUser.fecha_naci}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="flex space-x-2 mt-5">
            <button type="submit" className="bg-[#1446a0] text-white font-bold py-2 px-4 rounded">
              {selectedUser ? 'Guardar Cambios' : 'Agregar Usuario'}
            </button>
            <button type="button" onClick={closeModal} className="bg-gray-300 text-black font-bold py-2 px-4 rounded">
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={deleteModalIsOpen}
        onRequestClose={closeDeleteModal}
        style={customStyles}
        contentLabel="Eliminar Usuario"
      >
        <h2 className="text-[#f54703] font-bold text-2xl mb-5">¿Está seguro que desea eliminar este usuario?</h2>
        <div className="flex space-x-2">
          <button onClick={handleDelete} className="bg-red-500 text-white font-bold py-2 px-4 rounded">
            Eliminar
          </button>
          <button onClick={closeDeleteModal} className="bg-gray-300 text-black font-bold py-2 px-4 rounded">
            Cancelar
          </button>
        </div>
      </Modal>
    </Dashboard>
  );
};

export default UserList;