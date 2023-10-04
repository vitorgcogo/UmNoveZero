import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { enviarDados } from '../Api/Ocorrencia';

//https://chatbot-ijix.onrender.com
//http://localhost:5000

const ChatComponent = () => {
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]);
    const [awaitingDescription, setAwaitingDescription] = useState(false);
    const [showRestartButton, setShowRestartButton] = useState(false);

    const endOfChatRef = React.useRef(null);

    const scrollToBottom = () => {
        endOfChatRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chat]);


    useEffect(() => {
        axios.get('http://localhost:5000/welcome_message')
            .then(response => {
                setChat([...chat, { text: response.data.response, sender: 'bot' }]);
            });
    }, []);

    // const handleSendMessage = () => {
    //     if (message.trim()) {
    //         setChat(prevChat => [...prevChat, { text: message, sender: 'user' }]);

    //         if (awaitingDescription) {
    //             setChat(prevChat => [...prevChat, { text: "Por favor, permita a localização para prosseguir.", sender: 'bot' }]);
    //             setAwaitingDescription(false);
    //             setTimeout(handleLocationPermission, 1500); // Delaying the location request for a better user experience.
    //             return;
    //         }

    //         axios.post('http://localhost:5000/chatbot', { message })
    //             .then(response => {
    //                 const botResponse = response.data.response;
    //                 setChat(prevChat => [...prevChat, { text: botResponse, sender: 'bot' }]);

    //                 if (botResponse.includes("crime") || botResponse.includes("emergencia") || botResponse.includes("denúncia")) {
    //                     setChat(prevChat => [...prevChat,
    //                     { text: "Você gostaria de registrar um chamado?", sender: 'bot', type: 'option' }]);
    //                 }
    //             });
    //         setMessage('');
    //     }
    // };

    const handleSendMessage = () => {
        if (message.trim()) {
            setChat(prevChat => [...prevChat, { text: message, sender: 'user' }]);
            setMessage('');

            if (awaitingDescription) {
                setChat(prevChat => [...prevChat, { text: "Por favor, permita a localização para prosseguir.", sender: 'bot' }]);
                setAwaitingDescription(false);
                setTimeout(handleLocationPermission, 1500); // Delaying the location request for a better user experience.
                return;
            }
    
            axios.post('http://localhost:5000/chatbot', { message })
                .then(response => {
                    const botResponse = response.data.response;
                    const detectedIntent = response.data.intent; // Suponho que você esteja enviando a intenção detectada como parte da resposta
    
                    setChat(prevChat => [...prevChat, { text: botResponse, sender: 'bot' }]);
    
                    if (detectedIntent === 'relatar_crime' || detectedIntent === 'emergencia') { // Verifique a intenção aqui
                        setChat(prevChat => [...prevChat,
                        { text: "Você gostaria de registrar um chamado?", sender: 'bot', type: 'option' }]);
                    }
                });
            setMessage('');
        }
    };
    

    const handleRestartConversation = () => {
        setChat(prevChat => [...prevChat, { text: "Olá! Como posso ajudar?", sender: 'bot' }]);
        setShowRestartButton(false);
        // Qualquer outro estado ou lógica que você queira resetar pode ser feito aqui
    };


    const handleOptionClick = (option) => {
        if (option === "Sim") {
            setChat(prevChat => [...prevChat, { text: "Sim", sender: 'user' }]);
            setChat(prevChat => [...prevChat, { text: "Por favor, descreva o ocorrido.", sender: 'bot' }]);
            setAwaitingDescription(true);
        } else {
            setChat(prevChat => [...prevChat, { text: "Não", sender: 'user' }]);
            setChat(prevChat => [...prevChat, { text: "Obrigado pela conversa. ", sender: 'bot' }]);
            setShowRestartButton(true);

            // // Adicionando delay de 3 segundos
            // setTimeout(() => {
            //     setChat([]); // Limpa a conversa
            //     setChat(prevChat => [...prevChat, { text: "Obrigado pela conversa. ", sender: 'bot' }]);
            // }, 3000); // 3000 milissegundos (3 segundos)
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleLocationPermission = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async position => {

                enviarDados(message, position.coords.latitude, position.coords.longitude)

                setChat(prevChat => [...prevChat, { text: "Localização registrada. Obrigado por informar.", sender: 'bot' }]);
            });
        } else {
            console.error("Geolocation nao suportada pelo navegador.");
        }
    };

    return (
        <div className='container mt-1'>
            <div className="chat-box">
                {chat.map((msg, index) => (
                    <div key={index} className={msg.sender}>
                        {msg.text}
                        {msg.type === 'option' && (
                            <div className="options">
                                <button className='btn btn-primary mx-2' onClick={() => handleOptionClick("Sim")}>Sim</button>
                                <button className='btn btn-danger mx-2' onClick={() => handleOptionClick("Não")}>Não</button>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={endOfChatRef} /> {/* Adicione esta linha */}
                {showRestartButton && (
                    <button className='btn btn-secondary mt-2 mx-2' onClick={handleRestartConversation}>
                        Iniciar Nova Conversa
                    </button>
                )}
            </div>

            <div className="input-area">
                <input
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}  // Adicione isso para detectar a tecla Enter
                    placeholder="Digite sua mensagem..."
                />
                <button onClick={handleSendMessage}>Enviar</button>
            </div>
        </div>
    );
};

export default ChatComponent;



// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const ChatComponent = () => {
//     const [message, setMessage] = useState('');
//     const [chat, setChat] = useState([]);

//     useEffect(() => {
//         axios.get('http://localhost:5000/welcome_message')
//             .then(response => {
//                 setChat([...chat, { text: response.data.response, sender: 'bot' }]);
//             });
//     }, []);

//     const handleSendMessage = () => {
//         if (message.trim()) {
//             setChat([...chat, { text: message, sender: 'user' }]);
//             axios.post('http://localhost:5000/chatbot', { message })
//                 .then(response => {
//                     setChat([...chat, { text: message, sender: 'user' }, { text: response.data.response, sender: 'bot' }]);
//                 });
//             setMessage('');
//         }
//     };

//     return (
//         <div>
//             <div className="chat-box">
//                 {chat.map((msg, index) => (
//                     <div key={index} className={msg.sender}>
//                         {msg.text}
//                     </div>
//                 ))}
//             </div>
//             <div className="input-area">
//                 <input
//                     type="text"
//                     value={message}
//                     onChange={e => setMessage(e.target.value)}
//                     placeholder="Digite sua mensagem..."
//                 />
//                 <button onClick={handleSendMessage}>Enviar</button>
//             </div>
//         </div>
//     );
// };

// export default ChatComponent;

