import React, { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie'; // Importa la librería js-cookie
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

const ListaOrdenesAdmin = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [error, setError] = useState(null);
  const [mensajeError, setMensajeError] = useState('');
  const navigate = useNavigate();

  // Obtener el rol del usuario desde las cookies
  const userRole = Cookies.get('userRole'); // Obtener el userRole de las cookies
  
  if (userRole !== '2') {  // Verificar si el rol no es admin
    return <div className="text-center mt-4 text-red-500">No tienes acceso a esta página.</div>;
  }

  // Función para obtener las órdenes desde el backend
  const fetchOrdenes = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/admin/ordenes`);
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
    // Verificar si el usuario tiene el rol de administrador (rol 2)
    if (userRole !== '2') {
      // Si no es administrador, mostrar un mensaje de error o impedir la acción
      setMensajeError('No tienes permisos para actualizar el estado de esta orden.');
      return; // Salir de la función sin hacer nada
    }

    let etapas = obtenerEtapasOrden(idOrden);

    // Actualizar las etapas según el estado de la orden
    if (estadoOrden === 'En preparación' && !etapas.some(etapa => etapa.nombre === 'En preparación')) {
      etapas.push({ nombre: 'En preparación', completada: true });
    } else if (estadoOrden === 'Listo para recoger en tienda' && !etapas.some(etapa => etapa.nombre === 'Listo para recoger en tienda')) {
      etapas.push({ nombre: 'Listo para recoger en tienda', completada: true });
    }

    // Guardar las etapas en el almacenamiento local
    guardarEtapasOrden(idOrden, etapas);
    fetchOrdenes(); // Refrescar las órdenes
  };

  // Cuando el administrador hace clic en la orden, mostramos sus detalles.
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
            <p className="text-center text-gray-600">No hay órdenes activas.</p>
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
        </div>
      </div>

      <footer className="bg-[#f54703] p-4 text-center">
        {/* Aquí el pie de página */}
      </footer>

      {/* Mostrar mensaje de error si no es administrador */}
      {mensajeError && <div className="text-red-500 text-center mt-4">{mensajeError}</div>}
    </div>
  );
};

export default ListaOrdenesAdmin;
