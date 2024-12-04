import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Dashboard from './Dashboard';

Modal.setAppElement('#root');

const OfertasAdmin = () => {
  const [ofertas, setOfertas] = useState([]);
  const [selectedOferta, setSelectedOferta] = useState(null);
  const [newOferta, setNewOferta] = useState({
    nombre: '',
    inicio: '',
    expiracion: '',
    descuento: null,
    activo: true,
  });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [ofertaToDelete, setOfertaToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchOfertas();
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

  const fetchOfertas = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/ofertas');
      const data = await response.json();
      setOfertas(data);
      setLoading(false);
    } catch (error) {
      setError('Error al obtener ofertas');
      setLoading(false);
    }
  };

  const openModal = () => {
    setNewOferta({
      nombre: '',
      inicio: '',
      expiracion: '',
      descuento: null,
      activo: true,
    });
    setSelectedOferta(null);
    setModalIsOpen(true);
  };

  const openEditModal = (oferta) => {
    const formattedInicio = oferta.inicio ? new Date(oferta.inicio).toISOString().split('T')[0] : '';
    const formattedExpiracion = oferta.expiracion ? new Date(oferta.expiracion).toISOString().split('T')[0] : '';
    setNewOferta({
      ...oferta,
      inicio: formattedInicio,
      expiracion: formattedExpiracion,
    });
    setSelectedOferta(oferta);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const openDeleteModal = (oferta) => {
    setOfertaToDelete(oferta);
    setDeleteModalIsOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalIsOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewOferta({ ...newOferta, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const options = {
        method: selectedOferta ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOferta),
      };
      const url = selectedOferta
        ? `http://localhost:3000/ofertas/${selectedOferta.idoferta}`
        : 'http://localhost:3000/ofertas';

      await fetch(url, options);

      setSuccess('Oferta guardada correctamente');
      fetchOfertas();
      closeModal();
    } catch (error) {
      setError('Error al guardar oferta');
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`http://localhost:3000/ofertas/${ofertaToDelete.idoferta}`, { method: 'DELETE' });
      setSuccess('Oferta eliminada correctamente');
      fetchOfertas();
      closeDeleteModal();
    } catch (error) {
      setError('Error al eliminar oferta');
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
      <h1 className="text-[#f54703] font-bold text-[32px] text-center mt-[100px] mb-[44px]">Ofertas</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      <div className="flex justify-end mb-6">
        <button 
          onClick={openModal} 
          className="bg-[#1446a0] text-white font-bold py-2 px-4 rounded"
        >
          Agregar Oferta
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
                <th className="py-2 text-left font-bold text-[16px]">Inicio</th>
                <th className="py-2 text-left font-bold text-[16px]">Expiración</th>
                <th className="py-2 text-left font-bold text-[16px]">Descuento</th>
                <th className="py-2 text-left font-bold text-[16px]">Activo</th>
                <th className="py-2 text-left font-bold text-[16px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ofertas.map((oferta) => (
                <tr key={oferta.idoferta}>
                  <td className="py-2 text-[16px]">{oferta.nombre}</td>
                  <td className="py-2 text-[16px]">{formatDate(oferta.inicio)}</td>
                  <td className="py-2 text-[16px]">{formatDate(oferta.expiracion)}</td>
                  <td className="py-2 text-[16px]">{oferta.descuento ? `${oferta.descuento}%` : '-'}</td>
                  <td className="py-2 text-[16px]">{oferta.activo ? 'Sí' : 'No'}</td>
                  <td className="py-2">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openEditModal(oferta)} 
                        className="bg-[#1446a0] text-white font-bold py-1 px-2 rounded mr-[18px]"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => openDeleteModal(oferta)} 
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
        contentLabel="Agregar/Editar Oferta"
      >
        <h2 className="text-[#f54703] font-bold text-2xl mb 5">{selectedOferta ? 'Editar Oferta' : 'Agregar Oferta'}</h2>
<form onSubmit={handleSubmit} className="space-y-4">
<div>
<label className="block mb-1">Nombre:</label>
<input
           type="text"
           name="nombre"
           value={newOferta.nombre}
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
           value={newOferta.inicio}
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
           value={newOferta.expiracion}
           onChange={handleInputChange}
           required
           className="w-full px-3 py-2 border rounded"
         />
</div>
<div>
<label className="block mb-1">Descuento (%):</label>
<input
type="number"
name="descuento"
value={newOferta.descuento || ''}
onChange={handleInputChange}
min="0"
max="100"
className="w-full px-3 py-2 border rounded"
/>
</div>
<div>
<label className="block mb-1">
<input
             type="checkbox"
             name="activo"
             checked={newOferta.activo}
             onChange={handleInputChange}
             className="mr-2"
           />
Activo
</label>
</div>
<div className="flex space-x-2 mt-5">
<button type="submit" className="bg-[#1446a0] text-white font-bold py-2 px-4 rounded">
{selectedOferta ? 'Guardar Cambios' : 'Agregar Oferta'}
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
    contentLabel="Eliminar Oferta"
  >
    <h2 className="text-[#f54703] font-bold text-2xl mb-5">¿Está seguro que desea eliminar esta oferta?</h2>
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
export default OfertasAdmin;