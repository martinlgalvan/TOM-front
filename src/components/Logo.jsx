import * as img from '../assets/img/logo.png'

function Logo(){
    console.log(img.default)
    return (
        <div className='row justify-content-center align-items-center y-2'>
            <h1 className="d-none">TOM</h1>
            <img className="img-fluid Largo text-center my-5 pt-5 pb-3" src={img.default} alt="TOM" />
        </div>
    )
}

export default Logo