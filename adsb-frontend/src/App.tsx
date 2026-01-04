import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet'
import { useEffect, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/**
 * Fix do ícone padrão do Leaflet (obrigatório em Vite)
 */
delete (L.Icon.Default.prototype as any)._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

function createAirplaneIcon(heading = 0) {
  // Ícone aponta para LESTE → corrigimos para NORTE
  const rotation = heading - 90

  return L.divIcon({
    className: '',
    html: `
      <img
        src="https://cdn-icons-png.flaticon.com/512/61/61212.png"
        style="
          width: 32px;
          height: 32px;
          transform: rotate(${rotation}deg);
          transform-origin: center;
        "
      />
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  })
}



/**
 * Tipagem do estado do ADS-B
 */
type AircraftState = {
  hex: string
  flight: string
  lat: number
  lon: number
  altitude: number
  speed: number
  heading?: number
}

/**
 * Componente responsável por centralizar o mapa
 * quando os dados do avião chegam
 */
function RecenterMap({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap()

  useEffect(() => {
    map.setView([lat, lon], 11)
  }, [lat, lon, map])

  return null
}

function App() {
  const [aircraft, setAircraft] = useState<AircraftState | null>(null)
  const [icao, setIcao] = useState('')
  const [icaos, setIcaos] = useState<string[]>([])
  const [selectedIcao, setSelectedIcao] = useState<string | null>(null)
  const [track, setTrack] = useState<[number, number][]>([])

  useEffect(() => {
    setTrack([])
  }, [aircraft?.hex])

  useEffect(() => {
    if (!aircraft) return

    setTrack(prev => {
      const last = prev[prev.length - 1]

      // evita duplicar o mesmo ponto
      if (last && last[0] === aircraft.lat && last[1] === aircraft.lon) {
        return prev
      }

      return [...prev, [aircraft.lat, aircraft.lon]]
    })
  }, [aircraft])


  function handleIcaoChange(e: React.ChangeEvent<HTMLInputElement>) {
    setIcao(e.target.value.toLowerCase())
  }

  useEffect(() => {
    const fetchIcaos = () => {
      fetch('http://localhost:3000/adsb/states')
        .then(res => res.json())
        .then(data => {
          if (data?.states?.length) {
            const hexList = data.states
              .map((s: any) => s.hex)
              .filter(Boolean)

            setIcaos(hexList)
          } else {
            setIcaos([])
          }
        })
        .catch(err => {
          console.error('Erro ao buscar lista de ICAOs:', err)
        })
    }

    fetchIcaos()
    const interval = setInterval(fetchIcaos, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!selectedIcao) return

    fetch(`http://localhost:3000/adsb/state?icao=${selectedIcao}`)
      .then(res => res.json())
      .then(data => {
        if (data?.states?.length) {
          setAircraft(data.states[0])
        } else {
          alert('Sem dados para este ICAO')
          setAircraft(null)
        }
      })
      .catch(err => {
        console.error('Erro ao buscar ICAO selecionado:', err)
      })
  }, [selectedIcao])


  function buscarIcao() {
  if (!icao) {
    alert('Digite um ICAO')
    return
  }

  fetch(`http://localhost:3000/adsb/state?icao=${icao}`)
    .then(res => res.json())
    .then(data => {
      if (data?.states?.length) {
        setAircraft(data.states[0])
      } else {
        alert('ICAO não encontrado ou sem dados')
        setAircraft(null)
      }
    })
    .catch(err => {
      console.error('Erro ao buscar ADS-B:', err)
      alert('Erro ao consultar backend')
    })
}

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 100,
          zIndex: 1000,
          background: 'white',
          padding: '8px',
          borderRadius: '4px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          display: 'flex',
          gap: '6px'
        }}
      >
        <input
          type="text"
          placeholder="Digite o ICAO"
          value={icao}
          onChange={handleIcaoChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              buscarIcao()
            }
          }}
          style={{ padding: '4px' }}
        />

        <button onClick={buscarIcao}>
          Buscar
        </button>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          background: 'rgba(255,255,255,0.7)',
          padding: '8px 10px',
          borderRadius: '6px',
          fontSize: '14px',
          color: '#000',
          maxHeight: '60vh',
          overflowY: 'auto',
          minWidth: '120px'
        }}
      >
        <strong>ICAOs</strong>
          {selectedIcao && (
            <div style={{ fontSize: '12px', marginBottom: '6px' }}>
              Selecionado: <strong>{selectedIcao}</strong>
            </div>
          )}


          {icaos.map(hex => (
            <div
              key={hex}
              onClick={() => {
                setSelectedIcao(hex)
                setIcao(hex)
              }}
              style={{
                cursor: 'pointer',
                padding: '2px 4px',
                background:
                  selectedIcao === hex ? 'rgba(0,0,0,0.1)' : 'transparent',
                borderRadius: '3px'
              }}
            >
              {hex}
            </div>
          ))}

      </div>



      <MapContainer
        center={[-23.5015, -47.4526]} // centro inicial (Sorocaba)
        zoom={7}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        {/* <TileLayer
          attribution='&copy; OpenStreetMap &copy; CARTO'
          url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        /> */}

        {aircraft && (
          <>
            <RecenterMap lat={aircraft.lat} lon={aircraft.lon} />

            {track.length > 1 && (
              <Polyline
                positions={track}
                pathOptions={{
                  color: 'blue',
                  weight: 3,
                  opacity: 0.8
                }}
              />
            )}


            <Marker
              position={[aircraft.lat, aircraft.lon]}
              icon={createAirplaneIcon(aircraft.heading ?? 0)}
            >
              <Popup>
                <strong>Voo:</strong> {aircraft.flight || 'N/A'} <br />
                <strong>ICAO:</strong> {aircraft.hex} <br />
                <strong>Altitude:</strong> {aircraft.altitude} ft <br />
                <strong>Velocidade:</strong> {aircraft.speed} km/h
              </Popup>
            </Marker>
          </>
        )}
      </MapContainer>
    </div>
  )
}

export default App
