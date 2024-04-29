import {useState, useEffect} from 'react'

import TOM from '/src/assets/img/TOM.png';
import JESUSOLIVA from '/src/assets/img/jesus-logo.jpeg';
import POWERHOUSE from '/src/assets/img/Powerhouse.png';
import RAMABELTRAME from '/src/assets/img/RB.png';
import CAMILABENEITEZ from '/src/assets/img/camila-beneitez.png';
import MATHIAS_RAGO from '/src/assets/img/mathias-logo.png';
import GERONIMO_BISANZIO from '/src/assets/img/geronimo-logo.jpeg';
import JEREMIAS_OLMEDO from '/src/assets/img/jeremias-olmedo.jpeg';
import MATIAS_VILLALBA from '/src/assets/img/matias-logo.jpeg';


function Logo(){

    const [urlPath, setUrlPath] = useState()
    let id = localStorage.getItem('_id')

   useEffect(() => {

    if(localStorage.getItem('email') == "camibeneitez.fitness@gmail.com" || localStorage.getItem('entrenador_id') == "6604700535d4ec9f70bc4abf"){
        setUrlPath(CAMILABENEITEZ)
    } else if(localStorage.getItem('email') == "jesusoliva@gmail.com" || localStorage.getItem('entrenador_id') == "648c06a7c3ce34126657a924"){
        setUrlPath(JESUSOLIVA)
    } else if(localStorage.getItem('email') == "mathiasrago7@gmail.com" || localStorage.getItem('entrenador_id') == "66066ff46310dcb00ee20717"){
        setUrlPath(MATHIAS_RAGO)
    } else if(localStorage.getItem('email') == "bisabisanzio@gmail.com" || localStorage.getItem('entrenador_id') == "660df0889e33d1815acf9506"){
        setUrlPath(GERONIMO_BISANZIO)
    } else if(localStorage.getItem('email') == "jeremiasolmedo6@gmail.com" || localStorage.getItem('entrenador_id') == "660680376310dcb00ee20719"){
        setUrlPath(JEREMIAS_OLMEDO)
    } else if(localStorage.getItem('email') == "matuch_27@hotmail.com" || localStorage.getItem('entrenador_id') == "66156628e97c68ef705f451f"){
        setUrlPath(MATIAS_VILLALBA)

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