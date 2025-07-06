import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

//.............................. COMPONENTES ..............................//
import PrimeReactTable_Routines from '../../components/PrimeReactTable_Routines.jsx';
import LogoChico from '../../components/LogoChico.jsx';
import BloquesForm from './../../components/BloquesForm.jsx';
import BlocksListPage from './../../components/BlocksListPage.jsx';
import {
  User,
  CalendarPlus,
  Repeat,
  ClipboardCopy,
  HelpCircle,
  ToggleLeft,
  SquarePlus,
  Info
} from 'lucide-react';

//.............................. ICONOS MUI ..............................//
import IconButton from "@mui/material/IconButton";
import AddIcon from '@mui/icons-material/Add';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonIcon from '@mui/icons-material/Person';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import AddToDriveIcon from '@mui/icons-material/AddToDrive';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function UserRoutineEditPage() {
    const navigate = useNavigate();
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

    const [showProfileDialog, setShowProfileDialog] = useState(false);
    const [showDriveLinkDialog, setShowDriveLinkDialog] = useState(false);
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
                title: 'Perfil del alumno',
                description: 'En este apartado encontrarás información de tu alumno, cuando rellene su perfil.',
                target: () => document.getElementById('perfil'),
                placement: 'top',
                nextButtonProps: { children: 'Siguiente »' }
            },
            {
                title: 'Resumen semanal',
                description: 'Estos datos son rellenados por el alumno. La idea es que los llene semana a semana para poder trabajar con más información.',
                target: () => document.getElementById('resumen'),
                placement: 'top',
                nextButtonProps: { children: 'Siguiente »' }
            },
              {
                title: 'Devolución',
                description: 'Este botón sirve para poder cargar la corrección al alumno. El la verá cuando entre a la sección de "Ver Rutina"',
                target: () => document.getElementById('correcciones'),
                placement: 'top',
                nextButtonProps: { children: 'Siguiente »' }
            },
              {
                title: 'Drive',
                description: 'Cuando el usuario suba su link de drive, podrás ingresar a su carpeta. La idea es manejar los videos mediante este sistema, para que tengas todo centralizado.',
                target: () => document.getElementById('drive'),
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
                    const normalized = data.map(w => ({
                    ...w,
                    block_id: w.block_id ? w.block_id.toString() : null,
                    block: w.block?._id
                      ? { ...w.block, _id: w.block._id.toString() }
                      : null
                  }));
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
            console.log(data)
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

    const getBadgeStyle = (value) => {
  if (!value) return 'bg-secondary';
  const val = value.toLowerCase();
  if (val.includes('muy bien')) return 'bg-success';
  if (val.includes('bien')) return 'bg-success-subtle text-dark';
  if (val.includes('regular')) return 'bg-warning text-dark';
  if (val.includes('mal')) return 'bg-danger';
  return 'bg-secondary';
};

    // Nueva función para guardar las correcciones junto a la fecha
   const handleCorrectionsSave = () => {
  const now = new Date().toISOString();

  // Creamos un nuevo objeto excluyendo campos que no deben ser reenviados
  const {
    _id,
    id: ignoredId,
    user_id, // 👈 NO reenviar esto
    ...safeProfile
  } = profile;

  const updatedProfile = {
    ...safeProfile,
    devolucion: correctionsText,
    devolucionFecha: now
  };

  UserServices.editProfile(id, updatedProfile)
    .then(() => {
      NotifyHelper.instantToast('Devolución actualizada con éxito!');
      setProfile(prev => ({
        ...prev,
        devolucion: correctionsText,
        devolucionFecha: now
      }));
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
        <div className='sidebarPro colorMainAll'>
          <div className="d-flex flex-column  colorMainAll  shadow-sm" style={{ width: '220px', height: '100vh', paddingTop: '50px' }}>

          <div className="p-3">
            <div id={'alumno'} onClick={() => setShowProfileDialog(true)} className="bgItemsDropdown stylePointer rounded mx-2 row justify-content-center mb-3">
              <div className=' col-1'><User /></div>
              <div className='text-center col-10'><strong >{username}</strong></div>
            </div>

            <div id={'switchWeek'} className="d-flex justify-content-between text-light bgItemsDropdown align-items-center 3">
              <span className="text-light mx-2 small d-flex align-items-center">
                {useDate ? "Modo fecha" : "Modo numérico"}
                <OverlayTrigger
                  placement="right"
                  overlay={
                    <Tooltip id="switch-mode-tooltip">
                      Es el nombre que se le pondrá a las semanas. En modo fecha: "Semana - xx/xx/xxxx". En modo numérico: "Semana x"
                    </Tooltip>
                  }
                >
                  <Info size={14} className="ms-2" style={{ cursor: 'pointer' }} />
                </OverlayTrigger>
              </span>
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" checked={useDate} onChange={handleToggleUseDate} />
              </div>
            </div>

          </div>

          {weeklySummary && (
            <div  className="px-2">
              <h6 className="text-light ms-2">Resumen semanal</h6>
              <ul id='resumen' className="list-group small mb-2">
                 <li className=" d-flex justify-content-between">
                </li>
                <li className="list-group-item py-1 bgItemsDropdownUl d-flex justify-content-between">
                  Alimentación <span className={`badge ${getBadgeStyle(weeklySummary.selection1)}`}>{weeklySummary.selection1 || '-'}</span>
                </li>
                <li className="list-group-item py-1 bgItemsDropdownUl d-flex justify-content-between">
                  NEAT <span className={`badge ${getBadgeStyle(weeklySummary.selection2)}`}>{weeklySummary.selection2 || '-'}</span>
                </li>
                <li className="list-group-item bgItemsDropdownUl py-1 d-flex justify-content-between">
                  Sensaciones <span className={`badge ${getBadgeStyle(weeklySummary.selection3)}`}>{weeklySummary.selection3 || '-'}</span>
                </li>
                <li className="list-group-item bgItemsDropdownUl py-1 d-flex justify-content-between">
                  Sueño <span className={`badge ${getBadgeStyle(weeklySummary.selection4)}`}>{weeklySummary.selection4 || '-'}</span>
                </li>
                <li className="list-group-item bgItemsDropdownUl py-1 d-flex justify-content-between">
                  Estrés <span className={`badge ${getBadgeStyle(weeklySummary.selection5)}`}>{weeklySummary.selection5 || '-'}</span>
                </li>
                <li className="list-group-item bgItemsDropdownUl py-1 d-flex justify-content-between">
                  Peso (Kg) <span className={`badge ${getBadgeStyle(weeklySummary.selection5)}`}>{weeklySummary.pesoCorporal || '-'}</span>
                </li>
                 <li className=" d-flex justify-content-between">
                </li>
              </ul>

              {weeklySummary.lastSaved && (
                <p className='text-light small text-center mb-2'>
                  Última actualización: {new Date(weeklySummary.lastSaved).toLocaleDateString()}
                </p>
              )}

              {/* Comentario con vista expandible */}
              <div id='comments' className="position-relative">
                <label className='text-light small ms-2' htmlFor="">Comentarios</label>
                <OverlayTrigger
                  placement="right"
                  delay={{ show: 200, hide: 150 }}
                  overlay={
                    <Tooltip id="full-comment-tooltip">
                      <div style={{ maxWidth: '250px', fontSize: '1rem', whiteSpace: 'normal' }}>
                        {weeklySummary.comments}
                      </div>
                    </Tooltip>
                  }
                >
                  <p
                    className="small mx-2 rounded p-2 text-light bgItemsDropdown"
                    style={{ cursor: 'pointer' }}
                  >
                    {
                      weeklySummary.comments?.split(" ").length > 15
                        ? weeklySummary.comments.split(" ").slice(0, 15).join(" ") + "..."
                        : weeklySummary.comments || "No hay comentarios"
                    }
                  </p>
                </OverlayTrigger>
              </div>

              <div id='correcciones' className="d-grid mt-2">
                <button className="btn btn-outline-light btn-sm" onClick={() => {
                  setCorrectionsText(profile.devolucion || "");
                  setShowCorrectionsDialog(true);
                }}>
                  Cargar correciones
                </button>
              </div>
                 <div id='drive' className="d-grid mt-2">
                    {profile.drive_link ? (
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={profile.drive_link}
                        className="btn btn-outline-light btn-sm"
                      >
                        <AddToDriveIcon /> Ver videos subidos
                      </a>
                    ) : (
                      <button
                        className="btn btn-outline-light btn-sm"
                        onClick={() => setShowDriveLinkDialog(true)}
                      >
                        <AddToDriveIcon /> Ver videos subidos
                      </button>
                    )}
                  </div>
            </div>
          )}

          <div className="p-3 mb-3 text-center">
            <div className="small text-light mb-2">
              <strong>TOM</strong><br />Planificación digital
            </div>
            <button className="btn btn-outline-light btn-sm" onClick={() => setTourVisible(true)}>
              <HelpCircle size={16} className="me-1" /> Ayuda
            </button>
          </div>
        </div>
      </div>
            <section className='container-fluid totalHeight'>
                <article className={`row justify-content-center ${collapsed ? 'marginSidebarClosed' : 'marginSidebarOpen'}`}>

                {firstWidth < 983 ? (<div className="row text-center justify-content-center marginTableRoutine align-middle align-center align-items-center ">
                        
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
                           
                        
                       
                          
                            <div id={'week0'} className="col-10 col-lg-3 mx-2 mb-4 boxData">
                                <button  className="btn p-3" onClick={createWeek}>
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
                    
                    </div>) :
                    <div className="row justify-content-around mb-5 mt-5 ">
                      <button id={'week0'} onClick={createWeek} className="btn bgItemsDropdown btn-sm col-3"><CalendarPlus size={16} className="me-2" /> Nueva semana</button>
                      <button id='continueWeek' onClick={createWeekCopyLastWeek} className="btn bgItemsDropdown btn-sm col-3"><Repeat size={16} className="me-2" /> Seguir semana</button>
                      <button id='paste' onClick={loadFromLocalStorage} className="btn bgItemsDropdown btn-sm col-3"><ClipboardCopy size={16} className="me-2" /> Pegar semana</button>
                    </div>
            }



                    {firstWidth < 991 && weeklySummary &&
  (
                      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                        <button className='btn btn-outline-primary' onClick={() => setShowWeeklySummaryModal(true)}>
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
                      <span className=''>Últ. actualización: 
                      {weeklySummary.lastSaved ? new Date(weeklySummary.lastSaved).toLocaleString() : '-'}</span>
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
                        <strong>Peso:</strong> {weeklySummary.pesoCorporal || '-'}
                      </div>
                      <div>
                        <strong>Comentarios:</strong> {weeklySummary.comments || '-'}
                      </div>
                  </div>
                  <div className="text-center align-bottom my-3">
                        <button 
                            className="btn btn-outline-light"
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

                <Dialog
                  header="Sin link de Drive"
                  visible={showDriveLinkDialog}
                  onHide={() => setShowDriveLinkDialog(false)}
                  style={{ width: '30vw' }}
                >
                  <p className='text-light'>Pedile a tu alumno que suba el link de su drive para poder verlo!</p>
                  <div className="text-center mt-3">
                    <Button label="Cerrar" onClick={() => setShowDriveLinkDialog(false)} />
                  </div>
                </Dialog>

                <Dialog
                header="Perfil del Alumno"
                visible={showProfileDialog}
                style={{ width: '30vw' }}
                onHide={() => setShowProfileDialog(false)}
                draggable={true}
            >
                {profile && (
                    <div className="text-muted small">
                        <div className="d-flex justify-content-between bgItemsDropdown"><span className='ms-2'>Edad</span><strong className='me-2'>{profile.edad || '-'} años</strong></div>
                        <div className="d-flex justify-content-between bgItemsDropdown"><span className='ms-2'>Peso</span><strong className='me-2'>{profile.peso || '-'} kg</strong></div>
                        <div className="d-flex justify-content-between bgItemsDropdown"><span className='ms-2'>Altura</span><strong className='me-2'>{profile.altura || '-'} cm</strong></div>
                    </div>
                )}
                <div className="text-center mt-3">
                    <Button label="Cerrar" onClick={() => setShowProfileDialog(false)} />
                </div>
            </Dialog>

            </section>
        </>
    );
}

export default UserRoutineEditPage;
