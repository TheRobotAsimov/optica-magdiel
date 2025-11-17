// Importaciones necesarias para el componente
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import ventaService from '../../service/ventaService';
import clientService from '../../service/clientService';
import lenteService from '../../service/lenteService';
import empleadoService from '../../service/empleadoService';
import precioService from '../../service/precioService';
import notificacionService from '../../service/notificacionService';
import NavComponent from '../common/NavBar';
import { Save, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { validateUnifiedForm, validateUnifiedField } from '../../utils/validations/index.js';
import Swal from 'sweetalert2';

// Componente principal para el formulario unificado de ventas
const UnifiedForm = () => {

  // Estado para almacenar todos los datos del formulario
  // Se especifican los valores que se muestran por default 
  // Incluye campos para venta, cliente y lente
  const [formData, setFormData] = useState({
    // Venta fields
    folio: '',
    idasesor: '',
    fecha: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10),
    tipo: 'Contado',
    enganche: '',
    total: '',
    observaciones: '',
    estatus: 'Pendiente',
    cant_pagos: '',
    imagen_contrato: '',
    imagen_cobranza: '',
    // Cliente fields
    nombre: '',
    paterno: '',
    materno: '',
    domicilio1: '',
    domicilio2: '',
    telefono1: '',
    telefono2: '',
    edad: '',
    sexo: '',
    // Lente fields
    sintomas: '',
    idoptometrista: '',
    uso_de_lente: '',
    examen_seguimiento: '',
    armazon: '',
    material: '',
    tratamiento: '',
    tinte_color: '',
    tono: '',
    desvanecido: 'No',
    tipo_de_lente: '',
    blend: 'No',
    subtipo: '',
    procesado: 'No',
    od_esf: '',
    od_cil: '',
    od_eje: '',
    od_add: '',
    od_av: '',
    oi_esf: '',
    oi_cil: '',
    oi_eje: '',
    oi_add: '',
    oi_av: '',
    fecha_entrega: '',
    kit: 'Sin kit',
  });
// Estado para manejar la graduacion optica separadamente
  const [graduacion, setGraduacion] = useState({
    od_esf_sign: '+',
    od_esf_val: '',
    od_cil_val: '',
    od_eje_val: '',
    od_add_val: '',
    od_av_1: '',
    od_av_2: '',
    oi_esf_sign: '+',
    oi_esf_val: '',
    oi_cil_val: '',
    oi_eje_val: '',
    oi_add_val: '',
    oi_av_1: '',
    oi_av_2: '',
  });
// Estados adicionales para opciones y datos dinamicos
  const [examenSeguimientoOption, setExamenSeguimientoOption] = useState('');
  const [asesores, setAsesores] = useState([]);
  const [optometristas, setOptometristas] = useState([]);
  const [priceCatalog, setPriceCatalog] = useState(null);
  const [additives, setAdditives] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isClientSelected, setIsClientSelected] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [priceIncreaseReason, setPriceIncreaseReason] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

// Efecto para pre-llenar el asesor si el usuario logueado es asesor
  useEffect(() => {
    if (user && user.rol === 'Asesor') {
      setFormData(prev => ({
        ...prev,
        idasesor: user.idempleado,
      }));
    }
  }, [user]);

// Lista de sintomas disponibles para seleccion
  const symptomsList = [
    'ARDOR', 'LAGRIMEO', 'IRRITACION', 'DOLOR', 'COMEZON', 'MOL. SOL.',
    'MOL. AIRE', 'ARENOZO', 'HIPERTENSION', 'DIABETES', 'GLAUCOMA', 'CATARATAS',
    'USO DISP. ELEC.', 'QUIRURGICOS', 'INFECCION', 'FOSFENOS', 'MIODESOPIAS', 'FOTOSENSIBLES'
  ];

  // Estado inicial para los sintomas, todos desmarcados
  const initialSymptomsState = symptomsList.reduce((acc, symptom) => {
    acc[symptom] = false;
    return acc;
  }, {});

  const [symptomsState, setSymptomsState] = useState(initialSymptomsState);

  // Funcion para manejar cambios en los sintomas
  const handleSymptomChange = (e) => {
    const { name, checked } = e.target;
    setSymptomsState(prev => ({ ...prev, [name]: checked }));
  };

