# React + TypeScript + Vite

- docker exec -it <nome container> sh
- npm run dev -- --port 3001 --host

# 1️⃣ Requisitos
Docker instalado
Conexão com a internet para baixar as imagens do Docker Hub

# 2️⃣ Baixar (pull) os containers do Docker Hub
No terminal:

# Backend
docker pull rogpe/backend-node:1.0

# Frontend
docker pull rogpe/frontend-react:1.0

# 3️⃣ Testar containers individualmente

# Rodar backend
docker run --name adsb-backend -p 3000:3000 rogpe/adsb-back-node:1.0

# Rodar frontend
docker run --name adsb-frontend -p 5173:5173 rogpe/adsb-front-react:1.0