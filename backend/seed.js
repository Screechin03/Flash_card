import pool from "./config/database.js";

async function seed() {
    // Clear existing data
    await pool.query('DELETE FROM flashcards');
    await pool.query('DELETE FROM flashcard_sets');
    await pool.query('DELETE FROM users');

    // Create users
    const userRes = await pool.query(
        `INSERT INTO users (username, email, password) VALUES
      ('alice', 'alice@example.com', '$2a$10$7Qw1Qw1Qw1Qw1Qw1Qw1QwOQw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Q'),
      ('bob', 'bob@example.com', '$2a$10$7Qw1Qw1Qw1Qw1Qw1Qw1QwOQw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Q')
      RETURNING id, username`);
    const [alice, bob] = userRes.rows;

    // Create sets (topics)
    const setRes = await pool.query(
        `INSERT INTO flashcard_sets (title, description, user_id) VALUES
      ('Math: Algebra', 'Algebra basics', $1),
      ('Math: Geometry', 'Geometry concepts', $1),
      ('Science: Physics', 'Physics fundamentals', $2),
      ('Science: Chemistry', 'Chemistry basics', $2)
      RETURNING id, title, user_id`,
        [alice.id, bob.id]
    );
    const sets = setRes.rows;

    // Create cards for each set
    for (const set of sets) {
        await pool.query(
            `INSERT INTO flashcards (front, back, set_id) VALUES
        ($1, $2, $3),
        ($4, $5, $3),
        ($6, $7, $3)`,
            [
                `What is a variable?`, `A symbol for a number we don't know yet.`, set.id,
                `What is an equation?`, `A statement that two things are equal.`,
                `What is a function?`, `A relation from a set of inputs to a set of possible outputs.`,
            ]
        );
    }

    // Create more cards for variety and realism
    await pool.query(
        `INSERT INTO flashcards (front, back, set_id) VALUES
      ($1, $2, $3),
      ($4, $5, $6),
      ($7, $8, $9),
      ($10, $11, $12),
      ($13, $14, $15),
      ($16, $17, $18),
      ($19, $20, $21),
      ($22, $23, $24)
    `,
        [
            'What is the quadratic formula?', 'x = [-b ± sqrt(b²-4ac)] / 2a', sets[0].id,
            'What is the Pythagorean theorem?', 'a² + b² = c²', sets[1].id,
            "What is Newton's First Law?", 'An object in motion stays in motion unless acted upon by a force.', sets[2].id,
            'What is an atom?', 'The smallest unit of matter that retains the properties of an element.', sets[3].id,
            'What is a coefficient?', 'A number used to multiply a variable.', sets[0].id,
            'What is a polygon?', 'A closed figure with straight sides.', sets[1].id,
            'What is velocity?', 'Speed in a given direction.', sets[2].id,
            'What is a molecule?', 'Two or more atoms bonded together.', sets[3].id
        ]
    );

    console.log('Seed data inserted!');
    process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
