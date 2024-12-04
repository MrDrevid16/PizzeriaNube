import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faUser } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'js-cookie';

function ProductoList() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [userName, setUserName] = useState('');
  const [mostrarMenuUsuario, setMostrarMenuUsuario] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    cargarProductos();
    cargarCarrito();
  }, []);

  const cargarProductos = async () => {
    try {
      const response = await axios.get('http://localhost:3000/productos');
      setProductos(response.data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const cargarCarrito = async () => {
    try {
      const userId = Cookies.get('userID');
      if (userId) {
        const response = await axios.get(`http://localhost:3000/api/carrito/${userId}`);
        setCarrito(response.data);
      }
    } catch (error) {
      console.error('Error al cargar el carrito:', error);
    }
  };

  useEffect(() => {
    const nombreUsuario = Cookies.get('userName');
    setUserName(nombreUsuario || '');
  }, []);

  const handleComprar = (productoId) => {
    console.log(`Comprar producto con ID ${productoId}`);
  };

  const handleAgregarCarrito = async (producto) => {
    try {
      const userId = Cookies.get('userID');
      if (!userId) {
        setMensaje('Por favor, inicia sesión para agregar productos al carrito');
        return;
      }

      const productoParaCarrito = {
        idproducto: producto.id_producto,
        nombre: producto.nombre,
        cantidad: 1,
        precio: producto.precio,
        total: producto.precio,
        imagen: producto.imagen,
        idusuario: parseInt(userId, 10)
      };

      const response = await axios.post('http://localhost:3000/api/carrito/agregar', productoParaCarrito);

      console.log('Respuesta del servidor:', response.data);
      setMensaje('Producto agregado al carrito');
      
      await cargarCarrito();
      
    } catch (error) {
      console.error('Error al agregar producto al carrito:', error);
      setMensaje('Error al agregar producto al carrito: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEliminarCarrito = async (productoId) => {
    try {
      await axios.delete(`http://localhost:3000/api/carrito/${productoId}`);
      await cargarCarrito();
    } catch (error) {
      console.error('Error al eliminar producto del carrito:', error);
    }
  };

  const handleActualizarCarrito = (idProducto, nuevaCantidad) => {
    axios.put(`http://localhost:3000/api/carrito/${idProducto}`, { cantidad: nuevaCantidad })
      .then(response => {
        console.log("Producto actualizado en el carrito:", response.data);
      })
      .catch(error => {
        console.error("Error al actualizar producto en el carrito:", error);
      });
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + item.total, 0);
  };
  
  const calcularCantidadTotal = () => {
    return carrito.reduce((total, item) => total + item.cantidad, 0);
  };

  const realizarCompra = async () => {
    try {
      const userId = Cookies.get('userID');
      if (!userId) {
        setMensaje('Por favor, inicia sesión para realizar la compra');
        return;
      }

      // Aquí enviar la solicitud para guardar los productos en la tabla de compras
      // Supongamos que tienes una ruta como 'http://localhost:3000/api/compras'

      const response = await axios.post('http://localhost:3000/api/compras', {
        productos: carrito.map(item => ({
          idproducto: item.idproducto,
          cantidad: item.cantidad,
          precio_unitario: item.precio,
          idusuario: item.idusuario
        })),
        total: calcularTotal(),
        idusuario: parseInt(userId, 10)
      });

      console.log('Compra realizada con éxito:', response.data);
      setMensaje('Compra realizada con éxito');
      
      // Vaciar el carrito después de la compra
      await Promise.all(carrito.map(item => axios.delete(`http://localhost:3000/api/carrito/${item.idproducto}`)));
      setCarrito([]);
      
    } catch (error) {
      console.error('Error al realizar la compra:', error);
      setMensaje('Error al realizar la compra: ' + (error.response?.data?.message || error.message));
    }
  };

  const cerrarSesion = () => {
    Cookies.remove('userName');
    Cookies.remove('userRole');
    setUserName('');
    setMostrarMenuUsuario(false);
    navigate('/loginform');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="bg-[#1446a0] p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center text-white font-bold text-lg">
            <img src="/assets/img/logo_pizza2.png" alt="Logo" className="w-20 mr-2" />
            Pizzeria Saborreti
          </Link>
          <div className="hidden lg:flex items-center space-x-4">
            <Link to="/" className="text-white">Inicio</Link>
            <Link to="/conocenos" className="text-white">Conócenos</Link>
            <Link to="/productolist" className="text-white">Productos</Link>
            <Link to="/contacto" className="text-white">Contacto</Link>
            <Link to="/compras" className="text-white border border-white rounded px-2 py-1">Mis compras</Link>
            <div className="relative">
              <button className="text-white border border-white rounded p-2" onClick={() => setMostrarCarrito(!mostrarCarrito)}>
                <FontAwesomeIcon icon={faShoppingCart} size="lg" />
                <span className="ml-2">{calcularCantidadTotal()}</span>
              </button>
              {mostrarCarrito && (
                <div className="absolute right-0 mt-2 w-96 bg-white shadow-xl rounded">
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">Carrito de compras</h3>
                    {carrito.length === 0 ? (
                      <p>No hay productos en el carrito</p>
                    ) : (
                      <div>
                        <ul>
                          {carrito.map(item => (
                            <li key={item.idproducto} className="flex justify-between items-center mb-2">
                              <div className="flex items-center">
                                <img src={`http://localhost:3000/uploads/${item.imagen}`} alt={item.nombre} className="w-12 h-12 object-cover mr-2" />
                                <span>{item.nombre}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="mr-2">Cantidad: {item.cantidad}</span>
                                <div className="flex flex-col">
                                  <button onClick={() => handleActualizarCarrito(item.idproducto, item.cantidad + 1)} className="text-gray-600 hover:text-gray-800">▲</button>
                                  <button onClick={() => handleActualizarCarrito(item.idproducto, Math.max(1, item.cantidad - 1))} className="text-gray-600 hover:text-gray-800">▼</button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-4 flex justify-between">
                          <span className="font-semibold">Total productos:</span>
                          <span className="font-semibold">{calcularCantidadTotal()}</span>
                        </div>
                        <div className="mt-2 flex justify-between">
                          <span className="font-semibold">Total:</span>
                          <span className="font-semibold">${calcularTotal().toFixed(2)}</span>
                        </div>
                        <button onClick={realizarCompra} className="mt-4 bg-[#1446a0] text-white rounded px-4 py-2 hover:bg-blue-700">
                          Realizar compra
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {userName ? (
              <div className="relative">
                <button
                  className="text-white border border-white rounded p-2 ml-2"
                  onClick={() => setMostrarMenuUsuario(!mostrarMenuUsuario)}
                >
                  Hola, {userName}
                </button>
                {mostrarMenuUsuario && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded">
                    <ul className="py-2">
                      <li
                        className="cursor-pointer px-4 py-2 hover:bg-gray-200"
                        onClick={cerrarSesion}
                      >
                        Cerrar sesión
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/loginform" className="text-white border border-white rounded px-2 py-1 ml-2">Iniciar sesión</Link>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto my-8">
        <h2 className="text-2xl font-bold mb-4">Listado de Productos</h2>
        <ul className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {productos.map(producto => (
            <li key={producto.id_producto} className="bg-white shadow-md rounded-lg overflow-hidden">
              <img src={`http://localhost:3000/uploads/${producto.imagen}`} alt={producto.nombre} className="w-full h-64 object-cover" />
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{producto.nombre}</h3>
                <p className="text-gray-700 mb-2">{producto.descripcion}</p>
                <p className="text-gray-800 font-semibold mb-2">${producto.precio}</p>
                <div className="flex justify-between items-center">
                  <button onClick={() => handleComprar(producto.id_producto)} className="bg-[#1446a0] text-white rounded px-4 py-2 hover:bg-blue-700">Comprar</button>
                  <button onClick={() => handleAgregarCarrito(producto)} className="bg-gray-200 text-gray-800 rounded px-4 py-2 hover:bg-gray-300 ml-2">Agregar al carrito</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {mensaje && (
        <div className="fixed bottom-0 right-0 bg-green-500 text-white p-4 mb-4 mr-4 rounded-md shadow-lg">
          {mensaje}
        </div>
      )}
    </div>
  );
}

export default ProductoList;
