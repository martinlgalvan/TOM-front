import { useState,useRef, useEffect } from "react";

import * as RandomizerColumns from "../../services/randomizerColumn.services.js";
import * as PARService from "../../services/par.services.js";
import * as NotifyHelper from './../../helpers/notify.js'
import Options from './../../assets/json/options.json';

import { Dropdown } from 'primereact/dropdown';
import { generateMongoDBObjectId } from "../../helpers/generateUUID.js";
import { Tooltip } from 'primereact/tooltip';


function CellsPage({ onUpdateRoutine, onRefreshCells }) {

  const user_id = localStorage.getItem("_id")
  const [columns, setColumns] = useState()
  const [tableData, setTableData] = useState([
    { type: 'exercise',numberExercise: 1, nombre: '', sets: '', reps: '', peso: '', rest: '', video: '', notas: '' },
  ]);


  const [dayCount, setDayCount] = useState(0);
  const [routine, setRoutine] = useState();
  const [PAR, setPAR] = useState();
  const [namePAR, setNamePAR] = useState();
  const [loading, setLoading] = useState()

  const [showTooltip, setShowTooltip] = useState(false);
  const [denied, setDenied] = useState(false);

  const [options, setOptions] = useState()   
  
  
  const [color, setColor] = useState(localStorage.getItem('color'))
  const [textColor, setColorButton] = useState(localStorage.getItem('textColor'))


  useEffect(() => {
    NotifyHelper.notifyA("Cargando...")
    const groupedOptions = Options.reduce((acc, group) => {
      acc.push({ label: group.label, value: group.value, disabled: null });
      acc.push(...group.items);
      return acc;
  }, [])
  
  setOptions(groupedOptions)                 
    RandomizerColumns.getColumns(user_id)
      .then(data => {
        setColumns(data)
        NotifyHelper.updateToast()

        
      })

}, [loading]);

useEffect(() => {
  NotifyHelper.notifyA("Carganddsdso...")
  PARService.getPAR(user_id)
    .then(data => { 
      setPAR(data)
      NotifyHelper.updateToast()
    })

}, [loading]);

function onChangeName(event){
  setNamePAR(event.target.value);
  if (event.target.value.trim() === "") { // Verifica si el valor está vacío o solo contiene espacios en blanco
    setDenied(false);
  } else {
    setDenied(true);
  }
}



  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    const newTableData = [...tableData];
    newTableData[index][name] = value;

    setTableData(newTableData);
  };

  const handleSelectChange = (index, event) => {
    const { value } = event.target.options[event.target.selectedIndex];
    const newTableData = [...tableData];
    newTableData[index]['numberExercise'] = value;
  
    setTableData(newTableData);
  };

  
  const handleDropdownChange = (index, selectedOption) => {
    const { name } = selectedOption;
    const newTableData = [...tableData];
    newTableData[index]['nombre'] = name;
  
    setTableData(newTableData);
  };

  const addRow = () => {
    setTableData([...tableData, { type: 'exercise', numberExercise: tableData.length + 1, nombre: '', sets: '', peso: '', reps: '', rest: '', video: '', notas: '' }]);
  };

  const createProgress = (name2) => {
    const newProgress = tableData.map((row, index) => {
      const sets = isNaN(row.sets) || row.sets == '' ? row.sets : parseInt(row.sets);
      const reps = isNaN(row.reps) || row.reps == '' ? row.reps : parseInt(row.reps);
      const video = row.video == '' ? '' :  row.video;

      return {
        type: 'exercise',
        mainName: row.nombre,
        numberExercise: row.numberExercise,
        sets,
        reps,
        peso: row.peso,
        rest: row.rest,
        video,
        notas: row.notas,
        exercise_id: generateMongoDBObjectId(),
      };
    });
  
    const progressObject = {
      name: `Día ${dayCount + 1}`,
      _id: generateMongoDBObjectId(),
      exercises: newProgress,
    };
  
    // Actualizar el estado con el nuevo objeto
    setRoutine((prevRoutine) => {
      return { name: `${name2}`, routine: [...(prevRoutine?.routine || []), progressObject] };
    });
  
    setDayCount((prevCount) => prevCount + 1);
    onUpdateRoutine((prevRoutine) => {
      return { name: `${name2}`, routine: [...(prevRoutine?.routine || []), progressObject] };
    });
    // Restaurar valores de tableData a su estado inicial
    setTableData([
      { type: 'exercise', numberExercise: 1, nombre: '', sets: '', reps: '', peso: '', rest: '', video: '', notas: '' },
    ]);

  };
  
  
  
  //  CHEQUEAR PORQUE NO ANDA CUANDO LE PONGO EL INPUT

  
  

  const SaveRoutine = () => {
    setLoading(true)
    PARService.createPAR(routine, user_id)
      .then(data => {
        
        onRefreshCells(true)
      })
  
  };



  return (
<>
      <h2>Planificador</h2>

      <article className="row justify-content-center">

        <div className="table-responsive col-10">

          <table className="table table-bordered text-center ">
            <thead>
              <tr className="">
                <td colSpan={8} className="text-center colorTdPAR">
                <div className="mb-4">
                        <label htmlFor="name" className="form-label">Nombre del protocolo</label>
                        <input type="name" className="form-control" onChange={onChangeName} defaultValue={namePAR} id="name" placeholder="Nombre del protocolo"/>
                    </div>
                </td>
              </tr>
            </thead>
            <thead>
              <tr>
                <th className="tableRandomizer-num">#</th>
                <th className="tableRandomizer-exercise">Ejercicio</th>
                <th className="tableRandomizer-sets">Series</th>
                <th className="tableRandomizer-reps">Reps</th>
                <th className="tableRandomizer-peso">Peso</th>
                <th className="tableRandomizer-rest">Descanso</th>
                <th className="tableRandomizer-notes">Notas</th>
              </tr>
            </thead>

            <tbody>
            {tableData.map((row, index) => (
                <tr key={index}>

                  <td className='' >
                                        
                      <Dropdown 
                          value={row.numberExercise} 
                          options={options} 
                          onChange={(e) => {changeModifiedData(i,e.target.value, 'numberExercise')}}
                          placeholder="Select an item"
                          optionLabel="label"
                          className="p-dropdown-group w-100"
                      />
     
                  </td>

                  <td className="">
                    <Dropdown
                      value={columns && columns.find((column) => column.name === row.nombre)}
                      options={columns}
                      optionLabel="name"
                      placeholder="Selecciona una columna"
                      onChange={(e) => handleDropdownChange(index, e.value)}
                      className="w-100 dropDown"
                      filter
                      scrollHeight={"360px"}
                      filterPlaceholder={"Columna"}
                      emptyFilterMessage={"No se encontró ningun ejercicio"}
                      emptyMessage={"No se encontró ningun ejercicio"}
                    />
                  </td>
                  
   
                  <td className="tableRandomizer-sets"> <input type="text"  name="sets"  className="border-0 h-100 text-center" value={row.sets} onChange={(e) => handleInputChange(index, e)} /></td>
                  <td className="tableRandomizer-reps"> <input type="text" name="reps" className="border-0 h-100 text-center" value={row.reps} onChange={(e) => handleInputChange(index, e)} /></td>
                  <td className="tableRandomizer-reps"> <input type="text" name="peso" className="border-0 h-100 text-center" value={row.peso} onChange={(e) => handleInputChange(index, e)} /></td>
                  <td className="tableRandomizer-reps"> <input type="text" name="rest" className="border-0 h-100 text-center" value={row.rest} onChange={(e) => handleInputChange(index, e)} /></td>
                  <td className="tableRandomizer-notes"><input type="text" name="notas" className="border-0  h-100 text-center" value={row.notas} onChange={(e) => handleInputChange(index, e)} /></td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>

      </article>

      <article className="row justify-content-center mt-4">

        <div className="custom-target-icon">
          <button disabled={!denied} className={`col-6 col-lg-3 btn ${textColor == 'false' ? "bbb" : "blackColor"} `} style={{ "backgroundColor": `${color}` }} onClick={addRow} >
            Agregar Fila
          </button>
        </div>

        <div className="mt-2 custom-target-icon">
            <button disabled={!denied}  className={` col-6 col-lg-3 btn ${textColor == 'false' ? "bbb" : "blackColor"}  m-2`} style={{ "backgroundColor": `${color}` }} onClick={() => createProgress(namePAR)}>
              Añadir día
            </button>
        </div>

        <div className="col-5 mt-2">
          {!denied && 
            <Tooltip 
              target=".custom-target-icon"
              position="right"
              mouseTrack
              mouseTrackLeft={5}
              mouseTrackTop={5}
              onHide={() => setShowTooltip(false)}
              className="largoTooltip p-0 m-0"
              >
              Ingresa un nombre para el protocolo!
            </Tooltip>}
            <div className="custom-target-icon ">

            <button 
            disabled={!denied} 
            className={`btn ${textColor == 'false' ? "bbb" : "blackColor"} w-100`} 
            style={{ "backgroundColor": `${color}` }}
            onClick={SaveRoutine}
            >
              Crear {namePAR && namePAR}
            </button>
              
            </div>
        </div>




      </article>
      </>
  );
}

export default CellsPage;