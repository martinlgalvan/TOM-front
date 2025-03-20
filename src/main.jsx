import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import { ColorProvider } from './components/Context/ColorContext.jsx';

// Prime react styles
import "primereact/resources/themes/lara-light-indigo/theme.css";     
import "primereact/resources/primereact.min.css";
import 'primereact/resources/primereact.css';    
import 'primereact/resources/themes/saga-blue/theme.css';


//react-toastify
import 'react-toastify/dist/ReactToastify.css';


//rsuit styles
import '../src/assets/rsuiteStyles.css'
//Bootstrapstyles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// propy styles
import '../src/assets/styles.css';   


import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

ReactDOM.createRoot(document.getElementById('root'))

.render(
    <ColorProvider>

    <BrowserRouter>
        <App />
    </BrowserRouter>
    </ColorProvider>
)
