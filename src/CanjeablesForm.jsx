import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import Dashboard from './Dashboard';

Modal.setAppElement('#root');

const CanjeablesForm = () => {
  const [canjeables, setCanjeables] = useState([]);
  const [productos, setProductos] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newCanjeable, setNewCanjeable] = useState({
    puntos_requeridos: 0
  });
  const [editingCanjeableId, setEditingCanjeableId] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [addProductModalIsOpen, setAddProductModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [canjeableToDelete, setCanjeableToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [puntosRequeridos, setPuntosRequeridos] = useState('');
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [productosCanjeables, setProductosCanjeables] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCanjeables();
    fetchProductos();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchCanjeables = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/canjeables');
      const data = await response.json();
      setCanjeables(data);
      setLoading(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error fetching canjeables' });
      setLoading(false);
    }
  };

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/productos');
      const data = await response.json();
      setProductos(data);
      setLoading(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error fetching productos' });
      setLoading(false);
    }
  };

  const openModal = () => {
    setSelectedProducto(null);
    setPuntosRequeridos('');
    setModalIsOpen(true);
  };

  const openAddProductModal = () => {
    setSelectedProduct(null);
    setAddProductModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const openDeleteModal = (canjeable) => {
    setCanjeableToDelete(canjeable);
    setDeleteModalIsOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalIsOpen(false);
  };

  const handleEditModal = (canjeable) => {
    // Buscar el producto correspondiente desde la lista de productos
    const productoRelacionado = productos.find((producto) => producto.id_producto === canjeable.id_producto);
    
    // Si encontramos el producto relacionado, usamos sus datos
    if (productoRelacionado) {
      setSelectedProducto({
        id_producto: productoRelacionado.id_producto,
        nombre: productoRelacionado.nombre,
        descripcion: productoRelacionado.descripcion,
        imagen: productoRelacionado.imagen,
      });
    }
  
    // Establecer el canjeable seleccionado para editar
    setEditingCanjeableId(canjeable.id_canjeable);
    setPuntosRequeridos(canjeable.puntos_requeridos);
  
    // Abrir el modal de edición
    setEditModalIsOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCanjeable({ ...newCanjeable, [name]: value });
  };

  const handleProductoClick = (producto) => {
    setSelectedProducto(producto);
  };

  const handlePuntosChange = (e) => {
    setPuntosRequeridos(e.target.value);
  };

  const handleActualizarCanjeable = async () => {
    if (!editingCanjeableId || !puntosRequeridos) {
      return;
    }

    try {
      const updatedCanjeable = {
        puntos_requeridos: parseInt(puntosRequeridos, 10),
        activo: 1,
      };

      await axios.put(`http://localhost:3000/api/canjeables/${editingCanjeableId}`, updatedCanjeable);

      setMessage({ type: 'success', text: 'Producto canjeable actualizado exitosamente' });
      fetchCanjeables(); // Recargar la lista de productos canjeables
      setEditModalIsOpen(false); // Cerrar el modal después de actualizar
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar el producto canjeable' });
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`http://localhost:3000/api/canjeables/${canjeableToDelete.id_canjeable}`, { method: 'DELETE' });
      fetchCanjeables();
      setMessage({ type: 'success', text: 'Producto canjeable eliminado correctamente' });
      closeDeleteModal();
    } catch (error) {
      setMessage({ type: 'error', text: 'Error deleting canjeable' });
    }
  };

  const handleAgregarCanjeable = async () => {
    if (!selectedProducto || !puntosRequeridos) {
      setMessage({ type: 'error', text: 'Debes seleccionar un producto y asignar los puntos requeridos.' });
      return;
    }
  
    try {
      // Preparar los datos del nuevo producto canjeable
      const newCanjeable = {
        id_producto: selectedProducto.id_producto,
        puntos_requeridos: parseInt(puntosRequeridos, 10),
        activo: 1,
      };
  
      // Realizar la solicitud POST para agregar el producto canjeable
      const response = await axios.post('http://localhost:3000/api/canjeables', newCanjeable);
  
      // Verificar si la respuesta es exitosa
      if (response.status === 201) {
        setMessage({ type: 'success', text: 'Producto canjeable agregado exitosamente' });
  
        // Agregar el nuevo producto a la lista de productos canjeables para que no vuelva a aparecer en el modal
        setProductosCanjeables((prev) => [...prev, selectedProducto]);
  
        fetchCanjeables(); // Recargar la lista de productos canjeables
        closeModal(); // Cerrar el modal después de agregar
      } else {
        setMessage({ type: 'error', text: 'Error al agregar producto canjeable. Inténtalo nuevamente.' });
      }
    } catch (error) {
      console.error('Error al agregar producto canjeable:', error);
      setMessage({ type: 'error', text: 'Error al agregar producto canjeable: ' + (error.response?.data?.message || error.message) });
    }
  };

  const handleProductoSelect = (producto) => {
    setSelectedProducto(producto);
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
      <h1 className="text-[#f54703] font-bold text-[32px] text-center mt-[100px] mb-[44px]">Productos Canjeables</h1>

      {message && (
        <p className={`mb-4 ${message.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
          {message.text}
        </p>
      )}

      <div className="flex justify-end mb-6">
        <button
          onClick={openModal}
          className="bg-[#1446a0] text-white font-bold py-2 px-4 rounded"
        >
          Agregar Producto Canjeable
        </button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="overflow-x-auto p-[36px]">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[#f54703]">
                <th className="py-2 text-left font-bold text-[16px]">Imagen</th>
                <th className="py-2 text-left font-bold text-[16px]">Nombre</th>
                <th className="py-2 text-left font-bold text-[16px]">Descripción</th>
                <th className="py-2 text-left font-bold text-[16px]">Puntos Requeridos</th>
                <th className="py-2 text-left font-bold text-[16px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {canjeables.map((canjeable) => {
                // Buscar el producto correspondiente por id_producto
                const producto = productos.find((producto) => producto.id_producto === canjeable.id_producto);

                return (
                  <tr key={canjeable.id_canjeable}>
                    <td className="py-2">
                      <img
                        src={producto?.imagen ? `http://localhost:3000/uploads/${producto.imagen}` : '/image/default-pizza.jpg'}
                        alt={producto?.nombre || 'Producto'}
                        className="w-[50px] h-[50px] object-cover"
                      />
                    </td>
                    <td className="py-2 text-[16px]">{producto?.nombre || 'Nombre no disponible'}</td>
                    <td className="py-2 text-[16px]">{producto?.descripcion || 'Descripción no disponible'}</td>
                    <td className="py-2 text-[16px]">{canjeable.puntos_requeridos}</td>
                    <td className="py-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditModal(canjeable)}
                          className="bg-[#1446a0] text-white font-bold py-1 px-2 rounded mr-[18px]"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => openDeleteModal(canjeable)}
                          className="bg-[#1446a0] text-white font-bold py-1 px-2 rounded"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

<Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Agregar Producto Canjeable"
      >
        <h2 className="text-[#f54703] font-bold text-2xl mb-5">Seleccionar Producto para Canjear</h2>

        {/* Mostrar la lista de productos disponibles para seleccionar */}
        <div className="overflow-y-auto max-h-96 mb-4">
          {productos
            .filter(producto => !productosCanjeables.some(canjeable => canjeable.id_producto === producto.id_producto))
            .map((producto) => (
              <div
                key={producto.id_producto}
                onClick={() => handleProductoSelect(producto)}
                className={`border rounded-lg p-4 shadow-md cursor-pointer mb-2 ${
                  selectedProducto?.id_producto === producto.id_producto ? 'bg-gray-300' : ''
                }`}
              >
                <img
                  src={producto.imagen ? `http://localhost:3000/uploads/${producto.imagen}` : '/image/default-pizza.jpg'}
                  alt={producto.nombre}
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
                <h3 className="text-xl font-bold mb-2">{producto.nombre}</h3>
                <p className="text-gray-600 mb-2">{producto.descripcion}</p>
              </div>
            ))}
        </div>

        {/* Campo para asignar los puntos requeridos */}
        <div className="flex items-center space-x-4 mt-4">
          <input
            type="number"
            name="puntos_requeridos"
            value={puntosRequeridos}
            onChange={handlePuntosChange}
            disabled={!selectedProducto}
            placeholder="Puntos requeridos"
            className="w-1/2 px-3 py-2 border rounded disabled:bg-gray-200"
          />
          <button
            onClick={handleAgregarCanjeable}
            disabled={!selectedProducto || !puntosRequeridos}
            className={`px-4 py-2 rounded ${
              !selectedProducto || !puntosRequeridos
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#1446a0] text-white hover:bg-blue-700'
            }`}
          >
            Agregar
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={editModalIsOpen}
        onRequestClose={() => setEditModalIsOpen(false)}
        style={customStyles}
        contentLabel="Editar Producto Canjeable"
      >
        <h2 className="text-[#f54703] font-bold text-2xl mb-5">Editar Producto Canjeable</h2>
        
        {/* Mostrar detalles del producto seleccionado para editar */}
        {selectedProducto && (
          <div className="border rounded-lg p-4 shadow-md">
            <img
              src={selectedProducto.imagen ? `http://localhost:3000/uploads/${selectedProducto.imagen}` : '/image/default-pizza.jpg'}
              alt={selectedProducto.nombre}
              className="w-full h-32 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-bold mb-2">{selectedProducto.nombre}</h3>
            <p className="text-gray-600 mb-2">{selectedProducto.descripcion}</p>
          </div>
        )}

        {/* Campo para editar los puntos requeridos */}
        <div className="flex items-center space-x-4 mt-4">
          <input
            type="number"
            name="puntos_requeridos"
            value={puntosRequeridos}
            onChange={handlePuntosChange}
            placeholder="Puntos requeridos"
            className="w-1/2 px-3 py-2 border rounded"
          />
          <button
            onClick={handleActualizarCanjeable}
            className="px-4 py-2 rounded bg-[#1446a0] text-white hover:bg-blue-700"
          >
            Actualizar
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={deleteModalIsOpen}
        onRequestClose={closeDeleteModal}
        style={customStyles}
        contentLabel="Eliminar Producto Canjeable"
      >
        <h2 className="text-[#f54703] font-bold text-2xl mb-5">¿Está seguro que desea eliminar este producto canjeable?</h2>
        <p className="mb-5">{canjeableToDelete?.nombre}</p>
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

export default CanjeablesForm;