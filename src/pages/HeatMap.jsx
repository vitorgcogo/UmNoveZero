import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { obterDados } from '../Api/Ocorrencia';

const HeatMap = () => {
    const [data, setData] = useState([]);
    const [filterType, setFilterType] = useState(null);

    // Carregar os dados do Firestore
    useEffect(() => {
        obterDados(setData)
    }, []);

    useEffect(() => {
        if (data.length === 0) return;  // Se não houver dados, não inicialize o mapa

        mapboxgl.accessToken = 'pk.eyJ1Ijoiam9hbzMzIiwiYSI6ImNsaW45cmFwOTBqajgzZHBlbnhhY3NheGUifQ.cvvOS0rh4XnUq3-olO135Q';

        // Definindo o centro usando o primeiro item de 'data'
        const center = [data[0].longitude, data[0].latitude];
        
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: center, 
            zoom: 12
        });

        map.addControl(new mapboxgl.NavigationControl());

        map.on('load', () => {
            map.addSource('points', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: data.map(point => ({
                        type: 'Feature',
                        properties: {
                            TipoOcorrencia: point.TipoOcorrencia  // Supondo que seus dados tenham um campo 'TipoOcorrencia'
                        },
                        geometry: {
                            type: 'Point',
                            coordinates: [point.longitude, point.latitude]
                        }
                    }))
                    
                }
            });
        
            map.addLayer({
                id: 'heatmapLayer',
                type: 'heatmap',
                source: 'points',
                filter: filterType ? ['==', ['get', 'TipoOcorrencia'], filterType] : ['!=', ['get', 'TipoOcorrencia'], ''] 
                // Se houver um tipo de filtro, ele irá filtrar para aquele tipo. Caso contrário, ele mostrará todos.
            });            
        });
        

        return () => map.remove();
    }, [data]);  // Dependência dos dados aqui para garantir que o mapa seja renderizado/alterado quando os dados forem carregados

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            <div id="map" style={{ width: '100%', height: '100vh' }}></div>
            <select 
                style={{
                    position: 'absolute', 
                    top: '10px', 
                    left: '10px',
                    zIndex: 1,  // Isso garante que o seletor esteja acima do mapa
                }} 
                onChange={e => setFilterType(e.target.value)}
            >
                <option value="">Todos os tipos</option>
                <option value="Acidente">Acidente</option>
                <option value="Assalto">Assalto</option>
                <option value="Roubo">Roubo</option>
                <option value="Outros">Outros</option>
            </select>
        </div>
    );
        
};

export default HeatMap;
