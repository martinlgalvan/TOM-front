import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import { ColorProvider } from './components/Context/ColorContext.jsx';

ReactDOM.createRoot(document.getElementById('root'))

.render(
    <ColorProvider>

    <BrowserRouter>
        <App />
    </BrowserRouter>
    </ColorProvider>
)
