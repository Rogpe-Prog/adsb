FROM node:20-slim

WORKDIR /app

# Copia package.json e package-lock.json primeiro (melhor cache)
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia todo o código
COPY . .

EXPOSE 3000

# Comando para rodar o backend
CMD ["npm", "start"]
