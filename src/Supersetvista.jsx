import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Dashboard from './Dashboard';

const Supersetvista = () => {
  const [loading, setLoading] = useState(true);
  const [iframeSrc, setIframeSrc] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [mostrarMenuUsuario, setMostrarMenuUsuario] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkUserSession();
    const fetchData = async () => {
      try {
        const dashboardUrl = "http://localhost:8088/superset/dashboard/16/";
        setIframeSrc(dashboardUrl);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar el dashboard:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const checkUserSession = () => {
    const userID = Cookies.get('userID');
    const userRole = Cookies.get('userRole');
    const userName = Cookies.get('userName');
    
    if (!userID || !userRole || !userName) {
      navigate('/loginform');
    } else {
      setUserName(userName);
      setUserRole(userRole);
    }
  };

  const cerrarSesion = () => {
    Cookies.remove('userName');
    Cookies.remove('userRole');
    Cookies.remove('userID');
    setUserName('');
    setUserRole(null);
    setMostrarMenuUsuario(false);
    navigate('/loginform');
  };

  return (
    <Dashboard>
    
    <div className="font-montserrat">
    
      <main className="container mx-auto px-4 py-8">
        <div className="">
          <div className="">
            <div className="">
              {loading ? (
                <p>Cargando datos del dashboard...</p>
              ) : iframeSrc ? (
                <iframe
                  src={iframeSrc}
                  width="100%"
                  height="600px"
                  frameBorder="0"
                  title="Dashboard Superset"
                ></iframe>
              ) : (
                <p className="text-red-500">Hubo un error al cargar el dashboard.</p>
              )}
            </div>
          </div>
          <div className="">
          </div>
        </div>
      </main>
    </div>
    </Dashboard>
  );
};

export default Supersetvista;