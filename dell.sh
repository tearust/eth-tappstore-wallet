echo "build for dell"
npm run dell

echo "docker start"
docker-compose down && docker-compose up -d