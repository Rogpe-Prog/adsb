FROM node:20-slim

WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

# Comando para rodar o frontend
CMD ["npm", "run", "dev", "--", "--host"]
