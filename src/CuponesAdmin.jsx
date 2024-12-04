import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Dashboard from './Dashboard';

Modal.setAppElement('#root');

const CuponesAdmin = () => {
  const [cupones, setCupones] = useState([]);
  const [selectedCupon, setSelectedCupon] = useState(null);
  const [newCupon, setNewCupon] = useState({
    nom_cupon: '',
    descripcion: '',
    descuento: '',
    inicio: '',
    expiracion: '',
    activo: true,
  });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [cuponToDelete, setCuponToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchCupones();
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

  const fetchCupones = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/cupones');
      const data = await response.json();
      setCupones(data);
      setLoading(false);
    } catch (error) {
      setError('Error al obtener cupones');
      setLoading(false);
    }
  };

  const openModal = () => {
    setNewCupon({
      nom_cupon: '',
      descripcion: '',
      descuento: '',
      inicio: '',
      expiracion: '',
      activo: true,
    });
    setSelectedCupon(null);
    setModalIsOpen(true);
  };

  const openEditModal = (cupon) => {
    const formattedInicio = cupon.inicio ? new Date(cupon.inicio).toISOString().split('T')[0] : '';
    const formattedExpiracion = cupon.expiracion ? new Date(cupon.expiracion).toISOString().split('T')[0] : '';
    setNewCupon({
      ...cupon,
      inicio: formattedInicio,
      expiracion: formattedExpiracion,
    });
    setSelectedCupon(cupon);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const openDeleteModal = (cupon) => {
    setCuponToDelete(cupon);
    setDeleteModalIsOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalIsOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewCupon({ ...newCupon, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const options = {
        method: selectedCupon ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCupon),
      };
      const url = selectedCupon
        ? `http://localhost:3000/api/cupones/${selectedCupon.idcupon}`
        : 'http://localhost:3000/api/cupones';

      await fetch(url, options);

      setSuccess('Cupón guardado correctamente');
      fetchCupones();
      closeModal();
    } catch (error) {
      setError('Error al guardar cupón');
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`http://localhost:3000/api/cupones/${cuponToDelete.idcupon}`, { method: 'DELETE' });
      setSuccess('Cupón eliminado correctamente');
      fetchCupones();
      closeDeleteModal();
    } catch (error) {
      setError('Error al eliminar cupón');
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
      <h1 className="text-[#f54703] font-bold text-[32px] text-center mt-[100px] mb-[44px]">Cupones</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      <div className="flex justify-end mb-6">
        <button 
          onClick={openModal} 
          className="bg-[#1446a0] text-white font-bold py-2 px-4 rounded"
        >
          Agregar Cupon
        </button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="overflow-x-auto p-[36px] bg-white rounded shadow-md">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b-2 border-[#f54703]">
                <th className="py-2 text-left font-bold text-[16px]">Nombre</th>
                <th className="py-2 text-left font-bold text-[16px]">Descripción</th>
                <th className="py-2 text-left font-bold text-[16px]">Descuento</th>
                <th className="py-2 text-left font-bold text-[16px]">Inicio</th>
                <th className="py-2 text-left font-bold text-[16px]">Expiración</th>
                <th className="py-2 text-left font-bold text-[16px]">Activo</th>
                <th className="py-2 text-left font-bold text-[16px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cupones.map((cupon) => (
                <tr key={cupon.idcupon}>
                  <td className="py-2 text-[16px]">{cupon.nom_cupon}</td>
                  <td className="py-2 text-[16px]">{cupon.descripcion}</td>
                  <td className="py-2 text-[16px]">{cupon.descuento}</td>
                  <td className="py-2 text-[16px]">{formatDate(cupon.inicio)}</td>
                  <td className="py-2 text-[16px]">{formatDate(cupon.expiracion)}</td>
                  <td className="py-2 text-[16px]">{cupon.activo ? 'Sí' : 'No'}</td>
                  <td className="py-2">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openEditModal(cupon)} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => openDeleteModal(cupon)} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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
        contentLabel="Agregar/Editar Cupón"
      >
        <h2 className="text-[#f54703] font-bold text-2xl mb-5">
          {selectedCupon ? 'Editar Cupón' : 'Agregar Cupón'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Nombre:</label>
            <input
              type="text"
              name="nom_cupon"
              value={newCupon.nom_cupon}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Descripción:</label>
            <input
              type="text"
              name="descripcion"
              value={newCupon.descripcion}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Descuento:</label>
            <input
              type="text"
              name="descuento"
              value={newCupon.descuento}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Fecha de inicio:</label>
            <input
              type="date"
              name="inicio"
              value={newCupon.inicio}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Fecha de expiración:</label>
            <input
              type="date"
              name="expiracion"
              value={newCupon.expiracion}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">
              <input
                type="checkbox"
                name="activo"
                checked={newCupon.activo}
                onChange={handleInputChange}
                className="mr-2"
              />
              Activo
            </label>
          </div>
          <div className="flex space-x-2 mt-5">
            <button type="submit" className="bg-[#1446a0] text-white font-bold py-2 px-4 rounded">
              {selectedCupon ? 'Guardar Cambios' : 'Agregar Cupón'}
            </button>
            <button 
              type="button" 
              onClick={closeModal} 
              className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={deleteModalIsOpen}
        onRequestClose={closeDeleteModal}
        style={customStyles}
        contentLabel="Eliminar Cupón"
      >
        <h2 className="text-[#f54703] font-bold text-2xl mb-5">¿Está seguro que desea eliminar este cupón?</h2>
        <div className="flex space-x-2">
          <button onClick={handleDelete} className="bg-red-500 text-white font-bold py-2 px-4 rounded">
            Eliminar
          </button>
          <button onClick={closeDeleteModal} className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded">
            Cancelar
          </button>
        </div>
      </Modal>
    </Dashboard>
  );
};

export default CuponesAdmin;