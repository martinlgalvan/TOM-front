function NavBarAppMobile(){

    return(
        <nav className="fixed-bottom colorNavBar  d-flex justify-content-around" style={{ borderTop: '1px solid #ccc' }}>
          {/* Botón de volver atrás */}

            <div>
                <Link
                    className=""
                    to={`/routine/${id}`}
                    rel="noopener noreferrer"
                >

                    <IconButton  className=" my-2 buttonsNav"  >
                        <ArrowBackIcon  />
                    </IconButton>

                </Link>
                <span>Atrás</span>
            </div>

            <div>
                <IconButton className=" my-2 buttonsNav" onClick={() => SetShowUploadVideos(true)} >
                    <AddToDriveIcon />
                </IconButton>
            </div>

            <div>
                <IconButton className=" my-2 buttonsNav">
                    <PercentIcon />
                </IconButton>
            </div>

        </nav>
    )
}

export default NavBarAppMobile