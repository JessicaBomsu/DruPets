// Sistema de Mapa
class MapSystem {
    constructor() {
        this.map = null;
        this.markers = [];
        this.init();
    }

    init() {
        if (document.getElementById('abandonment-map')) {
            this.initMap();
            this.loadMapData();
        }
    }

    initMap() {
        // Coordenadas padrão (São Paulo)
        const defaultCoords = [-23.5505, -46.6333];
        
        this.map = L.map('abandonment-map').setView(defaultCoords, 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18
        }).addTo(this.map);

        // Adicionar controle de localização
        this.map.locate({setView: true, maxZoom: 16});

        this.map.on('locationfound', (e) => {
            L.marker(e.latlng).addTo(this.map)
                .bindPopup('Você está aqui!')
                .openPopup();
        });

        this.map.on('locationerror', (e) => {
            console.log('Localização não disponível:', e.message);
        });
    }

    async loadMapData() {
        // Dados de exemplo - em uma implementação real, viriam do Firebase
        const sampleData = {
            abandoned: [
                {
                    coords: [-23.5505, -46.6333],
                    title: 'Cachorro abandonado',
                    description: 'Encontrado na região central. Precisa de ajuda urgente.',
                    type: 'abandoned',
                    contact: '(11) 99999-9999'
                },
                {
                    coords: [-23.5605, -46.6433],
                    title: 'Gatos em situação de rua',
                    description: 'Colônia de gatos precisa de doações de ração.',
                    type: 'abandoned',
                    contact: '(11) 88888-8888'
                }
            ],
            shelters: [
                {
                    coords: [-23.5405, -46.6233],
                    title: 'Abrigo Amigo dos Animais',
                    description: 'Aceita doações e voluntários. Horário: 9h-18h',
                    type: 'shelter',
                    contact: '(11) 77777-7777'
                }
            ],
            vets: [
                {
                    coords: [-23.5305, -46.6133],
                    title: 'Clínica Veterinária PetCare',
                    description: 'Atendimento 24h para emergências.',
                    type: 'vet',
                    contact: '(11) 66666-6666'
                }
            ]
        };

        this.addMarkersToMap(sampleData);
    }

    addMarkersToMap(data) {
        // Limpar marcadores existentes
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];

        // Ícones personalizados
        const icons = {
            abandoned: L.divIcon({
                className: 'custom-marker abandoned',
                html: '🐾',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            }),
            shelter: L.divIcon({
                className: 'custom-marker shelter',
                html: '🏠',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            }),
            vet: L.divIcon({
                className: 'custom-marker vet',
                html: '🏥',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        };

        // Adicionar marcadores para cada categoria
        Object.keys(data).forEach(category => {
            data[category].forEach(item => {
                const marker = L.marker(item.coords, { icon: icons[item.type] })
                    .addTo(this.map)
                    .bindPopup(`
                        <div class="map-popup">
                            <h3>${item.title}</h3>
                            <p>${item.description}</p>
                            ${item.contact ? `<p><strong>Contato:</strong> ${item.contact}</p>` : ''}
                            <div class="popup-actions">
                                <button onclick="mapSystem.getDirections(${item.coords[0]}, ${item.coords[1]})" class="btn btn-small">
                                    <i class="fas fa-directions"></i> Como chegar
                                </button>
                            </div>
                        </div>
                    `);

                this.markers.push(marker);
            });
        });
    }

    getDirections(lat, lng) {
        // Abrir Google Maps com direções
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                
                const url = `https://www.google.com/maps/dir/${userLat},${userLng}/${lat},${lng}`;
                window.open(url, '_blank');
            }, () => {
                // Fallback sem a localização do usuário
                const url = `https://www.google.com/maps/dir//${lat},${lng}`;
                window.open(url, '_blank');
            });
        } else {
            const url = `https://www.google.com/maps/dir//${lat},${lng}`;
            window.open(url, '_blank');
        }
    }

    searchAddress(address) {
        // Implementar busca por endereço usando Geocoding
        // Por enquanto, é um placeholder
        showNotification('Funcionalidade de busca por endereço em desenvolvimento.', 'info');
    }
}

// Adicionar estilos para os marcadores customizados
const mapStyles = `
.custom-marker {
    background: rgba(255, 255, 255, 0.9);
    border: 2px solid #fff;
    border-radius: 50%;
    text-align: center;
    line-height: 26px;
    font-size: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.custom-marker.abandoned {
    border-color: var(--danger);
}

.custom-marker.shelter {
    border-color: var(--secondary);
}

.custom-marker.vet {
    border-color: var(--success);
}

.map-popup {
    min-width: 200px;
}

.map-popup h3 {
    color: var(--primary);
    margin-bottom: 8px;
}

.map-popup p {
    margin-bottom: 8px;
    color: var(--dark);
}

.popup-actions {
    margin-top: 10px;
}
`;

// Adicionar estilos ao documento
const mapStyleSheet = document.createElement('style');
mapStyleSheet.textContent = mapStyles;
document.head.appendChild(mapStyleSheet);

// Inicializar mapa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    window.mapSystem = new MapSystem();
});