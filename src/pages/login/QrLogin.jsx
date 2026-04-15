import React, { useEffect, useState } from 'react';
import { loginWithQR } from '../../services/loginWithQR.js';
import { useNavigate } from 'react-router-dom';

export default function QrLogin({ onLogin }) {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const qrToken = queryParams.get('token');

    if (!qrToken) {
      setError('Token no encontrado en el QR.');
      navigate('/');
      return;
    }

    loginWithQR(qrToken)
      .then(({ token, user }) => {
        // ✅ Ahora calza con tu onLogin del App (guarda token en localStorage)
        onLogin(user, token);

        if (user.role === 'common') {
          navigate(`/routine/${user._id}`);
        } else if (user.role === 'admin') {
          navigate(`/users/${user._id}`);
        } else {
          navigate(`/`);
        }
      })
      .catch((err) => {
        console.error('Error al iniciar sesion:', err?.message || err);
        setError('Error al iniciar sesion. Intenta nuevamente.');
        navigate('/');
      });
  }, [navigate, onLogin]);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  return <p>Procesando tu inicio de sesion...</p>;
}
