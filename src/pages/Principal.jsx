import React, { useState } from 'react';
import ChatComponent from './ChatComponent';
import { NavLink } from 'react-router-dom';
import ImgLogo from '../assets/img/5.png'
const Principal = () => {

    return (
        <>

            <div className="container mt-2">
                <img src={ImgLogo} style={{width: '100%'}} />
                <div className="intro-section text-center">
                    <h2>Bem-vindo ao registro de chamados</h2>
                    <p></p>
                    <NavLink to={'/historico'} className="btn btn-primary mt-3" >Iniciar Chat</NavLink>

                </div>
            </div>
        </>

    );
};

export default Principal;
