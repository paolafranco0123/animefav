#!/bin/sh
# Aplica las migraciones pendientes contra la BD del contenedor "db"
# antes de arrancar el servidor. Así, en cualquier entorno nuevo
# (otro dev, otro servidor) la BD queda siempre al día sin pasos manuales.
set -e

echo "Esperando a que MySQL esté listo..."
npx wait-on tcp:db:3306 -t 30000

echo "Aplicando migraciones de Prisma..."
npx prisma migrate deploy

echo "Generando Prisma Client..."
npx prisma generate

echo "Arrancando el servidor..."
node server.js