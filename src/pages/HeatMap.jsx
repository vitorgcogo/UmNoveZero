import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { obterDados } from '../Api/Ocorrencia';

const HeatMap = () => {
    const [data, setData] = useState([]);
    const [filterType, setFilterType] = useState("");

    // Carregar os dados do Firestore
    useEffect(() => {
        obterDados(setData);
    }, []);

    useEffect(() => {
        // Filtrar os dados para garantir que cada ponto tenha uma localização válida
        const validData = data.filter(point => 
            point.longitude && point.latitude && 
            !isNaN(point.longitude) && !isNaN(point.latitude) &&
            point.status === true
        );

        // Verifica se há dados válidos
        if (validData.length === 0) return;

        mapboxgl.accessToken = 'pk.eyJ1Ijoiam9hbzMzIiwiYSI6ImNsaW45cmFwOTBqajgzZHBlbnhhY3NheGUifQ.cvvOS0rh4XnUq3-olO135Q';

        // Definindo o centro usando o primeiro item de 'validData'
        const center = [validData[0].longitude, validData[0].latitude];

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
                    features: validData
                        .filter(point => !filterType || point.TipoOcorrencia === filterType)
                        .map(point => ({
                            type: 'Feature',
                            properties: { TipoOcorrencia: point.TipoOcorrencia },
                            geometry: { type: 'Point', coordinates: [point.longitude, point.latitude] }
                        }))
                }
            });

            map.addLayer({
                id: 'heatmapLayer',
                type: 'heatmap',
                source: 'points',
                filter: filterType ? ['==', ['get', 'TipoOcorrencia'], filterType] : ['!=', ['get', 'TipoOcorrencia'], '']
            });
        });

        return () => map.remove();
    }, [data, filterType]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            <div id="map" style={{ width: '100%', height: '100vh' }}></div>
            <select className='custom-select'
                style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1 }}
                onChange={e => setFilterType(e.target.value)}
            >
                {/* Opções do dropdown */}
            </select>
        </div>
    );
};

export default HeatMap;
