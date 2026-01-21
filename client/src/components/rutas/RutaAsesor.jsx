// Componente para la gestión de rutas de asesores
// Permite iniciar, gestionar y finalizar rutas con entregas, gastos y ventas

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import rutaService from '../../service/rutaService';
import notificacionService from '../../service/notificacionService';
import NavComponent from '../common/NavBar';
import { Save, ArrowLeft, Package, DollarSign, ShoppingCart, CheckCircle, Edit } from 'lucide-react';
import Swal from 'sweetalert2';

const RutaAsesor = () => {
  // Estados para manejar las diferentes ventanas/pasos de la ruta
  const [currentWindow, setCurrentWindow] = useState(1); // 1: iniciar, 2: en ruta, 3: finalizar
  const [currentRouteId, setCurrentRouteId] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [formData, setFormData] = useState({
    lentes_recibidos: '',
    tarjetas_recibidas: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Control de acceso: solo asesores pueden acceder
  useEffect(() => {
    if (user && user.puesto !== 'Asesor') {
      navigate('/dashboard');
      return;
    }
  }, [user, navigate]);



  // Cargar ruta activa al montar el componente y restaurar estado si existe
  useEffect(() => {
    const loadActiveRoute = async () => {
      if (!user || user.puesto !== 'Asesor') return;

      // Verificar parámetros de URL para navegación de ventanas
      const urlParams = new URLSearchParams(window.location.search);
      const targetWindow = urlParams.get('window');

      const savedRouteId = localStorage.getItem('activeRouteId');
      const savedWindow = localStorage.getItem('currentWindow');

      // Intentar restaurar ruta guardada en localStorage
      if (savedRouteId && savedWindow === '2') {
        try {
          const rutas = await rutaService.getAllRutas();
          const restoredRoute = rutas.find(r => r.idruta === parseInt(savedRouteId));

          if (restoredRoute && restoredRoute.estatus === 'Activa') {
            setCurrentRouteId(restoredRoute.idruta);
            setRouteData(restoredRoute);
            setCurrentWindow(targetWindow === '3' ? 3 : 2);
            return;
          } else {
            localStorage.removeItem('activeRouteId');
            localStorage.removeItem('currentWindow');
          }
        } catch (err) {
          console.error('Error restoring saved route:', err);
        }
      } else {
        // Buscar ruta activa del asesor actual
        try {
          const rutas = await rutaService.getAllRutas();
          const restoredRoute = rutas.find(r => r.idasesor === user.idempleado && r.estatus === 'Activa');
          if (restoredRoute) {
            setCurrentRouteId(restoredRoute.idruta);
            setRouteData(restoredRoute);
            setCurrentWindow(targetWindow === '3' ? 3 : 2);
            return;
          }
        } catch (err) {
          console.error('Error checking for existing active route:', err);

        }
      }

      // Buscar ruta activa para hoy
      try {
        const rutas = await rutaService.getAllRutas();
        const activeRoute = rutas.find(r =>
          r.idasesor === user.idempleado &&
          r.estatus === 'Activa' &&
          r.fecha === new Date().toISOString().slice(0, 10)
        );

        if (activeRoute) {
          setCurrentRouteId(activeRoute.idruta);
          setRouteData(activeRoute);
          setCurrentWindow(targetWindow === '3' ? 3 : 2);
        } else {
          setCurrentWindow(1);
        }
      } catch (err) {
        console.error('Error loading active route:', err);
      }
    };

    loadActiveRoute();
  }, [user]);



  // Recargar datos de la ruta periódicamente para mantener actualizado
  useEffect(() => {
    if (currentRouteId && user && user.puesto === 'Asesor') {
      const refreshRouteData = async () => {
        try {
          const rutas = await rutaService.getAllRutas();
          const currentRoute = rutas.find(r => r.idruta === currentRouteId);
          if (currentRoute) {
            setRouteData(currentRoute);
          }
        } catch (err) {
          console.error('Error refreshing route data:', err);
        }
      };

      // Actualizar inmediatamente y configurar intervalo para actualizaciones continuas
      refreshRouteData();
      const interval = setInterval(refreshRouteData, 2000); // Actualizar cada 2 segundos

      return () => clearInterval(interval); // Limpiar al desmontar
    }
  }, [currentRouteId, user]);

  // Guardar estado de la ruta en localStorage para persistencia
  useEffect(() => {
    if (currentRouteId && currentWindow === 2) {
      localStorage.setItem('activeRouteId', currentRouteId);
      localStorage.setItem('currentWindow', '2');
    } else if (currentWindow === 1) {
      // Si localStorage.getItem('currentWindow') es 2, no hacer nada
      const savedWindow = localStorage.getItem('currentWindow');
      if (savedWindow === '2') return;
      localStorage.removeItem('activeRouteId');
      localStorage.removeItem('currentWindow');
    }
  }, [currentWindow, currentRouteId]);


  // Manejador de cambios en los inputs del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  // Función para iniciar una nueva ruta
  const startRoute = async (e) => {
    e.preventDefault();

    if (!formData.lentes_recibidos || !formData.tarjetas_recibidas) {
      Swal.fire({
        title: 'Campos requeridos',
        text: 'Debe ingresar la cantidad de lentes y tarjetas recibidas.',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    setLoading(true);
    try {
      const now = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
      const routePayload = {
        idasesor: user.idempleado,
        lentes_recibidos: parseInt(formData.lentes_recibidos),
        tarjetas_recibidas: parseInt(formData.tarjetas_recibidas),
        fecha: now.toISOString().slice(0, 10),
        hora_inicio: now.toTimeString().slice(0, 8),
        estatus: 'Activa',
        lentes_entregados: 0,
        tarjetas_entregadas: 0,
        lentes_no_entregados: null,
        tarjetas_no_entregadas: null,
        hora_fin: null,
      };

      const newRoute = await rutaService.createRuta(routePayload);
      setCurrentRouteId(newRoute.id);
      setRouteData(newRoute);
      setCurrentWindow(2);

      Swal.fire({
        title: 'Ruta iniciada',
        text: 'La ruta ha sido iniciada exitosamente.',
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Continuar'
      });
    } catch (err) {
      console.error(err.message);
      Swal.fire({
        title: 'Error',
        text: 'Error al iniciar la ruta.',
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Entendido'
      });
    } finally {
      setLoading(false);
    }
  };

  // Funciones de navegación para diferentes acciones de la ruta
  const registerDelivery = () => {
    navigate(`/entregas/complete?ruta=${currentRouteId}`);
  };

  const registerExpense = () => {
    navigate(`/gasto-rutas/new?idruta=${currentRouteId}`);
  };

  const newSale = () => {
    navigate('/ventas/new/unified?fromRuta=true');
  };

  const finishRoute = () => {
    setCurrentWindow(3);
  };

  const registerUndeliveredLente = () => {
    navigate(`/entregas/complete?ruta=${currentRouteId}&undelivered=lente`);
  };

  const registerUndeliveredPago = () => {
    navigate(`/entregas/complete?ruta=${currentRouteId}&undelivered=pago`);
  };

  // Función para solicitar edición de la ruta al administrador
  const handleEditRequest = () => {
    Swal.fire({
      title: 'Solicitar edición',
      input: 'textarea',
      inputLabel: 'Descripción de la edición solicitada',
      inputPlaceholder: 'Describe qué cambios necesitas hacer en esta ruta...',
      inputValidator: (value) => {
        if (!value) {
          return 'Debes proporcionar una descripción';
        }
      },
      showCancelButton: true,
      confirmButtonText: 'Enviar solicitud',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const mensaje = `Ruta Asesor - ID Ruta: ${currentRouteId}, Descripción: ${result.value} - Solicitado por: ${user.nombre} ${user.paterno} ${user.materno}`;
          await notificacionService.create(mensaje);
          Swal.fire('Solicitud enviada', 'Tu solicitud de edición ha sido enviada al administrador.', 'success');
        } catch {
          Swal.fire('Error', 'No se pudo enviar la solicitud.', 'error');
        }
      }
    });
  };

  // Función para finalizar la ruta definitivamente
  const finalizeRoute = async () => {
    const remainingLentes = routeData.lentes_recibidos - routeData.lentes_entregados - (routeData.lentes_no_entregados || 0);
    const remainingTarjetas = routeData.tarjetas_recibidas - routeData.tarjetas_entregadas - (routeData.tarjetas_no_entregadas || 0);

    if (remainingLentes > 0 || remainingTarjetas > 0) {
      Swal.fire({
        title: 'Artículos pendientes',
        text: 'Aún hay artículos sin registrar como entregados o no entregados.',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    setLoading(true);
    try {
      const now = new Date();
      const finalizeUpdateData = {
        ...routeData,
        hora_fin: now.toTimeString().slice(0, 8),
        estatus: 'Finalizada',
      };

      // Ensure date field is in YYYY-MM-DD format only
      if (finalizeUpdateData.fecha) {
        finalizeUpdateData.fecha = finalizeUpdateData.fecha.split('T')[0];
      }

      await rutaService.updateRuta(currentRouteId, finalizeUpdateData);

      setCurrentRouteId(null);
      setRouteData(null);
      setCurrentWindow(1);
      setFormData({ lentes_recibidos: '', tarjetas_recibidas: '' });

      localStorage.removeItem('activeRouteId');
      localStorage.removeItem('currentWindow');


      Swal.fire({
        title: 'Ruta finalizada',
        text: 'La ruta ha sido finalizada exitosamente.',
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido'
      });
    } catch (err) {
      console.error(err.message);
      Swal.fire({
        title: 'Error',
        text: 'Error al finalizar la ruta.',
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Entendido'
      });
    } finally {
      setLoading(false);
    }
  };

  // Verificación de acceso: solo asesores pueden ver el componente
  if (user && user.puesto !== 'Asesor') {
    return null; // Acceso denegado
  }

  return (
    // Contenedor principal del componente
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-blue-700">RUTA PARA ASESOR</h1>
              <div className="text-sm text-gray-600">
                Fecha: {new Date().toLocaleDateString('es-ES')}
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            {/* Ventana 1: Iniciar ruta */}
            {currentWindow === 1 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Iniciar Ruta</h2>
                <form onSubmit={startRoute} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lentes Recibidos *
                      </label>
                      <input
                        type="number"
                        name="lentes_recibidos"
                        value={formData.lentes_recibidos}
                        onChange={handleChange}
                        required
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tarjetas Recibidas *
                      </label>
                      <input
                        type="number"
                        name="tarjetas_recibidas"
                        value={formData.tarjetas_recibidas}
                        onChange={handleChange}
                        required
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      <span>{loading ? 'Iniciando...' : 'Iniciar Ruta'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Ventana 2: Gestión de ruta activa */}
            {currentWindow === 2 && routeData && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">En Ruta</h2>
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <strong>Lentes Recibidos:</strong> {routeData.lentes_recibidos}
                    </div>
                    <div>
                      <strong>Lentes Entregados:</strong> {routeData.lentes_entregados || 0}
                    </div>
                    <div>
                      <strong>Tarjetas Recibidas:</strong> {routeData.tarjetas_recibidas}
                    </div>
                    <div>
                      <strong>Tarjetas Entregadas:</strong> {routeData.tarjetas_entregadas || 0}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <button
                    onClick={registerDelivery}
                    className="flex items-center justify-center space-x-2 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Package className="h-5 w-5" />
                    <span>Registrar Entrega</span>
                  </button>

                  <button
                    onClick={registerExpense}
                    className="flex items-center justify-center space-x-2 px-6 py-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <DollarSign className="h-5 w-5" />
                    <span>Registrar Gasto</span>
                  </button>

                  <button
                    onClick={newSale}
                    className="flex items-center justify-center space-x-2 px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Nuevo Contrato de Venta</span>
                  </button>

                  <button
                    onClick={handleEditRequest}
                    className="flex items-center justify-center space-x-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Edit className="h-5 w-5" />
                    <span>Solicitar edición</span>
                  </button>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
                  <button
                    onClick={finishRoute}
                    className="flex items-center space-x-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Finalizar Ruta</span>
                  </button>
                </div>
              </div>
            )}

            {/* Ventana 3: Finalización de ruta */}
            {currentWindow === 3 && routeData && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Fin de Ruta</h2>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen de la Ruta</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <strong>Lentes Recibidos:</strong> {routeData.lentes_recibidos}
                    </div>
                    <div>
                      <strong>Lentes Entregados:</strong> {routeData.lentes_entregados || 0}
                    </div>
                    <div>
                      <strong>Tarjetas Recibidas:</strong> {routeData.tarjetas_recibidas}
                    </div>
                    <div>
                      <strong>Tarjetas Entregadas:</strong> {routeData.tarjetas_entregadas || 0}
                    </div>
                    <div>
                      <strong>Lentes No Entregados:</strong> {routeData.lentes_no_entregados || 0}
                    </div>
                    <div>
                      <strong>Tarjetas No Entregadas:</strong> {routeData.tarjetas_no_entregadas || 0}
                    </div>
                    <div>
                      <strong>Hora Inicio:</strong> {routeData.hora_inicio}
                    </div>
                    <div>
                      <strong>Hora Fin:</strong> {new Date().toTimeString().slice(0, 8)}
                    </div>
                  </div>
                </div>

                {(() => {
                  const remainingLentes = routeData.lentes_recibidos - (routeData.lentes_entregados || 0) - (routeData.lentes_no_entregados || 0);
                  const remainingTarjetas = routeData.tarjetas_recibidas - (routeData.tarjetas_entregadas || 0) - (routeData.tarjetas_no_entregadas || 0);

                  return (remainingLentes > 0 || remainingTarjetas > 0) ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-medium text-yellow-800 mb-4">Registrar Artículos No Entregados</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {remainingLentes > 0 && (
                          <button
                            onClick={registerUndeliveredLente}
                            className="flex items-center justify-center space-x-2 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                          >
                            <Package className="h-5 w-5" />
                            <span>Registrar Lente No Entregado</span>
                          </button>
                        )}
                        {remainingTarjetas > 0 && (
                          <button
                            onClick={registerUndeliveredPago}
                            className="flex items-center justify-center space-x-2 px-6 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                          >
                            <DollarSign className="h-5 w-5" />
                            <span>Registrar Pago No Entregado</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end pt-6 border-t border-gray-200">
                      <button
                        onClick={finalizeRoute}
                        disabled={loading}
                        className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>{loading ? 'Finalizando...' : 'Ruta Finalizada'}</span>
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RutaAsesor;