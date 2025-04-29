import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

//.............................. SERVICES ..............................//
import * as WeekService from '../../services/week.services.js';
import * as ParService from '../../services/par.services.js';
import * as UserServices from '../../services/users.services.js';

//.............................. HELPERS ..............................//
import * as NotifyHelper from './../../helpers/notify.js';
import * as RefreshFunction from './../../helpers/generateUUID.js';

//.............................. BIBLIOTECAS EXTERNAS ..............................//
import { Tour } from 'antd';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

//.............................. COMPONENTES ..............................//
import PrimeReactTable_Routines from '../../components/PrimeReactTable_Routines.jsx';
import LogoChico from '../../components/LogoChico.jsx';
import BloquesForm from './../../components/BloquesForm.jsx';
import BlocksListPage from './../../components/BlocksListPage.jsx';

//.............................. ICONOS MUI ..............................//
import IconButton from "@mui/material/IconButton";
import AddIcon from '@mui/icons-material/Add';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonIcon from '@mui/icons-material/Person';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';

function UserRoutineEditPage() {
    const { id } = useParams();
    const { username } = useParams();

    const [status, setStatus] = useState();
    const [loading, setLoading] = useState(false);
    const [routine, setRoutine] = useState([]);
    const [weekNumber, setWeekNumber] = useState(0);
    const [weekClipboardLocalStorage, setWeekClipboardLocalStorage] = useState();
    const [collapsed, setCollapsed] = useState(false);
    const [tourSteps, setTourSteps] = useState([]);
    const [tourVisible, setTourVisible] = useState(false);
    const [firstWidth, setFirstWidth] = useState();
    const [weeklySummary, setWeeklySummary] = useState({
        selection1: "",
        selection2: "",
        selection3: "",
        selection4: "",
        selection5: "",
        comments: "",
        lastSaved: ""
    });
    
    const [showWeeklySummaryModal, setShowWeeklySummaryModal] = useState();
    const [profile, setProfile] = useState(true); // NUEVO ESTADO
    const [showCorrectionsDialog, setShowCorrectionsDialog] = useState(false);
    const [correctionsText, setCorrectionsText] = useState("");

    const [showBlockForm, setShowBlockForm] = useState(false);
    const [blocks, setBlocks] = useState([]);
    

    const [weekDate, setWeekDate] = useState(() => {
        return localStorage.getItem("weekDate") || "";
    });

    const [useDate, setUseDate] = useState(() => {
        const saved = localStorage.getItem("useDate");
        return saved === "true";
    });

    // NUEVO ESTADO PARA isEditable
    const [isEditable, setIsEditable] = useState(() => {
        const saved = localStorage.getItem("isEditable");
        return saved === "true";
    });

    useEffect(() => {
        setTourSteps([
            {
                title: 'Alumno actual',
                description: `Este es el nombre del alumno en el que te encontrás. Las semanas pertecenen a ${username}`,
                target: () => document.getElementById('alumno'),
                placement: 'top',
                nextButtonProps: { children: 'Siguiente »' }
            },
            {
                title: 'Switch de semana',
                description: 'Este switch permite que crees las semanas de manera numérica ( semana 1, semana 2, etc..) o, la creación de semanas a partir de la fecha actual.',
                target: () => document.getElementById('switchWeek'),
                placement: 'top',
                nextButtonProps: { children: 'Siguiente »' }
            },
            {
                title: 'Crear semana de 0',
                description: 'Este botón crea una semana de 0, ideal para comenzar un nuevo bloque.',
                target: () => document.getElementById('week0'),
                placement: 'top',
                prevButtonProps: { children: '« Anterior' },
                nextButtonProps: { children: 'Siguiente »' }
            },
            {
                title: 'Continuar con la rutina',
                description: 'Este botón crea una copia de la última semana. Ideal para continuar el bloque de entrenamiento.',
                target: () => document.getElementById('continueWeek'),
                placement: 'top',
                prevButtonProps: { children: '« Anterior' },
                nextButtonProps: { children: 'Siguiente »' }
            },
            {
                title: 'Pegar rutina del portapapeles',
                description: 'Botón para pegar una rutina, previamente copiada. Puede ser una rutina, tanto de otro alumno, como del que se encuentra.',
                target: () => document.getElementById('paste'),
                placement: 'top',
                prevButtonProps: { children: '« Anterior' },
                nextButtonProps: { children: '¡Finalizar!' }
            }
        ]);
    }, [username]);

    useEffect(() => {
        setLoading(true);
        setFirstWidth(window.innerWidth);
        NotifyHelper.notifyA("Cargando semanas...");

        WeekService.findRoutineByUserId(id)
            .then(data => {
                setRoutine(data);
                setWeekNumber(data.length + 1);
                setLoading(false);
                NotifyHelper.updateToast();
            });
    }, [status, id]);

    useEffect(() => {
        UserServices.getProfileById(id)
          .then((data) => {
            setProfile(data);
            // Si data.resumen_semanal existe, úsalo; si no, usamos el objeto por defecto.
            setWeeklySummary(data.resumen_semanal || {
              selection1: "",
              selection2: "",
              selection3: "",
              selection4: "",
              selection5: "",
              comments: "",
              lastSaved: ""
            });
          })
          .catch((error) => {
            console.error("Error al obtener el perfil del usuario:", error);
          });
      }, [id]);

    const copyRoutine = (data) => {
        setWeekClipboardLocalStorage(data);
    };

    useEffect(() => {
        setWeekClipboardLocalStorage(localStorage.getItem('userWeek'));
    }, [copyRoutine]);

    const handleToggleUseDate = () => {
        const newValue = !useDate;
        setUseDate(newValue);
        localStorage.setItem("useDate", newValue.toString());
    };

    function createWeek() {
        setLoading(true);

        let name;
        if (useDate) {
            const currentDate = new Date().toLocaleDateString();
            localStorage.setItem("weekDate", currentDate);
            setWeekDate(currentDate);
            name = `Semana del ${currentDate}`;
        } else {
            name = `Semana ${weekNumber}`;
        }

        // Se envía la propiedad isEditable en el objeto a crear
        WeekService.createWeek({ name }, id)
            .then(() => setStatus(RefreshFunction.generateUUID()));
    }

    function createWeekCopyLastWeek() {
        setLoading(true);
        WeekService.createClonWeek(id, { fecha: useDate ? 'isDate' : 'noDate' })
            .then(() => {
                setStatus(RefreshFunction.generateUUID());
            });
    }

    const loadFromLocalStorage = () => {
        try {
            if (weekClipboardLocalStorage) {
                const parsedData = JSON.parse(weekClipboardLocalStorage);
                ParService.createPARroutine(parsedData, id)
                    .then(() => {
                        setLoading(false);
                        setStatus(RefreshFunction.generateUUID());
                        NotifyHelper.updateToast();
                    });
            } else {
                alert('No hay datos en localStorage!');
            }
        } catch (err) {
            console.error('Error al cargar desde localStorage: ', err);
        }
    };

    const getBgForSelection = (value) => {
        if (!value) return {};
        const val = value.toLowerCase().trim();
        if (val === 'muy mal' || val === 'muy mala' || val === 'muy malo') {
          return { backgroundColor: '#fd0000', color: 'white' };
        } else if (val === 'mal' || val === 'mala' || val === 'malo') {
          return { backgroundColor: '#9c0200', color: 'white' };
        } else if (val === 'regular') {
          return { backgroundColor: '#ffe700' };
        } else if (val === 'bien' || val === 'buena' || val === 'bueno') {
          return { backgroundColor: '#94ff01' };
        } else if (val === 'muy bien' || val === 'muy buena' || val === 'muy bueno') {
          return { backgroundColor: '#02c101' };
        }
        return {};
    };

    // Nueva función para guardar las correcciones junto a la fecha
    const handleCorrectionsSave = () => {
        const now = new Date().toISOString();
        // Combinar el perfil actual con la devolución y su fecha en nuevas propiedades:
        const updatedProfile = { ...profile, devolucion: correctionsText, devolucionFecha: now };
        // Para evitar problemas con _id si el servicio lo impide, lo extraemos.
        const { _id, ...profileDataWithoutId } = updatedProfile;
        
        UserServices.editProfile(id, profileDataWithoutId)
          .then(() => {
            NotifyHelper.instantToast('Devolución actualizada con éxito!');
            setProfile(updatedProfile);
            setShowCorrectionsDialog(false);
          })
          .catch((err) => {
            console.error("Código de error:", err.status);
            console.error("Detalle del error:", err.data);
            NotifyHelper.instantToast('Error al guardar la devolución');
          });
    };

    return (
        <>
            <div className="sidebarPro">
                <Sidebar
                    collapsed={collapsed}
                    collapsedWidth={'85px'}
                    width="200px"
                    backgroundColor="colorMain"
                    rootStyles={{ color: 'white', border: 'none' }}
                >
                    <Menu>
                        <MenuItem id={'alumno'} icon={collapsed ? <PersonIcon /> : ''} disabled={!collapsed} className="mt-5 pt-3">
                            <div className="bg-light rounded-2 text-center">
                                <p className="m-0">Alumno <strong className="d-block">{username}</strong></p>
                            </div>
                        </MenuItem>
                        <MenuItem icon={collapsed ? <ToggleOnIcon /> : ''} id='switchWeek' className="mt-4">
                            <div className="bg-light rounded-2 text-center ">
                                <div className="d-flex align-items-center justify-content-center flex-column ">
                                    <p className='mt-1 mb-0'>{useDate ? "Modo fecha" : "Modo numérico"}</p>
                                    <label className="switch mb-2">
                                        <input type="checkbox" checked={useDate} onChange={handleToggleUseDate} />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>
                        </MenuItem>

                        <MenuItem id={'week0'} icon={collapsed ? <AddIcon /> : ''} className="mt-5 pt-2" onClick={createWeek}>
                            <div className="bg-light rounded-2 text-center py-3" >
                                <div className="d-flex align-items-center justify-content-center  ">
                                <AddIcon className='text-dark me-2' />
                                <p className="m-0">Nueva semana</p>
                                </div>
                            </div>
                        </MenuItem>

                        <MenuItem id='continueWeek' icon={collapsed ? <LibraryAddIcon/> : ''}  className="mt-4" onClick={createWeekCopyLastWeek}>
                            <div className="bg-light rounded-2 text-center py-3">
                                <div className="d-flex align-items-center justify-content-center  ">
                                <LibraryAddIcon className='text-dark me-2' />
                                <p className="m-0">Seguir semana</p>
                                </div>
                            </div>
                        </MenuItem>

                        <MenuItem id='paste' icon={collapsed ? <ContentCopyIcon/> : ''}  className="mt-4" onClick={loadFromLocalStorage}>
                            <div className="bg-light rounded-2 text-center py-3">
                                <div className="d-flex align-items-center justify-content-center  ">
                                <ContentCopyIcon className='text-dark me-2' />
                                <p className="m-0">Pegar semana</p>
                                </div>
                            </div>
                        </MenuItem>

                        {profile && (
                        <>
                            <MenuItem icon={collapsed ? <ToggleOnIcon /> : ''} disabled={!collapsed} id='switchWeek' className="mt-5">
                                <div className='row justify-content-around'>
                                    <div className='col-6'>
                                        <p className='text-light text-start p-1'>Edad</p> 
                                    </div>
                                    <div className='col-6 '>
                                        <p className='text-dark rounded-2 colorItems text-center p-1'>{profile.edad || '-'}</p>
                                    </div>
                                </div>
                            </MenuItem>
                            <MenuItem icon={collapsed ? <ToggleOnIcon /> : ''} disabled={!collapsed} id='switchWeek' className="">
                                <div className='row justify-content-around'>
                                    <div className='col-6'>
                                        <p className='text-light text-start p-1'>Peso</p> 
                                    </div>
                                    <div className='col-6  '>
                                        <p className='text-dark rounded-2 colorItems text-center p-1'>{profile.peso || '-'}kg</p>
                                    </div>
                                </div>
                            </MenuItem>
                            <MenuItem icon={collapsed ? <ToggleOnIcon /> : ''} disabled={!collapsed} id='switchWeek' className="">
                                <div className='row justify-content-around '>
                                    <div className='col-6 '>
                                        <p className='text-light text-start p-1'>Altura</p> 
                                    </div>
                                    <div className='col-6 '>
                                        <p className='text-dark colorItems rounded-2 text-center p-1'>{profile.altura || '-'}cm</p>
                                    </div>
                                </div>
                            </MenuItem>
                        </>
                        )}
                        <MenuItem disabled className=" ">
                            <LogoChico />
                        </MenuItem>
                        <MenuItem className="text-center botonHelpEditUserRoutine" onClick={() => setTourVisible(true)}>
                            <IconButton className="p-2 bg-light ">
                                <HelpOutlineIcon className="text-dark" />
                            </IconButton>
                            <span className="ms-2">Ayuda</span>
                        </MenuItem>
                    </Menu>
                </Sidebar>
            </div>

            <section className='container-fluid totalHeight'>
                <article className={`row justify-content-center ${collapsed ? 'marginSidebarClosed' : 'marginSidebarOpen'}`}>

                {firstWidth < 983 && (<div className="row text-center justify-content-center marginTableRoutine align-middle align-center align-items-center ">
                        
                            <>
                                <div className="col-10 col-lg-3 mx-2 mb-4 boxData">
                                    <div className="bg-light rounded-2 text-center ">
                                        <div className="d-flex align-items-center justify-content-center flex-column ">
                                            <p className='mt-1 mb-0'>{useDate ? "Modo fecha" : "Modo numérico"}</p>
                                            <label className="switch mb-2">
                                                <input type="checkbox" checked={useDate} onChange={handleToggleUseDate} />
                                                <span className="slider round"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                           
                        
                       
                          
                            <div className="col-10 col-lg-3 mx-2 mb-4 boxData">
                                <button id={'week0'} className="btn p-3" onClick={createWeek}>
                                    <AddIcon className="me-2" />
                                    <span className=" me-1">Nueva semana</span>
                                </button>
                            </div>
                            <div id='continueWeek' className="col-10 col-lg-3 mx-2 mb-4 boxData" onClick={createWeekCopyLastWeek}>
                                <button disabled={routine.length === 0} className="btn p-3 disabledButton">
                                    <LibraryAddIcon className="me-2" />
                                    Seguir semana
                                </button>
                            </div>
                            <div id='paste' className="col-10 col-lg-3 mx-2 mb-4 boxData">
                                <button className="btn p-3 " onClick={loadFromLocalStorage}>
                                    <ContentCopyIcon className="me-2" />
                                    <span className=" me-1">Pegar rutina</span>
                                </button>
                            </div>
                            </>
                    
                    </div>)}



                    {firstWidth > 991 && weeklySummary ? (
                        
                            <div className='col-10 mb-3'>
                            <div className='row justify-content-around'>
                                <div className='col-10 col-sm-6 col-xl-5  stylesImportantResuemn'>

                                
                            <div className='' style={{ display: 'flex', flexDirection: 'row' }}>
                            {/* Tabla vertical para las propiedades */}
                            <table
                            className=''
                                style={{
                                flex: 1,
                                width: '100%',
                                border: '1px solid #ddd',
                                borderCollapse: 'collapse',
                                backgroundColor: '#fafafa'
                                }}
                            >
                                <tbody>
                                <tr>
                                    <td style={{ padding: '5px', border: '1px solid #ddd' }}>
                                    <strong>Alimentación</strong>
                                    </td>
                                    <td
                                    style={{
                                        padding: '5px',
                                        border: '1px solid #ddd',
                                        ...getBgForSelection(weeklySummary.selection1)
                                    }}
                                    >
                                    {weeklySummary.selection1 || '-'}
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '5px', border: '1px solid #ddd' }}>
                                    <strong>NEAT</strong>
                                    </td>
                                    <td
                                    style={{
                                        padding: '5px',
                                        border: '1px solid #ddd',
                                        ...getBgForSelection(weeklySummary.selection2)
                                    }}
                                    >
                                    {weeklySummary.selection2 || '-'}
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '5px', border: '1px solid #ddd' }}>
                                    <strong>Sensaciones</strong>
                                    </td>
                                    <td
                                    style={{
                                        padding: '5px',
                                        border: '1px solid #ddd',
                                        ...getBgForSelection(weeklySummary.selection3)
                                    }}
                                    >
                                    {weeklySummary.selection3 || '-'}
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '5px', border: '1px solid #ddd' }}>
                                    <strong>Descanso / Sueño</strong>
                                    </td>
                                    <td
                                    style={{
                                        padding: '5px',
                                        border: '1px solid #ddd',
                                        ...getBgForSelection(weeklySummary.selection4)
                                    }}
                                    >
                                    {weeklySummary.selection4 || '-'}
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '5px', border: '1px solid #ddd' }}>
                                    <strong>Estrés</strong>
                                    </td>
                                    <td
                                    style={{
                                        padding: '5px',
                                        border: '1px solid #ddd',
                                        ...getBgForSelection(weeklySummary.selection5)
                                    }}
                                    >
                                    {weeklySummary.selection5 || '-'}
                                    </td>
                                </tr>
                                </tbody>
                                {profile && profile.devolucion ? (
                                <tr>
                                    <td style={{ padding: '5px', border: '1px solid #ddd' }}>
                                    <strong>Ult. devolución<noframes></noframes></strong>
                                    </td>
                                    <td
                                    style={{
                                        padding: '5px',
                                        border: '1px solid #ddd'
                                    }}
                                    >
                                    {profile.devolucionFecha ? new Date(profile.devolucionFecha).toLocaleDateString() : ''}
                                    </td>
                                </tr> ) : (
                                '-'
                                )}
                                
                            </table>

                            </div>

                            </div>
                                {/* Columna para Comentarios y Devoluciones */}
                                <div
                                style={{
                                    
                                    flexDirection: 'column',  // Agregado: en columna
                                    justifyContent: 'space-between', // Distribuye el contenido: comments arriba y botón abajo
                                       // (Opcional) Definí una altura mínima para notar la separación
                                  }}
                                    className='col-sm-7 col-xl-6  border p-2 '
                                >
                                    
                                    <strong>Comentarios del alumno:</strong>
                                    
                                    <p className='mt-3'>{weeklySummary.comments || '-'}</p>

                                    <div className="text-center align-bottom">
                                        <button 
                                            className="btn btn-outline-dark"
                                            onClick={() => {
                                            setCorrectionsText(profile.devolucion || "");
                                            setShowCorrectionsDialog(true);
                                            }}
                                        >
                                            Cargar correcciones/devoluciones
                                        </button>
                                    </div>
                                    
                                </div>
                            </div>

                            </div>

                    ) : (
                      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                        <button className="btn btn-outline-primary" onClick={() => setShowWeeklySummaryModal(true)}>
                          Ver resumen semanal
                        </button>
                      </div>
                    )}

                    <div className='col-12 col-xl-10'>
                        <div className='row justify-content-center'>
                            <PrimeReactTable_Routines
                                id={id}
                                username={username}
                                routine={routine}
                                setRoutine={setRoutine}
                                copyRoutine={copyRoutine}
                            />
                        </div>
                    </div>
                </article>

                {tourVisible && (
                    <Tour
                        open={tourVisible}
                        steps={tourSteps}
                        onClose={() => setTourVisible(false)}
                        onFinish={() => setTourVisible(false)}
                        scrollIntoViewOptions={true}
                    />
                )}

                <Dialog
                  header="Resumen Semanal"
                  visible={showWeeklySummaryModal}
                  style={{ width: '80vw' }}
                  onHide={() => setShowWeeklySummaryModal(false)}
                  draggable={true}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <span className='styleInputsSpan'>Última actualización:</span>{" "}
                      {weeklySummary.lastSaved ? new Date(weeklySummary.lastSaved).toLocaleString() : '-'}
                      <div>
                        <strong>Alimentación:</strong> {weeklySummary.selection1 || '-'}
                      </div>
                      <div>
                        <strong>NEAT:</strong> {weeklySummary.selection2 || '-'}
                      </div>
                      <div>
                        <strong>Sensaciones:</strong> {weeklySummary.selection3 || '-'}
                      </div>
                      <div>
                        <strong>Descanso / Sueño:</strong> {weeklySummary.selection4 || '-'}
                      </div>
                      <div>
                        <strong>Estrés:</strong> {weeklySummary.selection5 || '-'}
                      </div>
                      <div>
                        <strong>Comentarios:</strong> {weeklySummary.comments || '-'}
                      </div>
                  </div>
                  <div className="text-center align-bottom my-3">
                        <button 
                            className="btn btn-outline-dark"
                            onClick={() => {
                            setCorrectionsText(profile.devolucion || "");
                            setShowCorrectionsDialog(true);
                            }}
                        >
                            Cargar correcciones/devoluciones
                        </button>
                    </div>

                  <div className="row justify-content-center mt-3">
                      <Button label="Cerrar" className="btn BlackBGtextWhite col-4" onClick={() => setShowWeeklySummaryModal(false)} />
                  </div>
                </Dialog>

                {showBlockForm && (
                <Dialog visible={showBlockForm} onHide={() => setShowBlockForm(false)} header="Crear Bloque">
                    <BloquesForm 
                    id={trainer_id}
                    onSaved={() => {
                    setShowBlockForm(false);
                    BlockService.getBlocks(id).then(setBlocks);
                    }} />
                </Dialog>
                )}

                <Dialog
                  header="Correcciones / Devolución"
                  visible={showCorrectionsDialog}
                  onHide={() => setShowCorrectionsDialog(false)}
                  style={{ width: firstWidth > 900 ? '40%' : '90%' }}
                >
                  <div className="mb-3">
                    <textarea 
                      className="form-control" 
                      rows="5" 
                      value={correctionsText} 
                      onChange={(e) => setCorrectionsText(e.target.value)}
                      placeholder="Ingrese las correcciones o devolución..."
                    />
                  </div>
                  <div className="d-flex justify-content-end">
                    <button className="btn btn-secondary me-2" onClick={() => setShowCorrectionsDialog(false)}>
                      Cancelar
                    </button>
                    <button className="btn btn-primary" onClick={handleCorrectionsSave}>
                      Guardar
                    </button>
                  </div>
                </Dialog>
            </section>
        </>
    );
}

export default UserRoutineEditPage;
