import {useState} from 'react'
import * as WeekService from '../services/week.services.js'


import {useParams} from 'react-router-dom'


function NewDay(){
    const {id} = useParams()
    const [name, setName] = useState("")

    const [color, setColor] = useState(localStorage.getItem('color'))
    const [textColor, setColorButton] = useState(localStorage.getItem('textColor'))
    
    function changeName(e){
        setName(e.target.value)
    }

    function onSubmit(){
        WeekService.createWeek({name}, id)
    }

    return (

            <form onSubmit={onSubmit}>
                <div className="input-group mb-5">
                <label htmlFor="name" className="visually-hidden ">Nombre del día</label>
                    <input type="text" className="form-control" id="name" name="name"  onChange={changeName} value={name} placeholder="Día 1" />
                    <button className={`input-group-text btn ${textColor == 'false' ? "bbb" : "blackColor"}`} `} style={{ "backgroundColor": `${color}` }}>Crear día</button>
                </div>
            </form>

    )
}

export default NewDay