// Valores debounced para busqueda de clientes
  const [debouncedNombre] = useDebounce(formData.nombre, 1000);
  const [debouncedPaterno] = useDebounce(formData.paterno, 500);

// Funcion para manejar cambios en la graduacion optica
  const handleGraduacionChange = (e) => {
    const { name, value } = e.target;

    setGraduacion(prev => {
      const newGrad = { ...prev, [name]: value };

      // Mirroring logic from OD to OI
      if (name.startsWith('od_')) {
        const oi_name = name.replace('od_', 'oi_');
        newGrad[oi_name] = value;
      }

      return newGrad;
    });
  };

// Efecto para sincronizar la graduacion con formData y determinar si es procesado
  useEffect(() => {
    const {
      od_esf_sign, od_esf_val, od_cil_val, od_eje_val, od_add_val, od_av_1, od_av_2,
      oi_esf_sign, oi_esf_val, oi_cil_val, oi_eje_val, oi_add_val, oi_av_1, oi_av_2
    } = graduacion;

    const newOdEsf = od_esf_val ? `${od_esf_sign}${od_esf_val}` : '';
    const newOdCil = od_cil_val ? `-${od_cil_val}` : '';
    const newOiEsf = oi_esf_val ? `${oi_esf_sign}${oi_esf_val}` : '';
    const newOiCil = oi_cil_val ? `-${oi_cil_val}` : '';

    const shouldBeProcesado =
      Math.abs(parseFloat(newOdEsf)) >= 5 ||
      Math.abs(parseFloat(newOdCil)) >= 5 ||
      Math.abs(parseFloat(newOiEsf)) >= 5 ||
      Math.abs(parseFloat(newOiCil)) >= 5;

    setFormData(prev => ({
      ...prev,
      od_esf: newOdEsf,
      od_cil: newOdCil,
      od_eje: od_eje_val,
      od_add: od_add_val ? `+${od_add_val}` : '',
      od_av: (od_av_1 || od_av_2) ? `${od_av_1}/${od_av_2}` : '',
      oi_esf: newOiEsf,
      oi_cil: newOiCil,
      oi_eje: oi_eje_val,
      oi_add: oi_add_val ? `+${oi_add_val}` : '',
      oi_av: (oi_av_1 || oi_av_2) ? `${oi_av_1}/${oi_av_2}` : '',
      procesado: shouldBeProcesado ? 'Si' : 'No',
    }));
  }, [graduacion]);

// Efecto para actualizar los sintomas seleccionados en formData
  useEffect(() => {
    const selectedSymptoms = Object.keys(symptomsState)
      .filter(symptom => symptomsState[symptom])
      .join(', ');

    setFormData(prev => ({
      ...prev,
      sintomas: selectedSymptoms
    }));
  }, [symptomsState]);

// Funcion para buscar clientes basado en nombre y apellido paterno
  useEffect(() => {
    const searchClients = async () => {
      // Solo buscar si hay algun criterio y no se ha seleccionado un cliente
      if ((debouncedNombre || debouncedPaterno) && !isClientSelected) {
        try {
          // Realizar la busqueda de clientes
          const results = await clientService.searchClients(debouncedNombre, debouncedPaterno);
          // Actualizar los resultados y mostrar sugerencias
          setSearchResults(results);
          setShowSuggestions(true);
        } catch (err) {
          // Manejar errores en la busqueda
          console.error("Error searching clients:", err);
          setSearchResults([]);
          setShowSuggestions(false);
        }
      } else {
        // Limpiar resultados si no hay criterios o ya se selecciono un cliente
        setSearchResults([]);
        setShowSuggestions(false);
      }
    };
    searchClients();
  }, [debouncedNombre, debouncedPaterno, isClientSelected]);

