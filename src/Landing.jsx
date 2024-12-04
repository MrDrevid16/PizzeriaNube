import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate, Link } from "react-router-dom";
import { FaPhone, FaShoppingCart, FaTrash, FaStar } from "react-icons/fa";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { HiMail } from "react-icons/hi";
import "tailwindcss/tailwind.css";

const Landing = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [carritoVisible, setCarritoVisible] = useState(false);
  const [cantidades, setCantidades] = useState({});
  const [mensajes, setMensajes] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [descuento, setDescuento] = useState(0);
  const [mostrarCupones, setMostrarCupones] = useState(false);
  const [cupones, setCupones] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [cuponAplicado, setCuponAplicado] = useState(null);
  const [mostrarMenuUsuario, setMostrarMenuUsuario] = useState(false);
  const [compraInmediata, setCompraInmediata] = useState(null);
  const [totalCalculado, setTotalCalculado] = useState("0.00");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [productRatings, setProductRatings] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategorias();
    fetchProductos();
    cargarCarrito();
    fetchCupones();

    const userID = Cookies.get("userID");
    const userRole = Cookies.get("userRole");
    const userName = Cookies.get("userName");

    setUserRole(userRole);
    setUserName(userName);
  }, []);

  const calcularPromedioCalificacion = async (idProducto) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/resenas/${idProducto}`
      );
      const reseñas = response.data;
      if (reseñas.length === 0) return 0;

      const totalCalificacion = reseñas.reduce(
        (acc, resena) => acc + resena.calificacion,
        0
      );
      return totalCalificacion / reseñas.length;
    } catch (error) {
      console.error("Error al obtener las reseñas:", error);
      return 0;
    }
  };

  const calcularPorcentajeCalificacion = (promedio) => {
    return (promedio / 5) * 100;
  };

  const mostrarEstrellas = (porcentaje) => {
    const estrellas = [];
    for (let i = 1; i <= 5; i++) {
      if (porcentaje >= i * 20) {
        estrellas.push(<FaStar key={i} size={16} color="#f54703" />);
      } else {
        estrellas.push(<FaStar key={i} size={16} color="#ddd" />);
      }
    }
    return estrellas;
  };

  useEffect(() => {
    const fetchRatings = async () => {
      const ratings = {};
      for (const producto of productos) {
        const promedio = await calcularPromedioCalificacion(
          producto.id_producto
        );
        ratings[producto.id_producto] = promedio;
      }
      setProductRatings(ratings);
    };

    if (productos.length > 0) {
      fetchRatings();
    }
  }, [productos]);

  const fetchCupones = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/cupones-activos"
      );
      setCupones(response.data);
    } catch (error) {
      console.error("Error al obtener cupones:", error);
      setMensajes({ error: "Error al cargar los cupones disponibles" });
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await axios.get("http://localhost:3000/categoria");
      setCategorias(response.data);
    } catch (error) {
      console.error("Error fetching categorias:", error);
    }
  };

  const fetchProductos = async (idCategoria = null) => {
    try {
      let url = "http://localhost:3000/productos";
      if (idCategoria) {
        url += `?idcategoria=${idCategoria}`;
      }
      const response = await axios.get(url);
      const productos = response.data;

      const ofertasResponse = await axios.get("http://localhost:3000/ofertas");
      const ofertas = ofertasResponse.data;
      const fechaActual = new Date();

      const productosConOfertas = productos
        .map((producto) => {
          // Si el producto tiene una oferta asignada
          if (producto.idoferta) {
            const oferta = ofertas.find(
              (o) => o.idoferta === producto.idoferta
            );
            if (oferta) {
              const fechaInicio = new Date(oferta.inicio);
              const fechaExpiracion = new Date(oferta.expiracion);

              // Verificar si la oferta está vigente
              if (
                fechaActual >= fechaInicio &&
                fechaActual <= fechaExpiracion
              ) {
                // Si la oferta tiene descuento
                if (oferta.descuento) {
                  const precioConDescuento =
                    producto.precio * (1 - oferta.descuento / 100);
                  return {
                    ...producto,
                    precioFinal: precioConDescuento,
                    oferta: {
                      ...oferta,
                      tipo: "descuento",
                      fechaExpiracion: fechaExpiracion,
                    },
                  };
                } else {
                  // Si es oferta por tiempo limitado
                  return {
                    ...producto,
                    precioFinal: producto.precio,
                    oferta: {
                      ...oferta,
                      tipo: "temporal",
                      fechaExpiracion: fechaExpiracion,
                    },
                  };
                }
              } else if (!oferta.descuento) {
                // Si la oferta es temporal y está expirada, retornamos null para filtrar después
                return null;
              }
            }
          }

          // Si el producto no tiene oferta o tiene una oferta de descuento expirada,
          // mostrarlo con precio normal
          return {
            ...producto,
            precioFinal: producto.precio,
          };
        })
        .filter((producto) => producto !== null); // Filtrar los productos que son null (ofertas temporales expiradas)

      setProductos(productosConOfertas);
      const cantidadesIniciales = {};
      productosConOfertas.forEach((producto) => {
        cantidadesIniciales[producto.id_producto] = 1;
      });
      setCantidades(cantidadesIniciales);
    } catch (error) {
      console.error("Error fetching productos:", error);
    }
  };

  const cargarCarrito = async () => {
    try {
      const userId = Cookies.get("userID");
      if (userId) {
        const response = await axios.get(
          `http://localhost:3000/api/carrito/${userId}`
        );
        setCarrito(response.data);
      }
    } catch (error) {
      console.error("Error al cargar el carrito:", error);
    }
  };

  const handleCategoriaClick = (idCategoria) => {
    fetchProductos(idCategoria);
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
      if (isNaN(subtotal) || subtotal < 0) return "0.00";

      const descuentoAmount = subtotal * (descuento / 100);
      if (isNaN(descuentoAmount)) return subtotal.toFixed(2);

      const total = subtotal - descuentoAmount;
      return total.toFixed(2);
    } catch (error) {
      console.error("Error al calcular total:", error);
      return "0.00";
    }
  }, [calcularSubtotal, descuento]);

  useEffect(() => {
    const nuevoTotal = calcularTotal();
    setTotalCalculado(nuevoTotal);
    Cookies.set("cartTotal", nuevoTotal);
  }, [carrito, descuento, calcularTotal]);

  const agregarAlCarrito = async (producto) => {
    try {
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
  
      const userId = Cookies.get("userID");
      if (!userId) {
        setMensajes((prevMensajes) => ({
          ...prevMensajes,
          [producto.id_producto]:
            "Por favor, inicia sesión para agregar productos al carrito",
        }));
        return;
      }
  
      const cantidadAAgregar = cantidades[producto.id_producto] || 1;
      const precioFinal = producto.precioFinal || producto.precio;
      const productoParaCarrito = {
        idproducto: producto.id_producto,
        nombre: producto.nombre,
        cantidad: cantidadAAgregar,
        total: parseFloat((precioFinal * cantidadAAgregar).toFixed(2)),
        imagen: producto.imagen,
        idusuario: parseInt(userId, 10),
        idcategoria: producto.idcategoria,
      };
  
      const productoExistente = carrito.find(
        (item) => item.idproducto === producto.id_producto
      );
  
      if (productoExistente) {
        const nuevaCantidad = productoExistente.cantidad + cantidadAAgregar;
        await axios.put(
          `http://localhost:3000/api/carrito/${producto.id_producto}`,
          {
            cantidad: nuevaCantidad,
            idusuario: userId,
            total: parseFloat((precioFinal * nuevaCantidad).toFixed(2)),
          }
        );
      } else {
        await axios.post(
          "http://localhost:3000/api/carrito/agregar",
          productoParaCarrito
        );
      }
  
      setMensajes((prevMensajes) => ({
        ...prevMensajes,
        [producto.id_producto]: "Producto agregado al carrito",
      }));
      setTimeout(() => {
        setMensajes((prevMensajes) => ({
          ...prevMensajes,
          [producto.id_producto]: "",
        }));
      }, 3000);
      await cargarCarrito();
    } catch (error) {
      console.error("Error al agregar producto al carrito:", error);
      setMensajes((prevMensajes) => ({
        ...prevMensajes,
        [producto.id_producto]:
          "Error al agregar producto al carrito: " +
          (error.response?.data?.message || error.message),
      }));
    }
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

  const handleActualizarCarrito = async (idProducto, nuevaCantidad) => {
    try {
      const userId = Cookies.get("userID");
      const producto = productos.find((p) => p.id_producto === idProducto);
      const precioFinal = producto ? producto.precioFinal : producto.precio;
      const nuevoTotal = parseFloat((precioFinal * nuevaCantidad).toFixed(2));

      await axios.put(`http://localhost:3000/api/carrito/${idProducto}`, {
        cantidad: nuevaCantidad,
        idusuario: userId,
        total: nuevoTotal,
      });
      await cargarCarrito();
    } catch (error) {
      console.error("Error al actualizar producto en el carrito:", error);
    }
  };

  const handleEliminarCarrito = async (idProducto) => {
    try {
      const userId = Cookies.get("userID");
      await axios.delete(`http://localhost:3000/api/carrito/${idProducto}`, {
        data: { idusuario: userId },
      });
      await cargarCarrito();
    } catch (error) {
      console.error("Error al eliminar producto del carrito:", error);
    }
  };

  const calcularCantidadTotal = () => {
    return carrito.reduce((total, item) => total + item.cantidad, 0);
  };

  const renderCartPayPalButtons = () => {
    const total = parseFloat(Cookies.get("cartTotal") || totalCalculado);
    console.log("Total para PayPal del carrito:", total);

    if (isNaN(total) || total <= 0) return null;

    return (
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          const currentTotal = parseFloat(
            Cookies.get("cartTotal") || totalCalculado
          );
          const subtotal = calcularSubtotal();
          console.log("Creando orden con total:", currentTotal);

          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  currency_code: "MXN",
                  value: currentTotal.toString(),
                  breakdown: {
                    item_total: {
                      currency_code: "MXN",
                      value: subtotal.toFixed(2),
                    },
                    discount: {
                      currency_code: "MXN",
                      value: (subtotal - currentTotal).toFixed(2),
                    },
                  },
                },
              },
            ],
          });
        }}
        onApprove={async (data, actions) => {
          try {
            const details = await actions.order.capture();
            await realizarCompra(details, data);
          } catch (error) {
            console.error("Error al procesar el pago:", error);
            setMensajes({
              error:
                "Error al procesar el pago. Por favor, intente nuevamente.",
            });
          }
        }}
        onError={(err) => {
          console.error("Error PayPal:", err);
          setMensajes({
            error:
              "Error en la conexión con PayPal. Por favor, intente nuevamente.",
          });
        }}
      />
    );
  };

  const comprarAhora = (producto) => {
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
  
    // Si hay conexión, continuar con la lógica original
    const cantidad = cantidades[producto.id_producto] || 1;
    const precioFinal = producto.precioFinal || producto.precio;
    const total = parseFloat((precioFinal * cantidad).toFixed(2));
    Cookies.set("buyNowTotal", total.toString());
    setCompraInmediata({
      ...producto,
      cantidad,
      total,
      descuento: 0,
      cuponAplicado: null,
    });
  };

  const renderBuyNowPayPalButtons = () => {
    if (!compraInmediata) return null;

    const total = parseFloat(
      Cookies.get("buyNowTotal") || compraInmediata.total.toString()
    );
    console.log("Total para PayPal compra inmediata:", total);

    return (
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          const currentTotal = parseFloat(
            Cookies.get("buyNowTotal") || compraInmediata.total.toString()
          );

          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  currency_code: "MXN",
                  value: currentTotal.toString(),
                },
              },
            ],
          });
        }}
        onApprove={async (data, actions) => {
          try {
            const details = await actions.order.capture();
            await realizarCompraInmediata(details, data);
          } catch (error) {
            console.error("Error al procesar el pago:", error);
            setMensajes({
              error:
                "Error al procesar el pago. Por favor, intente nuevamente.",
            });
          }
        }}
        onError={(err) => {
          console.error("Error PayPal:", err);
          setMensajes({
            error:
              "Error en la conexión con PayPal. Por favor, intente nuevamente.",
          });
        }}
      />
    );
  };

  const aplicarCuponCarrito = async (cupon) => {
    try {
      const descuentoNum = parseInt(cupon.discount);
      if (isNaN(descuentoNum)) {
        setMensajes({ error: "Error al aplicar el cupón" });
        return;
      }

      const userId = Cookies.get("userID");
      if (!userId) {
        setMensajes({
          error: "Por favor, inicia sesión para aplicar el cupón",
        });
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3000/api/cupones-disponibles/${userId}`
        );
        const cuponDisponible = response.data.find(
          (c) => c.idcupon === cupon.idcupon && !c.usado
        );

        if (!cuponDisponible) {
          setMensajes({
            error: "Este cupón ya ha sido utilizado o no está disponible",
          });
          return;
        }

        setDescuento(descuentoNum);
        setCuponAplicado(cupon);
        setMostrarCupones(false);

        const subtotal = calcularSubtotal();
        const nuevoTotal = (subtotal * (1 - descuentoNum / 100)).toFixed(2);
        setTotalCalculado(nuevoTotal);
        Cookies.set("cartTotal", nuevoTotal);

        setMensajes({
          success: `Cupón de ${cupon.discount}% aplicado exitosamente`,
        });
        setTimeout(() => {
          setMensajes({});
        }, 3000);
      } catch (error) {
        console.error("Error al verificar el cupón:", error);
        setMensajes({
          error: "Error al verificar la disponibilidad del cupón",
        });
      }
    } catch (error) {
      console.error("Error al aplicar cupón:", error);
      setMensajes({ error: "Error al aplicar el cupón" });
    }
  };

  const quitarCuponCarrito = () => {
    setDescuento(0);
    setCuponAplicado(null);
    const nuevoTotal = calcularSubtotal().toFixed(2);
    setTotalCalculado(nuevoTotal);
    Cookies.set("cartTotal", nuevoTotal);
    setMensajes({ success: "Cupón removido exitosamente" });
    setTimeout(() => {
      setMensajes({});
    }, 3000);
  };

  const aplicarCuponCompraInmediata = async (cupon) => {
    try {
      const userId = Cookies.get("userID");
      if (!userId) {
        setMensajes({
          error: "Por favor, inicia sesión para aplicar el cupón",
        });
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3000/api/cupones-disponibles/${userId}`
        );
        const cuponDisponible = response.data.find(
          (c) => c.idcupon === cupon.idcupon && !c.usado
        );

        if (!cuponDisponible) {
          setMensajes({
            error: "Este cupón ya ha sido utilizado o no está disponible",
          });
          return;
        }

        const descuentoNum = parseInt(cupon.discount);
        const subtotal = compraInmediata.precioFinal * compraInmediata.cantidad;
        const nuevoTotal = subtotal * (1 - descuentoNum / 100);

        setCompraInmediata((prev) => ({
          ...prev,
          total: nuevoTotal,
          descuento: descuentoNum,
          cuponAplicado: cupon,
        }));

        Cookies.set("buyNowTotal", nuevoTotal.toString());
        setMostrarCupones(false);
        setMensajes({
          success: `Cupón de ${cupon.discount}% aplicado exitosamente`,
        });

        setTimeout(() => {
          setMensajes({});
        }, 3000);
      } catch (error) {
        console.error("Error al verificar el cupón:", error);
        setMensajes({
          error: "Error al verificar la disponibilidad del cupón",
        });
      }
    } catch (error) {
      console.error("Error al aplicar cupón:", error);
      setMensajes({ error: "Error al aplicar el cupón" });
    }
  };

  const quitarCuponCompraInmediata = () => {
    if (compraInmediata) {
      const precioOriginal =
        compraInmediata.precioFinal || compraInmediata.precio;
      const nuevoTotal = precioOriginal * compraInmediata.cantidad;
      setCompraInmediata((prev) => ({
        ...prev,
        total: nuevoTotal,
        descuento: 0,
        cuponAplicado: null,
      }));
      Cookies.set("buyNowTotal", nuevoTotal.toString());
      setMensajes({ success: "Cupón removido exitosamente" });
      setTimeout(() => {
        setMensajes({});
      }, 3000);
    }
  };

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


  const cerrarSesion = () => {
    Cookies.remove("userName");
    Cookies.remove("userRole");
    Cookies.remove("userID");
    Cookies.remove("cartTotal");
    Cookies.remove("buyNowTotal");
    setUserName("");
    setUserRole(null);
    setMostrarMenuUsuario(false);
    navigate("/loginform");
  };

  const irAModoAdministrador = () => {
    navigate("/userlist");
  };

  const MisCupones = () => {
    navigate("/cupones");
  };

  const MiCarrito = () => {
    navigate("/carrito");
  };

  return (
    <PayPalScriptProvider
      options={{
        "client-id":
          "Adm1ePzrPh4pqcyELF8e8VzTdItq1U764Urwv2wQh_5vNrZwTneFQl-_EZW9heVcxwaNZ22NuM-NFIpi",
        currency: "MXN",
      }}
    >
      <div className="flex flex-col min-h-screen font-sans">
        {/* Navigation */}
        <nav className="bg-[#1446a0] p-4 relative z-50">
          <div className="container mx-auto flex justify-between items-center">
            <Link
              to="/"
              className="flex items-center text-white font-bold text-xl"
            >
              <img
                src="/assets/img/logo_pizza2.png"
                alt="Logo"
                className="w-20 mr-2"
              />
              Pizzeria Saborreti
            </Link>
            <div className="hidden lg:flex items-center space-x-6">
              <Link
                to="/"
                className="text-white font-bold uppercase hover:text-gray-300 text-base"
              >
                Inicio
              </Link>
              <Link
                to="/conocenos"
                className="text-white font-bold uppercase hover:text-gray-300 text-base"
              >
                Conocenos
              </Link>
              <Link
                to="/landing"
                className="text-white font-bold uppercase hover:text-gray-300 text-base"
              >
                Productos
              </Link>
              <Link
                to="/contacto"
                className="text-white font-bold uppercase hover:text-gray-300 text-base"
              >
                Contacto
              </Link>
              {/* <Link
                to="/cupones"
                className="text-white font-bold uppercase hover:text-gray-300 text-base"
              >
                Cupones
              </Link> */}
              {/* <Link
                to="/pepperpoints"
                className="text-white font-bold uppercase hover:text-gray-300 text-base"
              >
                Mis PepperPoints
              </Link> */}
              <Link
                to="/compras"
                className="text-white font-bold uppercase border border-white rounded px-3 py-1 hover:bg-white hover:text-[#1446a0] text-base"
              >
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
                  <div className="absolute right-0 mt-2 w-64 bg-white shadow-xl rounded-lg z-50 py-3 flex flex-col space-y-2 transform transition-transform duration-300 ease-out">
                    {/* Opción para Cupones */}
                    <Link
                      to="/cupones"
                      className="menu-option flex items-center px-4 py-2 hover:bg-orange-100 rounded-md transition duration-200 group"
                    >
                      <span className="mr-3 text-blue-500 group-hover:text-orange-500 transition duration-200">
                        🎟
                      </span>
                      <span className="text-gray-700 group-hover:text-orange-500 font-medium transition duration-200">
                        Cupones
                      </span>
                    </Link>
                    {/* Separador */}
                    <hr className="border-t border-gray-200" />
                    {/* Opción para Orden Activa */}
                    <Link
                      to="/ListaOrdenes"
                      className="menu-option flex items-center px-4 py-2 hover:bg-orange-100 rounded-md transition duration-200 group"
                    >
                      <span className="mr-3 text-green-500 group-hover:text-orange-500 transition duration-200">
                        🛒
                      </span>
                      <span className="text-gray-700 group-hover:text-orange-500 font-medium transition duration-200">
                        Ordenes Activas
                      </span>
                    </Link>
                    {/* Separador */}
                    <hr className="border-t border-gray-200" />
                    {/* Opción para Membresía */}
                    <Link
                      to="/pepperpoints"
                      className="menu-option flex items-center px-4 py-2 hover:bg-orange-100 rounded-md transition duration-200 group"
                    >
                      <span className="mr-3 text-orange-500 group-hover:text-orange-500 transition duration-200">
                        🎫
                      </span>
                      <span className="text-gray-700 group-hover:text-orange-500 font-medium transition duration-200">
                        Pepperpoints
                      </span>
                    </Link>
                    {/* Separador */}
                    <hr className="border-t border-gray-200" />
                    {/* Opción para Cerrar Sesión */}
                    <button
                      onClick={cerrarSesion}
                      className="flex items-center w-full px-4 py-2 text-red-500 hover:bg-orange-100 rounded-md transition duration-200 group"
                    >
                      <span className="mr-3 text-red-500 group-hover:text-orange-500 transition duration-200">
                        ⬅️ {/* Emoji de flecha hacia la izquierda */}
                      </span>
                      <span className="text-gray-700 group-hover:text-orange-500 font-medium transition duration-200">
                        Cerrar sesión
                      </span>
                    </button>
                    {/* Opción para Modo Administrador */}
                    {userRole === "2" && (
                      <>
                        <hr className="border-t border-gray-200" />
                        <button
                          onClick={irAModoAdministrador}
                          className="menu-option flex items-center px-4 py-2 hover:bg-orange-100 rounded-md transition duration-200 group"
                        >
                          <span className="mr-3 text-purple-500 group-hover:text-orange-500 transition duration-200">
                            ⚙️
                          </span>
                          <span className="text-gray-700 group-hover:text-orange-500 font-medium transition duration-200">
                            Modo Administrador
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                )}
                </div>
              ) : (
                <Link
                  to="/loginform"
                  className="text-white font-bold uppercase hover:text-gray-300 text-base"
                >
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </nav>

        <main className="flex-grow container mx-auto mt-10 px-4">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="md:w-1/4 pr-4">
              <div className="bg-[#f54703] text-white p-4 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Categorías</h2>
                <ul className="space-y-2">
                  <li
                    onClick={() => handleCategoriaClick(null)}
                    className="cursor-pointer hover:text-gray-300"
                  >
                    Todas nuestras pizzas
                  </li>
                  {categorias.map((categoria) => (
                    <li
                      key={categoria.idcategoria}
                      className="flex justify-between items-center cursor-pointer hover:text-gray-300"
                      onClick={() =>
                        handleCategoriaClick(categoria.idcategoria)
                      }
                    >
                      <span>{categoria.nombre}</span>
                      {categoria.nombre !== "Ofertas" && (
                        <div className="flex items-center">
                          <img
                            src="/image/pepperpoint.png"
                            alt="PepperPoint"
                            className="w-5 h-5 mr-2"
                          />
                          <span>{categoria.puntos} pts</span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Products Grid */}
            <section className="md:w-3/4">
              <h2 className="text-center text-[#f54603] text-3xl font-bold mb-4">
                Nuestro menú de pizzas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productos.map((producto) => (
                  <div
                    key={producto.id_producto}
                    className={`border rounded-lg p-4 shadow-md relative ${
                      producto.oferta?.tipo === "descuento"
                        ? "border-[#f54703] border-2"
                        : producto.oferta?.tipo === "temporal"
                        ? "border-red-600 border-2"
                        : ""
                    }`}
                  >
                    {producto.oferta?.tipo === "descuento" && (
                      <div className="absolute -top-3 -right-3 bg-[#f54703] text-white rounded-full w-16 h-16 flex items-center justify-center transform rotate-12">
                        <span className="text-sm font-bold">
                          {producto.oferta.descuento}% OFF
                        </span>
                      </div>
                    )}

                    {producto.oferta?.tipo === "temporal" && (
                      <div className="absolute -top-3 -right-3 bg-red-600 text-white py-1 px-3 rounded-lg transform rotate-12">
                        <span className="text-sm font-bold whitespace-nowrap">
                          Por tiempo limitado
                        </span>
                      </div>
                    )}

                    <img
                      src={
                        producto.imagen
                          ? `http://localhost:3000/uploads/${producto.imagen}`
                          : "/image/default-pizza.jpg"
                      }
                      alt={producto.nombre}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />

                    <h3 className="text-xl font-bold mb-2">
                      {producto.nombre}
                    </h3>
                    <p className="text-gray-600 mb-2">{producto.descripcion}</p>
                    <p className="text-sm mb-1">Tamaño: {producto.tamano}</p>

                    <div className="mb-3">
                      {producto.oferta?.tipo === "descuento" ? (
                        <>
                          <p className="text-sm text-gray-500">Antes:</p>
                          <p className="text-lg font-bold text-gray-500 line-through">
                            ${parseFloat(producto.precio).toFixed(2)}
                          </p>
                          <p className="text-sm text-[#f54703]">
                            Precio de oferta:
                          </p>
                          <p className="flex items-center justify-start text-orange-500 font-bold text-lg">
                            ${producto.precioFinal.toFixed(2)}{" "}
                            <span className="ml-2">🔥</span>
                          </p>
                          <p className="text-sm text-gray-500">
                            Válido hasta:{" "}
                            {new Date(
                              producto.oferta.fechaExpiracion
                            ).toLocaleDateString()}
                          </p>
                        </>
                      ) : producto.oferta?.tipo === "temporal" ? (
                        <>
                          <p className="text-lg font-bold text-[#f54703]">
                            Precio: ${parseFloat(producto.precio).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            Disponible hasta:{" "}
                            {new Date(
                              producto.oferta.fechaExpiracion
                            ).toLocaleDateString()}
                          </p>
                        </>
                      ) : (
                        <p className="text-lg font-bold text-[#f54703]">
                          Precio: ${parseFloat(producto.precio).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {mostrarEstrellas(
                            calcularPorcentajeCalificacion(
                              productRatings[producto.id_producto] || 0
                            )
                          )}
                        </div>
                        <span className="text-sm text-gray-600">
                          {productRatings[producto.id_producto]
                            ? `${calcularPorcentajeCalificacion(
                                productRatings[producto.id_producto]
                              ).toFixed(0)}%`
                            : "Sin calificaciones"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center mb-3">
                      <Link
                        to={`/producto/${producto.id_producto}`}
                        className="text-[#1446a0] hover:text-blue-700 mr-2 underline"
                      >
                        Ver detalles
                      </Link>
                      <input
                        type="number"
                        value={cantidades[producto.id_producto] || 1}
                        onChange={(e) =>
                          setCantidades({
                            ...cantidades,
                            [producto.id_producto]: parseInt(e.target.value),
                          })
                        }
                        min="1"
                        className="w-16 border rounded px-2 py-1 mr-2"
                      />
                      <button
                        onClick={() => agregarAlCarrito(producto)}
                        className="bg-[#1446a0] text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Agregar al Carrito
                      </button>
                    </div>
                    <button
                      onClick={() => comprarAhora(producto)}
                      className="w-full bg-[#f54703] text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Comprar Ahora
                    </button>
                    {mensajes[producto.id_producto] && (
                      <p className="text-sm text-green-600 mt-2">
                        {mensajes[producto.id_producto]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>

        {/* Buy Now Modal */}
        {compraInmediata && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Confirmar Compra</h3>
              <div className="mb-4">
                <p className="mb-2">
                  <strong>Producto:</strong> {compraInmediata.nombre}
                </p>
                <p className="mb-2">
                  <strong>Cantidad:</strong> {compraInmediata.cantidad}
                </p>
                <p className="mb-2">
                  <strong>Subtotal:</strong> $
                  {(
                    compraInmediata.precioFinal * compraInmediata.cantidad
                  ).toFixed(2)}
                </p>

                {compraInmediata.cuponAplicado ? (
                  <div className="bg-green-100 p-3 rounded mb-3">
                    <p>
                      Cupón aplicado: {compraInmediata.cuponAplicado.discount}%
                      de descuento
                    </p>
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

                <p className="text-xl font-bold">
                  Total Final: ${compraInmediata.total.toFixed(2)}
                </p>
              </div>

              {renderBuyNowPayPalButtons()}

              <button
                onClick={() => {
                  setCompraInmediata(null);
                  Cookies.remove("buyNowTotal");
                }}
                className="mt-4 w-full bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Coupons Modal */}
        {mostrarCupones && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#f54603]">
                  Cupones Disponibles
                </h3>
                <button
                  onClick={() => setMostrarCupones(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ✕
                </button>
              </div>

              {cupones.length === 0 ? (
                <p className="text-center text-gray-600 p-4">
                  No hay cupones disponibles en este momento
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cupones.map((cupon, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 shadow-md"
                    >
                      <div className={`${cupon.bgColor} p-4 rounded-lg mb-4`}>
                        <img
                          src={cupon.img}
                          alt="cupon"
                          className="w-full h-24 object-cover rounded"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-500 mb-2">
                          DESCUENTO {cupon.discount}%
                        </p>
                        <p className="text-gray-600 mb-2">
                          Válido hasta: {cupon.expiration}
                        </p>
                        <button
                          onClick={() =>
                            setSelectedCoupon(
                              index === selectedCoupon ? null : index
                            )
                          }
                          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300 w-full mb-2"
                        >
                          {selectedCoupon === index
                            ? "Cerrar"
                            : "Más Información"}
                        </button>
                        <button
                          onClick={() =>
                            compraInmediata
                              ? aplicarCuponCompraInmediata(cupon)
                              : aplicarCuponCarrito(cupon)
                          }
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
                <img
                  src="/assets/img/logo_pizza2.png"
                  alt="Logo"
                  className="w-36"
                />
              </div>
              <div>
                <h5 className="font-bold mb-2 text-lg">Dirección</h5>
                <p className="text-base">
                  Calle 57a #982 x 36 y 37 Fraccionamiento Los Heroes
                </p>
              </div>
              <div>
                <h5 className="font-bold mb-2 text-lg">Teléfonos</h5>
                <p className="text-base">
                  <FaPhone className="inline mr-2" /> 999 532 3689
                </p>
                <p className="text-base">
                  <FaPhone className="inline mr-2" /> 999 168 0011
                </p>
              </div>
              <div>
                <h5 className="font-bold mb-2 text-lg">Correo</h5>
                <p className="text-base">
                  <HiMail className="inline mr-2" /> pizzasaborretti@gmail.com
                </p>
              </div>
            </div>
          </div>
          <div className="bg-[#f54703] text-center py-4">
            <p className="text-lg">
              © 2024 <strong>Pizzeria Saborreti</strong>
            </p>
          </div>
        </footer>

        {/* Success/Error Messages */}
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

export default Landing;
