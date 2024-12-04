import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import "tailwindcss/tailwind.css";

// Función para obtener las etapas guardadas de una orden
const obtenerEtapasOrden = (idOrden) => {
  const etapasGuardadas = localStorage.getItem(`etapas_orden_${idOrden}`);
  return etapasGuardadas ? JSON.parse(etapasGuardadas) : [];
};

// Función para actualizar las etapas de una orden en el almacenamiento local
const guardarEtapasOrden = (idOrden, etapas) => {
  localStorage.setItem(`etapas_orden_${idOrden}`, JSON.stringify(etapas));
};

// Función para obtener el progreso de una orden
const getProgreso = (idOrden) => {
  const etapas = obtenerEtapasOrden(idOrden);
  return etapas.length > 0 ? (etapas.filter(etapa => etapa.completada).length / etapas.length) * 100 : 0;
};

const ListaOrdenes = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Función para obtener las órdenes desde el backend
  const fetchOrdenes = async () => {
    const userId = Cookies.get('userID');
    if (!userId) {
      setError('Por favor, inicia sesión para ver tus órdenes.');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3000/api/ordenes?userId=${userId}`);
      const ordenesFiltradas = response.data
        .filter((orden) => orden.estado !== 'Entregado')
        .map((orden) => {
          const progreso = getProgreso(orden.idorden);
          return {
            ...orden,
            progreso,
          };
        });
      setOrdenes(ordenesFiltradas);
    } catch (err) {
      setError('Error al cargar las órdenes');
    }
  };

  // Polling para actualizar el estado de las órdenes en tiempo real
  useEffect(() => {
    fetchOrdenes();
    const intervalId = setInterval(fetchOrdenes, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // Función para actualizar las etapas de la orden automáticamente
  const actualizarEtapasAutomaticamente = (idOrden, estadoOrden) => {
    let etapas = obtenerEtapasOrden(idOrden);

    if (estadoOrden === 'En preparación' && !etapas.some(etapa => etapa.nombre === 'En preparación')) {
      etapas.push({ nombre: 'En preparación', completada: true });
    } else if (estadoOrden === 'Listo para recoger en tienda' && !etapas.some(etapa => etapa.nombre === 'Listo para recoger en tienda')) {
      etapas.push({ nombre: 'Listo para recoger en tienda', completada: true });
    }

    guardarEtapasOrden(idOrden, etapas);
    fetchOrdenes();
  };

  // Manejador para redirigir a la página de aterrizaje
  const handleSeguirComprando = () => {
    navigate('/landing');
  };

  // Cuando el usuario hace clic en la orden, mostramos sus etapas y el progreso.
  const manejarClickOrden = (idOrden, estadoOrden) => {
    actualizarEtapasAutomaticamente(idOrden, estadoOrden);
    navigate(`/orden/${idOrden}`);
  };

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <nav className="bg-[#1446a0] p-4 relative z-50">
        {/* Aquí va el contenido del navbar */}
      </nav>

      <div className="flex-grow p-4 flex justify-center">
        <div className="w-full max-w-2xl overflow-y-auto h-96">
          {ordenes.length === 0 ? (
            <p className="text-center text-gray-600">No tienes órdenes activas.</p>
          ) : (
            <ul className="space-y-4">
              {ordenes.map((orden) => (
                <li
                  key={orden.idorden}
                  className="bg-white shadow-md rounded-lg p-6 transition-transform transform hover:scale-105 hover:shadow-lg cursor-pointer"
                  onClick={() => manejarClickOrden(orden.idorden, orden.estado)}
                >
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-lg font-semibold">Orden #{orden.idorden}</p>
                    <p className="text-xl font-bold text-blue-600">${orden.total}</p>
                  </div>
                  <p className="font-medium text-gray-500">
                    Estado: {orden.estado} - {Math.round(orden.progreso)}% completado
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Última etapa: {obtenerEtapasOrden(orden.idorden).slice(-1)[0]?.nombre || 'No disponible'}
                  </p>
                  <div className="mt-2">
                    {orden.estado === 'En preparación' && (
                      <div className="w-full bg-gray-200 h-2 rounded-full">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${orden.progreso}%` }}></div>
                      </div>
                    )}
                    {orden.estado === 'Listo para recoger en tienda' && (
                      <div className="w-full bg-gray-200 h-2 rounded-full">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${orden.progreso}%` }}></div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
         <div className="flex justify-center mt-6">
  <button
    onClick={handleSeguirComprando}
    className="bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors hover:bg-blue-700"
  >
    Seguir Comprando
  </button>
</div>

        </div>
      </div>

      <footer className="bg-[#f54703] p-4 text-center">
        {/* Aquí el pie de página */}
      </footer>
    </div>
  );
};

export default ListaOrdenes;
