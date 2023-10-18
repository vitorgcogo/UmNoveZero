import React, { useEffect, useState } from 'react';
import { signOut, getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { getUserData, auth } from '../config/firebase';

const Perfil = () => {
    const [userData, setUserData] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const user = getAuth().currentUser;

            if (user) {
                const data = await getUserData(user.uid);
                if (data) {
                    setUserData(data);
                }
            }
        };

        fetchUserData();
    }, []);

    const handleSignOut = async () => {
        try {
            signOut(auth);
            navigate("/login");
        } catch (error) {
            console.error("Erro ao deslogar:", error);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-6 offset-md-3">
                    <div className="card">
                        <div className="card-header">
                            Perfil
                        </div>
                        <div className="card-body">
                            <h5 className="card-title">Nome: {userData.nome || 'N/A'}</h5>
                            <p>Email: {userData.email || 'N/A'}</p>
                            <p>Telefone: {userData.telefone || 'N/A'}</p>
                            <button className="btn btn-danger" onClick={handleSignOut}>Deslogar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Perfil;
