--------- user -----------
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    email TEXT UNIQUE,
    hashed_password TEXT,
    google_id VARCHAR(255) UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    is_revoked BOOLEAN DEFAULT FALSE
);

CREATE TABLE user_auth_providers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    provider_user_id TEXT NOT NULL,
    email TEXT,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);

-------- calendar -----------
CREATE TABLE calendars (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    visibility BOOLEAN DEFAULT FALSE,
    read_link VARCHAR(32) NOT NULL,
    read_link_enable BOOLEAN DEFAULT FALSE,
    write_link VARCHAR(32) NOT NULL,
    write_link_enable BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE calendar_shared_users (
    calendar_id INTEGER REFERENCES calendars(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    permission TEXT DEFAULT 'write', -- 'read', 'write'
    PRIMARY KEY (calendar_id, user_id, permission)
);

---------- event ----------
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    calendar_id INTEGER REFERENCES calendars(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP(0) NOT NULL,
    end_time TIMESTAMP(0) NOT NULL,
    is_all_day BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

--------- subscription ----------
CREATE TABLE calendar_subscriptions (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    calendar_id INTEGER REFERENCES calendars(id) ON DELETE CASCADE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, calendar_id)
);

----------- group ----------
CREATE TABLE groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE group_members (
  group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, user_id)
);

---------- availability ----------
CREATE TABLE user_availability (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    available_date DATE NOT NULL,
    start_time TIME(0) NOT NULL,
    end_time TIME(0) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--------- poll ----------
CREATE TABLE polls (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_confirmed BOOLEAN DEFAULT FALSE,
    confirmed_time_range_id INTEGER,
    is_cancelled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE poll_time_ranges (
    id SERIAL PRIMARY KEY,
    poll_id INTEGER REFERENCES polls(id) ON DELETE CASCADE,
    start_time TIMESTAMP(0) NOT NULL,
    end_time TIMESTAMP(0) NOT NULL
);

ALTER TABLE polls
  ADD CONSTRAINT fk_confirmed_time_range_id FOREIGN KEY (confirmed_time_range_id)  REFERENCES poll_time_ranges(id);

CREATE TABLE poll_invited_users (
    poll_id INTEGER REFERENCES polls(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (poll_id, user_id)
);

CREATE TABLE poll_votes (
    poll_id INTEGER REFERENCES polls(id) ON DELETE CASCADE,
    time_range_id INTEGER REFERENCES poll_time_ranges(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_available BOOLEAN NOT NULL,
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (poll_id, time_range_id, user_id)
);
