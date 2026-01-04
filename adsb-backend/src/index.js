import express from 'express';

const app = express();
const PORT = 3000;
import { getStatesAll, getStatesByICAO } from './adsb/client.js';

import cors from 'cors'
app.use(cors())

// Rota de teste simples        
app.get('/', (req, res) => {
  res.send('Backend Node + Express funcionando, meu Rei!');
});

// Endpoint de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),     
    memoryUsage: process.memoryUsage()
  });
});

/**
 * Endpoint: Lista de voos próximos
 * Query params opcionais:
 *  - lat (latitude)
 *  - lon (longitude)
 *  - dist (distância em km)
 */
app.get("/adsb/states", async (req, res) => {
  try {
    const lat = Number(req.query.lat) || -23.5017;
    const lon = Number(req.query.lon) || -47.4526;
    const dist = Number(req.query.dist) || 50;

    const data = await getStatesAll({ lat, lon, dist });
    res.json(data);
  } catch (err) {
    console.error("🔥 ERRO ADS-B 🔥", err.message);
    res.status(err.response?.status || 500).json({
      error: "Erro ao consultar provider ADS-B",
      details: err.response?.data || err.message,
    });
  }
});

/**
 * Endpoint: Voo específico pelo ICAO (hex)
 * Query param obrigatório:
 *  - icao (hex da aeronave)
 */
app.get("/adsb/state", async (req, res) => {
  try {
    const icao = req.query.icao;
    if (!icao) return res.status(400).json({ error: "Parâmetro 'icao' obrigatório" });

    const data = await getStatesByICAO(icao);

    if (data.states.length === 0) {
      return res.status(404).json({ error: "Aeronave não encontrada" });
    }

    res.json(data);
  } catch (err) {
    console.error("🔥 ERRO ADS-B 🔥", err.message);
    res.status(500).json({
      error: "Erro ao consultar provider ADS-B",
      details: err.response?.data || err.message,
    });
  }
});


app.listen(PORT, () => {
  console.log(`ADSB BACKEND rodando em http://localhost:${PORT}`);
});
