import React from 'react';
import { Skeleton } from 'primereact/skeleton';

const SkeletonCard = ({days}) => {
  return (
    <div className="card col-12 col-lg-3 text-center m-3">
      <div className="card-body m-0 p-0">
        <div className="menuColor py-1 row justify-content-center text-center">
          <h2 className="FontTitles col-6 m-0 py-2">
            <Skeleton shape="text"  height="2rem" />
          </h2>
        </div>

        <div className="todo-list">
          {days.map((element) => (
            <div key={element} className="row justify-content-center mx-0 py-1 border-bottom">
              <div className="col-10 ClassBGHover pt-2">
                <Skeleton shape="text"  height="1.5rem" />
              </div>

              <div className="col-2 btn ClassBGHover">
                <Skeleton shape="circle" width="1.5rem" height="1.5rem" />
              </div>
            </div>
          ))}
        </div>

        <button disabled={true} className="input-group-text btn border buttonColor mt-3">
        <Skeleton shape="rectangle" width="1.5rem" height="1.5rem" />
        </button>
      </div>

      <div className="row justify-content-between m-0 p-0">
        <div className="col-5">
          <button disabled={true} className="m-1 btn border buttonColor buttonColorDelete"><Skeleton shape="circle" width="1.5rem" height="1.5rem" /></button>
        </div>
        <div className="col-5">
          <button disabled={true} className="btn border buttonColor"><Skeleton shape="circle" width="1.5rem" height="1.5rem" /></button>
        </div>
        <div className="card-footer m-0 row justify-content-center textCreated mt-3">
          <div className='col-6'>
            <Skeleton shape="text" height="1rem" />

          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
