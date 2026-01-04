import axios from "axios";

/**
 * ADS-B Provider: 
 * https://airplanes.live/api
 */

// Busca todos os voos próximos de um ponto (lat, lon, dist)
export async function getStatesAll({ lat = -23.5017, lon = -47.4526, dist = 50 } = {}) {
  const response = await axios.get(
    `https://api.airplanes.live/v2/point/${lat}/${lon}/${dist}`,
    { timeout: 10000 }
  );

  const allStates = response.data.ac || [];

  // Pega somente os primeiros 10 voos para teste
  const sampleStates = allStates.slice(0, 10).map(ac => ({
    hex: ac.hex,
    flight: ac.flight?.trim(),
    lat: ac.lat,
    lon: ac.lon,
    altitude: ac.alt_baro,
    speed: ac.gs
  }));

  return {
    time: Math.floor(Date.now() / 1000),
    states: sampleStates
  };
}

/**
 * Busca uma aeronave específica pelo ICAO (hex)
 */
export async function getStatesByICAO(icao) {
  if (!icao) return { time: Math.floor(Date.now() / 1000), states: [] };

  try {
    // Chama o endpoint /hex/ICAO
    const response = await axios.get(
      `https://api.airplanes.live/v2/hex/${icao}`,
      { timeout: 10000 }
    );

    const allStates = response.data.ac || [];

    // FILTRO FINAL: só pega o HEX exato que você quer
    const filtered = allStates.filter(ac => ac.hex.toLowerCase() === icao.toLowerCase());

    return {
      time: Math.floor(Date.now() / 1000),
      states: filtered.map(ac => ({
        hex: ac.hex,
        flight: ac.flight?.trim(),
        lat: ac.lat,
        lon: ac.lon,
        altitude: ac.alt_baro,
        speed: ac.gs,
        heading: ac.track
      }))
    };
  } catch (err) {
    console.error("Erro ao buscar aeronave por HEX:", err.message);
    return { time: Math.floor(Date.now() / 1000), states: [] };
  }
}