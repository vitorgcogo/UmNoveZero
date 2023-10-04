import React, { useState } from 'react';
import { enviarDados } from '../Api/Ocorrencia';
import ChatComponent from './ChatComponent';

function Principal() {
    const [descricao, setDescricao] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [erro, setErro] = useState(null);

    const obterLocalizacao = () => {
        if (!navigator.geolocation) {
            setErro('Geolocation não é suportado pelo seu navegador.');
            return;
        }

        navigator.geolocation.getCurrentPosition((posicao) => {
            setLatitude(posicao.coords.latitude);
            setLongitude(posicao.coords.longitude);
            setErro(null);
        }, (error) => {
            setErro(error.message);
        });
    };

    const handleEnviar = () => {
        enviarDados(descricao, latitude, longitude)
            .then(() => {
                alert('Dados enviados com sucesso!');
                setDescricao('');
                setLatitude('');
                setLongitude('');
            })
            .catch(err => {
                setErro('Erro ao enviar os dados: ' + err.message);
            });
    };

    return (
        <div className="container mt-5">

            <ChatComponent />

            {/* <form>
                <div className="mb-3">
                    <label htmlFor="descricao" className="form-label">Descrição</label>
                    <textarea
                        className="form-control"
                        id="descricao"
                        rows="3"
                        value={descricao}
                        onChange={e => setDescricao(e.target.value)}
                    ></textarea>
                </div>

                <div className="mb-3">
                    <label htmlFor="latitude" className="form-label">Latitude</label>
                    <input
                        type="text"
                        className="form-control"
                        id="latitude"
                        readOnly
                        value={latitude}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="longitude" className="form-label">Longitude</label>
                    <input
                        type="text"
                        className="form-control"
                        id="longitude"
                        readOnly
                        value={longitude}
                    />
                </div>

                <button type="button" className="btn btn-primary me-2" onClick={obterLocalizacao}>Obter Localização</button>
                <button type="button" className="btn btn-success" onClick={handleEnviar}>Enviar</button>
            </form>

            {erro && <p className="mt-3 text-danger">Error: {erro}</p>} */}
        </div>
    );
}

export default Principal;
