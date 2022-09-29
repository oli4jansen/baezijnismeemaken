# baezijnismeemaken

This is a event ticketing system built for the BAE Openluchtcantus 2023.

The main features of the system are to 1) sell tickets using a
Mollie-integration, 2) distribute tickets via email as QR codes, and 3) check
ticket validity at the entrance of the event using a QR code scanner.

## Development

Prerequisites:

1. Install a Postgres server locally.
   - Take a look at installation instructions for your platform here:
     https://www.postgresql.org/download/
2. Install `deno`.
   - Take a look at installation instructions for your platform here:
     https://deno.land/
3. Install `npm`.
   - To use `npm`, you need to install `Node.js`. It is recommended that you
     install `Node.js` using `nvm`. Take a look at installation instructions for
     your platform here: https://github.com/nvm-sh/nvm
4. Install client dependencies:
   - Navigate into the client folder (`cd client`) and run `npm install`
5. Set up the .env file
   - Database details
   - Admin account

Run the server:

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

Run the client:

- `cd client`
- `npm run start`

## Production

`docker compose up --build`

It is recommended to run the Postgres database directly on the production
machine.

The `docker-compose.yml` file inserts the following environment variable:
`DATABASE_HOST=host.docker.internal`. This allows your server to connect to your
database on `localhost` from within the container.