// Efecto para cargar datos iniciales: empleados y catalogo de precios
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [empleadosData, catalogData] = await Promise.all([
          empleadoService.getAllEmpleados(),
          precioService.getPriceCatalog(),
        ]);

        const asesoresList = empleadosData.filter(emp => emp.puesto === 'Asesor');
        const optometristasList = empleadosData.filter(emp => emp.puesto === 'Optometrista');

        setAsesores(asesoresList);
        setOptometristas(optometristasList);
        setPriceCatalog(catalogData.priceCatalog);
        setAdditives(catalogData.additives);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

// Efecto para calcular el total basado en las selecciones del lente
  useEffect(() => {
    // Si todos los datos necesarios estan disponibles, calcular el total
    if (priceCatalog && formData.material && formData.tipo_de_lente && formData.tratamiento) {
      let newTotal = 0;
      const material = priceCatalog[formData.material];
      if (material) {
        const tipoDeLente = material[formData.tipo_de_lente];
        if (tipoDeLente) {
          const tratamiento = tipoDeLente[formData.tratamiento];
          if (tratamiento) {
            newTotal += tratamiento.base;
            if (formData.procesado === 'Si') {
              newTotal += tratamiento.procesado;
            }
            if (formData.subtipo && tratamiento.subtipo) {
              newTotal += tratamiento.subtipo[formData.subtipo] || 0;
            }
            if (formData.blend === 'Si' && tratamiento.blend) {
              newTotal += tratamiento.blend;
            }
          }
        }
      }

      if (additives) {
        if (formData.kit === 'Completo') {
          newTotal += additives.kit;
        }
        if (formData.tinte_color) {
          newTotal += additives.tinte;
        }
      }

      setFormData((prev) => ({ ...prev, total: newTotal }));
    }
  }, [formData.material, formData.tipo_de_lente, formData.tratamiento, formData.subtipo, formData.procesado, formData.blend, formData.kit, formData.tinte_color, priceCatalog, additives]);

  useEffect(() => {
    const errors = validateUnifiedForm(formData);
    const hasErrors = Object.values(errors).some((err) => err);
    setIsFormValid(!hasErrors);
  }, [formData, fieldErrors]);

// Funcion principal para manejar cambios en los campos del formulario
   const handleChange = (e) => {
     const { name, value } = e.target;

     // Si el campo es examen de seguimiento, calcular la fecha automaticamente
     if (name === 'examenSeguimientoOption') {
       setExamenSeguimientoOption(value);
       if (value) {
         const baseDate = new Date(formData.fecha); // Usar la fecha |e la venta como base
         let newDate = new Date(baseDate);

         // Calcular la nueva fecha basada en la opcion seleccionada
         if (value === '6 months') {
           newDate.setMonth(newDate.getMonth() + 6);
         } else if (value === '1 year') {
           newDate.setFullYear(newDate.getFullYear() + 1);
         } else if (value === '2 years') {
           newDate.setFullYear(newDate.getFullYear() + 2);
         }

         // Formatear la fecha a YYYY-MM-DD
         const year = newDate.getFullYear();
         const month = String(newDate.getMonth() + 1).padStart(2, '0');
         const day = String(newDate.getDate()).padStart(2, '0');
         const formattedDate = `${year}-${month}-${day}`;

         setFormData((prev) => ({
           ...prev,
           examen_seguimiento: formattedDate,
         }));
       } else {
         setFormData((prev) => ({
           ...prev,
           examen_seguimiento: '',
         }));
       }
     } else {
       setFormData((prev) => {
         const newFormData = { ...prev, [name]: value };

         if (name === 'nombre' || name === 'paterno') {
           setSelectedClient(null);
           setIsClientSelected(false);
         }

         if (name === 'material') {
           newFormData.tratamiento = '';
           newFormData.tipo_de_lente = '';
           newFormData.subtipo = '';
         }

         if (name === 'tratamiento') {
           newFormData.tipo_de_lente = '';
           newFormData.subtipo = '';
         }

         if (name === 'tipo_de_lente') {
           newFormData.subtipo = '';
           if (value !== 'Bifocal') {
             newFormData.blend = 'No';
           }
         }

         return newFormData;
       });

       // Validación en tiempo real
       if (touched[name]) {
         const error = validateUnifiedField(name, value, formData);
         setFieldErrors(prev => ({ ...prev, [name]: error }));
       }
     }
   };

   const handleBlur = (e) => {
     const { name, value } = e.target;
     setTouched(prev => ({ ...prev, [name]: true }));

     const error = validateUnifiedField(name, value, formData);
     setFieldErrors(prev => ({ ...prev, [name]: error }));
   };

