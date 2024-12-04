import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Dashboard from './Dashboard';

Modal.setAppElement('#root');

const CategoriaForm = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    nombre: '',
    descripcion: '',
    puntos: 0 // Nuevo campo para los puntos
  });
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/categoria');
      const data = await response.json();
      setCategories(data);
      setLoading(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al obtener las categorías' });
      setLoading(false);
    }
  };

  const openModal = () => {
    setNewCategory({ nombre: '', descripcion: '', puntos: 0 });
    setEditingCategoryId(null);
    setModalIsOpen(true);
  };

  const openEditModal = (category) => {
    setNewCategory({ 
      nombre: category.nombre, 
      descripcion: category.descripcion,
      puntos: category.puntos || 0
    });
    setEditingCategoryId(category.idcategoria);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setDeleteModalIsOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalIsOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Convertir el valor a número si el campo es 'puntos'
    const newValue = name === 'puntos' ? parseInt(value) || 0 : value;
    setNewCategory({ ...newCategory, [name]: newValue });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (newCategory.puntos < 0) {
      setMessage({ type: 'error', text: 'Los puntos no pueden ser negativos' });
      return;
    }

    try {
      const options = {
        method: editingCategoryId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      };
      const url = editingCategoryId
        ? `http://localhost:3000/categoria/${editingCategoryId}`
        : 'http://localhost:3000/categoria';

      const response = await fetch(url, options);
      const data = await response.json();

      if (response.ok) {
        setNewCategory({ nombre: '', descripcion: '', puntos: 0 });
        setEditingCategoryId(null);
        setMessage({ type: 'success', text: 'Categoría guardada correctamente' });
        fetchCategories();
        closeModal();
      } else {
        throw new Error(data.error || 'Error al guardar la categoría');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:3000/categoria/${categoryToDelete.idcategoria}`, { 
        method: 'DELETE' 
      });
      
      if (response.ok) {
        fetchCategories();
        setMessage({ type: 'success', text: 'Categoría eliminada correctamente' });
        closeDeleteModal();
      } else {
        throw new Error('Error al eliminar la categoría');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
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
      <h1 className="text-[#f54703] font-bold text-[32px] text-center mt-[100px] mb-[44px]">Categorías</h1>

      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-end mb-6">
        <button 
          onClick={openModal} 
          className="bg-[#1446a0] text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
        >
          Agregar Categoría
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <p>Cargando...</p>
        </div>
      ) : (
        <div className="overflow-x-auto p-[36px]">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[#f54703]">
                <th className="py-2 text-left font-bold text-[16px]">Nombre</th>
                <th className="py-2 text-left font-bold text-[16px]">Descripción</th>
                <th className="py-2 text-left font-bold text-[16px]">Puntos PepperPoints</th>
                <th className="py-2 text-left font-bold text-[16px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category.idcategoria} className="border-b hover:bg-gray-50">
                  <td className="py-2 text-[16px]">{category.nombre}</td>
                  <td className="py-2 text-[16px]">{category.descripcion}</td>
                  <td className="py-2 text-[16px]">{category.puntos || 0}</td>
                  <td className="py-2">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openEditModal(category)} 
                        className="bg-[#1446a0] text-white font-bold py-1 px-2 rounded mr-[18px] hover:bg-blue-700 transition duration-300"
                      >
                        Editar
                      </button>
                      <button 
  onClick={() => openDeleteModal(category)} 
  className="bg-[#1446a0] text-white font-bold py-1 px-2 rounded hover:bg-blue-700 transition duration-300"
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

      {/* Modal para Agregar/Editar */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Agregar/Editar Categoría"
      >
        <h2 className="text-[#f54703] font-bold text-2xl mb-5">
          {editingCategoryId ? 'Editar Categoría' : 'Agregar Categoría'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">Nombre:</label>
            <input
              type="text"
              name="nombre"
              value={newCategory.nombre}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Descripción:</label>
            <input
              type="text"
              name="descripcion"
              value={newCategory.descripcion}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
          <input
  type="number"
  name="puntos"
  value={newCategory.puntos}
  onChange={handleInputChange}
  min="0"
  required
  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  onKeyDown={(e) => {
    // Permitir solo números, backspace, delete, flechas y tab
    if (!/[0-9]/.test(e.key) && 
        !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
      e.preventDefault();
    }
  }}
  inputMode="numeric"
  pattern="[0-9]*"
/>
          </div>
          <div className="flex space-x-2 mt-5">
            <button 
              type="submit" 
              className="bg-[#1446a0] text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
            >
              {editingCategoryId ? 'Guardar Cambios' : 'Agregar Categoría'}
            </button>
            <button 
              type="button" 
              onClick={closeModal} 
              className="bg-gray-300 text-black font-bold py-2 px-4 rounded hover:bg-gray-400 transition duration-300"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmación para Eliminar */}
      <Modal
        isOpen={deleteModalIsOpen}
        onRequestClose={closeDeleteModal}
        style={customStyles}
        contentLabel="Eliminar Categoría"
      >
        <h2 className="text-[#f54703] font-bold text-2xl mb-5">¿Está seguro que desea eliminar esta categoría?</h2>
        <p className="mb-5">
          Categoría: <span className="font-semibold">{categoryToDelete?.nombre}</span>
        </p>
        <div className="flex space-x-2">
        <button 
  onClick={handleDelete} 
  className="bg-[#1446a0] text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
>
  Eliminar
</button>
          <button 
            onClick={closeDeleteModal} 
            className="bg-gray-300 text-black font-bold py-2 px-4 rounded hover:bg-gray-400 transition duration-300"
          >
            Cancelar
          </button>
        </div>
      </Modal>
    </Dashboard>
  );
};

export default CategoriaForm;