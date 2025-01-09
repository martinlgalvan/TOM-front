import { ToastContainer, toast } from 'react-toastify';
const TOASTID = "LOADER_ID"

const notifyA = (message) => {

  toast.loading(message, {
      position:           "top-right",
      toastId:            TOASTID, 
      autoClose:          false, 
      hideProgressBar:    true,
      pauseOnFocusLoss:   false,
      limit: 1 
  })
};

const updateToast = () => 

  toast.update(
      TOASTID, { 
      render:             "Listo!", 
      type:               "success", 
      autoClose:          300, 
      isLoading:          false,
      pauseOnFocusLoss:   false,
      closeOnClick:       true,
      hideProgressBar:    true,
      limit:              1,
      className:          'rotateY animated'
      }
  );

const instantToast = (message) => 
  toast.success(message, {
    position: "top-right",
    autoClose:          300, 
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    limit: 1,
    progress: undefined,
    theme: "light",
    });





   
  

  export {
    notifyA,
    updateToast,
    instantToast,
    ToastContainer
  }