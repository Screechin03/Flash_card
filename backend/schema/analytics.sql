CREATE TABLE IF NOT EXISTS analytics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    set_id INTEGER NOT NULL REFERENCES flashcard_sets(id) ON DELETE CASCADE,
    card_id INTEGER NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('correct', 'incorrect', 'skipped')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, card_id, timestamp)
);

CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_card_id ON analytics(card_id);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics(timestamp);
