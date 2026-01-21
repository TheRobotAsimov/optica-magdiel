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
import Loading from '../common/Loading';
import Error from '../common/Error';
import pacienteService from '../../service/pacienteService'; // <--- IMPORTAR ESTO
import { Save, ArrowLeft, ShoppingCart, User, Eye, Glasses, Users } from 'lucide-react';
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
    institucion: '',
    tipo: 'Contado',
    inapam: 'No',
    factura: 'No',
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
    // --- NUEVOS CAMPOS PACIENTE ---
    paciente_nombre: '',
    paciente_paterno: '',
    paciente_materno: '',
    paciente_edad: '',
    paciente_sexo: '',
    paciente_parentesco: '',
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
  const [clientPatients, setClientPatients] = useState([]); // Lista de pacientes del cliente
  const [isPatientSelected, setIsPatientSelected] = useState(false); // Para saber si es edición o lectura

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
      Math.abs(parseFloat(newOiCil)) >= 5 ||
      (od_cil_val && od_eje_val) ||
      (oi_cil_val && oi_eje_val) ||
      (od_cil_val && oi_eje_val) ||
      (oi_cil_val && od_eje_val);

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
        const [empleadosRes, catalogData] = await Promise.all([
          empleadoService.getAllEmpleados({ limit: 1000 }),
          precioService.getPriceCatalog(),
        ]);

        const allEmpleados = empleadosRes.items || [];
        const asesoresList = allEmpleados.filter(emp => emp.puesto === 'Asesor');
        const optometristasList = allEmpleados.filter(emp => emp.puesto === 'Optometrista');

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

      // Agregar monto del armazón
      newTotal += parseFloat(formData.armazon_monto) || 0;

      // Aplicar descuento INAPAM si está activado
      if (formData.inapam === 'Si' && additives && additives.inapam_discount) {
        newTotal = newTotal * (1 - additives.inapam_discount / 100);
      }

      // Aplicar IVA si factura está activado
      if (formData.factura === 'Si') {
        newTotal = newTotal * 1.16;
      }

      setFormData((prev) => ({ ...prev, total: parseFloat(newTotal.toFixed(2)) }));
    }
  }, [formData.material, formData.tipo_de_lente, formData.tratamiento, formData.subtipo, formData.procesado, formData.blend, formData.kit, formData.tinte_color, formData.inapam, formData.factura, formData.armazon_monto, priceCatalog, additives]);

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

    let errorField = name;
    if (name.includes('_val') || name.includes('_sign') || name.includes('_1') || name.includes('_2')) {
      errorField = name.replace(/_val|_sign|_1|_2/, '');
    }

    setFieldErrors(prev => ({ ...prev, [errorField]: error }));
  };

  // Modificar handleSelectClient para buscar pacientes
  const handleSelectClient = async (client) => { // Hacer async
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

    // --- NUEVO: Cargar pacientes asociados al cliente ---
    try {
      const pacientes = await pacienteService.getPacientesByCliente(client.idcliente);
      setClientPatients(pacientes);
    } catch (error) {
      console.error("Error cargando pacientes", error);
      setClientPatients([]);
    }
    // --------------------------------------------------
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
      paciente_nombre: '',
      paciente_paterno: '',
      paciente_materno: '',
      paciente_edad: '',
      paciente_sexo: '',
      paciente_parentesco: '',
    }));
    setSelectedClient(null);
    setIsClientSelected(false);
    setClientPatients([]); // Limpiar lista de pacientes
    setIsPatientSelected(false);
  };

  // --- NUEVA FUNCION: Manejar selección de paciente existente ---
  const handleSelectPatient = (e) => {
    const idPaciente = e.target.value;

    if (idPaciente === "new") {
      // Modo crear nuevo paciente
      setFormData(prev => ({
        ...prev,
        paciente_nombre: '',
        paciente_paterno: '',
        paciente_materno: '',
        paciente_edad: '',
        paciente_sexo: '',
        paciente_parentesco: '',
      }));
      setIsPatientSelected(false);
    } else {
      // Modo paciente existente
      const paciente = clientPatients.find(p => p.idpaciente.toString() === idPaciente);
      if (paciente) {
        setFormData(prev => ({
          ...prev,
          paciente_nombre: paciente.nombre,
          paciente_paterno: paciente.paterno,
          paciente_materno: paciente.materno || '',
          paciente_edad: paciente.edad,
          paciente_sexo: paciente.sexo,
          paciente_parentesco: paciente.parentesco || '',
        }));
        setIsPatientSelected(true);
      }
    }
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

      // --- NUEVO: Crear Paciente si no se seleccionó uno existente ---
      // Solo creamos si se llenaron al menos nombre y paterno del paciente
      if (!isPatientSelected && formData.paciente_nombre && formData.paciente_paterno) {
        await pacienteService.createPaciente({
          idcliente: clientId,
          nombre: formData.paciente_nombre,
          paterno: formData.paciente_paterno,
          materno: formData.paciente_materno,
          edad: formData.paciente_edad,
          sexo: formData.paciente_sexo,
          parentesco: formData.paciente_parentesco
        });
      }
      // ---------------------------------------------------------------

      const finalTotal = formData.total;

      // 2. Crea Venta
      await ventaService.createVenta({
        folio: formData.folio,
        idasesor: parseInt(formData.idasesor),
        idcliente: clientId,
        fecha: formData.fecha,
        institucion: formData.institucion,
        tipo: formData.tipo,
        inapam: formData.inapam,
        enganche: parseFloat(formData.enganche) || 0,
        total: finalTotal,
        pagado: parseFloat(formData.enganche) || 0,
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
    return <Loading />;
  }

  // Renderizado condicional para estado de error
  if (error) {
    return <Error message={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Card */}
        <div className="bg-white rounded-4xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <ShoppingCart className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Contrato de Venta
                  </h1>
                  <p className="text-blue-100 text-sm mt-1">
                    Completa el formulario para registrar una nueva venta
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-6 py-6">
            {/* Inicio del formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sales Information Section */}
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">

                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <ShoppingCart className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Información de Venta</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Folio
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input type="text" name="folio" value={formData.folio} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.folio
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        }`} />
                      {fieldErrors.folio && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.folio}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Asesor
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select name="idasesor" value={formData.idasesor} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.idasesor
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        }`} disabled={user?.rol === 'Asesor'}>
                        <option value="">Seleccionar Asesor</option>
                        {asesores.map(asesor => (
                          <option key={asesor.idempleado} value={asesor.idempleado}>{asesor.nombre} {asesor.paterno}</option>
                        ))}
                      </select>
                      {fieldErrors.idasesor && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.idasesor}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Fecha
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.fecha
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        }`} />
                      {fieldErrors.fecha && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.fecha}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2">
                        Institución
                      </label>
                      <input type="text" name="institucion" value={formData.institucion} onChange={handleChange} onBlur={handleBlur} className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.institucion
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        }`} />
                      {fieldErrors.institucion && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.institucion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Seccion de informacion del cliente*/}
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">

                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Información del Cliente</h3>
                    {isClientSelected && (
                      <button type="button" onClick={handleClearClient} className="px-2 py-1 bg-red-500 text-white rounded-3xl text-sm">Limpiar</button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                      <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${fieldErrors.nombre ? 'border-red-500 bg-red-50' : ''}`} disabled={isClientSelected} />
                      {fieldErrors.nombre && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.nombre}
                        </p>
                      )}


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
                      <input type="text" name="paterno" value={formData.paterno} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${fieldErrors.paterno ? 'border-red-500 bg-red-50' : ''}`} disabled={isClientSelected} />
                      {fieldErrors.paterno && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.paterno}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Apellido Materno</label>
                      <input type="text" name="materno" value={formData.materno} onChange={handleChange} onBlur={handleBlur} className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${fieldErrors.materno ? 'border-red-500 bg-red-50' : ''}`} disabled={isClientSelected} />
                      {fieldErrors.materno && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.materno}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Edad</label>
                      <input type="number" name="edad" value={formData.edad} onChange={handleChange} onBlur={handleBlur} className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${fieldErrors.edad ? 'border-red-500 bg-red-50' : ''}`} disabled={isClientSelected} />
                      {fieldErrors.edad && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.edad}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sexo</label>
                      <select name="sexo" value={formData.sexo} onChange={handleChange} onBlur={handleBlur} className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${fieldErrors.sexo ? 'border-red-500 bg-red-50' : ''}`} disabled={isClientSelected}>
                        <option value="">Seleccionar</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                      </select>
                      {fieldErrors.sexo && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.sexo}
                        </p>
                      )}
                    </div>
                    {/* Limpiar button moved to header */}
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Domicilio 1 *</label>
                      <textarea name="domicilio1" value={formData.domicilio1} onChange={handleChange} onBlur={handleBlur} required rows="3" className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${fieldErrors.domicilio1 ? 'border-red-500 bg-red-50' : ''}`} disabled={isClientSelected}></textarea>
                      {fieldErrors.domicilio1 && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.domicilio1}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Domicilio 2</label>
                      <input type="text" name="domicilio2" value={formData.domicilio2} onChange={handleChange} onBlur={handleBlur} className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${fieldErrors.domicilio2 ? 'border-red-500 bg-red-50' : ''}`} disabled={isClientSelected} />
                      {fieldErrors.domicilio2 && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.domicilio2}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono 1 *</label>
                      <input type="tel" name="telefono1" value={formData.telefono1} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${fieldErrors.telefono1 ? 'border-red-500 bg-red-50' : ''}`} disabled={isClientSelected} />
                      {fieldErrors.telefono1 && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.telefono1}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono 2</label>
                      <input type="tel" name="telefono2" value={formData.telefono2} onChange={handleChange} onBlur={handleBlur} className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${fieldErrors.telefono2 ? 'border-red-500 bg-red-50' : ''}`} disabled={isClientSelected} />
                      {fieldErrors.telefono2 && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.telefono2}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Seccion de informacion del Paciente */}
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-teal-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-8 border border-green-100">

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-600 p-2 rounded-lg">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Información del Paciente</h3>
                    </div>

                    {/* Selector de pacientes existentes (Solo visible si hay cliente seleccionado) */}
                    {isClientSelected && (
                      <div className="w-64">
                        <select
                          className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm"
                          onChange={handleSelectPatient}
                          defaultValue="new"
                        >
                          <option value="new">+ Nuevo Paciente</option>
                          {clientPatients.length > 0 && <option disabled>──────────</option>}
                          {clientPatients.map(p => (
                            <option key={p.idpaciente} value={p.idpaciente}>
                              {p.nombre} {p.paterno} ({p.parentesco})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                      <input
                        type="text"
                        name="paciente_nombre"
                        value={formData.paciente_nombre}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${isPatientSelected ? 'bg-gray-100' : 'bg-white'}`}
                        disabled={isPatientSelected}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Apellido Paterno</label>
                      <input
                        type="text"
                        name="paciente_paterno"
                        value={formData.paciente_paterno}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${isPatientSelected ? 'bg-gray-100' : 'bg-white'}`}
                        disabled={isPatientSelected}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Apellido Materno</label>
                      <input
                        type="text"
                        name="paciente_materno"
                        value={formData.paciente_materno}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${isPatientSelected ? 'bg-gray-100' : 'bg-white'}`}
                        disabled={isPatientSelected}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Edad</label>
                      <input
                        type="number"
                        name="paciente_edad"
                        value={formData.paciente_edad}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${isPatientSelected ? 'bg-gray-100' : 'bg-white'}`}
                        disabled={isPatientSelected}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sexo</label>
                      <select
                        name="paciente_sexo"
                        value={formData.paciente_sexo}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${isPatientSelected ? 'bg-gray-100' : 'bg-white'}`}
                        disabled={isPatientSelected}
                      >
                        <option value="">Seleccionar</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Parentesco</label>
                      <input
                        type="text"
                        name="paciente_parentesco"
                        value={formData.paciente_parentesco}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Ej. Hijo, Sobrino, Primo"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${isPatientSelected ? 'bg-gray-100' : 'bg-white'}`}
                        disabled={isPatientSelected}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seccion de informacion del lente*/}
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">

                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <Glasses className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Información de Lente</h3>
                  </div>

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
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Uso de Lente
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input type="text" name="uso_de_lente" value={formData.uso_de_lente} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.uso_de_lente
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        }`} />
                      {fieldErrors.uso_de_lente && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.uso_de_lente}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Optometrista
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select name="idoptometrista" value={formData.idoptometrista} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.idoptometrista
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        }`}>
                        <option value="">Seleccionar Optometrista</option>
                        {optometristas.map(optometrista => (
                          <option key={optometrista.idempleado} value={optometrista.idempleado}>{optometrista.nombre} {optometrista.paterno}</option>
                        ))}
                      </select>
                      {fieldErrors.idoptometrista && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.idoptometrista}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2">
                        Examen de Seguimiento
                      </label>
                      <select name="examenSeguimientoOption" value={examenSeguimientoOption} onChange={handleChange} onBlur={handleBlur} className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.examenSeguimientoOption
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        }`}>
                        <option value="">Seleccionar</option>
                        <option value="6 months">6 meses</option>
                        <option value="1 year">1 año</option>
                        <option value="2 years">2 años</option>
                      </select>
                      {fieldErrors.examenSeguimientoOption && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.examenSeguimientoOption}
                        </p>
                      )}
                    </div>
                    <div className="group md:col-span-2">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Armazón
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="flex gap-4">
                        <select name="armazon" value={formData.armazon} onChange={handleChange} onBlur={handleBlur} required className={`flex-1 px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.armazon
                            ? 'border-red-500 focus:ring-red-100 bg-red-50'
                            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                          }`}>
                          <option value="">Seleccionar</option>
                          <option value="Básico">Básico</option>
                          <option value="Línea">Línea</option>
                          <option value="Marca">Marca</option>
                        </select>
                        <input type="number" name="armazon_monto" value={formData.armazon_monto} onChange={handleChange} onBlur={handleBlur} placeholder="Monto" className={`w-32 px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.armazon_monto
                            ? 'border-red-500 focus:ring-red-100 bg-red-50'
                            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                          }`} />
                      </div>
                      {fieldErrors.armazon && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.armazon}
                        </p>
                      )}
                      {fieldErrors.armazon_monto && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.armazon_monto}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2">
                        Kit
                      </label>
                      <select name="kit" value={formData.kit} onChange={handleChange} onBlur={handleBlur} className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.kit
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        }`}>
                        <option value="Sin kit">Sin kit</option>
                        <option value="Completo">Completo</option>
                      </select>
                      {fieldErrors.kit && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.kit}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:col-span-3">
                      <div className="group">
                        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          Material
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select name="material" value={formData.material} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.material
                            ? 'border-red-500 focus:ring-red-100 bg-red-50'
                            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                          }`}>
                          <option value="">Seleccione</option>
                          <option value="CR-39">CR-39</option>
                          <option value="BLUERAY">BLUERAY</option>
                        </select>
                        {fieldErrors.material && (
                          <p className="text-red-600 text-sm mt-2 flex items-center">
                            <span className="mr-1">⚠</span> {fieldErrors.material}
                          </p>
                        )}
                      </div>
                      {formData.material && (
                        <div className="group">
                          <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            Tratamiento
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <select name="tratamiento" value={formData.tratamiento} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.tratamiento
                              ? 'border-red-500 focus:ring-red-100 bg-red-50'
                              : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                            }`}>
                            <option value="">Seleccione</option>
                            <option value="AR">AR</option>
                            <option value="Photo AR">Photo AR</option>
                          </select>
                          {fieldErrors.tratamiento && (
                            <p className="text-red-600 text-sm mt-2 flex items-center">
                              <span className="mr-1">⚠</span> {fieldErrors.tratamiento}
                            </p>
                          )}
                        </div>
                      )}
                      {formData.tratamiento && (
                        <div className="group">
                          <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            Tipo de Lente
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <select name="tipo_de_lente" value={formData.tipo_de_lente} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.tipo_de_lente
                              ? 'border-red-500 focus:ring-red-100 bg-red-50'
                              : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                            }`}>
                            <option value="">Seleccione</option>
                            <option value="Monofocal">Monofocal</option>
                            <option value="Bifocal">Bifocal</option>
                            <option value="Progresivo">Progresivo</option>
                          </select>
                          {fieldErrors.tipo_de_lente && (
                            <p className="text-red-600 text-sm mt-2 flex items-center">
                              <span className="mr-1">⚠</span> {fieldErrors.tipo_de_lente}
                            </p>
                          )}
                        </div>
                      )}
                      {formData.tipo_de_lente && (
                        <div className="group">
                          <label className="text-sm font-semibold text-gray-700 mb-2">
                            Subtipo
                          </label>
                          <select name="subtipo" value={formData.subtipo} onChange={handleChange} onBlur={handleBlur} className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.subtipo
                              ? 'border-red-500 focus:ring-red-100 bg-red-50'
                              : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                            }`}>
                            <option value="">Ninguno</option>
                            <option value="Policarbonato">Policarbonato</option>
                            <option value="Haid index">Haid index</option>
                          </select>
                          {fieldErrors.subtipo && (
                            <p className="text-red-600 text-sm mt-2 flex items-center">
                              <span className="mr-1">⚠</span> {fieldErrors.subtipo}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-3">
                      <div className="group">
                        <label className="text-sm font-semibold text-gray-700 mb-2">
                          Tinte Color
                        </label>
                        <input type="text" name="tinte_color" value={formData.tinte_color} onChange={handleChange} onBlur={handleBlur} className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.tinte_color
                            ? 'border-red-500 focus:ring-red-100 bg-red-50'
                            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                          }`} />
                        {fieldErrors.tinte_color && (
                          <p className="text-red-600 text-sm mt-2 flex items-center">
                            <span className="mr-1">⚠</span> {fieldErrors.tinte_color}
                          </p>
                        )}
                      </div>
                      {formData.tinte_color && (
                        <div className="group">
                          <label className="text-sm font-semibold text-gray-700 mb-2">
                            Tono
                          </label>
                          <select name="tono" value={formData.tono} onChange={handleChange} onBlur={handleBlur} className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.tono
                              ? 'border-red-500 focus:ring-red-100 bg-red-50'
                              : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                            }`}>
                            <option value="">No</option>
                            <option value="Claro">Claro</option>
                            <option value="Intermedio">Intermedio</option>
                            <option value="Oscuro">Oscuro</option>
                          </select>
                          {fieldErrors.tono && (
                            <p className="text-red-600 text-sm mt-2 flex items-center">
                              <span className="mr-1">⚠</span> {fieldErrors.tono}
                            </p>
                          )}
                        </div>
                      )}
                      {formData.tono && (
                        <div className="group">
                          <label className="text-sm font-semibold text-gray-700 mb-2">
                            Desvanecido
                          </label>
                          <select name="desvanecido" value={formData.desvanecido} onChange={handleChange} onBlur={handleBlur} className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.desvanecido
                              ? 'border-red-500 focus:ring-red-100 bg-red-50'
                              : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                            }`}>
                            <option value="No">No</option>
                            <option value="Si">Si</option>
                          </select>
                          {fieldErrors.desvanecido && (
                            <p className="text-red-600 text-sm mt-2 flex items-center">
                              <span className="mr-1">⚠</span> {fieldErrors.desvanecido}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2">
                        Procesado
                      </label>
                      <select name="procesado" value={formData.procesado} onChange={handleChange} onBlur={handleBlur} className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 bg-gray-100 ${fieldErrors.procesado
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        }`} disabled>
                        <option value="No">No</option>
                        <option value="Si">Si</option>
                      </select>
                      {fieldErrors.procesado && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.procesado}
                        </p>
                      )}
                    </div>
                    {formData.tipo_de_lente === 'Bifocal' && (
                      <div className="group">
                        <label className="text-sm font-semibold text-gray-700 mb-2">
                          Blend
                        </label>
                        <select name="blend" value={formData.blend} onChange={handleChange} onBlur={handleBlur} className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.blend
                            ? 'border-red-500 focus:ring-red-100 bg-red-50'
                            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                          }`}>
                          <option value="No">No</option>
                          <option value="Si">Si</option>
                        </select>
                        {fieldErrors.blend && (
                          <p className="text-red-600 text-sm mt-2 flex items-center">
                            <span className="mr-1">⚠</span> {fieldErrors.blend}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/*// Seccion de graduacion optica*/}
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">

                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Graduación</h3>
                  </div>

                  <div className="space-y-6">
                    {/* Right Eye (OD) */}
                    <div className="bg-white rounded-xl p-5 border border-indigo-200 shadow-sm">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="bg-indigo-100 p-1.5 rounded-lg">
                          <Eye className="h-4 w-4 text-indigo-600" />
                        </div>
                        <span className="font-bold text-gray-900">Ojo Derecho (OD)</span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {/* ESF */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">ESF</label>
                          <div className="flex">
                            <select
                              name="od_esf_sign"
                              value={graduacion.od_esf_sign}
                              onChange={handleGraduacionChange}
                              onBlur={handleBlur}
                              className={`px-2 py-2.5 border-2 rounded-l-lg bg-gray-50 focus:outline-none focus:ring-2 transition-colors ${fieldErrors.od_esf ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-500'
                                }`}
                            >
                              <option value="+">+</option>
                              <option value="-">-</option>
                            </select>
                            <input
                              type="number"
                              step="0.25"
                              name="od_esf_val"
                              value={graduacion.od_esf_val}
                              onChange={handleGraduacionChange}
                              onBlur={handleBlur}
                              className={`w-full px-3 py-2.5 border-2 border-l-0 rounded-r-lg focus:outline-none focus:ring-2 transition-colors ${fieldErrors.od_esf ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-500'
                                }`}
                            />
                          </div>
                          {fieldErrors.od_esf && <p className="mt-1 text-xs text-red-600">{fieldErrors.od_esf}</p>}
                        </div>

                        {/* CIL */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">CIL</label>
                          <div className="flex">
                            <span className={`px-3 py-2.5 border-2 rounded-l-lg bg-gray-50 text-gray-600 font-medium ${fieldErrors.od_cil ? 'border-red-500' : 'border-gray-200'
                              }`}>-</span>
                            <input
                              type="number"
                              step="0.25"
                              name="od_cil_val"
                              value={graduacion.od_cil_val}
                              onChange={handleGraduacionChange}
                              onBlur={handleBlur}
                              className={`w-full px-3 py-2.5 border-2 border-l-0 rounded-r-lg focus:outline-none focus:ring-2 transition-colors ${fieldErrors.od_cil ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-500'
                                }`}
                            />
                          </div>
                          {fieldErrors.od_cil && <p className="mt-1 text-xs text-red-600">{fieldErrors.od_cil}</p>}
                        </div>

                        {/* EJE */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">EJE</label>
                          <div className="flex">
                            <input
                              type="number"
                              name="od_eje_val"
                              value={graduacion.od_eje_val}
                              onChange={handleGraduacionChange}
                              onBlur={handleBlur}
                              className={`w-full px-3 py-2.5 border-2 rounded-l-lg focus:outline-none focus:ring-2 transition-colors ${fieldErrors.od_eje ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-500'
                                }`}
                            />
                            <span className={`px-3 py-2.5 border-2 border-l-0 rounded-r-lg bg-gray-50 text-gray-600 font-medium ${fieldErrors.od_eje ? 'border-red-500' : 'border-gray-200'
                              }`}>°</span>
                          </div>
                          {fieldErrors.od_eje && <p className="mt-1 text-xs text-red-600">{fieldErrors.od_eje}</p>}
                        </div>

                        {/* ADD (Conditional) */}
                        {(formData.tipo_de_lente === 'Bifocal' || formData.tipo_de_lente === 'Progresivo') && (
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">ADD</label>
                            <div className="flex">
                              <span className={`px-3 py-2.5 border-2 rounded-l-lg bg-gray-50 text-gray-600 font-medium ${fieldErrors.od_add ? 'border-red-500' : 'border-gray-200'
                                }`}>+</span>
                              <input
                                type="number"
                                step="0.25"
                                name="od_add_val"
                                value={graduacion.od_add_val}
                                onChange={handleGraduacionChange}
                                onBlur={handleBlur}
                                className={`w-full px-3 py-2.5 border-2 border-l-0 rounded-r-lg focus:outline-none focus:ring-2 transition-colors ${fieldErrors.od_add ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-500'
                                  }`}
                              />
                            </div>
                            {fieldErrors.od_add && <p className="mt-1 text-xs text-red-600">{fieldErrors.od_add}</p>}
                          </div>
                        )}

                        {/* AV */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">AV <span className="text-red-500">*</span></label>
                          <div className="flex">
                            <input
                              type="text"
                              name="od_av_1"
                              value={graduacion.od_av_1}
                              onChange={handleGraduacionChange}
                              onBlur={handleBlur}
                              className={`w-full px-3 py-2.5 border-2 rounded-l-lg text-center focus:outline-none focus:ring-2 transition-colors ${fieldErrors.od_av ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-500'
                                }`}
                            />
                            <span className={`px-2 py-2.5 border-2 border-l-0 border-r-0 bg-gray-50 text-gray-600 font-medium ${fieldErrors.od_av ? 'border-red-500' : 'border-gray-200'
                              }`}>/</span>
                            <input
                              type="text"
                              name="od_av_2"
                              value={graduacion.od_av_2}
                              onChange={handleGraduacionChange}
                              onBlur={handleBlur}
                              className={`w-full px-3 py-2.5 border-2 rounded-r-lg text-center focus:outline-none focus:ring-2 transition-colors ${fieldErrors.od_av ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-500'
                                }`}
                            />
                          </div>
                          {fieldErrors.od_av && <p className="mt-1 text-xs text-red-600">{fieldErrors.od_av}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Left Eye (OI) */}
                    <div className="bg-white rounded-xl p-5 border border-purple-200 shadow-sm">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="bg-purple-100 p-1.5 rounded-lg">
                          <Eye className="h-4 w-4 text-purple-600" />
                        </div>
                        <span className="font-bold text-gray-900">Ojo Izquierdo (OI)</span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {/* ESF */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">ESF</label>
                          <div className="flex">
                            <select
                              name="oi_esf_sign"
                              value={graduacion.oi_esf_sign}
                              onChange={handleGraduacionChange}
                              onBlur={handleBlur}
                              className={`px-2 py-2.5 border-2 rounded-l-lg bg-gray-50 focus:outline-none focus:ring-2 transition-colors ${fieldErrors.oi_esf ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-purple-200 focus:border-purple-500'
                                }`}
                            >
                              <option value="+">+</option>
                              <option value="-">-</option>
                            </select>
                            <input
                              type="number"
                              step="0.25"
                              name="oi_esf_val"
                              value={graduacion.oi_esf_val}
                              onChange={handleGraduacionChange}
                              onBlur={handleBlur}
                              className={`w-full px-3 py-2.5 border-2 border-l-0 rounded-r-lg focus:outline-none focus:ring-2 transition-colors ${fieldErrors.oi_esf ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-purple-200 focus:border-purple-500'
                                }`}
                            />
                          </div>
                          {fieldErrors.oi_esf && <p className="mt-1 text-xs text-red-600">{fieldErrors.oi_esf}</p>}
                        </div>

                        {/* CIL */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">CIL</label>
                          <div className="flex">
                            <span className={`px-3 py-2.5 border-2 rounded-l-lg bg-gray-50 text-gray-600 font-medium ${fieldErrors.oi_cil ? 'border-red-500' : 'border-gray-200'
                              }`}>-</span>
                            <input
                              type="number"
                              step="0.25"
                              name="oi_cil_val"
                              value={graduacion.oi_cil_val}
                              onChange={handleGraduacionChange}
                              onBlur={handleBlur}
                              className={`w-full px-3 py-2.5 border-2 border-l-0 rounded-r-lg focus:outline-none focus:ring-2 transition-colors ${fieldErrors.oi_cil ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-purple-200 focus:border-purple-500'
                                }`}
                            />
                          </div>
                          {fieldErrors.oi_cil && <p className="mt-1 text-xs text-red-600">{fieldErrors.oi_cil}</p>}
                        </div>

                        {/* EJE */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">EJE</label>
                          <div className="flex">
                            <input
                              type="number"
                              name="oi_eje_val"
                              value={graduacion.oi_eje_val}
                              onChange={handleGraduacionChange}
                              onBlur={handleBlur}
                              className={`w-full px-3 py-2.5 border-2 rounded-l-lg focus:outline-none focus:ring-2 transition-colors ${fieldErrors.oi_eje ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-purple-200 focus:border-purple-500'
                                }`}
                            />
                            <span className={`px-3 py-2.5 border-2 border-l-0 rounded-r-lg bg-gray-50 text-gray-600 font-medium ${fieldErrors.oi_eje ? 'border-red-500' : 'border-gray-200'
                              }`}>°</span>
                          </div>
                          {fieldErrors.oi_eje && <p className="mt-1 text-xs text-red-600">{fieldErrors.oi_eje}</p>}
                        </div>

                        {/* ADD (Conditional) */}
                        {(formData.tipo_de_lente === 'Bifocal' || formData.tipo_de_lente === 'Progresivo') && (
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">ADD</label>
                            <div className="flex">
                              <span className={`px-3 py-2.5 border-2 rounded-l-lg bg-gray-50 text-gray-600 font-medium ${fieldErrors.oi_add ? 'border-red-500' : 'border-gray-200'
                                }`}>+</span>
                              <input
                                type="number"
                                step="0.25"
                                name="oi_add_val"
                                value={graduacion.oi_add_val}
                                onChange={handleGraduacionChange}
                                onBlur={handleBlur}
                                className={`w-full px-3 py-2.5 border-2 border-l-0 rounded-r-lg focus:outline-none focus:ring-2 transition-colors ${fieldErrors.oi_add ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-purple-200 focus:border-purple-500'
                                  }`}
                              />
                            </div>
                            {fieldErrors.oi_add && <p className="mt-1 text-xs text-red-600">{fieldErrors.oi_add}</p>}
                          </div>
                        )}

                        {/* AV */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">AV <span className="text-red-500">*</span></label>
                          <div className="flex">
                            <input
                              type="text"
                              name="oi_av_1"
                              value={graduacion.oi_av_1}
                              onChange={handleGraduacionChange}
                              onBlur={handleBlur}
                              className={`w-full px-3 py-2.5 border-2 rounded-l-lg text-center focus:outline-none focus:ring-2 transition-colors ${fieldErrors.oi_av ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-purple-200 focus:border-purple-500'
                                }`}
                            />
                            <span className={`px-2 py-2.5 border-2 border-l-0 border-r-0 bg-gray-50 text-gray-600 font-medium ${fieldErrors.oi_av ? 'border-red-500' : 'border-gray-200'
                              }`}>/</span>
                            <input
                              type="text"
                              name="oi_av_2"
                              value={graduacion.oi_av_2}
                              onChange={handleGraduacionChange}
                              onBlur={handleBlur}
                              className={`w-full px-3 py-2.5 border-2 rounded-r-lg text-center focus:outline-none focus:ring-2 transition-colors ${fieldErrors.oi_av ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-purple-200 focus:border-purple-500'
                                }`}
                            />
                          </div>
                          {fieldErrors.oi_av && <p className="mt-1 text-xs text-red-600">{fieldErrors.oi_av}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/*// Seccion de detalles finales de la venta*/}
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">

                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <ShoppingCart className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Detalles Finales de la Venta</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Tipo de Pago
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select name="tipo" value={formData.tipo} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.tipo
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        }`}>
                        <option value="Contado">Contado</option>
                        <option value="Credito">Crédito</option>
                      </select>
                      {fieldErrors.tipo && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.tipo}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        INAPAM
                      </label>
                      <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl flex items-center  hover:border-gray-300 transition-all duration-200">
                        <label className="flex items-center w-full cursor-pointer">
                          <input
                            type="checkbox"
                            name="inapam"
                            checked={formData.inapam === 'Si'}
                            onChange={(e) => setFormData(prev => ({ ...prev, inapam: e.target.checked ? 'Si' : 'No' }))}
                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                          />
                          <span className="ml-3 text-gray-600 font-medium select-none">
                            Aplicar descuento
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Factura
                      </label>
                      <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl flex items-center  hover:border-gray-300 transition-all duration-200">
                        <label className="flex items-center w-full cursor-pointer">
                          <input
                            type="checkbox"
                            name="factura"
                            checked={formData.factura === 'Si'}
                            onChange={(e) => setFormData(prev => ({ ...prev, factura: e.target.checked ? 'Si' : 'No' }))}
                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                          />
                          <span className="ml-3 text-gray-600 font-medium select-none">
                            Aplicar IVA (16%)
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Total
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="number"
                        name="total"
                        value={formData.total}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed
                        ${fieldErrors.total
                            ? 'border-red-500 focus:ring-red-100 bg-red-50'
                            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                          }`}
                        disabled
                      />
                      {fieldErrors.total && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.total}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Enganche
                      </label>
                      <input type="number" name="enganche" value={formData.enganche} onChange={handleChange} onBlur={handleBlur} className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.enganche
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        }`} />
                      {fieldErrors.enganche && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.enganche}
                        </p>
                      )}
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Cant. Pagos
                      </label>
                      <input type="number" name="cant_pagos" value={formData.cant_pagos} onChange={handleChange} onBlur={handleBlur} className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.cant_pagos
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        }`} />
                      {fieldErrors.cant_pagos && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.cant_pagos}
                        </p>
                      )}
                    </div>

                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Fecha de Entrega
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input type="date" name="fecha_entrega" value={formData.fecha_entrega} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.fecha_entrega
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        }`} />
                      {fieldErrors.fecha_entrega && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.fecha_entrega}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-7"></label>
                      <button
                        type="button"
                        onClick={handlePriceIncreaseRequest}
                        className={`w-full px-3 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${priceIncreaseReason
                            ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                            : 'bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white'
                          }`}
                      >
                        {priceIncreaseReason ? '✅ Solicitud guardada' : 'Solicitar aumento de precio'}
                      </button>
                    </div>
                    <div className="group md:col-span-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Observaciones
                      </label>
                      <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} onBlur={handleBlur} rows="3" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200"></textarea>
                    </div>
                  </div>
                </div>
              </div>

              {/*// Botones de accion*/}
              <div className="flex flex-col sm:flex-row gap-4 justify-end pt-8 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/ventas')}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid || loading}
                  className="flex items-center justify-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                >
                  <Save className="h-5 w-5" />
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
