# baezijnismeemaken

This is a event ticketing system built for the BAE Openluchtcantus 2023.

The main goals of the system are to sell tickets online and to check ticket validity at a later point in time. Selling is done using a Mollie integration. Tickets is serialized as a QR-code (with the payload encrypted) and distributed using email via a Sendgrid integration. An admin interface is provided with which ticket details can be viewed and edited. The admin interface also provides a scanned, which scans QR-codes and shows whether the ticket is valid and whether it has been scanned before.

## Development

Prerequisites:

1. Install a Postgres server locally.
   - Take a look at installation instructions for your platform here:
     https://www.postgresql.org/download/
2. Populate database with required tables.
   - Execute the contents of `./server/database.sql` on your new database.
3. Install `deno`.
   - Take a look at installation instructions for your platform here:
     https://deno.land/
4. Install `npm`.
   - To use `npm`, you need to install `Node.js`. It is recommended that you
     install `Node.js` using `nvm`. Take a look at installation instructions for
     your platform here: https://github.com/nvm-sh/nvm
5. Install client dependencies:
   - Navigate into the client folder (`cd ./client`) and run `npm install`
6. Set up the .env file in `./server`.
   - See `/server/README.md` for further instructions.

Run the server for development:

- Start you local Postgres server
- `cd server`
- `deno run --allow-env --allow-net --allow-read main.ts`
- If you want to test the Mollie integration, your server needs to be reachable
  from the outside by Mollie. You have a few options here:
  - Use a service like http://localhost.run/. Set the `HOST` property in your
    `.env` file to the returned URL.
  - Setup your router to forward incoming requests from the outside to the port
    on your machine where the server listens. Set the `HOST` property in your
    `.env` file to the public IP address of your router.

Run the client for development:

- `cd client`
- `npm run start`

## Production

1. Set up the .env file in `./server`.
   - See `/server/README.md` for further instructions.
2. Run `docker compose up --build`

It is recommended to run the Postgres database directly on the bare-metal production
machine. The Docker configuration does not provide a database server and the application will fail to start if no database server is found.

The `docker-compose.yml` file inserts the following environment variable:
`DATABASE_HOST=host.docker.internal`. This allows your server to connect to your
database on `localhost` from within the container.
