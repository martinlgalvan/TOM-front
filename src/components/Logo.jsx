import {useState, useEffect} from 'react'

import TOM from '/src/assets/img/TOM.png';
import JESUSOLIVA from '/src/assets/img/Jesusoliva.png';
import POWERHOUSE from '/src/assets/img/Powerhouse.png';
import RAMABELTRAME from '/src/assets/img/RB.png';

function Logo(){

    const [urlPath, setUrlPath] = useState()
    let id = localStorage.getItem('_id')
    const [a, setA] = useState(JESUSOLIVA)
    let urlActual = `/src/assets/img/${localStorage.getItem('logo')}`

   useEffect(() => {



    if(localStorage.getItem('email') == "ramabeltrame18@gmail.com" || localStorage.getItem('entrenador_id') == "6524635228c05be658aef93c"){
        setUrlPath(RAMABELTRAME)
    } else if(localStorage.getItem('email') == "hola@gmail.com" || localStorage.getItem('entrenador_id') == "63e7f02b3649482a65953d5c"){
        setUrlPath(JESUSOLIVA)
    } else{
        setUrlPath(TOM)
    }
    
    }, [])


    return (
        <div className='row justify-content-center align-items-center y-2'>
            <h1 className="visually-hidden">TOM</h1>
            <img className="img-fluid Largo text-center my-5 pt-3 pb-3" src={urlPath} alt="TOM" />
        </div>
    )
}

export default Logo