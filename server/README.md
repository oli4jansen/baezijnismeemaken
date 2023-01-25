# baezijnismeemaken - Server

Sits between the Postgres database and the frontend application.

The server application is built with [Deno](https://deno.land/) (a runtime for
TypeScript) and [Oak](https://deno.land/x/oak), which is a middleware framework
for Deno's HTTP server.

## Setting up `.env`

* Copy `example.env` to `.env` and replace all values. See the table below for explanation.

## Environment variables

This is a list of all environment variables available and an explanation.

| Name | Description |
|---|---|
| `ADMIN_USERNAME` | The username needed to sign in to the backend. |
| `ADMIN_PASSWORD` | The password needed to sign in to the backend. |
| `CLEANUP_EVERY_MS` | Number of milliseconds between cleanup jobs. During the cleanup job, ticket reservations that have expired are freed and the tickets are made available again. |
| `CLIENT` | The URL to the client application. Used to redirect users back after the Mollie payment. |
| `CRYPTO_HS512_KEY` | Key used to sign JWT tokens using HMAC SHA-512. To ensure JWT tokens are valid between server instances, the key needs to be stored here. Leave this value out of the `.env` and the application will generate a token and ask you to save it to the `.env`. |
| `CRYPTO_A256GCM_KEY` | Key used to sign the payload of the ticket QR-codes using A256GCM. To ensure tickets can be encoded and decoded between server instances, the key needs to be stored here. If this doesn't happen, a sold ticket can only be scanned if the server has not been restarted. Leave this value out of the `.env` and the application will generate a token and ask you to save it to the `.env`. |
| `DATABASE_NAME` | Name of the `postgres` database. |
| `DATABASE_HOST` | Host at which the database can be reached. |
| `DATABASE_PORT` | Port on which the database can be reached. |
| `DATABASE_USER` | User with which to authenticate at the database server. |
| `DATABASE_PASSWORD` | Password with which to authenticate at the database server. |
| `DATABASE_POOL_CONNECTIONS` | Number of database connections to keep open (typically between 1 and 115). |
| `HOST` | Host of the backend application. Including `https://`, excluding trailing `/`. |
| `MOLLIE_TOKEN` | Mollie API token. |
| `MOLLIE_DESCRIPTION` | Short description of the purchase to show on Mollie page. |
| `PORT` | Port of the backend application. |
| `RESERVATION_VALID_FOR_MS` | Number of milliseconds for which a reservation should be valid. |
| `SENDGRID_TOKEN` | Sendgrid API token. |
| `SENDGRID_SENDER_NAME` |  |
| `SENDGRID_SENDER_EMAIL` |  |
| `SENDGRID_SUBJECT` |  |
| `SENDGRID_SALUTATION` |  |
| `SENDGRID_REPERSONALIZED_BODY` |  |
| `SENDGRID_BODY` |  |
| `TICKET_SUBSCRIPT` | Text visible on each ticket PDF. Useful to instruct customers to bring the ticket to the event for it to be scanned. |

