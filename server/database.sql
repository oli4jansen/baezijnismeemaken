CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ticket types are managed by the administrators
CREATE TABLE ticket_types (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    amount_available INTEGER NOT NULL DEFAULT 100
);

-- Reservations are created by users, initially this is only a reservation
CREATE TABLE reservations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Reservations have a many-to-many relation with ticket_types
CREATE TABLE tickets (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation uuid,
    ticket_type uuid,
    owner_counter INTEGER NOT NULL DEFAULT 0,
    owner_email VARCHAR(255),
    owner_first_name VARCHAR(255),
    owner_last_name VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reservation FOREIGN KEY(reservation) REFERENCES reservations(id) ON DELETE CASCADE,
    CONSTRAINT fk_ticket_types FOREIGN KEY(ticket_type) REFERENCES ticket_types(id) ON DELETE CASCADE
);

CREATE TABLE payments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation uuid NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    mollie_id VARCHAR(255) NOT NULL UNIQUE,
    CONSTRAINT fk_reservation FOREIGN KEY(reservation) REFERENCES reservations(id)
);

CREATE TABLE completions (
    reservation uuid UNIQUE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reservation FOREIGN KEY(reservation) REFERENCES reservations(id)
);

CREATE TABLE ticket_scans (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id uuid,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ticket_id FOREIGN KEY(ticket_id) REFERENCES tickets(id)
);