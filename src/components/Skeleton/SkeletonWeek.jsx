import Skeleton from "react-loading-skeleton"

const SkeletonWeek = ({weeks}) => {
  return (
    Array(weeks).fill(0).map((item, index) => 
    <div className="card-skeleton" key={index}>
      <div>
        <Skeleton count={4} style={{marginBottom: "20px"}} />
        </div>
    </div>
  ))
}

export default SkeletonWeek