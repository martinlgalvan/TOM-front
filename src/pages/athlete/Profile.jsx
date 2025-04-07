import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';

import Logo from '../../components/Logo.jsx';
import * as UserServices from './../../services/users.services.js';
import * as NotifyHelper from './../../helpers/notify.js';

function Profile() {
    const { id } = useParams();
    const username = localStorage.getItem('name');

    const [formData, setFormData] = useState({
        edad: '',
        peso: '',
        altura: '',
        ocupacion: '',
        dias_entrenamiento: 1,
        modalidad: 'presencial',
        resumen_semanal: ''
    });

    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const modalidades = [
        { label: 'Presencial', value: 'presencial' },
        { label: 'Online', value: 'online' }
    ];

    const diasOptions = Array.from({ length: 7 }, (_, i) => ({
        label: `${i + 1} días`,
        value: i + 1
    }));

    const handleChange = (e, name) => {
        const value = e.target ? e.target.value : e;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = () => {
        const userDetails = {
            edad: formData.edad,
            peso: formData.peso,
            altura: formData.altura,
            ocupacion: formData.ocupacion,
            dias_entrenamiento: formData.dias_entrenamiento,
            modalidad: formData.modalidad,
            resumen_semanal: formData.resumen_semanal
        };

        setLoading(true);

        UserServices.editProfile(id, userDetails)
            .then(() => {
                setSuccess(true);
                NotifyHelper.instantToast("Perfil actualizado con éxito!");
            })
            .catch((error) => {
                console.error('Error al actualizar el perfil:', error);
                NotifyHelper.instantToast("Error al actualizar el perfil. Intentá de nuevo.");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        setLoading(true);
        UserServices.getProfileById(id)
            .then((data) => {
                if (data) {
                    setFormData({
                        edad: data.edad || '',
                        peso: data.peso || '',
                        altura: data.altura || '',
                        ocupacion: data.ocupacion || '',
                        dias_entrenamiento: data.dias_entrenamiento || 1,
                        modalidad: data.modalidad || 'presencial',
                        resumen_semanal: data.resumen_semanal || ''
                    });
                }
                NotifyHelper.updateToast();
            })
            .catch((error) => {
                console.error('Error al cargar datos del perfil:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <>
            <div className="container-fluid p-0">
                <Logo/>
            </div>

            <section className="container-fluid">
                <div className="row justify-content-center mt-3">
                    <h2 className="text-center">Bienvenido a tu perfil {username}!</h2>
                    <p className="text-center my-4">
                        A continuación, podés cargar tu información personal.
                    </p>

                    {loading ? (
                        <div className="text-center my-5">
                            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                            <p>Cargando perfil...</p>
                        </div>
                    ) : (
                        <div className="col-12 col-md-8 col-lg-6">
                            <div className="form-group mb-3">
                                <label>Edad</label>
                                <InputText
                                    value={formData.edad}
                                    onChange={(e) => handleChange(e, 'edad')}
                                    className="w-100"
                                    keyfilter="int"
                                />
                            </div>

                            <div className="form-group mb-3">
                                <label>Peso (kg)</label>
                                <InputText
                                    value={formData.peso}
                                    onChange={(e) => handleChange(e, 'peso')}
                                    className="w-100"
                                    keyfilter="int"
                                />
                            </div>

                            <div className="form-group mb-3">
                                <label>Altura (cm)</label>
                                <InputText
                                    value={formData.altura}
                                    onChange={(e) => handleChange(e, 'altura')}
                                    className="w-100"
                                    keyfilter="int"
                                />
                            </div>

                            <div className="form-group mb-3">
                                <label>Modalidad</label>
                                <Dropdown
                                    value={formData.modalidad}
                                    options={modalidades}
                                    onChange={(e) => handleChange(e, 'modalidad')}
                                    className="w-100"
                                />
                            </div>


                            <Button
                                label={loading ? 'Guardando...' : 'Guardar'}
                                onClick={handleSubmit}
                                className="w-100 p-button-primary text-light"
                                disabled={loading}
                            />

                            {success && (
                                <div className="alert alert-success text-center mt-3">
                                    ¡Datos guardados correctamente!
                                </div>
                            )}

                         
                        </div>
                    )}
                </div>

                <Dialog
                    header={`Preguntas Frecuentes`}
                    visible={visible}
                    style={{ width: '90vw' }}
                    modal
                    onHide={() => setVisible(false)}
                >
                    <div>
                        <div>
                            <h3>¿Qué es la fatiga?</h3>
                            <p>Es la sensación de cansancio, determinada por la disminución del rendimiento deportivo.</p>
                        </div>
                        <div>
                            <h3>¿Qué es el NEAT?</h3>
                            <p>Es el gasto energético que resulta de todas las acciones cotidianas no deportivas que requieren esfuerzo físico.</p>
                        </div>
                        <div>
                            <h3>¿Qué son los DOMS?</h3>
                            <p>Son molestias musculares que aparecen aproximadamente 24 hs después de entrenar.</p>
                        </div>
                        <div>
                            <h3>¿Qué es el estrés?</h3>
                            <p>Es una reacción física o emocional a una demanda. Cada persona lo vive diferente.</p>
                        </div>
                        <div>
                            <h3>¿Qué es la alimentación?</h3>
                            <p>Es la calidad del alimento que ingerís para entrenar mejor y alcanzar tus objetivos.</p>
                        </div>
                    </div>
                </Dialog>
            </section>
        </>
    );
}

export default Profile;
