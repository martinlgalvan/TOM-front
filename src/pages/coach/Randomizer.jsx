import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import * as NotifyHelper from './../../helpers/notify.js';
import * as UserService from '../../services/users.services.js';
import * as PARService from '../../services/par.services.js';
import Options from '../../assets/json/options.json';
import Exercises from '../../assets/json/NEW_EXERCISES.json';
import CustomInputNumber from '../../components/CustomInputNumber.jsx';
import { Dropdown } from 'primereact/dropdown';
import { AutoComplete } from 'primereact/autocomplete';
import { InputTextarea } from "primereact/inputtextarea";
import { OverlayPanel } from 'primereact/overlaypanel';
import { Modal, Button } from 'react-bootstrap';
import IconButton from '@mui/material/IconButton';
import YouTubeIcon from '@mui/icons-material/YouTube';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ObjectId from 'bson-objectid';

const App = () => {
    const [nombreSemana, setNombreSemana] = useState('Semana 1');
    const [dias, setDias] = useState([{ id: new ObjectId().toString(), ejercicios: [{ id: new ObjectId().toString(), numberExercise: 1, name: '', reps: 1, sets: 1, peso: '', rest: '', video: '', notas: '' }] }]);
    const [showModal, setShowModal] = useState(false);
    const [diaAEliminar, setDiaAEliminar] = useState(null);
    const [options, setOptions] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);
    const [loading, setLoading] = useState(false);
    const productRefs = useRef([]);
    const user_id = localStorage.getItem("_id");
    const [actualUser, setActualUser] = useState(null);
    const [users, setUsers] = useState([]);

    const inputRefs = useRef({});

    useEffect(() => {
        const groupedOptions = Options.reduce((acc, group) => {
            acc.push({ label: group.label, value: group.value, disabled: null });
            acc.push(...group.items);
            return acc;
        }, []);

        setOptions(groupedOptions);
    }, []);

    useEffect(() => {
        setFilteredCities(Exercises);
    }, []);

    useEffect(() => {
        NotifyHelper.notifyA("Cargando...");
        UserService.find(user_id).then(data => {
            setUsers(data);
            NotifyHelper.updateToast();
        });
    }, [user_id]);

    const handleDropdownChange = useCallback((selectedOption) => {
        setActualUser(selectedOption);
    }, []);

    const agregarDia = useCallback(() => {
        setDias(prevDias => [
            ...prevDias,
            {
                id: new ObjectId().toString(),
                ejercicios: [{ id: new ObjectId().toString(), numberExercise: 1, name: '', reps: 1, sets: 1, peso: '', rest: '', video: '', notas: '' }]
            }
        ]);
    }, []);

    const confirmarEliminarDia = useCallback((id) => {
        setDiaAEliminar(id);
        setShowModal(true);
    }, []);

    const eliminarDia = useCallback(() => {
        setDias(prevDias => prevDias.filter(dia => dia.id !== diaAEliminar));
        setShowModal(false);
    }, [diaAEliminar]);

    const agregarEjercicio = useCallback((diaId) => {
        setDias(prevDias => prevDias.map(dia =>
            dia.id === diaId
                ? {
                    ...dia,
                    ejercicios: [
                        ...dia.ejercicios,
                        {
                            id: new ObjectId().toString(),
                            numberExercise: dia.ejercicios.length + 1,
                            name: '', reps: 1, sets: 1, peso: '', rest: '', video: '', notas: ''
                        }
                    ]
                }
                : dia
        ));
    }, []);

    const eliminarEjercicio = useCallback((diaId, ejercicioId) => {
        setDias(prevDias => prevDias.map(dia =>
            dia.id === diaId
                ? { ...dia, ejercicios: dia.ejercicios.filter(ejercicio => ejercicio.id !== ejercicioId) }
                : dia
        ));
    }, []);

    const actualizarEjercicio = useCallback((diaId, ejercicioId, campo, valor) => {
        setDias(prevDias => {
            const newDias = [...prevDias];
            const diaIndex = newDias.findIndex(dia => dia.id === diaId);
            const ejercicioIndex = newDias[diaIndex].ejercicios.findIndex(ej => ej.id === ejercicioId);
            newDias[diaIndex].ejercicios[ejercicioIndex] = {
                ...newDias[diaIndex].ejercicios[ejercicioIndex],
                [campo]: valor
            };
            return newDias;
        });
    }, []);

    const search = useCallback((event) => {
        let query = event.query.toLowerCase();
        let _filteredCities = [];

        for (let country of filteredCities) {
            let filteredItems = country.items.filter((item) => item.label.toLowerCase().indexOf(query) !== -1);

            if (filteredItems && filteredItems.length) {
                _filteredCities.push({ ...country, items: filteredItems });
            }
        }

        setFilteredCities(_filteredCities);
    }, [filteredCities]);

    const groupedItemTemplate = (item) => {
        return (
            <div className="flex align-items-center autocompleteStyles">
                <img
                    alt={item.label}
                    src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png"
                    style={{ width: '18px' }}
                />
                <div>{item.label}</div>
            </div>
        );
    };

    const designWeekToUser = useCallback(() => {
        setLoading(true);
        PARService.createPARroutine(dias, actualUser._id)
            .then(() => {
                NotifyHelper.updateToast('PAR creado con éxito');
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [dias, actualUser]);



    const handleSave = () => {
        const updatedDias = dias.map(dia => ({
            ...dia,
            ejercicios: dia.ejercicios.map(ejercicio => ({
                ...ejercicio,
                name: inputRefs.current[`${dia.id}-${ejercicio.id}-name`]?.value || '',
                reps: inputRefs.current[`${dia.id}-${ejercicio.id}-reps`]?.value || 1,
                sets: inputRefs.current[`${dia.id}-${ejercicio.id}-sets`]?.value || 1,
                peso: inputRefs.current[`${dia.id}-${ejercicio.id}-peso`]?.value || '',
                rest: inputRefs.current[`${dia.id}-${ejercicio.id}-rest`]?.value || '',
                video: inputRefs.current[`${dia.id}-${ejercicio.id}-video`]?.value || '',
                notas: inputRefs.current[`${dia.id}-${ejercicio.id}-notas`]?.value || ''
            }))
        }));

        setDias(updatedDias);
    };


    const actualizarDropdown = (diaId, ejercicioId, value) => {
        setDias(prevDias =>
            prevDias.map(dia =>
                dia.id === diaId
                    ? {
                        ...dia,
                        ejercicios: dia.ejercicios.map(ejercicio =>
                            ejercicio.id === ejercicioId ? { ...ejercicio, numberExercise: value } : ejercicio
                        )
                    }
                    : dia
            )
        );
    };

    const actualizarAutoComplete = (diaId, ejercicioId, value) => {
        setDias(prevDias =>
            prevDias.map(dia =>
                dia.id === diaId
                    ? {
                        ...dia,
                        ejercicios: dia.ejercicios.map(ejercicio =>
                            ejercicio.id === ejercicioId ? { ...ejercicio, name: value } : ejercicio
                        )
                    }
                    : dia
            )
        );
    };
    

    return (
        <div className="container-fluid mt-5">

            <div className="row justify-content-center text-center mb-3">

                <div className="col-10 col-lg-8 text-center">

                    <h2>Rutinas pre-personalizadas</h2>

                    <p className='mt-3'>Bienvenido/a a tus <b>rutinas</b>.</p>
                    <p>Acá podes armar tanto las bases de tus rutinas, como una rutina completa, para copiarla a cualquiera de tus alumnos.</p>

                </div>

            </div>

            <div className="row justify-content-center text-center">
                <div className="col-4">
                    <label htmlFor="nombreSemana">Nombre de la Semana</label>
                    <input
                        type="text"
                        className="form-control"
                        id="nombreSemana"
                        value={nombreSemana}
                        onChange={(e) => setNombreSemana(e.target.value)}
                        placeholder="Nombre de la Semana"
                    />
                </div>
                <div className="col-9">
                    <button className="btn btn-primary my-4" onClick={agregarDia}>Añadir Día</button>
                </div>
            </div>

            {dias.map(dia => (
                <div key={dia.id} className="card mb-3 mx-4 card-shadow">
                    <div className="card-body">
                        <h5>Día {dia.id}</h5>
                        <table className="table table-sm text-center">
                            <thead>
                                <tr>
                                    <th className='w-small'>#</th>
                                    <th>Nombre</th>
                                    <th className='w-small'>Reps</th>
                                    <th className='w-small'>Sets</th>
                                    <th className='w-small'>Peso</th>
                                    <th className='w-small'>Rest</th>
                                    <th>Video</th>
                                    <th>Notas</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dia.ejercicios.map((ejercicio, index) => (
                                    <tr key={ejercicio.id}>
                                        <td>
                                            <Dropdown
                                                value={ejercicio.numberExercise}
                                                options={options}
                                                onChange={(e) => actualizarDropdown(dia.id, ejercicio.id, e.value)}
                                                placeholder="Select an item"
                                                optionLabel="label"
                                                className="p-dropdown-group w-100"
                                            />
                                        </td>
                                        <td>
                                            <AutoComplete
                                                value={ejercicio.name}
                                                onChange={(e) => actualizarAutoComplete(dia.id, ejercicio.id, e.value)}
                                                suggestions={filteredCities}
                                                completeMethod={search}
                                                field="label"
                                                    optionGroupLabel="label"
                                                    optionGroupChildren="items"
                                                    optionGroupTemplate={groupedItemTemplate}
                                                    placeholder="Sentadilla..."
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                defaultValue={ejercicio.reps}
                                                ref={el => inputRefs.current[`${dia.id}-${ejercicio.id}-reps`] = el}
                                                className="form-control"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                defaultValue={ejercicio.sets}
                                                ref={el => inputRefs.current[`${dia.id}-${ejercicio.id}-sets`] = el}
                                                className="form-control"
                                            />
                                        </td>
                                        <td>
                                        <CustomInputNumber
                                                    initialValue={ejercicio.sets}
                                                    ref={el => inputRefs.current[`${dia.id}-${ejercicio.id}-peso`] = el}
                                                />

                                        </td>
                                        <td>
                                        <CustomInputNumber
                                                    initialValue={ejercicio.reps}
                                                    ref={el => inputRefs.current[`${dia.id}-${ejercicio.id}-rest`] = el}
                                                    isRep={true}
                                                />

                                        </td>
                                        <td>
                                            <IconButton
                                                aria-label="video"
                                                className="w-100"
                                                onClick={(e) => {
                                                    productRefs.current[index].toggle(e);
                                                }}
                                            >
                                                <YouTubeIcon className='colorIconYoutube' />
                                            </IconButton>
                                            <OverlayPanel ref={(el) => (productRefs.current[index] = el)}>
                                                <input
                                                    className='form-control ellipsis-input text-center'
                                                    type="text"
                                                    ref={el => inputRefs.current[`${dia.id}-${ejercicio.id}-video`] = el}
                                                    defaultValue={ejercicio.video}
                                                    onChange={(e) => actualizarEjercicio(dia.id, ejercicio.id, 'video', e.target.value)}
                                                />
                                            </OverlayPanel>
                                        </td>
                                        <td>
                                            <textarea
                                                className="form-control"
                                                defaultValue={ejercicio.notas}
                                                ref={el => inputRefs.current[`${dia.id}-${ejercicio.id}-notas`] = el}
                                            />
                                        </td>
                                        <td>
                                            <button className="btn btn-danger" onClick={() => {/* lógica para eliminar el ejercicio */ }}>Eliminar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button className="btn btn-secondary" onClick={() => agregarEjercicio(dia.id)}>Añadir Ejercicio</button>
                    </div>
                </div>
            ))}

            <div className='row justify-content-center'>

                <div className='col-6 text-center'>
                <button className="btn btn-primary" onClick={handleSave}>Guardar Rutina</button>

                </div>

            </div>
            {/* Modal para confirmar eliminación de día */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>¿Estás seguro que deseas eliminar este día?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
                    <Button variant="danger" onClick={eliminarDia}>Eliminar Día</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default App;
