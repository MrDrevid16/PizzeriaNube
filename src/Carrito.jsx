// Importaciones se mantienen igual
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from "react-router-dom";
import { FaPhone, FaShoppingCart, FaTrash } from 'react-icons/fa';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { HiMail } from 'react-icons/hi';
import Cookies from 'js-cookie';
import "tailwindcss/tailwind.css";

const Carrito = () => {
  // States se mantienen igual
  const [carrito, setCarrito] = useState([]);
  const [mensajes, setMensajes] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [mostrarMenuUsuario, setMostrarMenuUsuario] = useState(false);
  const [mostrarCupones, setMostrarCupones] = useState(false);
  const [cupones, setCupones] = useState([]);
  const [descuento, setDescuento] = useState(0);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [cuponAplicado, setCuponAplicado] = useState(null);
  const [totalCalculado, setTotalCalculado] = useState('0.00');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const navigate = useNavigate();

  // Primer useEffect se mantiene igual
  useEffect(() => {
    cargarCarrito();
    fetchCupones();
    const userID = Cookies.get('userID');
    const userRole = Cookies.get('userRole');
    const userName = Cookies.get('userName');
    
    if (!userID) {
      navigate('/loginform');
      return;
    }
    
    setUserRole(userRole);
    setUserName(userName);
  }, [navigate]);

  // fetchCupones y cargarCarrito se mantienen igual
  const fetchCupones = async () => {
    try {
      console.log('Iniciando fetch de cupones');
      const response = await axios.get("http://localhost:3000/api/cupones-activos");
      console.log('Respuesta de cupones:', response.data);
      setCupones(response.data);
    } catch (error) {
      console.error("Error al obtener cupones:", error);
      setMensajes({ error: "Error al cargar los cupones disponibles" });
    }
  };

  const cargarCarrito = async () => {
    try {
      const userId = Cookies.get('userID');
      if (userId) {
        const response = await axios.get(`http://localhost:3000/api/carrito/${userId}`);
        setCarrito(response.data);
      }
    } catch (error) {
      console.error('Error al cargar el carrito:', error);
      setMensajes({ error: 'Error al cargar el carrito' });
    }
  };

  const calcularSubtotal = useCallback(() => {
    return carrito.reduce((total, item) => {
      const itemTotal = parseFloat(item.total) || 0;
      return total + itemTotal;
    }, 0);
  }, [carrito]);

  const calcularTotal = useCallback(() => {
    try {
      const subtotal = calcularSubtotal();
      if (isNaN(subtotal) || subtotal < 0) return '0.00';
      
      const descuentoAmount = subtotal * (descuento / 100);
      if (isNaN(descuentoAmount)) return subtotal.toFixed(2);
      
      const total = subtotal - descuentoAmount;
      return total.toFixed(2);
    } catch (error) {
      console.error('Error al calcular total:', error);
      return '0.00';
    }
  }, [calcularSubtotal, descuento]);

  // Modificado: useEffect para actualizar el total
  useEffect(() => {
    const nuevoTotal = calcularTotal();
    console.log('Nuevo total calculado:', nuevoTotal);
    setTotalCalculado(nuevoTotal);
    // Guardar el total en cookies
    Cookies.set('cartTotal', nuevoTotal);
  }, [carrito, descuento, calcularTotal]);

  // handleActualizarCarrito y handleEliminarCarrito se mantienen igual
  const handleActualizarCarrito = async (idProducto, nuevaCantidad) => {
    try {
      const userId = Cookies.get('userID');
  
      // Primero obtener el producto y su precio con descuento
      const response = await axios.get('http://localhost:3000/productos');
      const productos = response.data;
  
      // Obtener información de las ofertas
      const ofertasResponse = await axios.get('http://localhost:3000/ofertas');
      const ofertas = ofertasResponse.data;
  
      // Encontrar el producto y calcular su precio con descuento
      const producto = productos.find(p => p.id_producto === idProducto);
      if (producto) {
        const oferta = ofertas.find(o => o.idoferta === producto.idoferta);
        let precioFinal = producto.precio;
  
        if (oferta) {
          const fechaInicio = new Date(oferta.inicio);
          const fechaExpiracion = new Date(oferta.expiracion);
          const fechaActual = new Date();
          
          if (fechaActual >= fechaInicio && fechaActual <= fechaExpiracion) {
            precioFinal = producto.precio * (1 - oferta.descuento / 100);
          }
        }
  
        const nuevoTotal = precioFinal * nuevaCantidad;
  
        await axios.put(`http://localhost:3000/api/carrito/${idProducto}`, { 
          cantidad: nuevaCantidad, 
          idusuario: userId,
          total: nuevoTotal
        });
  
        await cargarCarrito();
      }
    } catch (error) {
      console.error("Error al actualizar producto en el carrito:", error);
      setMensajes({ error: "Error al actualizar el carrito" });
    }
  };
  
  const handleEliminarCarrito = async (idProducto) => {
    try {
      const userId = Cookies.get('userID');
      await axios.delete(`http://localhost:3000/api/carrito/${idProducto}`, { 
        data: { idusuario: userId } 
      });
      await cargarCarrito();
    } catch (error) {
      console.error('Error al eliminar producto del carrito:', error);
      setMensajes({ error: "Error al eliminar el producto" });
    }
  };

  // Modificado: cerrarSesion para limpiar la cookie del total
  const cerrarSesion = () => {
    Cookies.remove('userName');
    Cookies.remove('userRole');
    Cookies.remove('userID');
    Cookies.remove('cartTotal'); // Agregado
    setUserName('');
    setUserRole(null);
    setMostrarMenuUsuario(false);
    navigate('/loginform');
  };

  const irAModoAdministrador = () => {
    navigate('/userlist');
  };

  // Modificado: quitarCupon para actualizar cookies
  const quitarCupon = () => {
    setDescuento(0);
    setCuponAplicado(null);
    const nuevoTotal = calcularSubtotal().toFixed(2);
    setTotalCalculado(nuevoTotal);
    Cookies.set('cartTotal', nuevoTotal);
    setMensajes({ success: 'Cupón removido exitosamente' });
    setTimeout(() => {
      setMensajes({});
    }, 3000);
  };

  // Modificado: aplicarCupon para actualizar cookies
  const aplicarCupon = async (cupon) => {
    try {
      const descuentoNum = parseInt(cupon.discount);
      if (isNaN(descuentoNum)) {
        setMensajes({ error: 'Error al aplicar el cupón' });
        return;
      }

      const userId = Cookies.get('userID');
      if (!userId) {
        setMensajes({ error: 'Por favor, inicia sesión para aplicar el cupón' });
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3000/api/cupones-disponibles/${userId}`);
        const cuponDisponible = response.data.find(c => c.idcupon === cupon.idcupon && !c.usado);

        if (!cuponDisponible) {
          setMensajes({ error: 'Este cupón ya ha sido utilizado o no está disponible' });
          return;
        }

        setDescuento(descuentoNum);
        setCuponAplicado(cupon);
        setMostrarCupones(false);

        // Calcular y actualizar el nuevo total con el descuento
        const subtotal = calcularSubtotal();
        const nuevoTotal = (subtotal * (1 - descuentoNum / 100)).toFixed(2);
        setTotalCalculado(nuevoTotal);
        Cookies.set('cartTotal', nuevoTotal);
        
        setMensajes({ success: `Cupón de ${cupon.discount}% aplicado exitosamente` });
        setTimeout(() => {
          setMensajes({});
        }, 3000);

      } catch (error) {
        console.error('Error al verificar el cupón:', error);
        setMensajes({ error: 'Error al verificar la disponibilidad del cupón' });
      }
    } catch (error) {
      console.error('Error al aplicar cupón:', error);
      setMensajes({ error: 'Error al aplicar el cupón' });
    }
  };

  // Modificado: realizarCompra para usar el total de las cookies
  const realizarCompra = async (details, data) => {
    if (isProcessingPayment) return;
    setIsProcessingPayment(true);
  
    try {
      const userId = Cookies.get('userID');
      if (!userId) {
        setMensajes({ error: 'Por favor, inicia sesión para realizar la compra' });
        return;
      }
  
      const totalConDescuento = parseFloat(Cookies.get('cartTotal'));
      const subtotal = calcularSubtotal();
      const factorDescuento = totalConDescuento / subtotal;
  
      // Aplicar el factor de descuento a cada producto individualmente
      const productosParaCompra = carrito.map(item => ({
        nombre: item.nombre,
        cantidad: item.cantidad,
        total_compra: parseFloat((parseFloat(item.total) * factorDescuento).toFixed(2)),
        imagen: item.imagen,
        idcategoria: item.idcategoria,
      }));
  
      // Realizar la compra
      const response = await axios.post('http://localhost:3000/api/compras', {
        productos: productosParaCompra,
        idusuario: parseInt(userId, 10),
        total_final: totalConDescuento,
        transaction_id: details.id,
      });
  
      if (response.status === 201) {
        // Obtener puntos por categoría
        let puntosTotal = 0;
        for (const producto of productosParaCompra) {
          // Obtener la categoría y sus puntos
          try {
            const categoriaResponse = await axios.get(`http://localhost:3000/categoria`);
            const categorias = categoriaResponse.data;
            const categoria = categorias.find(cat => cat.idcategoria === producto.idcategoria);
            
            if (categoria && categoria.puntos) {
              // Multiplicar los puntos por la cantidad de productos
              puntosTotal += (categoria.puntos * producto.cantidad);
            }
          } catch (error) {
            console.error('Error al obtener puntos de categoría:', error);
          }
        }
  
        // Verificar si el usuario tiene membresía PepperPoints
        try {
          const pepperPointsResponse = await axios.get(`http://localhost:3000/api/pepperpoints/${userId}`);
          if (pepperPointsResponse.data) {
            // Actualizar los puntos del usuario
            await axios.put(`http://localhost:3000/api/pepperpoints/${userId}`, {
              puntos: puntosTotal
            });
          }
        } catch (error) {
          console.error('Error al actualizar PepperPoints:', error);
        }
  
        if (cuponAplicado) {
          await axios.post('http://localhost:3000/usar-cupon', {
            idcupon: cuponAplicado.idcupon,
            idusuario: userId
          });
        }
  
        await axios.delete(`http://localhost:3000/api/carrito/vaciar/${userId}`);
        setCarrito([]);
        setDescuento(0);
        setCuponAplicado(null);
        Cookies.remove('cartTotal');
        setMensajes({ 
          success: `¡Compra realizada con éxito! Has ganado ${puntosTotal} PepperPoints.`
        });
        setTimeout(() => {
          navigate('/compras');
        }, 3000);
      }
    } catch (error) {
      console.error('Error al realizar la compra:', error);
      setMensajes({ error: 'Error al procesar la compra' });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Modificado: renderPayPalButtons para usar el total de las cookies
  const renderPayPalButtons = () => {
    const total = parseFloat(Cookies.get('cartTotal') || totalCalculado);
    console.log('Total para PayPal:', total);

    if (isNaN(total) || total <= 0) return null;

    return (
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          const currentTotal = parseFloat(Cookies.get('cartTotal') || totalCalculado);
          console.log('Creando orden con total:', currentTotal);
          
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  currency_code: "MXN",
                  value: currentTotal.toString()
                }
              }
            ]
          });
        }}
        onApprove={async (data, actions) => {
          try {
            const details = await actions.order.capture();
            await realizarCompra(details, data);
          } catch (error) {
            console.error('Error al procesar el pago:', error);
            setMensajes({ 
              error: 'Error al procesar el pago. Por favor, intente nuevamente.' 
            });
          }
        }}
        onError={(err) => {
          console.error('Error PayPal:', err);
          setMensajes({ 
            error: 'Error en la conexión con PayPal. Por favor, intente nuevamente.' 
          });
        }}
      />
    );
  };

  return (
    <PayPalScriptProvider options={{ 
      "client-id": "Adm1ePzrPh4pqcyELF8e8VzTdItq1U764Urwv2wQh_5vNrZwTneFQl-_EZW9heVcxwaNZ22NuM-NFIpi",
      currency: "MXN",
      intent: "capture"
    }}>
      <div className="flex flex-col min-h-screen font-sans">
        <nav className="bg-[#1446a0] p-4 relative z-10">
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
              <Link to="/compras" className="text-white font-bold uppercase border border-white rounded px-3 py-1 hover:bg-white hover:text-[#1446a0] text-base">
                Mis compras
              </Link>
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
                      {userRole === "2" && (
                        <button onClick={irAModoAdministrador} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Modo Administrador
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/loginform" className="text-white font-bold uppercase hover:text-gray-300 text-base">
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </nav>

        <main className="flex-grow container mx-auto mt-10 relative z-0">
          <h2 className="text-center text-[#f54603] text-3xl font-bold mb-4">Carrito de Compras</h2>
          {carrito.length === 0 ? (
            <p className="text-center text-gray-600 mb-4">No hay productos en el carrito</p>
          ) : (
            <div>
              <ul className="max-h-96 overflow-auto">
                {carrito.map(item => (
                  <li key={item.idproducto} className="p-4 border-b flex justify-between items-center">
                    <img 
                      src={`http://localhost:3000/uploads/${item.imagen}`} 
                      alt={item.nombre} 
                      className="w-24 h-24 object-cover mr-4"
                    />
                    <span className="flex-grow text-lg">{item.nombre}</span>
                    <span className="mr-4">Cantidad: {item.cantidad}</span>
                    <div className="flex items-center">
                      <button 
                        onClick={() => handleActualizarCarrito(item.idproducto, item.cantidad + 1)} 
                        className="bg-blue-500 text-white px-2 py-1 rounded mr-1"
                      >
                        +
                      </button>
                      <button 
                        onClick={() => handleActualizarCarrito(item.idproducto, Math.max(1, item.cantidad - 1))} 
                        className="bg-blue-500 text-white px-2 py-1 rounded mr-1"
                      >
                        -
                      </button>
                      <button 
                        onClick={() => handleEliminarCarrito(item.idproducto)} 
                        className="bg-red-500 text-white p-1 rounded"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="p-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-xl">Subtotal: ${calcularSubtotal().toFixed(2)}</span>
                  <button
                    onClick={() => setMostrarCupones(true)}
                    className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                  >
                    Ver Cupones
                  </button>
                </div>
                {cuponAplicado && (
                  <div className="flex justify-between items-center mb-4 bg-green-100 p-3 rounded">
                    <span>Cupón aplicado: {cuponAplicado.discount}% de descuento</span>
                    <button
                      onClick={quitarCupon}
                      className="text-red-500 hover:text-red-700"
                    >
                      Quitar cupón
                    </button>
                  </div>
                )}
                <span className="font-bold text-xl block mt-4">Total Final: ${totalCalculado}</span>
              </div>

              <div className="p-4 relative z-0">
                {renderPayPalButtons()}
              </div>
            </div>
          )}

          {/* Modal de Cupones */}
          {mostrarCupones && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-[#f54603]">Cupones Disponibles</h3>
                  <button
                    onClick={() => setMostrarCupones(false)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    ✕
                  </button>
                </div>
                
                {cupones.length === 0 ? (
                  <p className="text-center text-gray-600 p-4">No hay cupones disponibles en este momento</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cupones.map((cupon, index) => (
                      <div key={index} className="border rounded-lg p-4 shadow-md">
                        <div className={`${cupon.bgColor} p-4 rounded-lg mb-4`}>
                          <img src={cupon.img} alt="cupon" className="w-full h-24 object-cover rounded" />
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-500 mb-2">
                            DESCUENTO {cupon.discount}%
                          </p>
                          <p className="text-gray-600 mb-2">Válido hasta: {cupon.expiration}</p>
                          <button
                            onClick={() => setSelectedCoupon(index === selectedCoupon ? null : index)}
                            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300 w-full mb-2"
                          >
                            {selectedCoupon === index ? 'Cerrar' : 'Más Información'}
                          </button>
                          <button
                            onClick={() => aplicarCupon(cupon)}
                            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700 transition duration-300 w-full"
                          >
                            Aplicar Cupón
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
            </div>
          )}
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

        {/* Mensajes de éxito/error */}
        {mensajes.success && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
            {mensajes.success}
          </div>
        )}
        {mensajes.error && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
            {mensajes.error}
          </div>
        )}
      </div>
    </PayPalScriptProvider>
  );
};

export default Carrito;