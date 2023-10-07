import {useState, useEffect} from 'react'

import TOM from './../assets/img/TOM.png';
import JESUSOLIVA from './../assets/img/Jesusoliva.png';
import POWERHOUSE from './../assets/img/Powerhouse.png';


function Logo(){

    const [urlPath, setUrlPath] = useState()

    useEffect(() => {
        let urlActual = `/src/assets/img/${localStorage.getItem('logo')}`


        if (urlActual == JESUSOLIVA) { 
            setUrlPath(JESUSOLIVA)
        } else if (urlActual == POWERHOUSE) { 
            setUrlPath(POWERHOUSE)
        } else{
            setUrlPath(TOM)
        }
    
    
    }, [])



    return (
        <div className='row justify-content-center align-items-center y-2'>
            <h1 className="visually-hidden">TOM</h1>
            <img className="img-fluid Largo text-center my-5 pt-5 pb-3" src={urlPath} alt="TOM" />
        </div>
    )
}

export default Logo