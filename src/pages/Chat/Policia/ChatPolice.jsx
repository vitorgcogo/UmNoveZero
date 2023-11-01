import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { getDoc, doc, collection, addDoc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { obterDadosId, updateStatus } from '../../../Api/Ocorrencia';
import { getAuth } from 'firebase/auth';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import IMG from '../../../assets/img/pin.png'

const ChatPolice = () => {
    const navigate = useNavigate();
    const { roomId } = useParams();
    const [messages, setMessages] = useState([]);
    const [data, setData] = useState([]);
    const [nome, setNome] = useState([]);

    const [userData, setUserData] = useState({});

    const endOfChatRef = React.useRef(null);

    const [actionTaken, setActionTaken] = useState(null);  // "sendPolice", "rejectCall", ou null

    const fetchUserName = async (userId) => {
        const userDoc = await getDoc(doc(db, 'users', userId)); // Ajuste 'users' para o nome correto da coleção de usuários
        if (userDoc.exists()) {
            return userDoc.data().nome; // ou o campo que armazena o nome do usuário
        }
        return null;
    };    

    const scrollToBottom = () => {
        endOfChatRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const fetchNome = async () => {
            const docRef = doc(db, "usuarios", data?.userId);
            const docSnapshot = await getDoc(docRef);
    
            if (docSnapshot.exists()) {
                setNome(docSnapshot.data().nome); // supondo que você esteja tentando obter o campo "nome" do documento
            }
        }; 
        fetchNome();
    }, [data]);
    

    useEffect(() => {
        obterDadosId(roomId, setData);
    }, [roomId, actionTaken]);

    useEffect(() => {
        const fetchData = async () => {
            const chamadoData = await obterDadosId(roomId);
            if (chamadoData?.userId) {
                const userName = await fetchUserName(chamadoData.userId);
                setData({
                    ...chamadoData,
                    userName: userName
                });
            }
        };
        fetchData();
    }, [roomId]);    

    const sendMessageAsPolice = async (response) => {
        if (roomId) {
            await addDoc(collection(db, 'conversations', roomId, 'messages'), {
                text: response,
                roomId: roomId,
                sender: 'bot',
                timestamp: new Date()
            });
        }
    };

    useEffect(() => {
        if (data.length === 0 || data.status === 'cancel') return;  // Se não houver dados, não inicialize o mapa
    
        mapboxgl.accessToken = 'pk.eyJ1Ijoiam9hbzMzIiwiYSI6ImNsaW45cmFwOTBqajgzZHBlbnhhY3NheGUifQ.cvvOS0rh4XnUq3-olO135Q';
    
        const center = [data?.longitude, data?.latitude];
    
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: center,
            zoom: 14
        });
    
        map.addControl(new mapboxgl.NavigationControl());
    
        map.on('load', () => {
            // Carregando a imagem do ícone personalizado
            map.loadImage(IMG, (error, image) => {
                if (error) throw error;
                map.addImage('meu-icone', image, { 'sdf': true });
        
                map.addSource('point', {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: [{
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'Point',
                                coordinates: [data?.longitude, data?.latitude]
                            }
                        }]
                    }
                });
        
                // Usando o ícone personalizado na layer com tamanho fixo
                map.addLayer({
                    id: 'pointLayer',
                    type: 'symbol',
                    source: 'point',
                    layout: {
                        'icon-image': 'meu-icone',
                        'icon-size': 0.05,  // ajuste este valor para definir o tamanho desejado
                        'icon-allow-overlap': true  // garante que o ícone seja sempre mostrado
                    }
                });
            });
        });
    
        return () => map.remove();
    }, [data]);


    const handleSendPolice = async () => {
        // Lógica para enviar a viatura (se necessário)
        await sendMessageAsPolice("Enviando viatura");
        updateStatus(roomId, true);
        setActionTaken("sendPolice");
    };

    const handleRejectCall = async () => {
        // Lógica para recusar o chamado (se necessário)
        await sendMessageAsPolice("Chamado recusado");
        updateStatus(roomId, false);
        setActionTaken("rejectCall");
    };


    return (
        <div className="chat-container">
            <div className="chat-header" onClick={() => navigate(-1)}>
                <i className=" back-icon bi bi-chevron-left"></i>
                <h3 >Chamado #{roomId}</h3>
            </div>

            <div className="container mt-1">
                <div className="row">
                    <div className="col-md-6">
                        <p><strong>Nome:</strong> {nome}</p>
                        <p><strong>Descrição:</strong> {data.descricao}</p>
                        <p><strong>Status:</strong> {data?.status == true ? 'Chamado Aceito' : data?.status == false ? 'Chamado Recusado' : 'Pendente'}</p>
                        <p><strong>Data e Hora:</strong> {data.timestamp?.toDate().toLocaleString()}</p>
                    </div>

                    <div className="col-md-6 mb-4">
                        <div id="map" style={{ width: '100%', height: '40vh', marginTop: '20px' }}></div>
                    </div>

                    {data.status == true || data.status == false ?
                        ""
                        : <div className="col-12 text-center ">
                            <button className="ticket-actions btn btn-success mx-2" onClick={handleSendPolice}>
                                Enviar Viatura &nbsp;
                                {actionTaken === "sendPolice" && <i className="bi bi-check-circle-fill ml-2"></i>}
                            </button>

                            <button className="ticket-actions btn btn-danger" onClick={handleRejectCall}>
                                Recusar Chamado &nbsp;
                                {actionTaken === "rejectCall" && <i className="bi bi-x-circle-fill ml-2"></i>}
                            </button>
                        </div>}
                </div>
            </div>

        </div>
    );
};

export default ChatPolice;