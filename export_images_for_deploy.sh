# Create deploy directory
mkdir -p deploy

# Remove images if existing
docker rmi baezijnismeemaken_server baezijnismeemaken_client --force

# Rebuild images with fresh source code
docker build -t baezijnismeemaken_server server
docker build -t baezijnismeemaken_client client

# Export images 
docker save -o deploy/server.tar baezijnismeemaken_server
docker save -o deploy/client.tar baezijnismeemaken_client

# Copy .env file from server directory to deploy directory.
# This file may be overwritten when actually deploying on the server
cp server/.env deploy/

# Copy the docker-compose definition
cp docker-compose.yml deploy/

# Provide an executable script to load the images and run compose
rm -rf deploy/start.sh
echo "docker load -i client.tar" >> deploy/start.sh
echo "docker load -i server.tar" >> deploy/start.sh
echo "docker compose up" >> deploy/start.sh
chmod +x deploy/start.sh

# Zip the deploy files
tar -czvf baezijnismeemaken-deploy.tar.gz deploy
# Remove the directory
# rm -rf deploy