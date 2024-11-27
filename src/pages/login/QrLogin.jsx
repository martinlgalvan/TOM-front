import React, { useEffect, useState } from 'react';
import { loginWithQR } from '../../services/loginWithQR.js'; // Ajusta el path según tu estructura
import { useNavigate } from 'react-router-dom';

export default function QrLogin({ onLogin }) {
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Extrae el token de la URL
        const queryParams = new URLSearchParams(window.location.search);
        const token = queryParams.get('token');

        if (!token) {
            setError('Token no encontrado en el QR.');
            navigate('/'); // Redirige al home si no hay token
            return;
        }

        // Valida el token usando el servicio
        loginWithQR(token)
            .then(({ jwt, user }) => {
                // Llama a la función onLogin para registrar la sesión
                onLogin(user, jwt);

                // Redirige al usuario según su rol
                if (user.role === 'common') {
                    navigate(`/routine/${user._id}`);
                } else if (user.role === 'admin') {
                    navigate(`/users/${user._id}`);
                }
            })
            .catch((err) => {
                console.error('Error al iniciar sesión:', err.message);
                setError('Error al iniciar sesión. Intenta nuevamente.');
                navigate('/'); // Redirige al home en caso de error
            });
    }, [navigate, onLogin]);

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return <p>Procesando tu inicio de sesión...</p>;
}
