import {useState, useEffect} from 'react'

import TOM from './../assets/img/TOM.png';
import JESUSOLIVA from './../assets/img/Jesusoliva.png';
import POWERHOUSE from './../assets/img/Powerhouse.png';


function Logo(){

    let urlActual = `/src/assets/img/${localStorage.getItem('logo')}`
    let urlPath = TOM


    if (urlActual == TOM )             { urlPath = TOM } 
    else if (urlActual == JESUSOLIVA) { urlPath = JESUSOLIVA } 
    else if (urlActual == POWERHOUSE) { urlPath = POWERHOUSE } 


    return (
        <div className='row justify-content-center align-items-center y-2'>
            <h1 className="d-none">TOM</h1>
            <img className="img-fluid Largo text-center my-5 pt-5 pb-3" src={urlPath} alt="TOM" />
        </div>
    )
}

export default Logo