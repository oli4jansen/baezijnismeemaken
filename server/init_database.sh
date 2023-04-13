psql -c 'DROP DATABASE IF EXISTS baezijnismeemaken'
psql -c 'CREATE DATABASE baezijnismeemaken'
psql baezijnismeemaken -U postgres -f database.sql