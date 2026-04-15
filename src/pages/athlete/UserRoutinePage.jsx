import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

import * as WeekService from '../../services/week.services.js';
import * as UserServices from './../../services/users.services.js';
import * as NotifyHelper from './../../helpers/notify.js';

import Logo from '../../components/Logo.jsx';
import ActionAreaCard from '../../components/MUI/ActionAreaCard.jsx';
import { UserLock, Dumbbell, Calendar, Bolt, MessageSquare } from 'lucide-react';

import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CircleIcon from '@mui/icons-material/Circle';
import ViewStreamIcon from '@mui/icons-material/ViewStream';

function UserRoutinePage() {
    const { id } = useParams();
    const username = localStorage.getItem('name');
    const [isDark, setIsDark] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('mobileDarkMode') === 'true';
    });

    const navigate = useNavigate()
    const [routine, setRoutine] = useState([]);
    const [pressedRoutine, setPressedRoutine] = useState([]);
    const [indexRoutine, setIndexRoutine] = useState([]);
    const [visibleEdit, setVisibleEdit] = useState(false);
    const [showProfileMissingModal, setShowProfileMissingModal] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

    // Comentarios (VM = ViewModel ya normalizado para el modal)
    const [visibleComments, setVisibleComments] = useState(false);
    const [commentsData, setCommentsData] = useState(null); // { mode: 'free'|'days', title?, description?, items? }
    const [commentsWeek, setCommentsWeek] = useState(null);

    const [paymentState, setPaymentState] = useState(() => localStorage.getItem('state'));

    const puedeVerRutina = useMemo(() => {
        return paymentState === 'permitir' || paymentState === 'true' || paymentState === null || paymentState === undefined;
    }, [paymentState]);

    const refreshPaymentState = useCallback(async () => {
        try {
            const user = await UserServices.findUserById(id);
            const isPaid = user?.payment_info?.isPaid;

            if (isPaid === null || isPaid === undefined) {
                localStorage.removeItem('state');
                setPaymentState(null);
                return;
            }

            const normalized = String(isPaid);
            localStorage.setItem('state', normalized);
            setPaymentState(normalized);
        } catch (error) {
            console.error('Error refrescando estado de acceso del usuario:', error);
        }
    }, [id]);

    // refs para observer
    const weekRefs = useRef([]);

    const handleCloseDialog = () => setVisibleEdit(false);
    const athleteDialogClass = isDark ? 'athlete-dialog-dark' : '';

    // ==== Helpers de fecha ====
    const parseDDMMYYYY = (fechaStr = '', horaStr = '') => {
        try {
            const [d, m, y] = (fechaStr || '').split('/').map(n => parseInt(n, 10));
            const [hh = 0, mm = 0] = (horaStr || '00:00').split(':').map(n => parseInt(n, 10));
            if (!y || !m || !d) return null;
            return new Date(y, m - 1, d, hh, mm, 0, 0);
        } catch {
            return null;
        }
    };

    const toTimestampSafe = (value) => {
        if (!value) return 0;
        if (value instanceof Date) return value.getTime();
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const t = new Date(value).getTime();
            return Number.isFinite(t) ? t : 0;
        }
        if (typeof value === 'object') {
            const maybe = parseDDMMYYYY(value?.fecha, value?.hora);
            return maybe ? maybe.getTime() : 0;
        }
        return 0;
    };

    const getSortTime = (week) => toTimestampSafe(week?.created_at);

    const getWeekDateLabel = (week) => {
        if (week?.visible_at) {
            const ts = toTimestampSafe(week.visible_at);
            if (ts) return new Date(ts).toLocaleDateString('es-AR');
        }
        const ca = week?.created_at;
        if (ca && typeof ca === 'object' && 'fecha' in ca) return ca.fecha || '-';
        const ts = toTimestampSafe(ca);
        return ts ? new Date(ts).toLocaleDateString('es-AR') : '-';
    };

    // ==== Mapeo de labels de dias de la rutina ====
    const getDayLabelMap = (week) => {
        const map = {};
        (week?.routine || []).forEach((d, idx) => {
            const key = String(d?._id ?? '');
            if (!key) return;
            map[key] = d?.name || d?.title || `Dia ${idx + 1}`;
        });
        return map;
    };

    // ==== VM de comentarios para render (free o days) ====
    const buildCommentsVM = (week) => {
        const src =
            week?.comments ??
            week?.comentarios ??
            week?.comment ??
            week?.comentario ??
            null;

        if (!src) return null;

        // Si viene en formato moderno con mode
        const title = (typeof src?.title === 'string' && src.title.trim()) ? src.title.trim() : 'Comentarios semanales';

        // ---- DAYS ----
        const looksLikeDays =
            src?.mode === 'days' ||
            Array.isArray(src?.days) ||
            typeof src?.days === 'object' ||
            typeof src?.daysMap === 'object';

        if (looksLikeDays) {
            const labels = getDayLabelMap(week);
            let items = [];

            if (Array.isArray(src?.days)) {
                items = src.days
                    .map(it => {
                        const dayId = String(it?.dayId ?? '').trim();
                        if (!dayId) return null;
                        const text = String(it?.text ?? '').trim();
                        const label = it?.label || labels[dayId] || 'Dia';
                        return { dayId, label, text };
                    })
                    .filter(Boolean)
                    .filter(it => it.text.length > 0);
            } else if (src?.daysMap && typeof src.daysMap === 'object') {
                items = Object.keys(src.daysMap)
                    .map(k => {
                        const dayId = String(k);
                        const text = String(src.daysMap[k] ?? '').trim();
                        const label = labels[dayId] || 'Dia';
                        return { dayId, label, text };
                    })
                    .filter(it => it.text.length > 0);
            } else if (src?.days && typeof src.days === 'object') {
                // legacy objeto { [dayId]: text }
                items = Object.keys(src.days)
                    .map(k => {
                        const dayId = String(k);
                        const text = String(src.days[k] ?? '').trim();
                        const label = labels[dayId] || 'Dia';
                        return { dayId, label, text };
                    })
                    .filter(it => it.text.length > 0);
            }

            return {
                mode: 'days',
                title,
                items
            };
        }

        // ---- FREE ---- (moderno o legacy)
        let description = '';
        if (typeof src?.description === 'string') {
            description = src.description.trim();
        } else if (typeof src === 'string') {
            description = src.trim();
        } else if (Array.isArray(src)) {
            // legacy: array de strings/objetos -> los concateno
            description = src.map(it => {
                if (typeof it === 'string') return it.trim();
                if (it && typeof it === 'object') {
                    const text = it.description ?? it.texto ?? it.detalle ?? it.body ?? it.mensaje ?? it.nota ?? '';
                    return String(text).trim();
                }
                return String(it ?? '').trim();
            }).filter(Boolean).join('\n\n');
        } else if (src && typeof src === 'object') {
            const text =
                src.description ?? src.descripcion ??
                src.detalle ?? src.texto ?? src.body ?? src.mensaje ??
                src.note ?? src.nota ?? '';
            description = String(text || '').trim();
        }

        return {
            mode: 'free',
            title,
            description
        };
    };

    // ==== Deteccion solida de comentarios para el indicador ====
    const getCommentsMeta = (week) => {
        const vm = buildCommentsVM(week);
        if (!vm) return { has: false, count: undefined };
        if (vm.mode === 'days') {
            const count = vm.items?.length ?? 0;
            return { has: count > 0, count };
        }
        // free
        const has = !!(vm.description && vm.description.trim().length > 0);
        return { has, count: undefined };
    };

    useEffect(() => {
        WeekService.findRoutineByUserId(id)
            .then(data => {
                // OJO: esto oculta las semanas con visibility === "hidden"
                const visibleWeeks = Array.isArray(data)
                    ? data.filter(w => !w?.visibility || w.visibility === 'visible')
                    : [];
                const sorted = [...visibleWeeks].sort((a, b) => getSortTime(b) - getSortTime(a));
                setRoutine(sorted);
                NotifyHelper.instantToast('Semanas cargadas con exito');
            });
    }, [id]);

    // Observer de visibilidad
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) entry.target.classList.add('in-view');
                    else entry.target.classList.remove('in-view');
                });
            },
            { threshold: 0.1 }
        );

        weekRefs.current.forEach(ref => { if (ref) observer.observe(ref); });
        return () => { weekRefs.current.forEach(ref => { if (ref) observer.unobserve(ref); }); };
    }, [routine]);

    useEffect(() => {
        UserServices.getProfileById(id)
            .then(setUserProfile)
            .catch((error) => console.error('Error al obtener el perfil del alumno:', error));
    }, [id]);

    useEffect(() => {
        refreshPaymentState();
    }, [refreshPaymentState]);

    useEffect(() => {
        const read = () => {
            const enabled = localStorage.getItem('mobileDarkMode') === 'true';
            setIsDark(enabled);
        };

        read();
        window.addEventListener('mobileDarkModeChange', read);
        window.addEventListener('resize', read);

        return () => {
            window.removeEventListener('mobileDarkModeChange', read);
            window.removeEventListener('resize', read);
        };
    }, []);

    useEffect(() => {
        const handleWindowFocus = () => {
            refreshPaymentState();
        };

        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                refreshPaymentState();
            }
        };

        window.addEventListener('focus', handleWindowFocus);
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            window.removeEventListener('focus', handleWindowFocus);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [refreshPaymentState]);

    const seeRoutine = (i) => {
        setPressedRoutine(routine[i].routine);
        setIndexRoutine(routine[i]);
        setVisibleEdit(true);
    };

    const redirectToPerfil = () => {
        setShowProfileMissingModal(false);
        navigate(`/perfil/${id}`);
    };

    const navigateToPage = (week_id, index_week) => {
        navigate(`/routine/${id}/day/0/${week_id}/${index_week}`);
    };

    // ==== abrir dialog de comentarios (usa VM) ====
    const openCommentsDialog = (week, e) => {
        if (e) {
            e.stopPropagation(); // evita navegar al clickear el icono
            e.preventDefault();
        }
        const vm = buildCommentsVM(week);
        setCommentsData(vm);
        setCommentsWeek(week);
        setVisibleComments(true);
    };

    // ==== Estilos del indicador ====
    const commentIndicatorWrap = {
        position: 'absolute',
        top: 8,
        right: 8,
        pointerEvents: 'auto',
        cursor: 'pointer',
        zIndex: 2
    };

    const commentIconBox = {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24
    };

    const badgeDot = {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 10,
        height: 10,
        backgroundColor: '#dc3545',
        borderRadius: 9999,
        border: '2px solid white'
    };

    const badgeCount = {
        position: 'absolute',
        top: -6,
        right: -6,
        minWidth: 18,
        height: 18,
        padding: '0 4px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#dc3545',
        color: '#fff',
        borderRadius: 9999,
        fontSize: '0.65rem',
        fontWeight: 700,
        lineHeight: 1,
        border: '2px solid white'
    };

    return (
        <>
            <section className='container-fluid p-0'>
                <Logo />
            </section>

            <section className={`container user-routine-page ${isDark ? 'user-routine-dark' : ''}`}>
            {puedeVerRutina ? ( <>
                <div className='transition-rigth-to-medium'>
                    <h2 className={`text-center mt-4 mb-3 ${isDark ? 'text-light' : ''}`}>Hola {username}!</h2>
                    <p className={`my-3 text-center ${isDark ? 'user-routine-subtitle-dark' : ''}`}>
                        Debajo, veras todas las semanas que tu entrenador cargo.
                    </p>
                </div>

                {userProfile && userProfile.devolucion && (
                    <div className={`card p-3 my-3 ${isDark ? 'user-routine-panel-dark border-0' : ''}`}>
                        <h5 className={`card-title ${isDark ? 'text-light' : ''}`}>Correcciones / Devolucion</h5>
                        {userProfile.devolucionFecha && (
                        <p className={isDark ? 'text-light-emphasis' : 'text-muted'}>
                            Fecha: {new Date(userProfile.devolucionFecha).toLocaleString()}
                        </p>
                        )}
                        <p className={`card-text ${isDark ? 'text-light' : ''}`} style={{ whiteSpace: 'pre-wrap' }}>
                        {userProfile.devolucion ? userProfile.devolucion : 'No se han cargado correcciones.'}
                        </p>
                    </div>
                )}

                {routine != null && (
                    <article className='row justify-content-center mb-4 mt-4'>
                        {routine.map((week, indexWeek) => {
                            const animationClass = indexWeek % 3 === 0
                                ? 'from-left'
                                : indexWeek % 3 === 1
                                ? 'from-center'
                                : 'from-right';

                            const { has, count } = getCommentsMeta(week);

                            return (
                                <div
                                    ref={el => (weekRefs.current[indexWeek] = el)}
                                    key={indexWeek}
                                    className={`col-11 stylesBoxWeeks user-routine-week-card box pt-2 pb-1 mt-2 ${animationClass} mb-4 rounded-3 position-relative`}
                                    onClick={() => navigateToPage(week._id, indexWeek)}
                                >
                                    {/* Indicador arriba-derecha: ahora cliqueable y abre dialog */}
                                    {has && (
                                        <div
                                            style={commentIndicatorWrap}
                                            title='Ver comentarios'
                                            aria-label='Ver comentarios'
                                            onClick={(e) => openCommentsDialog(week, e)}
                                        >
                                            <div style={commentIconBox} className={isDark ? 'user-routine-comment-icon-dark' : ''}>
                                                <MessageSquare size={18} />
                                                {Number.isFinite(count) && count > 0
                                                    ? <span style={badgeCount}>{count}</span>
                                                    : <span style={badgeDot} />}
                                            </div>
                                        </div>
                                    )}

                                    <div className='row'>
                                        <div className='col-1'>
                                            <CircleIcon className={`fs07em ${isDark ? 'user-routine-week-dot-dark' : 'text-primary'}`} />
                                        </div>
                                        <div className='col-11'>
                                            <p className={`m-0 ${isDark ? 'text-light' : ''}`}>{week.name}</p>
                                        </div>

                                        <div className='col-5 mt-3 mb-2'>
                                            <div className='row badgeFecha user-routine-week-badge rounded-2 py-1 m-auto'>
                                                <div className='col-3 ps-1 m-auto'><CalendarTodayIcon className={`fs08em ${isDark ? 'user-routine-week-dot-dark' : 'text-primary'}`} /></div>
                                                <div className={`col-8 ps-0 fs07em m-auto ${isDark ? 'text-light' : ''}`}>
                                                    {getWeekDateLabel(week)}
                                                </div>
                                            </div>
                                        </div>

                                        {week.block && week.block.name && (
                                            <div className='col-7 mt-3 mb-2'>
                                                <div className='row badgeFecha user-routine-week-badge rounded-2 py-1 m-auto' style={{ backgroundColor: `${week.block.color}` }}>
                                                    <div className={`col-2 ps-1 m-auto ${isDark ? 'text-light' : ''}`}><ViewStreamIcon className='fs07em' /></div>
                                                    <div className={`col-10 fs07em m-auto px-0 ${isDark ? 'text-light' : ''}`}>{week.block.name}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </article>
                )}

                </> ) : (
                    <div className={`d-flex flex-column align-items-center justify-content-center my-5 py-5 px-4 card shadow-sm ${isDark ? 'user-routine-panel-dark border-0' : 'bg-light'}`}>
                        <UserLock />
                        <h4 className="mb-3 text-danger fw-bold">Acceso restringido</h4>
                        <p className={`${isDark ? 'text-light-emphasis' : 'text-muted'} text-center`} style={{ maxWidth: '500px' }}>
                            Para poder visualizar tu rutina de entrenamiento, es necesario que tengas la mensualidad al dia.
                        </p>
                        <p className={`${isDark ? 'text-light-emphasis' : 'text-muted'} text-center`} style={{ maxWidth: '500px' }}>
                            Si crees que esto es un error, por favor <strong>contacta con tu entrenador</strong>.
                        </p>
                    </div>
                )}

                {routine && (
                    <Dialog
                        className={`${athleteDialogClass} col-12 col-md-10 col-xxl-8`}
                        contentClassName={'colorDialog'}
                        headerClassName={'colorDialog'}
                        header={indexRoutine.name}
                        visible={visibleEdit}
                        modal={false}
                        onHide={() => setVisibleEdit(false)}
                    >
                        <section>
                            <div className="table-responsive">
                                {pressedRoutine.length > 0 && pressedRoutine.map(day => (
                                    <table className="table table-bordered align-middle text-center table-md" key={day.name}>
                                        <thead>
                                            <tr>
                                                <th colSpan={8}>{day.name}</th>
                                            </tr>
                                        </thead>
                                        <thead>
                                            <tr>
                                                <th className="text-center">#</th>
                                                <th className="text-center">Nombre</th>
                                                <th className="text-center">Sets</th>
                                                <th className="text-center">Reps</th>
                                                <th className="text-center">Rest</th>
                                                <th className="text-center">Peso</th>
                                                <th className="text-center">Video</th>
                                                <th className="text-center">Notas</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {day.exercises.map(exercise => (
                                                <tr key={exercise.exercise_id}>
                                                    <td className="text-center"><b>{exercise.numberExercise}</b></td>
                                                    <td className="text-center">{exercise.name}</td>
                                                    <td className="text-center">{exercise.sets}</td>
                                                    <td className="text-center">{exercise.reps}</td>
                                                    <td className="text-center">{exercise.rest ? exercise.rest : "-"}</td>
                                                    <td className="text-center">{exercise.peso}</td>
                                                    <td className="text-center">
                                                        {exercise.video ? (
                                                            <a target='_blank' rel="noreferrer" href={exercise.video}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                                                     className="bi bi-camera-video" viewBox="0 0 16 16">
                                                                    <path fillRule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556v4.35zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2z" />
                                                                </svg>
                                                            </a>
                                                        ) : '-'}
                                                    </td>
                                                    <td className='text-center'>{exercise.notas || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ))}
                            </div>
                        </section>
                    </Dialog>
                )}

                {/* Dialog de comentarios (render distinto segun mode) */}
                <Dialog
                    className={`${athleteDialogClass} col-12 col-md-8 col-xxl-6`}
                    contentClassName={'colorDialog'}
                    headerClassName={'colorDialog'}
                    header={commentsWeek?.name ? `Comentarios - ${commentsWeek.name}` : `Comentarios`}
                    visible={visibleComments}
                    modal
                    onHide={() => setVisibleComments(false)}
                >
                    {!commentsData ? (
                        <div className={isDark ? 'text-light-emphasis' : 'text-muted'}>No hay comentarios cargados.</div>
                    ) : commentsData.mode === 'free' ? (
                        <div className={`border rounded-3 p-3 ${isDark ? 'user-routine-panel-dark border-secondary-subtle' : 'bg-light'}`}>
                            {commentsData.title && <h6 className={`mb-2 ${isDark ? 'text-light' : ''}`}>{commentsData.title}</h6>}
                            {commentsData.description ? (
                                <p className={`mb-0 ${isDark ? 'text-light' : ''}`} style={{ whiteSpace: 'pre-wrap' }}>
                                    {commentsData.description}
                                </p>
                            ) : (
                                <span className={isDark ? 'text-light-emphasis' : 'text-muted'}>Sin contenido.</span>
                            )}
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-3">
                            <h6 className={`mb-2 ${isDark ? 'text-light' : ''}`}>{commentsData.title || 'Comentarios por dia'}</h6>
                            {Array.isArray(commentsData.items) && commentsData.items.length > 0 ? (
                                commentsData.items.map((it) => (
                                    <div key={it.dayId} className={`border rounded-3 p-3 ${isDark ? 'user-routine-panel-dark border-secondary-subtle' : 'bg-light'}`}>
                                        <div className={`fw-semibold mb-2 ${isDark ? 'text-light' : ''}`}>{it.label || 'Dia'}</div>
                                        {it.text ? (
                                            <p className={`mb-0 ${isDark ? 'text-light' : ''}`} style={{ whiteSpace: 'pre-wrap' }}>
                                                {it.text}
                                            </p>
                                        ) : (
                                            <span className={isDark ? 'text-light-emphasis' : 'text-muted'}>Sin contenido.</span>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <span className={isDark ? 'text-light-emphasis' : 'text-muted'}>No hay comentarios por dia cargados.</span>
                            )}
                        </div>
                    )}
                </Dialog>

                <Dialog
                    className={athleteDialogClass}
                    header={'Completa tu perfil'}
                    visible={showProfileMissingModal}
                    style={{ width: '90vw' }}
                    modal
                    onHide={() => setShowProfileMissingModal(false)}
                    footer={
                        <div className="row justify-content-center mt-2">
                            <div className="col-6 text-center">
                                <Button label="Mas tarde" onClick={() => setShowProfileMissingModal(false)} className="p-button-secondary text-light " />
                            </div>
                            <div className="col-6 text-center">
                                <Button label="Ir al perfil " onClick={redirectToPerfil} className="p-button-primary text-light " />
                            </div>
                        </div>
                    }
                >
                    <p>Hola {username}!, por favor completa tu perfil, asi tu entrenador tiene tu informacion.</p>
                </Dialog>
            </section>
        </>
    );
}

export default UserRoutinePage;
