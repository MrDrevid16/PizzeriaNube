import React from 'react';
import './Perfil.css'; // Importa el archivo CSS para los estilos del perfil

const Perfil = () => {
  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <div className="perfil-avatar"></div>
        <div className="perfil-nombre">Nombre de Usuario</div>
      </div>
      <div className="perfil-links">
        <a href="#">Compras</a>
        <a href="#">Carrito</a>
        <a href="#">Cerrar Sesión</a>
      </div>
    </div>
  );
};

export default Perfil;
