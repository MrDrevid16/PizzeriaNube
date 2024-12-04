import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate, Link } from "react-router-dom";
import { FaPhone } from 'react-icons/fa';
import { HiMail } from 'react-icons/hi';
import "tailwindcss/tailwind.css";

const Cupones = () => {
  const [cupones, setCupones] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensajes, setMensajes] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [mostrarMenuUsuario, setMostrarMenuUsuario] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCupones = async () => {
      try {
        const userId = Cookies.get('userID');
        if (!userId) {
          navigate('/loginform');
          return;
        }

        const userRole = Cookies.get('userRole');
        const userName = Cookies.get('userName');
        setUserRole(userRole);
        setUserName(userName);

        // Obtener cupones disponibles específicamente para este usuario
        const response = await axios.get(`http://localhost:3000/api/cupones-disponibles/${userId}`);
        const cuponesActivos = await axios.get("http://localhost:3000/api/cupones-activos");
        
        // Combinar la información de ambos endpoints
        const cuponesConInfo = cuponesActivos.data.map(cupon => ({
          ...cupon,
          disponible: response.data.some(c => c.idcupon === cupon.idcupon && !c.usado)
        }));

        setCupones(cuponesConInfo);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener cupones:", error);
        setError('Error al cargar los cupones');
        setLoading(false);
      }
    };

    fetchCupones();
  }, [navigate]);

  const handleMoreInfoClick = (index) => {
    setSelectedCoupon(selectedCoupon === index ? null : index);
  };

  const aplicarCupon = (cupon) => {
    if (!cupon.disponible) {
      setMensajes({ error: 'Este cupón ya no está disponible' });
      setTimeout(() => {
        setMensajes({});
      }, 3000);
      return;
    }

    // Guardar el cupón seleccionado en el localStorage para usarlo en el landing
    localStorage.setItem('selectedCoupon', JSON.stringify(cupon));
    navigate('/landing', { state: { selectedCoupon: cupon } });
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

  const MisCupones = () => {
    navigate('/cupones');
  };

  const MiCarrito = () => {
    navigate('/carrito');
  };

  if (loading) {
    return (
      <div className="min-h-screen">
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
              <Link to="/compras" className="text-white font-bold uppercase border border-white rounded px-3 py-1 hover:bg-white hover:text-[#1446a0] text-base">Mis compras</Link>
              {userName ? (
                <div className="relative">
                  <span 
                    onClick={() => setMostrarMenuUsuario(!mostrarMenuUsuario)} 
                    className="text-white cursor-pointer hover:text-gray-300 text-base font-bold"
                  >
                    Hola, {userName}
                  </span>
                  {mostrarMenuUsuario && (
                    <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded z-50">
                      <button onClick={cerrarSesion} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Cerrar sesión
                      </button>
                      <button onClick={MisCupones} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Mis cupones
                      </button>
                      <button onClick={MiCarrito} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Mi carrito
                      </button>
                      {userRole === "2" && (
                        <button onClick={irAModoAdministrador} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Modo Administrador
                        </button>
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
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <p className="text-xl text-gray-600">Cargando cupones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <nav className="bg-[#1446a0] p-4 relative z-50">
          {/* Mismo contenido del nav que arriba */}
        </nav>
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <p className="text-xl text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
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
            <Link to="/cupones" className="text-white font-bold uppercase hover:text-gray-300 text-base">Cupones</Link>
            <Link to="/pepperpoints" className="text-white font-bold uppercase hover:text-gray-300 text-base">Mis PepperPoints</Link>
            <Link to="/compras" className="text-white font-bold uppercase border border-white rounded px-3 py-1 hover:bg-white hover:text-[#1446a0] text-base">Mis compras</Link>
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

      <div className="container mx-auto px-4 py-8 flex-grow">
        <h2 className="text-center text-[#f54603] text-3xl font-bold mb-8">Mis Cupones Disponibles</h2>
        
        {cupones.length === 0 ? (
          <div className="text-center text-gray-600 text-xl">
            No tienes cupones disponibles en este momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cupones.map((cupon, index) => (
              <div key={cupon.idcupon} className="border rounded-lg p-4 shadow-md">
                <div className={`${cupon.bgColor} p-4 rounded-lg mb-4`}>
                  <img src={cupon.img} alt="cupon" className="w-full h-24 object-cover rounded" />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-500 mb-2">
                    DESCUENTO {cupon.discount}%
                  </p>
                  <p className="text-gray-600 mb-2">Válido hasta: {cupon.expiration}</p>
                  <div className="mb-2">
                    {cupon.disponible ? (
                      <span className="text-green-500 font-semibold">Disponible para usar</span>
                    ) : (
                      <span className="text-red-500 font-semibold">Cupón ya utilizado</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleMoreInfoClick(index)}
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300 w-full mb-2"
                  >
                    {selectedCoupon === index ? 'Cerrar' : 'Más Información'}
                  </button>
                  <button
                    onClick={() => aplicarCupon(cupon)}
                    className={`w-full py-2 px-4 rounded transition duration-300 ${
                      cupon.disponible 
                        ? 'bg-green-500 hover:bg-green-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!cupon.disponible}
                  >
                    {cupon.disponible ? 'Usar Cupón' : 'Cupón Usado'}
                  </button>
                </div>
                {selectedCoupon === index && (
                  <div className="mt-4 text-left bg-gray-100 p-3 rounded-lg">
                    <p className="text-gray-600">{cupon.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

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

      {/* Mensajes de éxito/error */}
      {mensajes.error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
          {mensajes.error}
        </div>
      )}
      {mensajes.success && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
          {mensajes.success}
        </div>
      )}
    </div>
  );
};

export default Cupones;