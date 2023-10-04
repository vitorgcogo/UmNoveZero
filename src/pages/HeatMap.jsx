import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { obterDados } from '../Api/Ocorrencia';

const HeatMap = () => {
    const [data, setData] = useState([]);

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
                        properties: {},
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
            });
        });

        return () => map.remove();
    }, [data]);  // Dependência dos dados aqui para garantir que o mapa seja renderizado/alterado quando os dados forem carregados

    return (
        <div>
            <div id="map" style={{ width: '100%', height: '100vh' }} />
        </div>
    );
};

export default HeatMap;
