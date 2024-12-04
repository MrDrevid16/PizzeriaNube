import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FaPhone, FaShoppingCart, FaStar, FaTrash } from 'react-icons/fa';
import { HiMail } from 'react-icons/hi';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';

const ProductoPage = () => {
  const { id_producto } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [reseñas, setReseñas] = useState([]);
  const [calificacion, setCalificacion] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comentario, setComentario] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [mensajes, setMensajes] = useState({});
  const [cantidades, setCantidades] = useState({});
  const [userName, setUserName] = useState(Cookies.get("userName") || '');
  const [userRole, setUserRole] = useState(Cookies.get("userRole") || null);
  const [mostrarMenuUsuario, setMostrarMenuUsuario] = useState(false);
  const [carritoVisible, setCarritoVisible] = useState(false);
  const [carrito, setCarrito] = useState([]);
  const [descuento, setDescuento] = useState(0);
  const [mostrarCupones, setMostrarCupones] = useState(false);
  const [cupones, setCupones] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [cuponAplicado, setCuponAplicado] = useState(null);
  const [compraInmediata, setCompraInmediata] = useState(null);
  const [totalCalculado, setTotalCalculado] = useState('0.00');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar producto y ofertas
        const [productoResponse, ofertasResponse] = await Promise.all([
          axios.get(`http://localhost:3000/productos/${id_producto}`),
          axios.get('http://localhost:3000/ofertas')
        ]);

        const productoBase = productoResponse.data;
        const ofertas = ofertasResponse.data;
        const fechaActual = new Date();

        // Procesar producto con oferta
        let productoFinal = { ...productoBase };
        if (productoBase.idoferta) {
          const oferta = ofertas.find(o => o.idoferta === productoBase.idoferta);
          if (oferta) {
            const fechaInicio = new Date(oferta.inicio);
            const fechaExpiracion = new Date(oferta.expiracion);

            if (fechaActual >= fechaInicio && fechaActual <= fechaExpiracion) {
              if (oferta.descuento) {
                const precioConDescuento = productoBase.precio * (1 - oferta.descuento / 100);
                productoFinal = {
                  ...productoBase,
                  precioFinal: precioConDescuento,
                  oferta: {
                    ...oferta,
                    tipo: 'descuento',
                    fechaExpiracion: fechaExpiracion
                  }
                };
              } else {
                productoFinal = {
                  ...productoBase,
                  precioFinal: productoBase.precio,
                  oferta: {
                    ...oferta,
                    tipo: 'temporal',
                    fechaExpiracion: fechaExpiracion
                  }
                };
              }
            }
          }
        }

        setProducto(productoFinal);
        const cantidadInicial = {};
        cantidadInicial[id_producto] = 1;
        setCantidades(cantidadInicial);

        // Cargar reseñas, cupones y carrito
        const [reseñasResponse, cuponesResponse] = await Promise.all([
          axios.get(`http://localhost:3000/api/resenas/${id_producto}`),
          axios.get("http://localhost:3000/api/cupones-activos")
        ]);

        setReseñas(reseñasResponse.data);
        setCupones(cuponesResponse.data);
        await cargarCarrito();

      } catch (error) {
        console.error('Error al cargar los datos:', error);
        setError('Error al cargar los datos del producto');
      }
    };

    fetchData();
  }, [id_producto]);

  const calcularPromedioCalificacion = () => {
    if (reseñas.length === 0) return 0;
    const totalCalificacion = reseñas.reduce((acc, resena) => acc + resena.calificacion, 0);
    return totalCalificacion / reseñas.length;
  };

  const calcularPorcentajeCalificacion = () => {
    const promedio = calcularPromedioCalificacion();
    return (promedio / 5) * 100;
  };

  const mostrarEstrellas = (porcentaje) => {
    const estrellas = [];
    for (let i = 1; i <= 5; i++) {
      if (porcentaje >= (i * 20)) {
        estrellas.push(<FaStar key={i} color="#f54703" />);
      } else {
        estrellas.push(<FaStar key={i} color="#ddd" />);
      }
    }
    return estrellas;
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

  useEffect(() => {
    const nuevoTotal = calcularTotal();
    setTotalCalculado(nuevoTotal);
    Cookies.set('cartTotal', nuevoTotal);
  }, [carrito, descuento, calcularTotal]);

  const calcularCantidadTotal = () => {
    return carrito.reduce((total, item) => total + item.cantidad, 0);
  };

  const handleActualizarCarrito = async (idProducto, nuevaCantidad) => {
    try {
      const userId = Cookies.get('userID');
      const prodInfo = producto && producto.id_producto === idProducto ? producto : 
                      carrito.find(item => item.idproducto === idProducto);
      const precioFinal = prodInfo?.precioFinal || prodInfo?.precio;
      const nuevoTotal = parseFloat((precioFinal * nuevaCantidad).toFixed(2));

      await axios.put(`http://localhost:3000/api/carrito/${idProducto}`, {
        cantidad: nuevaCantidad,
        idusuario: userId,
        total: nuevoTotal
      });
      await cargarCarrito();
    } catch (error) {
      console.error("Error al actualizar producto en el carrito:", error);
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
    }
  };

  const agregarAlCarrito = async () => {
    if (!producto) return;
  
    // Verificar conexión a internet
    if (!navigator.onLine) {
      if (Notification.permission === 'granted') {
        new Notification('Saborretti', {
          body: 'No hay conexión a Internet. No se puede agregar productos al carrito.',
          icon: '/image/logo_bueno.png',
          badge: '/image/logo_bueno.png',
          vibrate: [200, 100, 200]
        });
      }
      return;
    }
  
    try {
      const userId = Cookies.get('userID');
      if (!userId) {
        setMensajes({
          error: 'Por favor, inicia sesión para agregar productos al carrito'
        });
        return;
      }
  
      const cantidadAAgregar = cantidades[producto.id_producto] || 1;
      const precioFinal = producto.precioFinal || producto.precio;
      const productoParaCarrito = {
        idproducto: producto.id_producto,
        nombre: producto.nombre,
        cantidad: cantidadAAgregar,
        total: precioFinal * cantidadAAgregar,
        imagen: producto.imagen,
        idusuario: parseInt(userId, 10),
        idcategoria: producto.idcategoria
      };
  
      await axios.post('http://localhost:3000/api/carrito/agregar', productoParaCarrito);
      setMensajes({ success: 'Producto agregado al carrito' });
      setTimeout(() => {
        setMensajes({});
      }, 3000);
      
      await cargarCarrito();
    } catch (error) {
      console.error('Error al agregar producto al carrito:', error);
      setMensajes({
        error: 'Error al agregar producto al carrito: ' + (error.response?.data?.message || error.message)
      });
    }
  };


  // Función comprarAhora modificada
  const comprarAhora = () => {
    if (!producto) return;
  
    // Verificar conexión antes de proceder
    if (!navigator.onLine) {
      if (Notification.permission === 'granted') {
        new Notification('Saborretti', {
          body: 'No hay conexión a Internet. No se puede realizar la compra en este momento.',
          icon: '/image/logo_bueno.png',
          badge: '/image/logo_bueno.png',
          vibrate: [200, 100, 200]
        });
      }
      return;
    }
  
    const cantidad = cantidades[producto.id_producto] || 1;
    const precioFinal = producto.precioFinal || producto.precio;
    const total = parseFloat((precioFinal * cantidad).toFixed(2));
    
    Cookies.set('buyNowTotal', total.toString());
    setCompraInmediata({
      ...producto,
      cantidad,
      total,
      precioFinal,
      descuento: 0,
      cuponAplicado: null
    });
  };

  const toggleCarrito = () => {
    if (!navigator.onLine) {
      if (Notification.permission === 'granted') {
        new Notification('Saborretti', {
          body: 'No hay conexión a Internet. No se puede acceder al carrito en este momento.',
          icon: '/image/logo_bueno.png',
          badge: '/image/logo_bueno.png',
          vibrate: [200, 100, 200]
        });
      }
      return;
    }
    setCarritoVisible(!carritoVisible);
  };

  const aplicarCuponCarrito = async (cupon) => {
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

  const quitarCuponCarrito = () => {
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

  const aplicarCuponCompraInmediata = async (cupon) => {
    try {
      const userId = Cookies.get('userID');
      if (!userId) {
        setMensajes({ error: 'Por favor, inicia sesión para aplicar el cupón' });
        return;
      }

      const response = await axios.get(`http://localhost:3000/api/cupones-disponibles/${userId}`);
      const cuponDisponible = response.data.find(c => c.idcupon === cupon.idcupon && !c.usado);

      if (!cuponDisponible) {
        setMensajes({ error: 'Este cupón ya ha sido utilizado o no está disponible' });
        return;
      }

      const descuentoNum = parseInt(cupon.discount);
      if (isNaN(descuentoNum)) {
        setMensajes({ error: 'Error al aplicar el cupón' });
        return;
      }

      const subtotal = compraInmediata.precioFinal * compraInmediata.cantidad;
      const nuevoTotal = subtotal * (1 - descuentoNum / 100);

      setCompraInmediata(prev => ({
        ...prev,
        total: nuevoTotal,
        descuento: descuentoNum,
        cuponAplicado: cupon
      }));

      Cookies.set('buyNowTotal', nuevoTotal.toString());
      setMostrarCupones(false);
      setMensajes({ success: `Cupón de ${cupon.discount}% aplicado exitosamente` });
      
      setTimeout(() => {
        setMensajes({});
      }, 3000);

    } catch (error) {
      console.error('Error al aplicar cupón:', error);
      setMensajes({ error: 'Error al aplicar el cupón' });
    }
  };

  const quitarCuponCompraInmediata = () => {
    if (compraInmediata) {
      const subtotal = compraInmediata.precioFinal * compraInmediata.cantidad;
      setCompraInmediata(prev => ({
        ...prev,
        total: subtotal,
        descuento: 0,
        cuponAplicado: null
      }));
      
      Cookies.set('buyNowTotal', subtotal.toString());
      setMensajes({ success: 'Cupón removido exitosamente' });
      setTimeout(() => {
        setMensajes({});
      }, 3000);
    }
  };

  const renderCartPayPalButtons = useCallback(() => {
    const total = parseFloat(Cookies.get('cartTotal') || totalCalculado);
    console.log('Total para PayPal del carrito:', total);
  
    if (isNaN(total) || total <= 0) return null;
  
    return (
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          const currentTotal = parseFloat(Cookies.get('cartTotal') || totalCalculado);
          const subtotal = calcularSubtotal();
          
          return actions.order.create({
            purchase_units: [{
              amount: {
                currency_code: "MXN",
                value: currentTotal.toString(),
                breakdown: {
                  item_total: {
                    currency_code: "MXN",
                    value: subtotal.toFixed(2)
                  },
                  discount: {
                    currency_code: "MXN",
                    value: (subtotal - currentTotal).toFixed(2)
                  }
                }
              }
            }]
          });
        }}
        onApprove={async (data, actions) => {
          try {
            const details = await actions.order.capture();
            await realizarCompra(details, data);
          } catch (error) {
            console.error('Error al procesar el pago:', error);
            setMensajes({ error: 'Error al procesar el pago' });
          }
        }}
        onError={(err) => {
          console.error('Error PayPal:', err);
          setMensajes({ error: 'Error en la conexión con PayPal' });
        }}
      />
    );
  }, [totalCalculado, calcularSubtotal]);

  const renderBuyNowPayPalButtons = useCallback(() => {
    if (!compraInmediata) return null;

    const total = parseFloat(Cookies.get('buyNowTotal') || compraInmediata.total.toString());
    console.log('Total para PayPal compra inmediata:', total);

    return (
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          const currentTotal = parseFloat(Cookies.get('buyNowTotal') || compraInmediata.total.toString());
          
          return actions.order.create({
            purchase_units: [{
              amount: {
                currency_code: "MXN",
                value: currentTotal.toString()
              }
            }]
          });
        }}
        onApprove={async (data, actions) => {
          try {
            const details = await actions.order.capture();
            await realizarCompraInmediata(details, data);
          } catch (error) {
            console.error('Error al procesar el pago:', error);
            setMensajes({ error: 'Error al procesar el pago' });
          }
        }}
        onError={(err) => {
          console.error('Error PayPal:', err);
          setMensajes({ error: 'Error en la conexión con PayPal' });
        }}
      />
    );
  }, [compraInmediata]);

  const realizarCompra = async (details, data) => {
    if (isProcessingPayment) return;
    setIsProcessingPayment(true);

    try {
        const userId = Cookies.get("userID");
        if (!userId) {
            setMensajes({
                error: "Por favor, inicia sesión para realizar la compra",
            });
            return;
        }

        const totalConDescuento = parseFloat(Cookies.get("cartTotal"));
        const subtotal = calcularSubtotal();
        const factorDescuento = totalConDescuento / subtotal;

        const productosParaCompra = carrito.map((item) => ({
            nombre: item.nombre,
            cantidad: item.cantidad,
            total_compra: parseFloat(
                (parseFloat(item.total) * factorDescuento).toFixed(2)
            ),
            imagen: item.imagen,
            idcategoria: item.idcategoria,
        }));

        // Crear la orden
        const ordenResponse = await axios.post("http://localhost:3000/api/ordenes", {
            idusuario: parseInt(userId, 10),
            total: totalConDescuento,
            estado: "Pendiente",
            metodopago: "Online",
            direccionentrega: "Dirección ejemplo", // Reemplazar con la dirección real
            telefonocontacto: "123456789", // Reemplazar con el teléfono real
        });

        if (ordenResponse.status === 201) {
            const idorden = ordenResponse.data.idorden;

            // Continuar con el flujo de compra
            const compraResponse = await axios.post("http://localhost:3000/api/compras", {
                productos: productosParaCompra,
                idusuario: parseInt(userId, 10),
                total_final: totalConDescuento,
                transaction_id: details.id,
                idorden,
            });

            if (compraResponse.status === 201) {
                let puntosTotal = 0;
                for (const producto of productosParaCompra) {
                    try {
                        const categoriaResponse = await axios.get(
                            `http://localhost:3000/categoria`
                        );
                        const categorias = categoriaResponse.data;
                        const categoria = categorias.find(
                            (cat) => cat.idcategoria === producto.idcategoria
                        );

                        if (categoria && categoria.puntos) {
                            puntosTotal += categoria.puntos * producto.cantidad;
                        }
                    } catch (error) {
                        console.error("Error al obtener puntos de categoría:", error);
                    }
                }

                try {
                    const pepperPointsResponse = await axios.get(
                        `http://localhost:3000/api/pepperpoints/${userId}`
                    );
                    if (pepperPointsResponse.data) {
                        await axios.put(
                            `http://localhost:3000/api/pepperpoints/${userId}`,
                            { puntos: puntosTotal }
                        );
                    }
                } catch (error) {
                    console.error("Error al actualizar PepperPoints:", error);
                }

                if (cuponAplicado) {
                    await axios.post("http://localhost:3000/usar-cupon", {
                        idcupon: cuponAplicado.idcupon,
                        idusuario: userId,
                    });
                }

                await axios.delete(`http://localhost:3000/api/carrito/vaciar/${userId}`);
                setCarrito([]);
                setDescuento(0);
                setCuponAplicado(null);
                setCarritoVisible(false);
                Cookies.remove("cartTotal");
                setMensajes({
                    success: `¡Compra realizada con éxito! Has ganado ${puntosTotal} PepperPoints.`,
                });
                setTimeout(() => {
                    navigate(`/OrdenActiva/${idorden}`); // Ruta corregida
                }, 3000);
            }
        }
    } catch (error) {
        console.error("Error al realizar la compra:", error);
        setMensajes({ error: "Error al procesar la compra" });
    } finally {
        setIsProcessingPayment(false);
    }
};

  
const realizarCompraInmediata = async (details, data) => {
  if (isProcessingPayment) return;
  setIsProcessingPayment(true);

  try {
      const userId = Cookies.get("userID");
      if (!userId) {
          setMensajes({
              error: "Por favor, inicia sesión para realizar la compra",
          });
          return;
      }

      const totalFinal = parseFloat(
          Cookies.get("buyNowTotal") || compraInmediata.total
      );

      // Crear la orden
      const ordenResponse = await axios.post("http://localhost:3000/api/ordenes", {
          idusuario: parseInt(userId, 10),
          total: totalFinal,
          estado: "Pendiente",
          metodopago: "Online",
          direccionentrega: "Dirección ejemplo", // Reemplazar con la dirección real
          telefonocontacto: "123456789", // Reemplazar con el teléfono real
      });

      if (ordenResponse.status === 201) {
          const idorden = ordenResponse.data.idorden;

          const compraResponse = await axios.post("http://localhost:3000/api/compras", {
              productos: [
                  {
                      nombre: compraInmediata.nombre,
                      cantidad: compraInmediata.cantidad,
                      total_compra: totalFinal,
                      imagen: compraInmediata.imagen,
                      idcategoria: compraInmediata.idcategoria,
                  },
              ],
              idusuario: parseInt(userId, 10),
              total_final: totalFinal,
              transaction_id: details.id,
              idorden,
          });

          if (compraResponse.status === 201) {
              let puntosTotal = 0;
              try {
                  const categoriaResponse = await axios.get(
                      `http://localhost:3000/categoria`
                  );
                  const categorias = categoriaResponse.data;
                  const categoria = categorias.find(
                      (cat) => cat.idcategoria === compraInmediata.idcategoria
                  );

                  if (categoria && categoria.puntos) {
                      puntosTotal = categoria.puntos * compraInmediata.cantidad;
                  }

                  const pepperPointsResponse = await axios.get(
                      `http://localhost:3000/api/pepperpoints/${userId}`
                  );
                  if (pepperPointsResponse.data) {
                      await axios.put(
                          `http://localhost:3000/api/pepperpoints/${userId}`,
                          { puntos: puntosTotal }
                      );
                  }
              } catch (error) {
                  console.error("Error al procesar los puntos:", error);
              }

              if (compraInmediata.cuponAplicado) {
                  await axios.post("http://localhost:3000/usar-cupon", {
                      idcupon: compraInmediata.cuponAplicado.idcupon,
                      idusuario: userId,
                  });
              }

              Cookies.remove("buyNowTotal");
              setCompraInmediata(null);
              setMensajes({
                  success: `¡Compra realizada con éxito! Has ganado ${puntosTotal} PepperPoints.`,
              });
              setTimeout(() => {
                  navigate(`/OrdenActiva/${idorden}`); // Ruta corregida
              }, 3000);
          }
      }
  } catch (error) {
      console.error("Error al realizar la compra inmediata:", error);
      setMensajes({ error: "Error al procesar la compra" });
  } finally {
      setIsProcessingPayment(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = Cookies.get("userID");
    if (!userId) {
      setError('Debes iniciar sesión para dejar una reseña');
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/resena', {
        idusuario: userId,
        id_producto,
        calificacion,
        comentario
      });

      setSuccessMessage('Reseña enviada con éxito');
      const nuevaReseña = {
        calificacion,
        comentario,
        fecha: new Date().toISOString(),
        nombre_usuario: userName
      };
      setReseñas([...reseñas, nuevaReseña]);
      setComentario('');
      setCalificacion(5);
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error al enviar la reseña:', error);
      setError('Error al enviar la reseña');
    }
  };

  const cerrarSesion = () => {
    Cookies.remove('userName');
    Cookies.remove('userRole');
    Cookies.remove('userID');
    Cookies.remove('cartTotal');
    Cookies.remove('buyNowTotal');
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

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={{ 
      "client-id": "Adm1ePzrPh4pqcyELF8e8VzTdItq1U764Urwv2wQh_5vNrZwTneFQl-_EZW9heVcxwaNZ22NuM-NFIpi", 
      currency: "MXN" 
    }}>
      <div className="flex flex-col min-h-screen font-sans">
        {/* Navbar */}
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
              <Link to="/compras" className="text-white font-bold uppercase border border-white rounded px-3 py-1 hover:bg-white hover:text-[#1446a0] text-base">
                Mis compras
              </Link>
              <div className="relative group">
  <button 
    onClick={toggleCarrito} 
    className="text-white border border-white rounded p-2 flex items-center hover:bg-white hover:text-[#1446a0] text-base"
  >
    <FaShoppingCart size={18} />
    <span className="ml-2">{calcularCantidadTotal()}</span>
  </button>

  {/* Carrito Dropdown */}
  {carritoVisible && (
    <div className="absolute right-0 mt-2 w-96 bg-white shadow-xl rounded z-50">
      <h3 className="text-lg font-bold p-4 border-b">Carrito de compras</h3>
      {carrito.length === 0 ? (
        <p className="p-4">No hay productos en el carrito</p>
      ) : (
        <div>
          <ul className="max-h-60 overflow-auto">
            {carrito.map(item => (
              <li key={item.idproducto} className="p-4 border-b flex justify-between items-center">
                <img 
                  src={`http://localhost:3000/uploads/${item.imagen}`} 
                  alt={item.nombre} 
                  className="w-12 h-12 object-cover mr-2"
                />
                <span className="flex-grow">{item.nombre}</span>
                <span>Cantidad: {item.cantidad}</span>
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
              <span className="font-bold">Subtotal: ${calcularSubtotal().toFixed(2)}</span>
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
                  onClick={quitarCuponCarrito}
                  className="text-red-500 hover:text-red-700"
                >
                  Quitar cupón
                </button>
              </div>
            )}
            <span className="font-bold">Total Final: ${totalCalculado}</span>
          </div>
          <div className="p-4">
            {renderCartPayPalButtons()}
          </div>
        </div>
      )}
    </div>
  )}
</div>
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
                <Link to="/loginform" className="text-white font-bold uppercase hover:text-gray-300 text-base">
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow container mx-auto p-8">
          {producto && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="relative">
                    {producto.oferta?.tipo === 'descuento' && (
                      <div className="absolute -top-3 -right-3 bg-[#f54703] text-white rounded-full w-16 h-16 flex items-center justify-center transform rotate-12">
                        <span className="text-sm font-bold">
                          {producto.oferta.descuento}% OFF
                        </span>
                      </div>
                    )}
                    {producto.oferta?.tipo === 'temporal' && (
                      <div className="absolute -top-3 -right-3 bg-red-600 text-white py-1 px-3 rounded-lg transform rotate-12">
                        <span className="text-sm font-bold whitespace-nowrap">
                          Por tiempo limitado
                        </span>
                      </div>
                    )}
                    <img 
                      src={`http://localhost:3000/uploads/${producto.imagen}`} 
                      alt={producto.nombre} 
                      className="w-full h-96 object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex flex-col justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-[#1446a0] mb-4">{producto.nombre}</h2>
                      <p className="text-gray-600 mb-4">{producto.descripcion}</p>
                      {producto.oferta?.tipo === 'descuento' ? (
                        <div>
                          <p className="text-sm text-gray-500">Antes:</p>
                          <p className="text-lg font-bold text-gray-500 line-through">
                            ${parseFloat(producto.precio).toFixed(2)}
                          </p>
                          <p className="text-sm text-[#f54703]">Precio de oferta:</p>
                          <p className="flex items-center justify-start text-orange-500 font-bold text-2xl">
                            ${producto.precioFinal.toFixed(2)} <span className="ml-2">🔥</span>
                          </p>
                          <p className="text-sm text-gray-500">
                            Válido hasta: {new Date(producto.oferta.fechaExpiracion).toLocaleDateString()}
                          </p>
                        </div>
                      ) : producto.oferta?.tipo === 'temporal' ? (
                        <div>
                          <p className="text-2xl font-bold text-[#f54703]">
                            Precio: ${parseFloat(producto.precio).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            Disponible hasta: {new Date(producto.oferta.fechaExpiracion).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <p className="text-2xl font-bold text-[#f54703]">
                          Precio: ${parseFloat(producto.precio).toFixed(2)}
                        </p>
                      )}
                      <div className="calificacion mb-4">
                        <span>Calificación: {calcularPorcentajeCalificacion().toFixed(0)}%</span>
                        <div className="estrellas flex space-x-1">
                          {mostrarEstrellas(calcularPorcentajeCalificacion())}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-700">Cantidad:</span>
                        <input 
                          type="number" 
                          value={cantidades[producto.id_producto] || 1} 
                          onChange={(e) => setCantidades({
                            ...cantidades, 
                            [producto.id_producto]: parseInt(e.target.value)
                          })}
                          min="1"
                          className="w-20 border rounded px-2 py-1"
                        />
                      </div>
                      <div className="flex space-x-4">
                        <button 
                          onClick={agregarAlCarrito} 
                          className="flex-1 bg-[#1446a0] text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Agregar al Carrito
                        </button>
                        <button 
                          onClick={comprarAhora}
                          className="flex-1 bg-[#f54703] text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Comprar Ahora
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reseñas Section */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-2xl font-bold text-[#1446a0] mb-6">Reseñas y Calificaciones</h3>
                <form onSubmit={handleSubmit} className="mb-8">
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Tu calificación:</label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className="cursor-pointer"
                          size={24}
                          color={(hoveredRating || calificacion) >= star ? "#f54703" : "#ddd"}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          onClick={() => setCalificacion(star)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Tu comentario:</label>
                    <textarea
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      rows="4"
                      className="w-full p-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Comparte tu opinión sobre este producto..."
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="bg-[#1446a0] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Publicar reseña
                  </button>
                  {successMessage && (
                    <p className="text-green-600 mt-2">{successMessage}</p>
                  )}
                </form>

                <div className="space-y-4">
                  {reseñas.length === 0 ? (
                    <p className="text-gray-500">No hay reseñas aún. ¡Sé el primero en opinar!</p>
                  ) : (
                    reseñas.map((resena, index) => (
                      <div key={index} className="border-b pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{resena.nombre_usuario}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                size={16}
                                color={i < resena.calificacion ? "#f54703" : "#ddd"}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-1">{resena.comentario}</p>
                        <span className="text-gray-400 text-sm">
                          {new Date(resena.fecha).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Modals */}
        {/* Modal de Compra Inmediata */}
        {compraInmediata && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Confirmar Compra</h3>
              <div className="mb-4">
                <p className="mb-2"><strong>Producto:</strong> {compraInmediata.nombre}</p>
                <p className="mb-2"><strong>Cantidad:</strong> {compraInmediata.cantidad}</p>
                <p className="mb-2"><strong>Subtotal:</strong> ${(compraInmediata.precioFinal * compraInmediata.cantidad).toFixed(2)}</p>
                
                {compraInmediata.cuponAplicado ? (
                  <div className="bg-green-100 p-3 rounded mb-3">
                    <p>Cupón aplicado: {compraInmediata.cuponAplicado.discount}% de descuento</p>
                    <button
                      onClick={quitarCuponCompraInmediata}
                      className="text-red-500 hover:text-red-700 mt-2"
                    >
                      Quitar cupón
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setMostrarCupones(true)}
                    className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 w-full mb-3"
                  >
                    Ver Cupones
                  </button>
                )}
                
                <p className="text-xl font-bold">Total Final: ${compraInmediata.total.toFixed(2)}</p>
              </div>
              
              {renderBuyNowPayPalButtons()}
              
              <button 
                onClick={() => {
                  setCompraInmediata(null);
                  Cookies.remove('buyNowTotal');
                }} 
                className="mt-4 w-full bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
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
                          onClick={() => compraInmediata ? aplicarCuponCompraInmediata(cupon) : aplicarCuponCarrito(cupon)}
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

        {/* Footer */}
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

export default ProductoPage;