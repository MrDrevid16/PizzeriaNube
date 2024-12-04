import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Dashboard = ({ children }) => {
  const [userName, setUserName] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [mostrarMenuUsuario, setMostrarMenuUsuario] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkUserSession();
  }, []);

  const checkUserSession = () => {
    const userID = Cookies.get('userID');
    const userRole = Cookies.get('userRole');
    const userName = Cookies.get('userName');
    
    if (!userID || !userRole || !userName) {
      navigate('/loginform');
    } else {
      setUserName(userName);
      setUserRole(userRole);
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

  return (
    <div className="font-montserrat">
      <nav className="bg-[#f54703] py-9">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img src="/assets/img/logo_pizza2.png" alt="Pizzeria Saborreti" className="w-[76px] h-auto mr-2" />
            <a href="#" className="text-white text-[20px] font-bold">Pizzeria Saborreti</a>
          </div>
          <ul className="flex space-x-6 items-center">
            <li><a href="/home" className="text-white hover:text-gray-200 font-bold text-[15px]">Inicio</a></li>
            <li><a href="/userlist" className="text-white hover:text-gray-200 font-bold text-[15px]">Usuarios</a></li>
            <li><a href="/productform" className="text-white hover:text-gray-200 font-bold text-[15px]">Productos</a></li>
            <li><a href="/canjeablesform" className="text-white hover:text-gray-200 font-bold text-[15px]">Canjeables</a></li>
            <li><a href="/categoriaform" className="text-white hover:text-gray-200 font-bold text-[15px]">Categorías</a></li>
            <li><a href="/comprasadmin" className="text-white hover:text-gray-200 font-bold text-[15px]">Compras</a></li>
            <li><a href="/cuponesadmin" className="text-white hover:text-gray-200 font-bold text-[15px]">Cupones</a></li>
            <li><a href="/ofertasadmin" className="text-white hover:text-gray-200 font-bold text-[15px]">Ofertas</a></li>
            <li><a href="/gestor-ordenes" className="text-white hover:text-gray-200 font-bold text-[15px]">Pedidos Activos</a></li>
            <li><a href="/NotificacionForm" className="text-white hover:text-gray-200 font-bold text-[15px]">Notificaciones</a></li>
            <li><a href="/supersetvista" className="text-white hover:text-gray-200 font-bold text-[15px]">Dashboard</a></li>
            <li className="relative">
              {userName ? (
                <span 
                  onClick={() => setMostrarMenuUsuario(!mostrarMenuUsuario)} 
                  className="text-white cursor-pointer hover:text-gray-200 text-[18px] font-bold"
                >
                  Hola, {userName}
                </span>
              ) : (
                <a href="/loginform" className="text-white hover:text-gray-200 border border-white rounded px-2 py-1 font-bold text-[20px]">
                  Iniciar sesión
                </a>
              )}
              {mostrarMenuUsuario && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded z-50">
                  <button 
                    onClick={cerrarSesion} 
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </li>
          </ul>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Dashboard;