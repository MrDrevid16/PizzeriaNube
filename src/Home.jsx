import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaPhone, FaShoppingCart, FaChevronLeft, FaChevronRight, FaBell } from "react-icons/fa";
import { HiMail } from "react-icons/hi";
import { RiCloseCircleLine } from "react-icons/ri";
import axios from "axios";
import Cookies from "js-cookie";
import "tailwindcss/tailwind.css";

const Home = () => {
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [mostrarMenuUsuario, setMostrarMenuUsuario] = useState(false);
  const [carrito, setCarrito] = useState([]);
  const [carritoVisible, setCarritoVisible] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [notificacionVisible, setNotificacionVisible] = useState(false);
  const [selectedNotificacion, setSelectedNotificacion] = useState(null);

  const slides = [
    "/assets/img/inio1.jpg",
    "/assets/img/inio2.jpg",
    "/assets/img/banner1.png",
    "/assets/img/banner3.png",
    "/assets/img/banner2.png",
    "/assets/img/inio1.jpg"
  ];

  const navigationLinks = [
    { to: "/", text: "Inicio" },
    { to: "/conocenos", text: "Conocenos" },
    { to: "/landing", text: "Productos" },
    { to: "/contacto", text: "Contacto" }
  ];

  const menuOptions = [
    { to: "/cupones", icon: "🎟", text: "Cupones", color: "blue" },
    { to: "/ListaOrdenes", icon: "🛒", text: "Ordenes Activas", color: "green" },
    { to: "/pepperpoints", icon: "🎫", text: "Pepperpoints", color: "orange" }
  ];

  useEffect(() => {
    startTimer();
    const userID = Cookies.get("userID");
    const userRole = Cookies.get("userRole");
    const userName = Cookies.get("userName");

    setUserRole(userRole);
    setUserName(userName);
    cargarCarrito();
    fetchNotificaciones();

    return () => clearInterval(timerRef.current);
  }, []);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentSlide(prevSlide => (prevSlide + 1) % slides.length);
    }, 5000);
  };

  const cargarCarrito = async () => {
    try {
      const userId = Cookies.get("userID");
      if (userId) {
        const response = await axios.get(`http://localhost:3000/api/carrito/${userId}`);
        setCarrito(response.data);
      }
    } catch (error) {
      console.error("Error al cargar el carrito:", error);
    }
  };

  const changeSlide = (direction) => {
    clearInterval(timerRef.current);
    setCurrentSlide(prevSlide => {
      const newSlide = direction === "next" 
        ? (prevSlide + 1) % slides.length 
        : (prevSlide - 1 + slides.length) % slides.length;
      return newSlide;
    });
    startTimer();
  };

  const cerrarSesion = () => {
    ["userName", "userRole", "userID"].forEach(cookie => Cookies.remove(cookie));
    setUserName("");
    setUserRole(null);
    setMostrarMenuUsuario(false);
    navigate("/loginform");
  };

  const fetchNotificaciones = async () => {
    try {
      const response = await axios.get("http://localhost:3000/notificaciones");
      setNotificaciones(response.data);
    } catch (error) {
      console.error("Error al obtener las notificaciones:", error);
    }
  };

  const calcularCantidadTotal = () => carrito.reduce((total, item) => total + item.cantidad, 0);

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <nav className="bg-[#1446a0] p-4 relative z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center text-white font-bold text-xl">
            <img src="/assets/img/logo_pizza2.png" alt="Logo" className="w-20 mr-2" />
            Pizzeria Saborreti
          </Link>

          <div className="hidden lg:flex items-center space-x-6">
            {navigationLinks.map(({ to, text }) => (
              <Link key={to} to={to} className="text-white font-bold uppercase hover:text-gray-300 text-base">{text}</Link>
            ))}

            {/* Reemplaza el Link de Mis compras con esto */}
{userName ? (
  <Link 
    to="/compras" 
    className="text-white font-bold uppercase border border-white rounded px-3 py-1 hover:bg-white hover:text-[#1446a0] text-base"
  >
    Mis compras
  </Link>
) : (
  <Link 
    to="/loginform" 
    className="text-white font-bold uppercase border border-white rounded px-3 py-1 hover:bg-white hover:text-[#1446a0] text-base"
    onClick={(e) => {
      e.preventDefault();
      navigate('/loginform', { state: { from: '/compras' } });
    }}
  >
    Mis compras
  </Link>
)}

            <div className="relative group">
              <button onClick={() => setCarritoVisible(!carritoVisible)} className="text-white border border-white rounded p-2 flex items-center hover:bg-white hover:text-[#1446a0] text-base">
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
                      {carrito.map(item => (
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

            {userName && (
              <div className="relative group">
                <button onClick={() => setNotificacionVisible(!notificacionVisible)} className="text-white border border-white rounded p-2 flex items-center hover:bg-white hover:text-[#1446a0] text-base">
                  <FaBell size={18} />
                  <span className="ml-2">{notificaciones.length}</span>
                </button>

                {notificacionVisible && (
                  <div className="absolute right-0 mt-2 w-96 bg-white shadow-xl rounded z-50">
                    <h3 className="text-lg font-bold p-4 border-b">Notificaciones</h3>
                    {notificaciones.length === 0 ? (
                      <p className="p-4">No hay notificaciones nuevas</p>
                    ) : (
                      <ul className="max-h-60 overflow-auto">
                        {notificaciones.map(notificacion => (
                          <li key={notificacion.idnotificacion} className="p-4 border-b cursor-pointer" onClick={() => setSelectedNotificacion(notificacion)}>
                            {notificacion.nombre}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}

            {userName ? (
              <div className="relative">
                <span onClick={() => setMostrarMenuUsuario(!mostrarMenuUsuario)} className="text-white cursor-pointer hover:text-gray-300 text-base font-bold">
                  Hola, {userName}
                </span>

                {mostrarMenuUsuario && (
                  <div className="absolute right-0 mt-2 w-64 bg-white shadow-xl rounded-lg z-50 py-3 flex flex-col space-y-2">
                    {menuOptions.map(option => (
                      <Link key={option.to} to={option.to} className="menu-option flex items-center px-4 py-2 hover:bg-orange-100 rounded-md transition duration-200 group">
                        <span className={`mr-3 text-${option.color}-500 group-hover:text-orange-500 transition duration-200`}>{option.icon}</span>
                        <span className="text-gray-700 group-hover:text-orange-500 font-medium transition duration-200">{option.text}</span>
                      </Link>
                    ))}
                    
                    <hr className="border-t border-gray-200" />
                    <button onClick={cerrarSesion} className="flex items-center w-full px-4 py-2 text-red-500 hover:bg-orange-100 rounded-md transition duration-200 group">
                      <span className="mr-3 group-hover:text-orange-500 transition duration-200">⬅️</span>
                      <span className="text-gray-700 group-hover:text-orange-500 font-medium transition duration-200">Cerrar sesión</span>
                    </button>

                    {userRole === "2" && (
                      <>
                        <hr className="border-t border-gray-200" />
                        <button onClick={() => navigate("/userlist")} className="menu-option flex items-center px-4 py-2 hover:bg-orange-100 rounded-md transition duration-200 group">
                          <span className="mr-3 text-purple-500 group-hover:text-orange-500 transition duration-200">⚙️</span>
                          <span className="text-gray-700 group-hover:text-orange-500 font-medium transition duration-200">Modo Administrador</span>
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
        <div className="relative w-full h-[calc(100vh-80px)] overflow-hidden">
          <div className="flex transition-transform duration-500 ease-in-out h-full" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {slides.map((slide, index) => (
              <div key={index} className="flex-shrink-0 w-full h-full" style={{
                backgroundImage: `url(${slide})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
              }}></div>
            ))}
          </div>
          
          <button onClick={() => changeSlide("prev")} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10 hover:bg-opacity-75">
            <FaChevronLeft size={24} />
          </button>
          <button onClick={() => changeSlide("next")} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10 hover:bg-opacity-75">
            <FaChevronRight size={24} />
          </button>
        </div>

        <div className="container mx-auto mt-8 px-4">
          <h1 className="text-center text-[#f54603] text-3xl font-bold mb-4">Bienvenido a Pizzería Saborreti</h1>
          <p className="text-center mb-8 text-lg">
            Descubre el auténtico sabor italiano en cada bocado. En Pizzería Saborreti, nos dedicamos a ofrecerte las mejores pizzas artesanales, preparadas con ingredientes frescos y de la más alta calidad.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {[
              { img: "sencilla.png", title: "Sencillas", desc: "De 1 ingrediente" },
              { img: "Especiales.png", title: "Especiales", desc: "De 3 a 4 ingredientes" },
              { img: "vip.png", title: "V.I.P", desc: "De 4 hasta 6 ingredientes" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <img src={`/assets/img/${item.img}`} alt={item.title} className="mx-auto" />
                <h2 className="text-[#f54603] text-2xl font-bold mt-4">{item.title}</h2>
                <p className="text-lg">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/landing" className="bg-[#1446a0] text-white text-xl font-bold px-8 py-3 rounded hover:bg-[#0f3479] transition duration-300">
              Ver todos los productos
            </Link>
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

      {selectedNotificacion && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 relative max-w-xl w-full">
            <img 
              src={`http://localhost:3000/uploads/${selectedNotificacion.imagen}`}
              alt={selectedNotificacion.nombre}
              className="max-w-full h-auto"
            />
            <button onClick={() => setSelectedNotificacion(null)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
              <RiCloseCircleLine size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;