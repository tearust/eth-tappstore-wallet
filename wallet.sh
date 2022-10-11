
npm run build:wallet

echo "move dist to pub_service"
rm -rf ../pub-service/newyork/dist
mv ./dist ../pub-service/newyork/dist