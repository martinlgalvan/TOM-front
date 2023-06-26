import { useState } from "react";
import * as ExercisesServices from "../services/exercises.services.js";
import * as JsonExercises from "../services/jsonExercises.services.js";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

import { InputNumber } from 'primereact/inputnumber';
import { AutoComplete } from "primereact/autocomplete";

function Formulas({refresh}) {

  const [status,setStatus] = useState()

  const [scientist,setScientist] = useState("Lander")

  const [formuleKilos,setFormuleKilos] = useState()
  const [formuleReps,setFormuleReps] = useState(1)

  const [formuleResult, setFormuleResult] = useState()
  const [result, setResult] = useState()

  let rmFinal

  function changeScientist(e) {
    setScientist(e.target.value);
  }
  
  function changeFormuleKilos(e) {
    setFormuleKilos(e.target.value);
    setStatus(status + 1)
  }

  function changeFormuleReps(e) {

    setFormuleReps(e.target.value);
  }

  const lander = (peso,reps) =>{
    let rmReps = 101.3 - (2.67123 * reps);
    let rmPeso = (100 * peso) / rmReps;

    //let repsFinal = Math.round(rmReps)
     rmFinal = Math.round(rmPeso)
     return rmFinal
}

  const brzycki = (peso,reps) => {
      let rmReps = 102.78 - (2.78 * reps);
      let rmPeso = (100 * peso) / rmReps;

      let rmFinal = Math.round(rmPeso)
      return rmFinal
  }

  const oconnor = (peso,reps) => {

    let rmPeso = 0.025*(peso*reps) + parseInt(peso);
    let rmReps = (peso * 100) / rmPeso;

    let rmFinal = Math.round(rmPeso)
    return rmFinal
  }

  const epley = (peso,reps) => {
    let rmPeso = (peso*0.033*reps) + parseInt(peso)
    let rmReps = (peso * 100) / rmPeso;
        
    let rmFinal = Math.round(rmPeso)
    return rmFinal
  }


useEffect(() => {
  if(scientist == "Lander"){
    let result = lander(formuleKilos,formuleReps)
    let parsedResult = parseInt(result)

    setFormuleResult(parsedResult)
  }
  if(scientist == "Brzycki"){
    let result = brzycki(formuleKilos,formuleReps)
    let parsedResult = parseInt(result)

    setFormuleResult(parsedResult)
  }
  if(scientist == "O'Connor"){
    let result = oconnor(formuleKilos, formuleReps)
    let parsedResult = parseInt(result)

    setFormuleResult(parsedResult)
  }
  if(scientist == "Epley"){
    let result = epley(formuleKilos, formuleReps)
    let parsedResult = parseInt(result)

    setFormuleResult(parsedResult)
  }


},[formuleKilos,formuleReps,scientist])




  const options =[{value: 1, name:"Lander"},{value: 2, name:"Brzycki"},{value: 3, name:"O'Connor"},{value: 4, name:"Epley"}]

  const optionsReps =[
    {value:"1.1", number: 1},
    {value:"1.2", number: 2},
    {value:"1.3", number: 3},
    {value:"1.4", number: 4},
    {value:"1.5", number: 5},
    {value:"1.6", number: 6},
    {value:"1.7", number: 7},
    {value:"1.8", number: 8},
    {value:"1.9", number: 9},
    {value:"1.10", number: 10},
    {value:"1.11", number: 11},
    {value:"1.12", number: 12},
    {value:"1.13", number: 13},
    {value:"1.14", number: 14},
    {value:"1.15", number: 15},
  ]


  return (
    <section className="row justify-content-center">
      <article className="col-10 col-lg-6 border-bottom pb-3">

          <h2 className="text-center mt-3 mb-5">Formulas</h2>

          <div className="col-12 col-md-6 text-center mb-2">

          <select defaultValue={options[0].name} name="" id="formule" onChange={changeScientist}>
              {options.map(formule => 
                <option key={formule.name} >{formule.name}</option>
              )}
            </select>

          <div className="row g-3">
            <div className="col-sm-7">
              <input className="form-control"  onChange={changeFormuleKilos}  />
            </div>

            <div className="col-sm">

              <select defaultValue={optionsReps[0].number} name="" id="formule" onChange={changeFormuleReps}>
                {optionsReps.map(formule => 
                  <option key={formule.value} value={formule.number}>{formule.number}</option>
                )}
              </select>   
                       
              </div>

          </div>
          </div>
                
          <div className="col-12 col-md-6 text-center mb-2">
            <label htmlFor="formule" className="form-label visually-hidden">
              Formulas
            </label>
           
          </div>

          <div className="col-10 col-xl-4 col-sm-12 my-2 text-center">
            <label htmlFor="peso" className="form-label d-block">
              Kilos
            </label>
              
          </div>

          <div className="col-12 col-md-10 my-2 text-center border">
            <span className="">{formuleResult > 0 && formuleResult}</span>
          </div>

      </article>
    </section>
  );
}

export default Formulas;
