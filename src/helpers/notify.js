import { ToastContainer, toast } from 'react-toastify';
const TOASTID = "LOADER_ID"

const getToastPosition = () => {
  if (typeof window !== 'undefined' && window.innerWidth <= 768) {
    return "bottom-center";
  }
  return "top-right";
};

const notifyA = (message) => {

  toast.loading(message, {
      position:           getToastPosition(),
      toastId:            TOASTID, 
      autoClose:          false, 
      hideProgressBar:    true,
      pauseOnFocusLoss:   false,
      draggable:          false
  })
};

const updateToast = () => {
  // Antes se descartaba el toast de carga y se creaba uno nuevo de exito. Como
  // el descarte es animado, los dos convivian casi un segundo y se veian dos
  // cajas apiladas. Con toast.update el mismo toast pasa de "cargando" a
  // "Listo!", asi que nunca hay mas de uno.
  if (toast.isActive(TOASTID)) {
    toast.update(TOASTID, {
      render: "Listo!",
      type: "success",
      isLoading: false,
      position: getToastPosition(),
      autoClose: 1200,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnFocusLoss: false,
    });
    return;
  }

  toast.success("Listo!", {
    position: getToastPosition(),
    autoClose: 1200,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnFocusLoss: false,
  });
};

const instantToast = (message) => 
  toast.success(message, {
    position: getToastPosition(),
    autoClose:          1200, 
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    });





   
  

  export {
    notifyA,
    updateToast,
    instantToast,
    ToastContainer
  }
