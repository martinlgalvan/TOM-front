import { useState } from 'react'
import * as authService from '../../services/auth.services.js'
import * as userService from '../../services/users.services.js'
import Logo from '../../components/Logo.jsx'
import { useNavigate } from 'react-router-dom'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

function LoginPage({ onLogin }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState()
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()
    
    // Settings for colors
    const [color, setColor] = useState(localStorage.getItem('color'))
    const [textColor, setTextColor] = useState(localStorage.getItem('textColor'))
    
    function onSubmit(event) {
        event.preventDefault()
        authService.login(email, password)
            .then(({ user, token }) => {
                onLogin(user, token)
                if(user.role ===  'common'){
                    navigate(`/routine/${user._id}`)
                } else if(user.role === 'admin'){
                    navigate(`/users/${user._id}`)
                }
            })
            .catch(err => {
                setError(err.message)
            })
    }

    return (
        <>
        <div className='container-fluid p-0'>
            <Logo />
        </div>
        <main className='container-fluid'>
            <div className="my-5 d-flex flex-column justify-content-center align-items-center py-3">
                <div className="card p-4 shadow-lg" style={{ width: '100%', maxWidth: '400px', border: 'none' }}>
                    <h2 className="text-center mb-4" style={{ fontWeight: 600 }}>Iniciar Sesión</h2>
                    
                    {error && 
                        <div className="alert alert-danger text-center" role="alert">
                            {error}
                        </div>
                    }

                    <form onSubmit={onSubmit}>
                        <div className="form-group mb-4">
                            <label htmlFor="email" className="form-label" style={{ fontWeight: 500 }}>Correo electrónico</label>
                            <input 
                                type="email" 
                                className="form-control form-control-lg" 
                                onChange={(e) => setEmail(e.target.value)} 
                                value={email} 
                                id="email" 
                                placeholder="correo@ejemplo.com" 
                                style={{ borderRadius: '10px', padding: '10px' }}
                            />
                        </div>

                        <div className="form-group mb-4 position-relative">
                            <label htmlFor="password" className="form-label" style={{ fontWeight: 500 }}>Contraseña</label>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                className="form-control form-control-lg" 
                                onChange={(e) => setPassword(e.target.value)} 
                                value={password} 
                                id="password" 
                                placeholder="********" 
                                style={{ borderRadius: '10px', padding: '10px' }}
                            />
                            <button 
                                type="button" 
                                className="btn position-absolute end-0 top-0 marginEye me-3" 
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ background: 'none', border: 'none', outline: 'none' }}
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </button>
                        </div>

                        <div className="d-grid">
                            <button 
                                type="submit" 
                                className="btn btn-lg" 
                                style={{
                                    backgroundColor: color || '#1a1a1a', 
                                    color: textColor === 'false' || !textColor ? '#fff' : textColor, 
                                    fontWeight: 500,
                                    borderRadius: '10px',
                                    padding: '12px'
                                }}
                            >
                                Ingresar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
        </>
    )
}

export default LoginPage
