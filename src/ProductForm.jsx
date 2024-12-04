import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Dashboard from './Dashboard';

Modal.setAppElement('#root');

const ProductForm = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    nombre: '',
    descripcion: '',
    tamano: '',
    precio: '',
    idcategoria: '',
    idoferta: '',
    imagen: '',
  });
  const [imagen, setImagen] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategorias();
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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/productos');
      const data = await response.json();
      setProductos(data);
      setLoading(false);
    } catch (error) {
      setError('Error fetching products');
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await fetch('http://localhost:3000/categoria');
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      console.error('Error fetching categorias:', error);
    }
  };

  const fetchOfertas = async () => {
    try {
      const response = await fetch('http://localhost:3000/ofertas');
      const data = await response.json();
      setOfertas(data);
    } catch (error) {
      console.error('Error fetching ofertas:', error);
    }
  };

  const openModal = () => {
    setNewProduct({
      nombre: '',
      descripcion: '',
      tamano: '',
      precio: '',
      idcategoria: '',
      idoferta: '',
      imagen: '',
    });
    setImagen(null);
    setSelectedProduct(null);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setDeleteModalIsOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalIsOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    for (const key in newProduct) {
      formData.append(key, newProduct[key]);
    }
    if (imagen) {
      formData.append('imagen', imagen);
    } else if (selectedProduct && selectedProduct.imagen) {
      formData.append('imagen', selectedProduct.imagen);
    }
  
    try {
      const url = selectedProduct
        ? `http://localhost:3000/productos/${selectedProduct.id_producto}`
        : 'http://localhost:3000/productos';
      const method = selectedProduct ? 'PUT' : 'POST';
  
      const response = await fetch(url, {
        method: method,
        body: formData,
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setSuccess('Producto guardado correctamente');
        fetchProducts();
        closeModal();
      } else {
        setError(`Error: ${data.error || 'Hubo un problema al guardar el producto'}`);
      }
    } catch (error) {
      setError('Error saving product');
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`http://localhost:3000/productos/${productToDelete.id_producto}`, { method: 'DELETE' });
      fetchProducts();
      setSuccess('Producto eliminado correctamente');
      closeDeleteModal();
    } catch (error) {
      setError('Error deleting product');
    }
  };

  const handleEdit = (product) => {
    setNewProduct({
      nombre: product.nombre,
      descripcion: product.descripcion,
      tamano: product.tamano,
      precio: product.precio,
      idcategoria: product.idcategoria,
      idoferta: product.idoferta,
      imagen: product.imagen,
    });
    setSelectedProduct(product);
    setImagen(null);
    setModalIsOpen(true);
  };

  const handleImageChange = (e) => {
    setImagen(e.target.files[0]);
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
      <h1 className="text-[#f54703] font-bold text-[32px] text-center mt-[100px] mb-[44px]">Productos</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      <div className="flex justify-end mb-6">
        <button 
          onClick={openModal} 
          className="bg-[#1446a0] text-white font-bold py-2 px-4 rounded"
        >
          Agregar Producto
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
                <th className="py-2 text-left font-bold text-[16px]">Descripción</th>
                <th className="py-2 text-left font-bold text-[16px]">Tamaño</th>
                <th className="py-2 text-left font-bold text-[16px]">Precio</th>
                <th className="py-2 text-left font-bold text-[16px]">Categoría</th>
                <th className="py-2 text-left font-bold text-[16px]">Oferta</th>
                <th className="py-2 text-left font-bold text-[16px]">Imagen</th>
                <th className="py-2 text-left font-bold text-[16px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((product) => (
                <tr key={product.id_producto}>
                  <td className="py-2 text-[16px]">{product.nombre}</td>
                  <td className="py-2 text-[16px]">{product.descripcion}</td>
                  <td className="py-2 text-[16px]">{product.tamano}</td>
                  <td className="py-2 text-[16px]">{product.precio}</td>
                  <td className="py-2 text-[16px]">
                    {categorias.find(cat => cat.idcategoria === product.idcategoria)?.nombre || product.idcategoria}
                  </td>
                  <td className="py-2 text-[16px]">
                    {ofertas.find(oferta => oferta.idoferta === product.idoferta)?.nombre || 'Sin oferta'}
                  </td>
                  <td className="py-2 text-[16px]">
                    {product.imagen && (
                      <img
                        src={`http://localhost:3000/uploads/${product.imagen}`}
                        alt={product.nombre}
                        className="w-[50px] h-[50px] object-cover"
                      />
                    )}
                  </td>
                  <td className="py-2">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(product)} 
                        className="bg-[#1446a0] text-white font-bold py-1 px-2 rounded mr-[18px]"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => openDeleteModal(product)} 
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
        contentLabel="Agregar/Editar Producto"
      >
        <h2 className="text-[#f54703] font-bold text-2xl mb-5">
          {selectedProduct ? 'Editar Producto' : 'Agregar Producto'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Nombre:</label>
            <input
              type="text"
              name="nombre"
              value={newProduct.nombre}
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
              value={newProduct.descripcion}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Tamaño:</label>
            <input
              type="text"
              name="tamano"
              value={newProduct.tamano}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Precio:</label>
            <input
              type="number"
              name="precio"
              value={newProduct.precio}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Categoría:</label>
            <select
              name="idcategoria"
              value={newProduct.idcategoria}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Seleccione una categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria.idcategoria} value={categoria.idcategoria}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">Oferta:</label>
            <select
              name="idoferta"
              value={newProduct.idoferta}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Seleccione una oferta</option>
              {ofertas.map((oferta) => (
                <option key={oferta.idoferta} value={oferta.idoferta}>
                  {oferta.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">Imagen actual:</label>
            <input
              type="text"
              value={newProduct.imagen || 'No hay imagen'}
              readOnly
              className="w-full px-3 py-2 border rounded bg-gray-100"
            />
          </div>
          <div className="col-span-2">
            <label className="block mb-1">Nueva imagen (opcional):</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="col-span-2 flex justify-end space-x-2 mt-5">
            <button type="submit" className="bg-[#1446a0] text-white font-bold py-2 px-4 rounded">
              {selectedProduct ? 'Guardar Cambios' : 'Agregar Producto'}
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
        contentLabel="Eliminar Producto"
      >
        <h2 className="text-[#f54703] font-bold text-2xl mb-5">¿Está seguro que desea eliminar este producto?</h2>
        <p className="mb-5">{productToDelete?.nombre}</p>
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

export default ProductForm;