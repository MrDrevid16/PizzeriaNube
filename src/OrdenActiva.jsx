import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faCircle } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import "tailwindcss/tailwind.css";
import axios from 'axios';
import Cookies from 'js-cookie';

const OrdenActiva = () => {
  const [orden, setOrden] = useState(null);
  const [etapas, setEtapas] = useState([]);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState(null);
  const navigate = useNavigate();
  const idOrden = window.location.pathname.split('/').pop();
  const userRole = Cookies.get('userRole');

  const guardarEstadoEnLocalStorage = (nuevasEtapas) => {
    localStorage.setItem(`etapas_orden_${idOrden}`, JSON.stringify(nuevasEtapas));
    const updatedOrden = { ...orden, estado: nuevasEtapas.find(etapa => !etapa.completada)?.nombre || "Listo para recoger en tienda" };
    localStorage.setItem(`orden_${idOrden}`, JSON.stringify(updatedOrden));
  };

  const actualizarEstadoOrden = async (nuevoEstado) => {
    try {
      await axios.patch(`http://localhost:3000/api/ordenes/${idOrden}`, { estado: nuevoEstado });
    } catch (err) { 
      console.error('Error al actualizar el estado de la orden', err);
    }
  };

  const actualizarEtapaManual = (indice, completada) => {
    setEtapas((prevEtapas) => {
      const nuevasEtapas = [...prevEtapas];
      if (nuevasEtapas[indice]) {
        nuevasEtapas[indice].completada = completada;
      }
      guardarEstadoEnLocalStorage(nuevasEtapas);
      return nuevasEtapas;
    });

    const nuevoEstado = etapas[indice]?.nombre;
    if (nuevoEstado) {
      actualizarEstadoOrden(nuevoEstado);
    }
  };

  const avanzarEtapa = () => {
    const indiceActual = etapas.findIndex((etapa) => etapa && !etapa.completada);
    if (indiceActual !== -1) {
      actualizarEtapaManual(indiceActual, true);
    }
  };

  const fetchOrden = async () => {
    const userId = Cookies.get('userID');
    if (!userId) {
      setError('Por favor, inicia sesión para ver tu orden.');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3000/api/ordenes/${idOrden}`);

      if (userRole !== '2' && response.data.idusuario !== parseInt(userId, 10)) {
        setError('No tienes permiso para ver esta orden.');
        return;
      }

      setOrden(response.data);

      const etapasGuardadas = localStorage.getItem(`etapas_orden_${idOrden}`);
      if (etapasGuardadas) {
        setEtapas(JSON.parse(etapasGuardadas));
      } else {
        const etapasIniciales = [
          { id: 1, nombre: "Pedido recibido", completada: false },
          { id: 2, nombre: "En preparación", completada: false },
          { id: 3, nombre: "Listo para recoger en tienda", completada: false }
        ];
        setEtapas(etapasIniciales);
        guardarEstadoEnLocalStorage(etapasIniciales);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar la orden');
    }
  };

  useEffect(() => {
    fetchOrden();
    const userName = Cookies.get("userName");
    setUserName(userName);
  }, []);

  const handleNuevaCompra = () => {
    navigate('/Landing');
  };

  const handleRecogerPedido = async () => {
    try {
      await axios.patch(`http://localhost:3000/api/ordenes/${idOrden}`, { estado: "Entregado" });
      await axios.delete(`http://localhost:3000/api/ordenes/${idOrden}`);
      alert('¡Pedido Entregado!');
      navigate('/landing');
    } catch (err) {
      console.error('Error al actualizar y eliminar la orden:', err);
      setError(err.message || 'No se pudo actualizar el estado del pedido.');
    }
  };

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  }

  if (!orden) {
    return <div className="text-center mt-4">Cargando tu orden...</div>;
  }

  const porcentajeCompletado = (etapas.filter(etapa => etapa?.completada).length / etapas.length) * 100;
  const etapaFinalCompletada = etapas[2]?.completada;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-blue-700 text-white p-6 w-full shadow-md">
        <h1 className="text-3xl font-semibold text-center">Saboretti - Seguimiento de Orden</h1>
      </header>

      <div className="flex-grow flex flex-col items-center justify-center p-6">
       

        <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-lg">
          <h2 className="text-xl font-semibold text-blue-600 mb-6">Estado de tu pedido #{orden.idorden}:</h2>
          <p className="text-lg text-gray-700 mb-6">¡Hola, <span className="font-semibold">{userName}</span>! Tu pedido está en proceso.</p>

          <ul className="space-y-4 mb-8">
            {etapas.map((etapa, index) => (
              <li key={etapa.id} className="flex items-center space-x-3">
                <FontAwesomeIcon
                  icon={etapa?.completada ? faCheckCircle : faCircle}
                  className={`text-xl ${etapa?.completada ? 'text-green-500' : 'text-gray-400'}`}
                />
                <span className={`${etapa?.completada ? 'line-through' : ''}`}>{etapa?.nombre}</span>
              </li>
            ))}
          </ul>

          <div className="relative h-3 bg-gray-300 rounded-full overflow-hidden mb-8">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${porcentajeCompletado}%` }}
            ></div>
          </div>

          <p className="text-lg mb-2 font-semibold">Total: ${orden.total}</p>
          <p className="text-lg mb-2">Método de pago: {orden.metodopago}</p>
          <p className="text-lg mb-2">Dirección de entrega: {orden.direccionentrega}</p>
          <p className="text-lg mb-2">Teléfono de contacto: {orden.telefonocontacto}</p>
          <p className="text-lg mb-4">Fecha: {new Date(orden.fecha).toLocaleDateString()} {orden.hora}</p>

          {userRole === '2' && !etapaFinalCompletada && (
            <div className="flex justify-center mt-6">
              <button
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all duration-300"
                onClick={avanzarEtapa}
                disabled={etapas.every((etapa) => etapa?.completada)}
              >
                Avanzar Etapa
              </button>
            </div>
          )}

          {userRole === '2' && etapaFinalCompletada && (
            <div className="flex justify-center mt-6">
              <button
                className="bg-green-500 text-white px-8 py-3 rounded-lg shadow-md hover:bg-green-600 transition-all duration-300"
                onClick={handleRecogerPedido}
              >
                ¡Entregar Pedido!
              </button>
            </div>
          )}

          {userRole !== '1' && (
            <div className="flex justify-center mt-6">
              <button
                className="bg-blue-500 text-white px-8 py-3 rounded-lg shadow-md hover:bg-blue-600 transition-all duration-300"
                onClick={handleNuevaCompra}
              >
                Nueva Compra
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className="bg-orange-600 text-white p-6 w-full text-center shadow-md">
        <p>&copy; 2024 Saboretti Pizzería. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default OrdenActiva;
