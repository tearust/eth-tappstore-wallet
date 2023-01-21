echo "build for wallet"
npm run build:wallet

echo "docker start"
docker-compose down && docker-compose up -d