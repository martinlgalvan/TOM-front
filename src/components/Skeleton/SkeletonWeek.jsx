import Skeleton from "react-loading-skeleton"

const SkeletonWeek = ({weeks}) => {
  return (
    Array(weeks).fill(0).map((item, index) => 
    <div key={index} className="card col-12 col-lg-5 text-center m-3">
      <div className="card-body m-0 p-0">
        <div className="menuColor py-1 row justify-content-center" >

          <h2 className='FontTitles m-0 py-2 mx-5'><Skeleton /></h2>
              
        </div>

          <div className='row justify-content-center mx-0 py-1 border-bottom'>
 
            <span className='col-10 btn ClassBGHover'>
              <Skeleton count={4} style={{marginBottom: "20px"}} />
            </span>
          </div>


      </div>


    </div>
  ))
}

export default SkeletonWeek