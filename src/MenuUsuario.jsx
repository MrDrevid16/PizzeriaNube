import React from 'react';
import { Link } from 'react-router-dom';

const MenuUsuario = ({
  userName,
  userRole,
  mostrarMenuUsuario,
  setMostrarMenuUsuario,
  cerrarSesion,
  irAModoAdministrador,
}) => {
  return (
    <div className="relative">
      <span
        onClick={() => setMostrarMenuUsuario(!mostrarMenuUsuario)}
        className="text-white cursor-pointer hover:text-gray-300 text-base font-bold"
        aria-haspopup="true"
        aria-expanded={mostrarMenuUsuario}
      >
        Hola, {userName}
      </span>
      {mostrarMenuUsuario && (
        <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg z-50 py-2 transition-opacity duration-200 ease-out">
          {/* Opción para Cupones */}
          <Link to="/cupones" className="menu-option">
            🎟 Cupones
          </Link>
          {/* Opción para Orden Activa */}
          <Link to="/ListaOrdenes" className="menu-option">
            🛒 Ordenes Activas
          </Link>
          {/* Opción para Membresía */}
          <Link to="/membresia" className="menu-option">
            🎫 Membresía
          </Link>
          {/* Opción para Editar Perfil */}
          <Link to="/editar-perfil" className="menu-option">
            ✏️ Editar Perfil
          </Link>
          {/* Opción para Cerrar Sesión */}
          <button
            onClick={cerrarSesion}
            className="block w-full text-left menu-option text-red-500"
          >
            <i className="fas fa-sign-out-alt mr-2"></i> Cerrar sesión
          </button>
          {/* Opción para Modo Administrador */}
          {userRole === "2" && (
            <button onClick={irAModoAdministrador} className="menu-option">
              ⚙️ Modo Administrador
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MenuUsuario;
