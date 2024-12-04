import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './Dashboard';

const ComprasAdmin = () => {
  const [compras, setCompras] = useState([]);
  const [filteredCompras, setFilteredCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    fetchCompras();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [compras, filterType, filterDate]);

  const fetchCompras = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/compras');
      setCompras(response.data);
      setFilteredCompras(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener las compras:', error);
      setError('Error al cargar las compras. Por favor, intente más tarde.');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Mexico_City'
    });
  };

  const applyFilter = () => {
    let filtered = [...compras];
    if (filterType !== 'all' && filterDate) {
      const filterDateObj = new Date(filterDate + 'T00:00:00');
      filtered = filtered.filter(compra => {
        const compraDate = new Date(compra.fecha_compra);
        switch (filterType) {
          case 'day':
            return compraDate.getFullYear() === filterDateObj.getFullYear() &&
                   compraDate.getMonth() === filterDateObj.getMonth() &&
                   compraDate.getDate() === filterDateObj.getDate();
          case 'month':
            return compraDate.getFullYear() === filterDateObj.getFullYear() &&
                   compraDate.getMonth() === filterDateObj.getMonth();
          case 'year':
            return compraDate.getFullYear() === filterDateObj.getFullYear();
          default:
            return true;
        }
      });
    }
    setFilteredCompras(filtered);
  };

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
    setFilterDate('');
  };

  const handleFilterDateChange = (e) => {
    setFilterDate(e.target.value);
  };

  if (loading) return <Dashboard><div className="text-center p-4">Cargando compras...</div></Dashboard>;
  if (error) return <Dashboard><div className="text-center p-4 text-red-500">{error}</div></Dashboard>;

  return (
    <Dashboard>
      <h1 className="text-[#f54703] font-bold text-[32px] text-center mt-[100px] mb-[44px]">Registro de Compras</h1>

      <div className="mb-4 flex justify-center space-x-4">
        <select 
          value={filterType} 
          onChange={handleFilterTypeChange}
          className="p-2 border rounded"
        >
          <option value="all">Todos</option>
          <option value="day">Por día</option>
          <option value="month">Por mes</option>
          <option value="year">Por año</option>
        </select>
        {filterType !== 'all' && (
          <input 
            type={filterType === 'day' ? 'date' : filterType === 'month' ? 'month' : 'number'} 
            value={filterDate} 
            onChange={handleFilterDateChange}
            className="p-2 border rounded"
            placeholder={filterType === 'year' ? 'Ingrese el año' : ''}
            min={filterType === 'year' ? '1900' : undefined}
            max={filterType === 'year' ? new Date().getFullYear().toString() : undefined}
          />
        )}
      </div>

      <div className="overflow-x-auto p-[36px]">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-[#f54703]">
              <th className="py-2 text-left font-bold text-[16px]">Fecha de Compra</th>
              <th className="py-2 text-left font-bold text-[16px]">Producto</th>
              <th className="py-2 text-left font-bold text-[16px]">Cantidad</th>
              <th className="py-2 text-left font-bold text-[16px]">Total</th>
              <th className="py-2 text-left font-bold text-[16px]">Usuario</th>
              <th className="py-2 text-left font-bold text-[16px]">Categoría</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompras.map((compra, index) => (
              <tr key={compra.idcompra || `compra-${index}`}>
                <td className="py-2 text-[16px]">{formatDate(compra.fecha_compra)}</td>
                <td className="py-2 text-[16px]">
                  <div className="flex items-center">
                    <img 
                      src={compra.imagen ? `http://localhost:3000/uploads/${compra.imagen}` : '/assets/img/default-product.jpg'} 
                      alt={compra.nombre_producto} 
                      className="w-12 h-12 rounded-xl mr-2" 
                    />
                    <span>{compra.nombre_producto}</span>
                  </div>
                </td>
                <td className="py-2 text-[16px]">{compra.cantidad}</td>
                <td className="py-2 text-[16px]">${parseFloat(compra.total_compra).toFixed(2)}</td>
                <td className="py-2 text-[16px]">{compra.nombre_usuario}</td>
                <td className="py-2 text-[16px]">{compra.nombre_categoria}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Dashboard>
  );
};

export default ComprasAdmin;