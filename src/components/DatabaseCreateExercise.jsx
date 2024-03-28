import { useEffect, useState} from 'react'
import * as DatabaseExercises from '../services/jsonExercises.services.js'

import {useParams} from 'react-router-dom'


function DatabaseCreateExercise({refresh}){

    const {id} = useParams()
    const [name, setName] = useState("")
    const [video, setVideo] = useState("")
    const [error, setError] = useState()
    
    const [color, setColor] = useState(localStorage.getItem('color'))
    const [textColor, setColorButton] = useState(localStorage.getItem('textColor'))
    
    function generateUUID() {
        let d = new Date().getTime();
        let uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }

    let idRefresh = generateUUID()
    
    function changeName(e){
        setName(e.target.value)
    }

    function changeVideo(e){
        setVideo(e.target.value)
    }



    function createExercise(){
        DatabaseExercises.createExercise(id, {name, video})
            .then((data) => {
                refresh(idRefresh)
            })
            .catch(err =>{
                setError(err.message)
            })
    }

    const [anchoPagina, setAnchoPagina] = useState(window.innerWidth);

    useEffect(() => {
      const actualizarAnchoPagina = () => {
        setAnchoPagina(window.innerWidth);
      };
  
      // Actualizar el ancho de la página cuando se monte el componente
      actualizarAnchoPagina();
  
      // Actualizar el ancho de la página cuando se redimensione la ventana
      window.onresize = actualizarAnchoPagina;
      // Limpiar el event handler cuando se desmonte el componente
      return () => {
        window.onresize = null;
      };
    }, []);

    return (
        <>
                        
        {error && 
        <div className="alert alert-danger text-center p-0" role="alert">
            <p className='p-2 m-0'>{error}</p>
        </div>
        }

        {anchoPagina > 992 ?
        <>
        <th> <input type="text" className="form-control rounded-0" placeholder='Peso muerto' onChange={changeName} /> </th>
        <th> <input type="text" className="form-control rounded-0" placeholder='https://xxxxxxxxx.com' onChange={changeVideo}/> </th>
        <th> <button type='submit' className={`btn ${textColor == 'false' ? "bbb" : "blackColor"} rounded-0 w-100`} style={{ "backgroundColor": `${color}` }} onClick={createExercise}>Añadir ejercicio</button> </th>
        </>:

        <th colSpan={3}> 
            <input type="text" className="form-control rounded-0 mb-2" placeholder='Peso muerto' onChange={changeName} />
            <input type="text" className="form-control rounded-0 mb-2" placeholder='https://xxxxxxxxx.com' onChange={changeVideo}/>
            <button type='submit' className={`btn ${textColor == 'false' ? "bbb" : "blackColor"} rounded-0 w-100`} onClick={createExercise} style={{ "backgroundColor": `${color}` }}>Añadir ejercicio</button>
        </th>}

 </>
               

    )
}

export default DatabaseCreateExercise