import { useEffect, useState} from 'react'
import * as UsersService from '../../services/users.services.js'
import * as addColorToUserService from '../../services/addColorsToUser.services..js'
import * as Notify from '../../helpers/notify.js'

import {useParams} from 'react-router-dom'
import { ColorPicker } from 'primereact/colorpicker';
import { useColor } from './../Context/ColorContext.jsx';

import { InputSwitch } from "primereact/inputswitch";
import { ToastContainer } from './../../helpers/notify.js';


function AddColorToUser(){

    const id = localStorage.getItem("_id")
    const { changeColor } = useColor();
    const { changeTextColor } = useColor();
    const { color } = useColor();
    const { textColor } = useColor();
    const [colorText, setColorText] = useState();
    useEffect(() =>{
        if(textColor == true){
            setColorText(true)
        } else{
            setColorText(false)
        }
    },[])

    const handleColorChange = (e) => {
      const newColor = e.target.value;

      changeColor(newColor);
    };

    const handleTextColorChange = (e) => {
        setColorText(e)
        changeTextColor(e)
      };
    

    function colorUpdate(){

        Notify.notifyA("Cambiando colores...")

        addColorToUserService.changeColor(id, color, textColor)
            .then((data) => {
                localStorage.setItem('color', color)
                localStorage.setItem('textColor', textColor)

                Notify.updateToast()
            })
    }
    return (
        <div className='row justify-content-center text-center'>
            <div className="card  rounded-0 m-0">
                
                <div className="card-body">
                    <h2 className='card-title'>Elegir color</h2>

                            <ul className="list-group list-group-flush">
                                <li className="list-group-item ">
                                    <label htmlFor="name2" className="form-label">Código HEX (#000000)</label>
                                    <input type="text" className="form-control my-1 rounded-0 text-center" id="name2" name="name2" value={color} onChange={handleColorChange}/>
                                </li>


                            </ul>

                </div>



                <div className='row justify-content-center'>

                    <div className='col-10 col-lg-5 mb-3'>
                        <label className='mb-3' htmlFor="">Editar color</label>
                        <div className='text-center'>
                            <input type="color" className="btn colorPicker" id="exampleColorInput" defaultValue={color} onChange={(e) => handleColorChange(e)} title="Choose your color"></input>

                        </div>
                    </div>

                    <div className='col-10 col-lg-5 mb-3'>
                        <p className='mb-4'>
                            Así se verán los botones
                        </p>

                        <button className={`btn ${textColor == false ? "bbb" : "blackColor"}`} style={{ "backgroundColor": `${color}` }}>Botón de prueba</button>
                    </div>

                        <div className='col-10 col-lg-12  mb-3'>
                            <label className='mb-3' htmlFor="">Texto ( Negro / Blanco )</label>
                            <div className='text-center'>
                                <InputSwitch className='' checked={colorText} onChange={(e) => handleTextColorChange(e.value)} />

                            </div>
                        </div>

                        <div className='mb-3'>
                            <button className={`btn ${textColor == false ? "bbb" : "blackColor"}`} style={{ "backgroundColor": `${color}` }}  onClick={() => colorUpdate()}>Confirmar cambios</button>

                        </div>
                    </div>

                </div>
 

                <ToastContainer
                    position="bottom-center"
                    autoClose={200}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                    />


            </div>

               

    )
}

export default AddColorToUser