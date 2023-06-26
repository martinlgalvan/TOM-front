import React from 'react';
import { Skeleton } from 'primereact/skeleton';

const SkeletonExercises = () => {
  return (
  <tr className='dd'>
      <td className="skeleton skeletonNumber">
        <Skeleton shape="rectangle " width='100%' height="60px" />
      </td>
      <td className="skeleton skeletonName">
        <Skeleton shape="rectangle" width="100%" height="60px" />
      </td>
      <td className="skeleton">
        <Skeleton shape="rectangle" width="100%" height="60px" />
      </td>
      <td className="skeleton">
        <Skeleton shape="rectangle" width="100%" height="60px" />
      </td>
      <td className="skeleton">
        <Skeleton shape="rectangle" width="100%" height="60px" />
      </td>
      <td className="skeleton">
        <Skeleton shape="rectangle" width="100%" height="60px" />
      </td>
      <td className="skeleton skeletonNotas">
        <Skeleton shape="rectangle" width="100%" height="60px" />
      </td>
      <td className="skeleton skeletonActions">
        <Skeleton shape="rectangle" width="100%" height="60px" />
      </td>

  </tr>
  );
};
export default SkeletonExercises;
