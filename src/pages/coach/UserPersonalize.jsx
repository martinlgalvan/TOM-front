import Logo from '../../components/Logo.jsx'
import AddColorToUser from '../../components/Users/AddColorToUser.jsx';

import { useColor } from '../../components/Context/ColorContext.jsx';

function UsersListPage() {


    return (
        <section className='container-fluid'>
            <article className='row justify-content-center'>
                <div>
                    <Logo />
                </div>

                <div className='col-10 col-lg-6'>
                    <AddColorToUser />
                </div>
      
            </article>

            <article className='row justify-content-center my-5'>

                <div className='col-10 col-lg-6 text-center'>
                    <h2>Más personalización pronto...</h2>
                </div>

            </article>
        </section>
    )
}

export default UsersListPage