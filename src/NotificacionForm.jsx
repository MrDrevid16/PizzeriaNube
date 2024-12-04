import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Dashboard from './Dashboard';

Modal.setAppElement('#root');

const NotificacionForm = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [selectedNotificacion, setSelectedNotificacion] = useState(null);
  const [newNotificacion, setNewNotificacion] = useState({
    nombre: '',
    imagen: ''
  });
  const [imagen, setImagen] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [notificacionToDelete, setNotificacionToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchNotificaciones();
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

  const fetchNotificaciones = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/notificaciones');
      const data = await response.json();
      setNotificaciones(data);
      setLoading(false);
    } catch (error) {
      setError('Error al cargar las notificaciones');
      setLoading(false);
    }
  };

  const openModal = () => {
    setNewNotificacion({
      nombre: '',
      imagen: ''
    });
    setImagen(null);
    setSelectedNotificacion(null);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const openDeleteModal = (notificacion) => {
    setNotificacionToDelete(notificacion);
    setDeleteModalIsOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalIsOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNotificacion({ ...newNotificacion, [name]: value });
  };

  const handleImageChange = (e) => {
    setImagen(e.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('nombre', newNotificacion.nombre);
    
    if (imagen) {
      formData.append('imagen', imagen);
    } else if (selectedNotificacion && selectedNotificacion.imagen) {
      formData.append('imagen', selectedNotificacion.imagen);
    }

    try {
      const url = selectedNotificacion
        ? `http://localhost:3000/notificaciones/${selectedNotificacion.idnotificacion}`
        : 'http://localhost:3000/notificaciones';
      const method = selectedNotificacion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Notificación guardada correctamente');
        fetchNotificaciones();
        closeModal();
      } else {
        setError(`Error: ${data.error || 'Hubo un problema al guardar la notificación'}`);
      }
    } catch (error) {
      setError('Error al guardar la notificación');
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`http://localhost:3000/notificaciones/${notificacionToDelete.idnotificacion}`, { method: 'DELETE' });
      fetchNotificaciones();
      setSuccess('Notificación eliminada correctamente');
      closeDeleteModal();
    } catch (error) {
      setError('Error al eliminar la notificación');
    }
  };

  const handleEdit = (notificacion) => {
    setNewNotificacion({
      nombre: notificacion.nombre,
      imagen: notificacion.imagen,
    });
    setSelectedNotificacion(notificacion);
    setImagen(null);
    setModalIsOpen(true);
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
      <h1 className="text-[#f54703] font-bold text-[32px] text-center mt-[100px] mb-[44px]">Notificaciones</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      <div className="flex justify-end mb-6">
        <button 
          onClick={openModal} 
          className="bg-[#1446a0] text-white font-bold py-2 px-4 rounded"
        >
          Agregar Notificación
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
                <th className="py-2 text-left font-bold text-[16px]">Imagen</th>
                <th className="py-2 text-left font-bold text-[16px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {notificaciones.map((notificacion) => (
                <tr key={notificacion.idnotificacion}>
                  <td className="py-2 text-[16px]">{notificacion.nombre}</td>
                  <td className="py-2 text-[16px]">
                    {notificacion.imagen && (
                      <img
                        src={`http://localhost:3000/uploads/${notificacion.imagen}`}
                        alt={notificacion.nombre}
                        className="w-[50px] h-[50px] object-cover"
                      />
                    )}
                  </td>
                  <td className="py-2">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(notificacion)} 
                        className="bg-[#1446a0] text-white font-bold py-1 px-2 rounded mr-[18px]"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => openDeleteModal(notificacion)} 
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
        contentLabel="Agregar/Editar Notificación"
      >
        <h2 className="text-[#f54703] font-bold text-2xl mb-5">
          {selectedNotificacion ? 'Editar Notificación' : 'Agregar Notificación'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <div>
            <label className="block mb-1">Nombre:</label>
            <input
              type="text"
              name="nombre"
              value={newNotificacion.nombre}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Imagen actual:</label>
            <input
              type="text"
              value={newNotificacion.imagen || 'No hay imagen'}
              readOnly
              className="w-full px-3 py-2 border rounded bg-gray-100"
            />
          </div>
          <div>
            <label className="block mb-1">Nueva imagen:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="flex justify-end space-x-2 mt-5">
            <button type="submit" className="bg-[#1446a0] text-white font-bold py-2 px-4 rounded">
              {selectedNotificacion ? 'Guardar Cambios' : 'Agregar Notificación'}
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
        contentLabel="Eliminar Notificación"
      >
        <h2 className="text-[#f54703] font-bold text-2xl mb-5">¿Está seguro que desea eliminar esta notificación?</h2>
        <p className="mb-5">{notificacionToDelete?.nombre}</p>
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

export default NotificacionForm;