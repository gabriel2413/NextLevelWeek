import React from 'react'
import { Route, BrowserRouter } from 'react-router-dom'

import Cadastro from './pages/Cadastro'
import Home from './pages/Home'

const Routes = () => {

    return (
        <BrowserRouter>
            <Route component={Home} path="/" exact/>
            <Route component={Cadastro} path="/cadastro"/>
        </BrowserRouter>
    )
}

export default Routes