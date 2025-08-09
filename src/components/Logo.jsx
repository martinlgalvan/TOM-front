import {useState, useEffect} from 'react'

import BackgroundLogo from '/src/assets/img/backgroundLogo.png'

import TOM from '/src/assets/img/TOM.png';
import JESUSOLIVA from '/src/assets/img/Jesusoliva-old.png';
import POWERHOUSE from '/src/assets/img/Powerhouse.png';
import RAMABELTRAME from '/src/assets/img/RB.png';
import ARIELBRUNO from '/src/assets/img/ariel-logo.png';
import MATHIAS_RAGO from '/src/assets/img/mathias-logo.png';
import GERONIMO_BISANZIO from '/src/assets/img/geronimo-logo.jpeg';
import JEREMIAS_OLMEDO from '/src/assets/img/jeremias-olmedo.jpeg';
import MATIAS_VILLALBA from '/src/assets/img/matias-logo.jpeg';
import MATIAS_VILLALBA_PERSONAL from '/src/assets/img/Matias_villalba_personal.png';
import TORETTO_GYM from '/src/assets/img/mauri-logo.png';
import PITBULL from '/src/assets/img/pitbull-logo.png';
import CRISTIAN_QUIROGA from '/src/assets/img/cristian-logo.png';
import FRANCO from '/src/assets/img/Franco.jpeg';
import SOL from '/src/assets/img/SvStrong.jpeg';
import MARTIN_CASANOVA from '/src/assets/img/MartinCasanova.png';
import MACARENA from '/src/assets/img/Macarena.png';
import LEO_BURGIO from '/src/assets/img/Leo_burgio.png';
import VALU_MARCHE from '/src/assets/img/Valu_marche.png';
import AGUSTIN_ARENAS from '/src/assets/img/Agustin_arenas.png';

function Logo({isHomePage}){

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
        setUrlPath(MATIAS_VILLALBA)
    } else if(localStorage.getItem('email') == "matiasvill83@gmail.com" || localStorage.getItem('entrenador_id') == "65285e48af829c334f96e695"){
            setUrlPath(MATIAS_VILLALBA_PERSONAL)
    } else if(localStorage.getItem('email') == "alexisdalessandrod@gmail.com" || localStorage.getItem('entrenador_id') == "67f84082c3514ac86837bddf"){
        setUrlPath(PITBULL)}
    else if(localStorage.getItem('email') == "mauricioarraztoa@gmail.com" || localStorage.getItem('entrenador_id') == "672d05cd7fa16a4779fe6135"){
        setUrlPath(TORETTO_GYM)
    } else if(localStorage.getItem('email') == "cristian_quiroga_08@hotmail.com" || localStorage.getItem('entrenador_id') == "6813162770c9257968a79fe0"){
        setUrlPath(CRISTIAN_QUIROGA)
    } else if(localStorage.getItem('email') == "beltrameramiro@gmail.com" || localStorage.getItem('entrenador_id') == "685372d397535c64dfc56d71"){
        setUrlPath(RAMABELTRAME)
    }else if(localStorage.getItem('email') == "Francogonzalez.trainer@gmail.com" || localStorage.getItem('entrenador_id') == "686162e2dbfbe24db072ca57"){
        setUrlPath(FRANCO)
    }else if(localStorage.getItem('email') == "Svstrong.training@gmail.com" || localStorage.getItem('entrenador_id') == "6861636cdbfbe24db072ca58"){
        setUrlPath(SOL)
    }else if(localStorage.getItem('email') == "martincasanova2001-trainer@gmail.com" || localStorage.getItem('entrenador_id') == "686976ccd5788ade7ad998bf"){
        setUrlPath(MARTIN_CASANOVA)
    } else if(localStorage.getItem('email') == "Macarena.entrenadora@gmail.com" || localStorage.getItem('entrenador_id') == "6862c3af1d409eaa2904b82a"){
        setUrlPath(MACARENA)
    }else if(localStorage.getItem('email') == "Leoburgio98@gmail.com" || localStorage.getItem('entrenador_id') == "68817363470317ec333efe3d"){
        setUrlPath(LEO_BURGIO )
    } else if(localStorage.getItem('email') == "marchesoti465@est.derecho.uba.ar" || localStorage.getItem('entrenador_id') == "666dd193caf84a7b159941d2"){
        setUrlPath(VALU_MARCHE )
    }else if(localStorage.getItem('email') == "Agu.arenaspf@gmail.com" || localStorage.getItem('entrenador_id') == "6887d82d7e742d5bca1eada6"){
        setUrlPath(AGUSTIN_ARENAS)
    }else{
        setUrlPath(TOM)
    }
    
    }, [])



    return (
        <>
        {urlPath == TOM && isHomePage == true ? 
            <div className={`row justify-content-center align-items-center position-relative divPrincipal marginNavBar`} >
                <h1 className="visually-hidden">TOM</h1>
                
                {/* Imagen de fondo */}
                <img className="background-logo position-absolute w-100 h-100" src={BackgroundLogo} alt="TOM" />
                
                {/* Imagen centrada con fondo blanco y opacidad */}
                <div className="image-container position-relative d-flex justify-content-center align-items-center">
                    <img className="img-fluid centered-img" src={urlPath} alt="TOM" />
                </div>
            </div>
        
            :
            <div className={`row justify-content-center  align-items-center y-2`}>
            <h1 className="visually-hidden">TOM</h1>
            <img className="img-fluid Largo text-center my-5 pt-3 pb-3" src={urlPath} alt="TOM" />
        </div>
        }

</>
    )
}

export default Logo