// Funcion para seleccionar un cliente de las sugerencias
  const handleSelectClient = (client) => {
    setFormData((prev) => ({
      ...prev,
      nombre: client.nombre,
      paterno: client.paterno,
      materno: client.materno || '',
      domicilio1: client.domicilio1 || '',
      domicilio2: client.domicilio2 || '',
      telefono1: client.telefono1 || '',
      telefono2: client.telefono2 || '',
      edad: client.edad || '',
      sexo: client.sexo || '',
    }));
    setSelectedClient(client);
    setIsClientSelected(true);
    setShowSuggestions(false);
    setSearchResults([]);
  };

// Funcion para limpiar la seleccion de cliente
  const handleClearClient = () => {
    setFormData((prev) => ({
      ...prev,
      nombre: '',
      paterno: '',
      materno: '',
      domicilio1: '',
      domicilio2: '',
      telefono1: '',
      telefono2: '',
      edad: '',
      sexo: '',
    }));
    setSelectedClient(null);
    setIsClientSelected(false);
  };

  // Funcion para manejar solicitud de aumento de precio
  const handlePriceIncreaseRequest = () => {
    Swal.fire({
      title: 'Solicitar aumento de precio',
      input: 'textarea',
      inputLabel: 'Motivo del aumento de precio',
      inputPlaceholder: 'Describe por qué necesitas aumentar el precio de esta venta...',
      inputValidator: (value) => {
        if (!value) {
          return 'Debes proporcionar un motivo';
        }
      },
      showCancelButton: true,
      confirmButtonText: 'Guardar solicitud',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        setPriceIncreaseReason(result.value);
        Swal.fire('Solicitud guardada', 'La solicitud de aumento de precio se enviará después de crear la venta.', 'success');
      }
    });
  };

