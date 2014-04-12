CREATE TABLE message (
    id serial PRIMARY KEY,
    time_sent timestamp DEFAULT current_timestamp,
    sender varchar(50) NOT NULL,
    url text NOT NULL,
    body text NOT NULL
);
