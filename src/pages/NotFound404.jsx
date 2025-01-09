import { Link } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
const name = localStorage.getItem('name')

function NotFound404() {
  return (

  <>
    <div className="container-fluid p-0 ">
      <Logo />
    </div>
    <div className='container-fluid'>

    
    <div className='row justify-content-center text-center mt-5 mb-3'>
      <div className='col-6'>
        <h2>Página no encontrada / se movió de lugar.</h2>
        <p>Por favor, volvé al inicio</p>

        <Link to={'/'} className='btn btn-warning' >Volver al inicio</Link>
      </div>

    </div>

  </div>
  </>


  )
}


export default NotFound404