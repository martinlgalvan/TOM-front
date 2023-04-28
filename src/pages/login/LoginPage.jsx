import {useState} from 'react'
import * as authService from '../../services/auth.services.js'
import Logo from '../../components/Logo.jsx'

function LoginPage({onLogin}){
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState()

    function onSubmit(event){
        event.preventDefault()
        authService.login(email, password)
        .then(({user, token}) =>{
            onLogin(user, token)
        })
        /*.catch(err =>{
            setError(err.message)
        })*/

    }

    function onChangeEmail(event){
        setEmail(event.target.value)
    }

    function onChangePassword(event){
        setPassword(event.target.value)
    }

    return (
        <main className='container-fluid'>
            <Logo />
            <h2 className='text-center my-5'>Iniciar Sesión</h2>
            
            {error && 
            <div className="alert alert-danger text-center p-0" role="alert">
                <p className='p-2 m-0'>{error}</p>
            </div>
            }
            <section className='row justify-content-center'>
                <form className='col-10 col-md-3' onSubmit={onSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input type="email" className="form-control" onChange={onChangeEmail} value={email} id="email" placeholder="name@example.com"/>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="passw" className="form-label">Contraseña</label>
                        <input type="password" className="form-control" onChange={onChangePassword} id="passw" rows="3"/> 
                    </div>
                    <div className='d-flex justify-content-center mb-4'>
                        <button className='btn BlackBGtextWhite' onSubmit={onSubmit}>Ingresar</button>
                    </div>
                </form>
            </section> 
        </main>)           
}


export default LoginPage
