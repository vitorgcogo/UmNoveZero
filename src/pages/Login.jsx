import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import { NavLink, useNavigate } from 'react-router-dom';
import { logInWithEmailAndPassword } from '../config/firebase';

function Login() {
    const [inputs, setInputs] = useState({});
    const [erros, setErros] = useState({});
    const [response, setResponse] = useState({});
    const [modalOpen, setModalOpen] = useState(false);

    const navigate = useNavigate();

    function closeModal() {
        setModalOpen(false);
    }

    const validator = yup.object().shape({
        email: yup.string().email("E-mail inválido.").required('E-email é obrigatório'),
        senha: yup.string().required("Senha é obrigatório")
    });

    function handleChange(e) {
        const name = e.target.name;
        const value = e.target.value;
        setInputs({ ...inputs, [name]: value });
    }

    function validar() {
        validator.validate(inputs, { abortEarly: false }).then(() => {
            setErros({});
            logInWithEmailAndPassword(inputs?.email, inputs?.senha, setResponse);
        }).catch((error) => {
            setErros({});
            error.inner.forEach((err) => {
                setErros((prevErros) => ({ ...prevErros, [err.path]: err.message }));
            });
        });
    }

    function handleSubmit(e) {
        e.preventDefault();
        validar();
    }

    useEffect(() => {
        if (response.status === 400) {
            setModalOpen(true);
        } else if (response.status === 200) {
            navigate("/");
        }
    }, [response]);

    return (
        <>
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title text-center mb-4">Login</h5>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Endereço de email</label>
                                        <input type="email" className="form-control" name="email" id="email" aria-describedby="emailHelp" onChange={handleChange} value={inputs?.email} />
                                        <div id="emailHelp" className="form-text">Nós nunca compartilharemos seu email com ninguém.</div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label">Senha</label>
                                        <input type="password" className="form-control" name="senha" id="password" onChange={handleChange} value={inputs?.senha} />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100">Entrar</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {modalOpen && response && (
                <div className="modal" tabIndex="-1" role="dialog" style={{ display: 'block', background: '#101010c2' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="exampleModalLabel">Informação</h1>
                            </div>
                            <div className="modal-body">
                                {response.message}
                            </div>
                            <div className="modal-footer">
                                {response?.status === 200 ? <NavLink to='/login'><button type="button" className="btn btn-primary">Fechar</button></NavLink>
                                    : <button type="button" className="btn btn-secondary" onClick={closeModal} data-bs-dismiss="modal">Fechar</button>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Login;
