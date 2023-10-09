import React from 'react';
import { signOut, getAuth } from 'firebase/auth';
import { auth } from '../config/firebase';  // Ajuste para o caminho correto de sua configuração do Firebase
import { useNavigate } from 'react-router-dom';

const Perfil = ({ user }) => {

    const navigate = useNavigate()
    const handleSignOut = async () => {
        try {
            signOut(getAuth());
            navigate("/login");

        } catch (error) {
            console.error("Erro ao deslogar:", error);
        }
    }

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-6 offset-md-3">
                    <div className="card">
                        <div className="card-header">
                            Perfil
                        </div>
                        <div className="card-body">
                            <h5 className="card-title">Nome: {getAuth().currentUser?.displayName}</h5>
                            <button className="btn btn-danger" onClick={handleSignOut}>Deslogar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Perfil;
