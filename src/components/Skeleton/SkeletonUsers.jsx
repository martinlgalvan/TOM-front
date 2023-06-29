import React, { useEffect, useState } from 'react';
import { Skeleton } from 'primereact/skeleton';

const SkeletonUsers = () => {


  useEffect(() => {
    console.log(window.innerWidth)
  },[])

  return (
  <tr className='dd'>
      <td className="skeleton skeletonNumber">
        <Skeleton shape="rectangle " width='100%' height={`${window.innerWidth > 992 ? '60px' : '95px'}`} />
      </td>
      <td className="skeleton skeletonName tdName TableResponsiveDayEditDetailsPage">
        <Skeleton shape="rectangle" width="100%" height={`${window.innerWidth > 992 ? '60px' : '95px'}`} />
      </td>
      <td className="skeleton">
        <Skeleton shape="rectangle" width="100%" height={`${window.innerWidth > 992 ? '60px' : '95px'}`} />
      </td>
  </tr>
  );
};
export default SkeletonUsers;
