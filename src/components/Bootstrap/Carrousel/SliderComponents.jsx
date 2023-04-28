import Carousel from 'react-bootstrap/Carousel';
import AddExercise from '../../AddExercise';
import AddCircuit from '../../AddCircuit';
import { useState } from 'react';

function SliderComponents({refreshToDad}) {

  const [status, setStatus] = useState()
  
  const refresh = (refresh) => {
    setStatus(refresh)
    refreshToDad(refresh)
}
  return (
    <Carousel slide={false} fade variant="dark" interval={null} indicators={false}>

      <Carousel.Item>
        <AddExercise refresh={refresh}/>
      </Carousel.Item>

      <Carousel.Item>
        <AddCircuit refresh={refresh} />
      </Carousel.Item>

    </Carousel>
  );
}

export default SliderComponents;