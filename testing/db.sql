-- Sample code for table stuff. Actually run through psql

-- Create message table
CREATE TABLE message (
    id serial PRIMARY KEY,
    time_sent timestamp DEFAULT current_timestamp,
    sender varchar(50) NOT NULL,
    url text NOT NULL,
    body text NOT NULL
);

-- Create persistant message table
CREATE TABLE graffiti (
    id serial PRIMARY KEY,
    time_sent timestamp DEFAULT current_timestamp,
    sender varchar(50) NOT NULL,
    url text NOT NULL,
    body text NOT NULL
);