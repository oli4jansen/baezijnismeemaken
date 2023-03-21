psql -c 'DROP DATABASE IF EXISTS baezijnismeemaken'
psql -c 'CREATE DATABASE baezijnismeemaken'
psql baezijnismeemaken < database.sql