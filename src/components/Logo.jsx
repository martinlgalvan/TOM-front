import {useState, useEffect} from 'react'

import TOM from '/src/assets/img/TOM.png';
import JESUSOLIVA from '/src/assets/img/Jesusoliva.png';
import POWERHOUSE from '/src/assets/img/Powerhouse.png';

import * as UsersService from '../services/users.services.js';

function Logo(){
    let id = localStorage.getItem('_id')
    useEffect(() => {
 
            UsersService.find(id)
                .then(data => {
                    console.log(data)
                })
       

    }, [status]) 

    const [urlPath, setUrlPath] = useState()
    const [a, setA] = useState(JESUSOLIVA)
    let urlActual = `/src/assets/img/${localStorage.getItem('logo')}`
    useEffect(() => {
        //let urlActual = `/src/assets/img/${localStorage.getItem('logo')}`




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