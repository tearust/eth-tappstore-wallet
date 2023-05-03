
npm run build:wallet

echo "move dist to alpha"
rm -rf ../pub-service/alpha/dist
cp -r ./dist ../pub-service/alpha/dist

echo "move dist to pub_service"
rm -rf ../pub-service/newyork/dist
mv ./dist ../pub-service/newyork/dist

