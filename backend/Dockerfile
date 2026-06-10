<<<<<<< HEAD
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

EXPOSE 3000


=======
# Imagen base: Node.js 20 en Alpine (versión ligera, ~180MB vs ~1GB de la normal)
FROM node:20-alpine

# Directorio de trabajo dentro del contenedor.
# Todos los comandos siguientes se ejecutan desde aquí.
WORKDIR /app

# Copiamos primero SOLO los archivos de dependencias.
# Truco importante: Docker cachea cada capa por separado.
# Si el código cambia pero package.json no, Docker reutiliza
# la capa del npm install y no vuelve a descargar todo.
COPY package*.json ./

# Instalamos solo las dependencias de producción.
# --omit=dev excluye Jest, nodemon y demás herramientas de desarrollo,
# reduciendo el tamaño final de la imagen.
RUN npm install --omit=dev

# Ahora sí copiamos el resto del código fuente.
# Se hace después del install para aprovechar la caché de Docker.
COPY . .

# Puerto en el que escucha la aplicación.
# Es solo informativo; el mapeo real se hace en docker-compose.yml
EXPOSE 3000

# Comando que arranca la app cuando se lanza el contenedor.
# Forma array (exec form): Node recibe correctamente las señales
# del sistema (SIGTERM, SIGINT) para poder apagarse limpiamente.
>>>>>>> f47cac16fd014f5b7b878bca514ed2a672961e32
CMD ["node", "server.js"]


