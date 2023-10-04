import {db} from '../config/firebase'; 
import { addDoc, collection, getDocs } from "firebase/firestore";  // Importe os métodos necessários do Firestore


export const enviarDados = async (conversa, descricao, latitude, longitude) => {
    try {
        const docRef = await addDoc(collection(db, "localizacoes"), {
            conversa: conversa,
            descricao: descricao,
            latitude: latitude,
            longitude: longitude
        });
        console.log("Dados salvos com sucesso no ID: ", docRef.id);
    } catch (e) {
        console.error("Erro ao salvar os dados: ", e);
        setErro("Erro ao salvar os dados");
    }
};


export const obterDados = async (setData) => {
    const dataCollection = collection(db, 'localizacoes'); // substitua 'nomeDaSuaColecao' pelo nome da sua coleção
    const dataSnapshot = await getDocs(dataCollection);
    const dataList = dataSnapshot.docs.map(doc => doc.data());
    setData(dataList);
};