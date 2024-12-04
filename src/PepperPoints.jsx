import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate, Link } from 'react-router-dom';
import { FaPhone, FaShoppingCart } from 'react-icons/fa';
import { HiMail } from 'react-icons/hi';
import Confetti from 'react-confetti';
import 'tailwindcss/tailwind.css';

const PepperPoints = () => {
  const [mensaje, setMensaje] = useState('');
  const [pepperPoints, setPepperPoints] = useState(null);
  const [productosCanjeables, setProductosCanjeables] = useState([]);
  const [modalProducto, setModalProducto] = useState(null);
  const [mostrarMenuUsuario, setMostrarMenuUsuario] = useState(false);
  const [carrito, setCarrito] = useState([]);
  const [carritoVisible, setCarritoVisible] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const navigate = useNavigate();
  const userId = Cookies.get('userID');
  const userName = Cookies.get('userName');
  const userRole = Cookies.get('userRole');

  useEffect(() => {
    verificarMembresia();
    fetchProductosCanjeables();
    cargarCarrito();
    fetchCategorias();
  }, []);

  useEffect(() => {
    if (mensajeExito) {
      const timer = setTimeout(() => {
        setMensajeExito('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [mensajeExito]);

  const fetchCategorias = async () => {
    try {
      // Llama al endpoint donde se encuentran los datos de las categorías
      const response = await fetch('http://localhost:3000/categoria');
      if (response.ok) {
        const data = await response.json();
        setCategorias(data); // Guarda los datos en el estado
      } else {
        console.error('Error al obtener las categorías:', response.statusText);
      }
    } catch (error) {
      console.error('Error al obtener las categorías:', error);
    }
  };

  // Verificar si el usuario tiene activada la membresía de PepperPoints
  const verificarMembresia = async () => {
    try {
      if (!userId) {
        setMensaje('Por favor, inicia sesión para acceder a Tus PepperPoints.');
        return;
      }

      const response = await axios.get(`http://localhost:3000/api/pepperpoints/${userId}`);
      if (response.status === 200 && response.data) {
        setPepperPoints(response.data);
      }
    } catch (error) {
      console.error('Error al verificar la membresía:', error);
    }
  };

  // Activar Membresía de PepperPoints
  const activarMembresia = async () => {
    try {
      if (!userId) {
        setMensaje('Por favor, inicia sesión para activar tu membresía.');
        return;
      }

      const response = await axios.post('http://localhost:3000/api/pepperpoints/activar', {
        id_usuario: parseInt(userId, 10),
      });

      if (response.status === 201) {
        setMensaje('¡Membresía PepperPoints activada con éxito!');
        verificarMembresia(); // Vuelve a cargar para verificar que la membresía está activa
      }
    } catch (error) {
      console.error('Error al activar la membresía:', error);
      setMensaje('Error al activar la membresía: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchProductosCanjeables = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/canjeables/disponibles');
      setProductosCanjeables(response.data);
    } catch (error) {
      console.error('Error al obtener productos canjeables:', error);
    }
  };

  // Confirmar el canje de un producto
  const confirmarCanje = (producto) => {
    if (!pepperPoints) {
      setMensaje('Debes activar tu membresía para canjear productos.');
      return;
    }

    if (pepperPoints.total_puntos < producto.puntos_requeridos) {
      setMensaje('No cuentas con suficientes puntos para canjear este producto.');
      return;
    }

    setModalProducto(producto);
  };

  // Manejar el canje de un producto seleccionado
  const handleCanjear = async () => {
    if (isProcessingPayment) return;
    setIsProcessingPayment(true);

    try {
      const response = await axios.post('http://localhost:3000/api/pepperpoints/canjear', {
        idusuario: parseInt(userId, 10),
        idproducto: modalProducto.id_producto,
      });

      if (response.status === 200) {
        await axios.post('http://localhost:3000/api/compras', {
          productos: [{
            nombre: modalProducto.nombre,
            cantidad: 1,
            total_compra: 0, // Almacenar el total como $0
            imagen: modalProducto.imagen,
            idcategoria: modalProducto.idcategoria,
          }],
          idusuario: parseInt(userId, 10),
          total_final: 0,
          transaction_id: 'CANJE_' + Date.now(),
        });

        // Almacenar el total del producto canjeado en las cookies
        Cookies.set('totalProductoCanjeado', '0');

        setPepperPoints((prev) => ({
          ...prev,
          total_puntos: prev.total_puntos - modalProducto.puntos_requeridos,
        }));
        setModalProducto(null);
        fetchProductosCanjeables(); // Actualizar lista de productos canjeables
        setShowConfetti(true);
        setShowNotification(true);
        // Detener el confeti después de unos segundos
        setTimeout(() => {
          setShowConfetti(false);
        }, 5000); // Mostrar confeti durante 5 segundos

        // Cerrar la notificación después de unos segundos
        setTimeout(() => {
          setShowNotification(false);
        }, 3000); // Mostrar notificación durante 3 segundos
      }
        setTimeout(() => {
          navigate('/compras');
        }, 5400);
      
    } catch (error) {
      console.error('Error al canjear el producto:', error);
      setMensaje('Error al canjear el producto: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Cerrar el modal de confirmación
  const cerrarModal = () => {
    setModalProducto(null);
  };

  const cargarCarrito = async () => {
    try {
      if (userId) {
        const response = await axios.get(`http://localhost:3000/api/carrito/${userId}`);
        setCarrito(response.data);
      }
    } catch (error) {
      console.error('Error al cargar el carrito:', error);
    }
  };

  const calcularCantidadTotal = () => {
    return carrito.reduce((total, item) => total + item.cantidad, 0);
  };

  const toggleCarrito = () => {
    setCarritoVisible(!carritoVisible);
  };

  const cerrarSesion = () => {
    Cookies.remove('userName');
    Cookies.remove('userRole');
    Cookies.remove('userID');
    setUserName('');
    setUserRole(null);
    setMostrarMenuUsuario(false);
    navigate('/loginform');
  };

  const irAModoAdministrador = () => {
    navigate('/userlist');
  };

  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* Navbar */}
      <nav className="bg-[#1446a0] p-4 relative z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center text-white font-bold text-xl">
            <img src="/assets/img/logo_pizza2.png" alt="Logo" className="w-20 mr-2" />
            Pizzeria Saborreti
          </Link>
          <div className="hidden lg:flex items-center space-x-6">
            <Link to="/" className="text-white font-bold uppercase hover:text-gray-300 text-base">Inicio</Link>
            <Link to="/conocenos" className="text-white font-bold uppercase hover:text-gray-300 text-base">Conócenos</Link>
            <Link to="/landing" className="text-white font-bold uppercase hover:text-gray-300 text-base">Productos</Link>
            <Link to="/contacto" className="text-white font-bold uppercase hover:text-gray-300 text-base">Contacto</Link>
            <Link to="/cupones" className="text-white font-bold uppercase hover:text-gray-300 text-base">Cupones</Link>
            <Link to="/compras" className="text-white font-bold uppercase border border-white rounded px-3 py-1 hover:bg-white hover:text-[#1446a0] text-base">Mis compras</Link>
            <div className="relative group">
              <button onClick={toggleCarrito} className="text-white border border-white rounded p-2 flex items-center hover:bg-white hover:text-[#1446a0] text-base">
                <FaShoppingCart size={18} />
                <span className="ml-2">{calcularCantidadTotal()}</span>
              </button>
              {carritoVisible && (
                <div className="absolute right-0 mt-2 w-96 bg-white shadow-xl rounded z-50">
                  <h3 className="text-lg font-bold p-4 border-b">Carrito de Compras</h3>
                  {carrito.length === 0 ? (
                    <p className="p-4">No hay productos en el carrito</p>
                  ) : (
                    <ul className="max-h-60 overflow-auto">
                      {carrito.map((item) => (
                        <li key={item.idproducto} className="p-4 border-b flex justify-between items-center">
                          <span>{item.nombre}</span>
                          <span>Cantidad: {item.cantidad}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="p-4">
                    <Link to="/landing" className="bg-blue-500 text-white px-4 py-2 rounded block text-center hover:bg-blue-600">
                      Ver Carrito Completo
                    </Link>
                  </div>
                </div>
              )}
            </div>
            {userName ? (
              <div className="relative">
                <span
                  onClick={() => setMostrarMenuUsuario(!mostrarMenuUsuario)}
                  className="text-white cursor-pointer hover:text-gray-300 text-base font-bold"
                >
                  Hola, {userName}
                </span>

                {mostrarMenuUsuario && (
                  <div className="absolute right-0 mt-2 w-64 bg-white shadow-xl rounded-lg z-50 py-3 flex flex-col space-y-2 transform transition-transform duration-300 ease-out">
                    {/* Opción para Cupones */}
                    <Link
                      to="/cupones"
                      className="menu-option flex items-center px-4 py-2 hover:bg-orange-100 rounded-md transition duration-200 group"
                    >
                      <span className="mr-3 text-blue-500 group-hover:text-orange-500 transition duration-200">
                        🎟
                      </span>
                      <span className="text-gray-700 group-hover:text-orange-500 font-medium transition duration-200">
                        Cupones
                      </span>
                    </Link>
                    {/* Separador */}
                    <hr className="border-t border-gray-200" />
                    {/* Opción para Orden Activa */}
                    <Link
                      to="/ListaOrdenes"
                      className="menu-option flex items-center px-4 py-2 hover:bg-orange-100 rounded-md transition duration-200 group"
                    >
                      <span className="mr-3 text-green-500 group-hover:text-orange-500 transition duration-200">
                        🛒
                      </span>
                      <span className="text-gray-700 group-hover:text-orange-500 font-medium transition duration-200">
                        Ordenes Activas
                      </span>
                    </Link>
                    {/* Separador */}
                    <hr className="border-t border-gray-200" />
                    {/* Opción para Membresía */}
                    <Link
                      to="/pepperpoints"
                      className="menu-option flex items-center px-4 py-2 hover:bg-orange-100 rounded-md transition duration-200 group"
                    >
                      <span className="mr-3 text-orange-500 group-hover:text-orange-500 transition duration-200">
                        🎫
                      </span>
                      <span className="text-gray-700 group-hover:text-orange-500 font-medium transition duration-200">
                        Pepperpoints
                      </span>
                    </Link>
                    {/* Separador */}
                    <hr className="border-t border-gray-200" />
                    {/* Opción para Cerrar Sesión */}
                    <button
                      onClick={cerrarSesion}
                      className="flex items-center w-full px-4 py-2 text-red-500 hover:bg-orange-100 rounded-md transition duration-200 group"
                    >
                      <span className="mr-3 text-red-500 group-hover:text-orange-500 transition duration-200">
                        ⬅️ {/* Emoji de flecha hacia la izquierda */}
                      </span>
                      <span className="text-gray-700 group-hover:text-orange-500 font-medium transition duration-200">
                        Cerrar sesión
                      </span>
                    </button>
                    {/* Opción para Modo Administrador */}
                    {userRole === "2" && (
                      <>
                        <hr className="border-t border-gray-200" />
                        <button
                          onClick={irAModoAdministrador}
                          className="menu-option flex items-center px-4 py-2 hover:bg-orange-100 rounded-md transition duration-200 group"
                        >
                          <span className="mr-3 text-purple-500 group-hover:text-orange-500 transition duration-200">
                            ⚙️
                          </span>
                          <span className="text-gray-700 group-hover:text-orange-500 font-medium transition duration-200">
                            Modo Administrador
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Link to="/loginform" className="text-white font-bold uppercase hover:text-gray-300 text-base">Iniciar sesión</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
<main className="flex-grow container mx-auto mt-10 px-4">
{showNotification && (
        <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white p-4 rounded-lg shadow-md z-50">
          ¡Felicidades! Canjeaste tus puntos por una pizza.
        </div>
      )}
      {showConfetti && <Confetti />}
  <div className="flex flex-col md:flex-row">
    {/* Sección izquierda: Tarjeta y PepperPoints por Categoría */}
    <aside className="md:w-1/4 pr-4 flex flex-col gap-6">
      <div>
        {pepperPoints ? (
          <div className="bg-gradient-to-r from-[#f54703] via-[#f78f03] to-[#f5b003] text-white w-full h-52 rounded-lg shadow-lg p-4 relative">
            <div className="flex justify-between items-center mb-4">
              <div className="text-lg font-bold">Tarjeta de Membresia</div>
              <img src="/assets/img/logo_pizza2.png" alt="Logo" className="w-10 h-10" />
            </div>
            <div className="mb-6">
              <span className="block text-sm">Número de Tarjeta:</span>
              <span className="block text-2xl font-bold tracking-widest">{pepperPoints.num_tarjeta}</span>
            </div>
            <div>
              <span className="block text-sm">PepperPoints:</span>
              <span className="block text-xl font-bold">{pepperPoints.total_puntos} pts</span>
            </div>
          </div>
        ) : (
          <div className="bg-[#f54703] p-4 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-center text-white">Activa Tus PepperPoints</h2>
            <p className="text-white mb-6 text-center">
              Con nuestra membresía PepperPoints, puedes acumular puntos cada vez que compras una pizza. Canjea tus puntos por nuestras deliciosas pizzas.
            </p>
            <button
              onClick={activarMembresia}
              className="w-full bg-white text-[#f54703] px-4 py-2 rounded hover:bg-gray-200"
            >
              Activar Membresía
            </button>
            {mensaje && <p className="text-sm text-white mt-4 text-center">{mensaje}</p>}
          </div>
        )}
      </div>

      {/* PepperPoints por Categoría - Ahora debajo de la tarjeta */}
      <div className="bg-white border-2 border-[#f54703] rounded-lg shadow-md w-full">
        <div className="bg-[#f54703] text-white p-3 rounded-t-lg">
          <h3 className="text-xl font-bold">PepperPoints por Categoría</h3>
        </div>
        <div className="p-4">
          <table className="w-full">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="font-bold py-2">Todas nuestras pizzas</td>
                <td className="text-sm text-gray-600 py-2">Te regalamos puntos por cada compra</td>
              </tr>
              {categorias.map((categoria) => (
                categoria.nombre !== 'Ofertas' && (
                  <tr key={categoria.idcategoria} className="border-b border-gray-200">
                    <td className="py-2">{categoria.nombre}</td>
                    <td className="flex items-center py-2">
                      <img src="/image/pepperpoint.png" alt="PepperPoint" className="w-6 h-6 mr-2" />
                      <span>{categoria.puntos} puntos</span>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </aside>

    {/* Sección de Productos Canjeables */}
    <section className="md:w-3/4">
      <h2 className="text-center text-[#f54603] text-3xl font-bold mb-4">Productos Canjeables</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productosCanjeables.map((producto) => (
          <div key={producto.id_producto} className="border rounded-lg p-4 shadow-md">
            <img
              src={producto.imagen ? `http://localhost:3000/uploads/${producto.imagen}` : '/image/default-pizza.jpg'}
              alt={producto.nombre}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-bold mb-2">{producto.nombre}</h3>
            <p className="text-gray-600 mb-2">{producto.descripcion}</p>
            <p className="text-lg font-bold text-[#f54703] mb-3 flex items-center"> <img src="/image/pepperpoint.png" alt="PepperPoints" className="w-6 h-6 ml-2"/> Puntos requeridos:  {producto.puntos_requeridos}</p> 
            <button
              onClick={() => confirmarCanje(producto)}
              className="w-full bg-[#1446a0] text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Canjear
            </button>
          </div>
        ))}
      </div>
    </section>
  </div>
</main>

      {/* Modal de Confirmación para Canje */}
{modalProducto && (
<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
<div className="bg-white p-8 rounded-lg shadow-md w-full md:w-1/3">
<h3 className="text-xl font-bold mb-4 text-[#f54703]">Confirmar Canje</h3>
<p className="mb-6">¿Estás seguro de que quieres canjear {modalProducto.nombre} por {modalProducto.puntos_requeridos} PepperPoints?</p>
<div className="mb-4">
<p className="mb-2"><strong>Subtotal:</strong> ${modalProducto.precioFinal ? modalProducto.precioFinal.toFixed(2) : '0.00'}</p>
<p className="mb-2 text-green-500"><strong>Descuento:</strong> -${modalProducto.precioFinal ? modalProducto.precioFinal.toFixed(2) : '0.00'}</p>
<p className="text-xl font-bold">Total: $0.00</p>
</div>
<div className="flex justify-between">
<button
             onClick={handleCanjear}
             className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
           >
Aceptar
</button>
<button
             onClick={cerrarModal}
             className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
           >
Cancelar
</button>
</div>
</div>
</div>
)}
{/* Mensaje de Éxito */}
{mensajeExito && (
    <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
      {mensajeExito}
    </div>
  )}

  {/* Footer */}
  <footer className="bg-[#f54703] text-white mt-16">
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex justify-center">
          <img src="/assets/img/logo_pizza2.png" alt="Logo" className="w-36" />
        </div>
        <div>
          <h5 className="font-bold mb-2 text-lg">Dirección</h5>
          <p className="text-base">Calle 57a #982 x 36 y 37 Fraccionamiento Los Heroes</p>
        </div>
        <div>
          <h5 className="font-bold mb-2 text-lg">Teléfonos</h5>
          <p className="text-base"><FaPhone className="inline mr-2" /> 999 532 3689</p>
          <p className="text-base"><FaPhone className="inline mr-2" /> 999 168 0011</p>
        </div>
        <div>
          <h5 className="font-bold mb-2 text-lg">Correo</h5>
          <p className="text-base"><HiMail className="inline mr-2" /> pizzasaborretti@gmail.com</p>
        </div>
      </div>
    </div>
    <div className="bg-[#f54703] text-center py-4">
      <p className="text-lg">© 2024 <strong>Pizzeria Saborreti</strong></p>
    </div>
  </footer>
</div>
);
};
export default PepperPoints;