// Funcion para manejar el envio del formulario
   const handleSubmit = async (e) => {
     e.preventDefault();

     // Validación completa del formulario
     const errors = validateUnifiedForm(formData);
     if (Object.keys(errors).length > 0) {
       setFieldErrors(errors);
       setError('Por favor corrige los errores en el formulario');
       return;
     }

     setLoading(true);
     try {
       let clientId;
       if (isClientSelected && selectedClient) {
         clientId = selectedClient.idcliente;
       } else {
         // 1. Crea Cliente
         const newClient = await clientService.createClient({
           nombre: formData.nombre,
           paterno: formData.paterno,
           materno: formData.materno,
           domicilio1: formData.domicilio1,
           domicilio2: formData.domicilio2,
           telefono1: formData.telefono1,
           telefono2: formData.telefono2,
           edad: formData.edad,
           sexo: formData.sexo,
           map_url: ''
         });
         clientId = newClient.id;
       }

       const finalTotal = formData.total;

       // 2. Crea Venta
       await ventaService.createVenta({
         folio: formData.folio,
         idasesor: parseInt(formData.idasesor),
         idcliente: clientId,
         fecha: formData.fecha,
         tipo: formData.tipo,
         enganche: parseFloat(formData.enganche) || 0,
         total: finalTotal,
         observaciones: formData.observaciones,
         estatus: formData.estatus,
         cant_pagos: parseInt(formData.cant_pagos) || 0,
         imagen_contrato: formData.imagen_contrato,
         imagen_cobranza: formData.imagen_cobranza,
       });


       // 3. Crea Lente
       await lenteService.createLente({
         idoptometrista: parseInt(formData.idoptometrista, 10),
         folio: formData.folio, // Usa el folio del formulario
         sintomas: formData.sintomas,
         uso_de_lente: formData.uso_de_lente,
         armazon: formData.armazon,
         material: formData.material,
         tratamiento: formData.tratamiento,
         tipo_de_lente: formData.tipo_de_lente,
         tinte_color: formData.tinte_color,
         tono: formData.tono === '' ? null : formData.tono,
         desvanecido: formData.desvanecido,
         blend: formData.blend,
         subtipo: formData.subtipo === '' ? null : formData.subtipo,
         procesado: formData.procesado,
         fecha_entrega: formData.fecha_entrega,
         examen_seguimiento: formData.examen_seguimiento,
         estatus: 'Pendiente',
         // Si el campo esta vacio, enviar null al backend, sino parsear el valor
         od_esf: formData.od_esf ? parseFloat(formData.od_esf) : null,
         od_cil: formData.od_cil ? parseFloat(formData.od_cil) : null,
         od_eje: formData.od_eje ? parseInt(formData.od_eje, 10) : null,
         od_add: formData.od_add ? parseFloat(formData.od_add) : null,
         od_av: formData.od_av,
         oi_esf: formData.oi_esf ? parseFloat(formData.oi_esf) : null,
         oi_cil: formData.oi_cil ? parseFloat(formData.oi_cil) : null,
         oi_eje: formData.oi_eje ? parseInt(formData.oi_eje, 10) : null,
         oi_add: formData.oi_add ? parseFloat(formData.oi_add) : null,
         oi_av: formData.oi_av,
         kit: formData.kit,
       });

       // Enviar notificación si hay una solicitud de aumento de precio pendiente
       if (priceIncreaseReason) {
         try {
           const mensaje = `Incremento de precio - Venta Folio: ${formData.folio}, Motivo: ${priceIncreaseReason} - Solicitado por: ${user.nombre} ${user.paterno} ${user.materno}`;
           await notificacionService.create(mensaje);
           console.log('Notificación de aumento de precio enviada');
         } catch (notificationError) {
           console.error('Error al enviar notificación de aumento de precio:', notificationError);
           // No fallar la creación de venta por error en notificación
         }
       }

       // Navigate back to ruta asesor if coming from there, otherwise to ventas
       const urlParams = new URLSearchParams(window.location.search);
       const fromRuta = urlParams.get('fromRuta');
       if (fromRuta) {
         navigate('/ruta-asesor');
       } else {
         navigate('/ventas');
       }
     } catch (err) {
       setError(err.message);
     } finally {
       setLoading(false);
     }
   };

// Renderizado condicional para estado de carga
  if (loading) {
  // Renderizado principal del componente
    return (
      <div className="min-h-screen bg-gray-50">
        <NavComponent />
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-gray-600">Cargando...</div>
          </div>
        </div>
      </div>
    );
  }

