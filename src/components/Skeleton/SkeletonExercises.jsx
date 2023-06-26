import React, { useEffect, useState } from 'react';
import { Skeleton } from 'primereact/skeleton';

const SkeletonExercises = () => {


  useEffect(() => {
    console.log(window.innerWidth)
  },[])

  return (
  <tr className='dd'>
      <td className="skeleton skeletonNumber tdNumber TableResponsiveDayEditDetailsPage">
        <Skeleton shape="rectangle " width='100%' height={`${window.innerWidth > 992 ? '60px' : '95px'}`} />
      </td>
      <td className="skeleton skeletonName tdName">
        <Skeleton shape="rectangle" width="100%" height={`${window.innerWidth > 992 ? '60px' : '95px'}`} />
      </td>
      <td className="skeleton tdSets">
        <Skeleton shape="rectangle" width="100%" height={`${window.innerWidth > 992 ? '60px' : '95px'}`} />
      </td>
      <td className="skeleton tdReps">
        <Skeleton shape="rectangle" width="100%" height={`${window.innerWidth > 992 ? '60px' : '95px'}`} />
      </td>
      <td className="skeleton TableResponsiveDayEditDetailsPage tdPeso">
        <Skeleton shape="rectangle" width="100%" height={`${window.innerWidth > 992 ? '60px' : '95px'}`} />
      </td>
      <td className="skeleton TableResponsiveDayEditDetailsPage tdVideo">
        <Skeleton shape="rectangle" width="100%" height={`${window.innerWidth > 992 ? '60px' : '95px'}`} />
      </td>
      <td className="skeleton skeletonNotas TableResponsiveDayEditDetailsPage tdNotas">
        <Skeleton shape="rectangle" width="100%" height={`${window.innerWidth > 992 ? '60px' : '95px'}`} />
      </td>
      <td className="skeleton skeletonActions tdActions">
        <Skeleton shape="rectangle" width="100%" height={`${window.innerWidth > 992 ? '60px' : '95px'}`} />
      </td>

  </tr>
  );
};
export default SkeletonExercises;
