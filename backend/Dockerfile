FROM node:20-alpine
 
WORKDIR /app
 
COPY package*.json ./
RUN npm install
RUN npm install --save-dev wait-on
 
COPY . .
 
RUN chmod +x entrypoint.sh
 
EXPOSE 3000
CMD ["node", "server.js"]