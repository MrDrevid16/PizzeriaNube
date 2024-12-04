import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPhone, FaShoppingCart } from 'react-icons/fa';
import { HiMail } from 'react-icons/hi';
import axios from 'axios';
import Cookies from 'js-cookie';
import "tailwindcss/tailwind.css";

const Contacto = () => {
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [mostrarMenuUsuario, setMostrarMenuUsuario] = useState(false);
  const [carrito, setCarrito] = useState([]);
  const [carritoVisible, setCarritoVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userID = Cookies.get('userID');
    const userRole = Cookies.get('userRole');
    const userName = Cookies.get('userName');
    
    setUserRole(userRole);
    setUserName(userName);

    cargarCarrito();
  }, []);

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

  const calcularCantidadTotal = () => {
    return carrito.reduce((total, item) => total + item.cantidad, 0);
  };

  const toggleCarrito = () => {
    setCarritoVisible(!carritoVisible);
  };

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <nav className="bg-[#1446a0] p-4 relative z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center text-white font-bold text-xl">
            <img src="/assets/img/logo_pizza2.png" alt="Logo" className="w-20 mr-2" />
            Pizzeria Saborreti
          </Link>
          <div className="hidden lg:flex items-center space-x-6">
            <Link to="/" className="text-white font-bold uppercase hover:text-gray-300 text-base">Inicio</Link>
            <Link to="/conocenos" className="text-white font-bold uppercase hover:text-gray-300 text-base">Conocenos</Link>
            <Link to="/landing" className="text-white font-bold uppercase hover:text-gray-300 text-base">Productos</Link>
            <Link to="/contacto" className="text-white font-bold uppercase hover:text-gray-300 text-base">Contacto</Link>
            {/* <Link to="/cupones" className="text-white font-bold uppercase hover:text-gray-300 text-base">Cupones</Link>
            <Link to="/pepperpoints" className="text-white font-bold uppercase hover:text-gray-300 text-base">Mis PepperPoints</Link> */}
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

      <main className="flex-grow">
        <div className="container mx-auto mt-8 px-4 max-w-7xl">
          <h2 className="text-3xl text-[#1446a0] font-bold text-center mb-8">Contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <p className="mb-6">Para cualquier consulta o sugerencia, por favor completa el siguiente formulario y nos pondremos en contacto contigo a la brevedad.</p>
              <div>
                <h5 className="text-[#f54703] font-bold text-xl mb-2">Dirección</h5>
                <p>Calle 57a #982 x 36 y 37 Fraccionamiento Los Heroes</p>
              </div>
              <div>
                <h5 className="text-[#f54703] font-bold text-xl mb-2">Teléfonos</h5>
                <p className="flex items-center mb-1"><FaPhone className="mr-2" /> 999 532 3689</p>
                <p className="flex items-center"><FaPhone className="mr-2" /> 999 168 0011</p>
              </div>
              <div>
                <h5 className="text-[#f54703] font-bold text-xl mb-2">Correo</h5>
                <p className="flex items-center"><HiMail className="mr-2" /> pizzasaborretti@gmail.com</p>
              </div>
            </div>
            <form className="space-y-4">
              <div>
                <label htmlFor="firstname" className="sr-only">Nombres</label>
                <input type="text" id="firstname" name="Nombres" placeholder="Nombres" className="w-full p-3 border rounded" autoFocus />
              </div>
              <div>
                <label htmlFor="lastname" className="sr-only">Apellidos</label>
                <input type="text" id="lastname" name="Apellidos" placeholder="Apellidos" className="w-full p-3 border rounded" />
              </div>
              <div>
                <label htmlFor="phonenumber" className="sr-only">Número de teléfono</label>
                <input type="tel" id="phonenumber" name="Número de teléfono" placeholder="Número de teléfono" className="w-full p-3 border rounded" required />
              </div>
              <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <input type="email" id="email" name="email" placeholder="Email" className="w-full p-3 border rounded" required />
              </div>
              <div>
                <label htmlFor="message" className="sr-only">Mensaje</label>
                <textarea id="message" name="Mensaje" placeholder="Mensaje" rows="8" className="w-full p-3 border rounded" required></textarea>
              </div>
              <button type="submit" className="bg-[#1446a0] text-white px-6 py-3 rounded text-lg font-bold hover:bg-[#0f3479] transition duration-300">Enviar</button>
            </form>
          </div>
        </div>
      </main>

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

export default Contacto;