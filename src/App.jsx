import React from "react";
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";
import RegisterForm from "./RegisterForm";
import LoginForm from "./LoginForm";
import ProductForm from "./ProductForm";
import Usuario from "./Usuario"; // Importa el componente Usuario
import Landing from "./Landing";
import Dashboard from "./Dashboard";
import Home from "./Home";
import UserList from "./UserList";
import RegisterPage from "./RegisterPage";
import Conocenos from "./Conocenos";
import Contacto from "./Contacto";
import Compras from "./Compras";
import CategoriaForm from "./CategoriaForm";
import ProductoList from "./ProductoList";
import ComprasAdmin from "./ComprasAdmin";
import Cupones from "./Cupones";
import CuponesAdmin from "./CuponesAdmin";
import OfertasAdmin from "./OfertasAdmin";
import Carrito from "./Carrito";
import ProductoPage from "./ProductoPage";
import CanjeablesForm from "./CanjeablesForm";
import PepperPoints from "./PepperPoints";
import OrdenActiva from './OrdenActiva'; // Asegúrate de que la ruta sea correcta
import ListaOrdenes from './ListaOrdenes';
import MenuUsuario from './MenuUsuario';
import GestorOrdenes from './GestorOrdenes';
import NotificacionForm from './NotificacionForm';
import Supersetvista from './Supersetvista';



const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/loginform" element={<LoginForm />} />
        <Route path="/registerform" element={<RegisterForm />} />
        <Route path="/productform" element={<ProductForm />} />
        <Route path="/usuarios" element={<Usuario />} /> 
        <Route path="/landing" element={<Landing />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/home" element={<Home />} />
        <Route path="/userlist" element={<UserList />} />
        <Route path="/registerpage" element={<RegisterPage />} />
        <Route path="/conocenos" element={<Conocenos />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/compras" element={<Compras />} />
        <Route path="/categoriaform" element={<CategoriaForm />} />
        <Route path="/productolist" element={<ProductoList />} />
        <Route path="/comprasadmin" element={<ComprasAdmin />} />
        <Route path="/cupones" element={<Cupones />} />
        <Route path="/cuponesadmin" element={<CuponesAdmin />} />
        <Route path="/ofertasadmin" element={<OfertasAdmin />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/producto/:id_producto" element={<ProductoPage />} />
        <Route path="/canjeablesform" element={<CanjeablesForm />} />
        <Route path="/pepperpoints" element={<PepperPoints />} />
        <Route path="/OrdenActiva/:idOrden" element={<OrdenActiva />} />
        <Route path="/ListaOrdenes" element={<ListaOrdenes />} />
        <Route path="/orden/:id" element={<OrdenActiva />} />
        <Route path="/gestor-ordenes" element={<GestorOrdenes />} /> {/* Ruta para el gestor de órdenes */}
        <Route path="/MenuUsuario" element={<MenuUsuario />} />
        <Route path="/NotificacionForm" element={<NotificacionForm />} />
        <Route path="/supersetvista" element={<Supersetvista />} />
      </Routes>
    </Router>
  );
};

export default App;
