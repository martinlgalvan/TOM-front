import React, { useEffect, useState } from 'react';

import * as NotifyHelper from './../helpers/notify.js';

import { Button } from 'primereact/button';
import { Slider } from 'primereact/slider';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { useMediaQuery } from 'react-responsive';


import * as UserServices from './../services/users.services.js';
import * as RefreshFunction from './../helpers/generateUUID.js';

const AddUserProfile = ({ user_id }) => {
    const [selectedDay, setSelectedDay] = useState('Lunes');
    const [details, setDetails] = useState({});
    const [bodyWeight, setBodyWeight] = useState(null);
    const [summary, setSummary] = useState('');
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState();
    
    let idRefresh = RefreshFunction.generateUUID();

    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    const handleDayToggle = (day) => {
        setSelectedDay(day);
    };

    useEffect(() => {
        setLoading(true);
        UserServices.getProfileById(user_id)
            .then((data) => {
                if (data) {
                    setDetails(data.details || {});
                    setBodyWeight(data.bodyWeight || 0);
                    setSummary(data.summary || '');
                    setLoading(false);
                    NotifyHelper.updateToast();
                }
            })
            .catch((error) => {
                console.error('Error fetching profile data:', error);
            });
    }, [status]);

    const handleFieldChange = (day, field, value) => {
        setDetails((prevDetails) => ({
            ...prevDetails,
            [day]: {
                ...prevDetails[day],
                [field]: value
            }
        }));
        setIsEditing(true);
    };

    const handleResetAll = () => {
        const resetDetails = {};
        days.forEach(day => {
            resetDetails[day] = {
                fatigueLevel: 0,
                sleepHours: 0,
                domsLevel: 0,
                neatLevel: null,
                stressLevel: null,
                nutrition: null
            };
        });
        setDetails(resetDetails);
    };

    const handleSubmit = () => {
        const userDetails = {
            selectedDay,
            details,
            bodyWeight,
            summary
        };
        UserServices.editProfile(user_id, userDetails)
            .then((data) => {
                setIsEditing(false);
                setStatus(idRefresh);
                NotifyHelper.instantToast("Perfil actualizado con éxito!")
            })
            .catch((error) => {
                console.error('Error updating profile:', error);
            });
    };

    const renderDayFields = (day) => {
        const dayDetails = details[day] || {};

        const options = [
            { label: 'Muy malo', value: 1 },
            { label: 'Malo', value: 2 },
            { label: 'Regular', value: 3 },
            { label: 'Bien', value: 4 },
            { label: 'Muy bien', value: 5 }
        ];

        return (
            <div className='container-fluid'>
                <div className='row justify-content-center'>
                    <button className='btn BlackBGtextWhite' onClick={handleResetAll}>Resetear datos <span className='d-block spanLow'>(No se eliminan)</span></button>
                </div>
                <div key={day} className="row justify-content-center text-center">
                    <div className="col-10 text-center p-2">
                        <label className='mb-2' htmlFor={`${day}-fatigueLevel`}>Fatiga <span className='ms-2'>{dayDetails.fatigueLevel || 0}</span></label>
                        <Slider
                            id={`${day}-fatigueLevel`}
                            value={dayDetails.fatigueLevel || 0}
                            onChange={(e) => handleFieldChange(day, 'fatigueLevel', e.value)}
                            min={1}
                            max={10}
                        />
                    </div>
                    <div className="col-10 text-center p-2">
                        <label className='mb-2' htmlFor={`${day}-sleepHours`}>Horas de Sueño <span className='ms-1'>{dayDetails.sleepHours || 0}</span></label>
                        <Slider
                            id={`${day}-sleepHours`}
                            value={dayDetails.sleepHours || 0}
                            onChange={(e) => handleFieldChange(day, 'sleepHours', e.value)}
                            min={0}
                            max={12}
                            step={0.5}
                        />
                    </div>
                    <div className="col-10 text-center p-2">
                        <label className='mb-2' htmlFor={`${day}-domsLevel`}>DOMS <span className='ms-2'>{dayDetails.domsLevel || 0}</span></label>
                        <Slider
                            id={`${day}-domsLevel`}
                            value={dayDetails.domsLevel || 0}
                            onChange={(e) => handleFieldChange(day, 'domsLevel', e.value)}
                            min={1}
                            max={10}
                        />
                    </div>
                    <div className="col-10 text-center p-2">
                        <label className='d-block' htmlFor={`${day}-neatLevel`}>NEAT</label>
                        <Dropdown
                            id={`${day}-neatLevel`}
                            value={dayDetails.neatLevel}
                            options={options}
                            className='w-100'
                            onChange={(e) => handleFieldChange(day, 'neatLevel', e.value)}
                            placeholder="Seleccionar"
                        />
                    </div>
                    <div className="col-10 text-center p-2">
                        <label className='d-block' htmlFor={`${day}-stressLevel`}>Estrés</label>
                        <Dropdown
                            id={`${day}-stressLevel`}
                            value={dayDetails.stressLevel}
                            options={options}
                            className='w-100'
                            onChange={(e) => handleFieldChange(day, 'stressLevel', e.value)}
                            placeholder="Seleccionar"
                        />
                    </div>
                    <div className="col-10 text-center p-2">
                        <label className='d-block' htmlFor={`${day}-nutrition`}>Alimentación</label>
                        <Dropdown
                            id={`${day}-nutrition`}
                            value={dayDetails.nutrition}
                            options={options}
                            className='w-100'
                            onChange={(e) => handleFieldChange(day, 'nutrition', e.value)}
                            placeholder="Seleccionar "
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className='row justify-content-center'>
            <div className="col-4 px-0">
                <div className="row flex-column text-start m-0 h-100">
                    {days.map((day) => (
                        <div key={day} className="row m-0 mb-2 justify-content-start flex-grow-1">
                            <button
                                className={selectedDay === day ? 'btn btn-dark w-100 h-100' : 'btn btn-outline-dark w-100 h-100'}
                                onClick={() => handleDayToggle(day)}
                            >
                                {day}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="col-8">
                {selectedDay && (
                    <div>
                        {renderDayFields(selectedDay)}
                    </div>
                )}
            </div>

            <div className="col-10 text-center my-3">
                <label className='d-block mb-2' htmlFor="bodyWeight">Peso Corporal</label>
                <InputNumber
                    id="bodyWeight"
                    value={bodyWeight}
                    onValueChange={(e) => {
                        setBodyWeight(e.value);
                        setIsEditing(true);
                    }}
                    suffix="kg"
                    mode="decimal"
                    min={0}
                />
            </div>
            <div className="col-10 text-center my-3">
                <label className='d-block mb-2' htmlFor="summary">Resumen Semanal</label>
                <InputTextarea
                    id="summary"
                    value={summary}
                    onChange={(e) => {
                        setSummary(e.target.value);
                        setIsEditing(true);
                    }}
                    rows={5}
                    cols={30}
                />
            </div>

            {isEditing && (
                <div className="floating-button">
                    <button className="btn colorRed p-4 my-3 fs-5" onClick={handleSubmit}>Confirmar</button>
                    <button className="btn colorCancel p-4 my-3 fs-5" onClick={() => setIsEditing(false)}>Cancelar</button>
                </div>
            )}


        </div>
    );
};

export default AddUserProfile;