// Renderizado condicional para estado de error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavComponent />
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-blue-700">NUEVA VENTA</h1>
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
{/* Inicio del formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Seccion de informacion de la venta */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información de la Venta</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Folio *</label>
                    <input type="text" name="folio" value={formData.folio} onChange={handleChange} onBlur={handleBlur} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Asesor *</label>
                    <select name="idasesor" value={formData.idasesor} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={user?.rol === 'Asesor'}>
                      <option value="">Seleccionar Asesor</option>
                      {asesores.map(asesor => (
                        <option key={asesor.idempleado} value={asesor.idempleado}>{asesor.nombre} {asesor.paterno}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
                    <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              </div>

{/* Seccion de informacion del cliente*/}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Información del Cliente</h3>
                  {isClientSelected && (
                    <button type="button" onClick={handleClearClient} className="px-2 py-1 bg-red-500 text-white rounded-3xl text-sm">Limpiar</button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                      <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isClientSelected} />
                      
                    
                    {showSuggestions && searchResults.length > 0 && (
                      <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-auto shadow-lg">
                        {searchResults.map((client) => (
                          <li key={client.idcliente} onClick={() => handleSelectClient(client)} className="px-3 py-2 cursor-pointer hover:bg-gray-100">
                            {client.nombre} {client.paterno} {client.materno}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apellido Paterno *</label>
                    <input type="text" name="paterno" value={formData.paterno} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isClientSelected} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apellido Materno</label>
                    <input type="text" name="materno" value={formData.materno} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isClientSelected} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Edad</label>
                    <input type="number" name="edad" value={formData.edad} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isClientSelected} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sexo</label>
                    <select name="sexo" value={formData.sexo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isClientSelected}>
                      <option value="">Seleccionar</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                  </div>
                  {/* Limpiar button moved to header */}
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Domicilio 1 *</label>
                    <textarea name="domicilio1" value={formData.domicilio1} onChange={handleChange} required rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isClientSelected}></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Domicilio 2</label>
                    <input type="text" name="domicilio2" value={formData.domicilio2} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isClientSelected} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono 1 *</label>
                    <input type="tel" name="telefono1" value={formData.telefono1} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isClientSelected} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono 2</label>
                    <input type="tel" name="telefono2" value={formData.telefono2} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isClientSelected} />
                  </div>
                </div>
              </div>

              {/* Seccion de informacion del lente*/}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Lente</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Síntomas</label>
                    <div className="grid grid-cols-3 gap-x-4 gap-y-2 p-2 border border-gray-200 rounded-lg">
                      {symptomsList.map(symptom => (
                        <label key={symptom} className="flex items-center space-x-2 text-xs font-medium text-gray-600">
                          <input
                            type="checkbox"
                            name={symptom}
                            checked={symptomsState[symptom]}
                            onChange={handleSymptomChange}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span>{symptom}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Uso de Lente *</label>
                    <input type="text" name="uso_de_lente" value={formData.uso_de_lente} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Optometrista *</label>
                    <select name="idoptometrista" value={formData.idoptometrista} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="">Seleccionar Optometrista</option>
                      {optometristas.map(optometrista => (
                        <option key={optometrista.idempleado} value={optometrista.idempleado}>{optometrista.nombre} {optometrista.paterno}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Examen de Seguimiento</label>
                    <select name="examenSeguimientoOption" value={examenSeguimientoOption} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="">Seleccionar</option>
                      <option value="6 months">6 meses</option>
                      <option value="1 year">1 año</option>
                      <option value="2 years">2 años</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Armazón *</label>
                    <input type="text" name="armazon" value={formData.armazon} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kit</label>
                    <select name="kit" value={formData.kit} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="Sin kit">Sin kit</option>
                        <option value="Completo">Completo</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:col-span-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Material *</label>
                      <select name="material" value={formData.material} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="">Seleccione</option>
                        <option value="CR-39">CR-39</option>
                        <option value="BLUERAY">BLUERAY</option>
                      </select>
                    </div>
                    {formData.material && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tratamiento *</label>
                        <select name="tratamiento" value={formData.tratamiento} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                          <option value="">Seleccione</option>
                          <option value="AR">AR</option>
                          <option value="Photo AR">Photo AR</option>
                        </select>
                      </div>
                    )}
                    {formData.tratamiento && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Lente *</label>
                        <select name="tipo_de_lente" value={formData.tipo_de_lente} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                          <option value="">Seleccione</option>
                          <option value="Monofocal">Monofocal</option>
                          <option value="Bifocal">Bifocal</option>
                          <option value="Progresivo">Progresivo</option>
                        </select>
                      </div>
                    )}
                    {formData.tipo_de_lente && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subtipo</label>
                        <select name="subtipo" value={formData.subtipo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                          <option value="">Ninguno</option>
                          <option value="Policarbonato">Policarbonato</option>
                          <option value="Haid index">Haid index</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-3">
                    <div>                                                                                   
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tinte Color</label>
                      <input type="text" name="tinte_color" value={formData.tinte_color} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    {formData.tinte_color && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Tono</label>
                          <select name="tono" value={formData.tono} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="">No</option>
                            <option value="Claro">Claro</option>
                            <option value="Intermedio">Intermedio</option>
                            <option value="Oscuro">Oscuro</option>
                          </select>
                        </div>
                      )}
                      {formData.tono && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Desvanecido</label>
                          <select name="desvanecido" value={formData.desvanecido} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                              <option value="No">No</option>
                              <option value="Si">Si</option>
                          </select>
                        </div>
                      )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Procesado</label>
                    <select name="procesado" value={formData.procesado} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled>
                        <option value="No">No</option>
                        <option value="Si">Si</option>
                    </select>
                  </div>
                  {formData.tipo_de_lente === 'Bifocal' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Blend</label>
                      <select name="blend" value={formData.blend} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="No">No</option>
                        <option value="Si">Si</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

{/*// Seccion de graduacion optica*/}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Graduación</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  <div className="md:col-span-5 font-bold">Ojo Derecho (OD)</div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ESF</label>
                    <div className="flex items-center">
                      <select name="od_esf_sign" value={graduacion.od_esf_sign} onChange={handleGraduacionChange} className="px-2 py-2 border border-gray-300 rounded-l-lg bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                        <option value="+">+</option>
                        <option value="-">-</option>
                      </select>
                      <input type="number" step="0.25" name="od_esf_val" value={graduacion.od_esf_val} onChange={handleGraduacionChange} className="w-full px-3 py-2 border-t border-b border-r border-gray-300 rounded-r-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CIL</label>
                    <div className="flex items-center">
                      <span className="px-3 py-2 border-l border-t border-b border-gray-300 rounded-l-lg bg-gray-100">-</span>
                      <input type="number" step="0.25" name="od_cil_val" value={graduacion.od_cil_val} onChange={handleGraduacionChange} className="w-full px-3 py-2 border-t border-b border-r border-gray-300 rounded-r-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">EJE</label>
                    <div className="flex items-center">
                      <input type="number" name="od_eje_val" value={graduacion.od_eje_val} onChange={handleGraduacionChange} className="w-full px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                      <span className="px-3 py-2 border-r border-t border-b border-gray-300 rounded-r-lg bg-gray-100">°</span>
                    </div>
                  </div>
                  {(formData.tipo_de_lente === 'Bifocal' || formData.tipo_de_lente === 'Progresivo') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ADD</label>
                      <div className="flex items-center">
                        <span className="px-3 py-2 border-l border-t border-b border-gray-300 rounded-l-lg bg-gray-100">+</span>
                        <input type="number" step="0.25" name="od_add_val" value={graduacion.od_add_val} onChange={handleGraduacionChange} className="w-full px-3 py-2 border-t border-b border-r border-gray-300 rounded-r-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">AV</label>
                    <div className="flex items-center">
                      <input type="text" name="od_av_1" value={graduacion.od_av_1} onChange={handleGraduacionChange} className="w-full px-3 py-2 border border-gray-300 rounded-l-lg text-center focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                      <span className="px-2 py-2 border-t border-b border-gray-300 bg-gray-100">/</span>
                      <input type="text" name="od_av_2" value={graduacion.od_av_2} onChange={handleGraduacionChange} className="w-full px-3 py-2 border border-gray-300 rounded-r-lg text-center focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>

                  <div className="md:col-span-5 font-bold">Ojo Izquierdo (OI)</div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ESF</label>
                    <div className="flex items-center">
                      <select name="oi_esf_sign" value={graduacion.oi_esf_sign} onChange={handleGraduacionChange} className="px-2 py-2 border border-gray-300 rounded-l-lg bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                        <option value="+">+</option>
                        <option value="-">-</option>
                      </select>
                      <input type="number" step="0.25" name="oi_esf_val" value={graduacion.oi_esf_val} onChange={handleGraduacionChange} className="w-full px-3 py-2 border-t border-b border-r border-gray-300 rounded-r-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CIL</label>
                    <div className="flex items-center">
                      <span className="px-3 py-2 border-l border-t border-b border-gray-300 rounded-l-lg bg-gray-100">-</span>
                      <input type="number" step="0.25" name="oi_cil_val" value={graduacion.oi_cil_val} onChange={handleGraduacionChange} className="w-full px-3 py-2 border-t border-b border-r border-gray-300 rounded-r-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">EJE</label>
                    <div className="flex items-center">
                      <input type="number" name="oi_eje_val" value={graduacion.oi_eje_val} onChange={handleGraduacionChange} className="w-full px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                      <span className="px-3 py-2 border-r border-t border-b border-gray-300 rounded-r-lg bg-gray-100">°</span>
                    </div>
                  </div>
                  {(formData.tipo_de_lente === 'Bifocal' || formData.tipo_de_lente === 'Progresivo') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ADD</label>
                      <div className="flex items-center">
                        <span className="px-3 py-2 border-l border-t border-b border-gray-300 rounded-l-lg bg-gray-100">+</span>
                        <input type="number" step="0.25" name="oi_add_val" value={graduacion.oi_add_val} onChange={handleGraduacionChange} className="w-full px-3 py-2 border-t border-b border-r border-gray-300 rounded-r-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">AV</label>
                    <div className="flex items-center">
                      <input type="text" name="oi_av_1" value={graduacion.oi_av_1} onChange={handleGraduacionChange} className="w-full px-3 py-2 border border-gray-300 rounded-l-lg text-center focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                      <span className="px-2 py-2 border-t border-b border-gray-300 bg-gray-100">/</span>
                      <input type="text" name="oi_av_2" value={graduacion.oi_av_2} onChange={handleGraduacionChange} className="w-full px-3 py-2 border border-gray-300 rounded-r-lg text-center focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                </div>
              </div>

{/*// Seccion de detalles finales de la venta*/}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Detalles Finales de la Venta</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Pago *</label>
                    <select name="tipo" value={formData.tipo} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="Contado">Contado</option>
                      <option value="Credito">Crédito</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total *</label>
                    <input
                      type="number"
                      name="total"
                      value={formData.total}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Enganche</label>
                    <input type="number" name="enganche" value={formData.enganche} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Entrega *</label>
                    <input type="date" name="fecha_entrega" value={formData.fecha_entrega} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-7"></label>
                    <button
                      type="button"
                      onClick={handlePriceIncreaseRequest}
                      className={`w-full px-3 py-2 rounded-lg font-medium transition-colors ${
                        priceIncreaseReason
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                      }`}
                    >
                      {priceIncreaseReason ? '✅ Solicitud guardada' : 'Solicitar aumento de precio'}
                    </button>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                    <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
                  </div>
                </div>
              </div>

{/*// Botones de accion*/}
               <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
                   <button type="submit" disabled={!isFormValid || loading} className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors">
                   <Save className="h-4 w-4" />
                   <span>{loading ? 'Guardando...' : 'Crear Venta'}</span>
                 </button>
               </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedForm;
