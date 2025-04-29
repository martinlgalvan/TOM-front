import React, {useState, useEffect} from 'react'

import BackgroundLogo from '/src/assets/img/backgroundLogo.png'

import TOM from '/src/assets/img/TOM.png';
import JESUSOLIVA from '/src/assets/img/jesus-logo.jpeg';
import POWERHOUSE from '/src/assets/img/Powerhouse.png';
import RAMABELTRAME from '/src/assets/img/RB.png';
import ARIELBRUNO from '/src/assets/img/ariel-logo.png';
import MATHIAS_RAGO from '/src/assets/img/mathias-logo.png';
import GERONIMO_BISANZIO from '/src/assets/img/geronimo-logo.jpeg';
import JEREMIAS_OLMEDO from '/src/assets/img/jeremias-olmedo.jpeg';
import MATIAS_VILLALBA from '/src/assets/img/matias-logo.jpeg';
import TORETTO_GYM from '/src/assets/img/mauri-logo.png';
import PITBULL from '/src/assets/img/pitbull-logo.png';

function LogoChico({isHomePage}){

    const [urlPath, setUrlPath] = useState()
    let id = localStorage.getItem('_id')

   useEffect(() => {

    if(localStorage.getItem('email') == "arielbruno97@gmail.com" || localStorage.getItem('entrenador_id') == "663b122634b3af9cafacb80c"){
        setUrlPath(ARIELBRUNO)
    } else if(localStorage.getItem('email') == "jesusoliva@gmail.com" || localStorage.getItem('entrenador_id') == "648c06a7c3ce34126657a924"){
        setUrlPath(JESUSOLIVA)
    } else if(localStorage.getItem('email') == "mathiasrago7@gmail.com" || localStorage.getItem('entrenador_id') == "66066ff46310dcb00ee20717"){
        setUrlPath(MATHIAS_RAGO)
    } else if(localStorage.getItem('email') == "bisabisanzio@gmail.com" || localStorage.getItem('entrenador_id') == "660df0889e33d1815acf9506"){
        setUrlPath(GERONIMO_BISANZIO)
    } else if(localStorage.getItem('email') == "jeremiasolmedo6@gmail.com" || localStorage.getItem('entrenador_id') == "660680376310dcb00ee20719"){
        setUrlPath(JEREMIAS_OLMEDO)
    } else if(localStorage.getItem('email') == "matuch_27@hotmail.com" || localStorage.getItem('entrenador_id') == "66156628e97c68ef705f451f"){
        setUrlPath(MATIAS_VILLALBA)}
        else if(localStorage.getItem('email') == "alexisdalessandrod@gmail.com" || localStorage.getItem('entrenador_id') == "67f84082c3514ac86837bddf"){
            setUrlPath(PITBULL)}
    else if(localStorage.getItem('email') == "mauricioarraztoa@gmail.com" || localStorage.getItem('entrenador_id') == "672d05cd7fa16a4779fe6135"){
        setUrlPath(TORETTO_GYM)
    
    } else{
        setUrlPath(TOM)
    }
    
    }, [])



    return (
        <>
        {urlPath === TOM ?
        <div className='row justify-content-center LargoLogo align-items-center '>
            <h1 className="visually-hidden">TOM</h1>
            <img className="img-fluid LargoLogoChico text-center my-5 pt-3 pb-3 bg-white rounded-3" src={urlPath} alt="TOM" />
        </div> :
        <div className='row justify-content-center LargoLogo align-items-center '>
            <h1 className="visually-hidden">TOM</h1>
            <img className="img-fluid LargoLogoChico text-center my-5 pt-3 pb-3" src={urlPath} alt="TOM" />
        </div>}
     

</>
    )
}

export default LogoChico