import React, { useEffect, useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';


function NavBar() {

    const auth = getAuth();

    // Função de logout
    const logout = () => {
        signOut(auth).then(() => {
            // Redirecionar para a página de login após logout
            window.location.href = '/login';
        }).catch((error) => {
            // An error happened.
            console.error('Logout failed', error);
        });
    };


    return (
        <>
            <nav class="navbar navbar-expand-lg bg-body-tertiary">
                <div class="container-fluid">
                    <a class="navbar-brand" href="/admin">Administrador</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            <li class="nav-item">
                                <a class="nav-link active" aria-current="page" href="/admin">Mapa</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/admin/chamado">Chamados</a>
                            </li>
                            <button onClick={logout} className="btn btn-outline-danger" type="button">Deslogar</button>

                        </ul>

                    </div>
                </div>
            </nav>
        </>
    );
}

export default NavBar;
