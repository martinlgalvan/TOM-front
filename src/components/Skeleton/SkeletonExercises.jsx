import React, { useState } from 'react';
import { Skeleton } from 'primereact/skeleton';

const SkeletonExercises = () => {

  console.log(window.innerWidth)

 

  return (
  <tr className='dd'>
      <td className="skeleton skeletonNumber TableResponsiveDayEditDetailsPage">
        <Skeleton shape="rectangle " width='100%' height="95px" />
      </td>
      <td className="skeleton skeletonName">
        <Skeleton shape="rectangle" width="100%" height="95px" />
      </td>
      <td className="skeleton">
        <Skeleton shape="rectangle" width="100%" height="95px" />
      </td>
      <td className="skeleton">
        <Skeleton shape="rectangle" width="100%" height="95px" />
      </td>
      <td className="skeleton TableResponsiveDayEditDetailsPage">
        <Skeleton shape="rectangle" width="100%" height="95px" />
      </td>
      <td className="skeleton TableResponsiveDayEditDetailsPage">
        <Skeleton shape="rectangle" width="100%" height="95px" />
      </td>
      <td className="skeleton skeletonNotas TableResponsiveDayEditDetailsPage">
        <Skeleton shape="rectangle" width="100%" height="95px" />
      </td>
      <td className="skeleton skeletonActions">
        <Skeleton shape="rectangle" width="100%" height="95px" />
      </td>

  </tr>
  );
};
export default SkeletonExercises;
