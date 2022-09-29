docker build -f Dockerfile -t baezijnismeemaken/client .

docker run -it --rm -p 3000:80 baezijnismeemaken/client