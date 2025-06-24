import pool from "./config/database.js";

console.log("Starting the seed-more-data script...");

async function seedMoreData() {
    try {
        // Get existing users
        const userRes = await pool.query('SELECT id, username FROM users');
        const users = userRes.rows;
        if (users.length === 0) {
            console.error('No users found. Please run seed.js first.');
            process.exit(1);
        }

        // Create more sets (topics)
        const newSets = [
            // Programming topics
            { title: 'Programming: JavaScript', description: 'JavaScript fundamentals and tricks', userId: users[0].id },
            { title: 'Programming: React', description: 'React.js concepts and best practices', userId: users[0].id },
            { title: 'Programming: Python', description: 'Python language basics and advanced topics', userId: users[1].id },

            // Language topics
            { title: 'Languages: Spanish', description: 'Spanish vocabulary and grammar', userId: users[0].id },
            { title: 'Languages: French', description: 'French basics for beginners', userId: users[1].id },

            // History topics
            { title: 'History: World War II', description: 'Key events, figures and dates', userId: users[0].id },
            { title: 'History: Ancient Rome', description: 'Roman empire and civilization', userId: users[1].id },

            // Biology topics
            { title: 'Biology: Human Anatomy', description: 'Systems and organs of the human body', userId: users[0].id },
            { title: 'Biology: Cell Biology', description: 'Cell structures and functions', userId: users[1].id }
        ];

        // Insert new sets
        for (const set of newSets) {
            const setRes = await pool.query(
                `INSERT INTO flashcard_sets (title, description, user_id) 
                VALUES ($1, $2, $3) RETURNING id`,
                [set.title, set.description, set.userId]
            );
            set.id = setRes.rows[0].id;
        }

        // JavaScript cards
        const jsCards = [
            { front: 'What is a closure in JavaScript?', back: 'A function that has access to variables from its outer (enclosing) lexical scope even after the outer function has returned.' },
            { front: 'What is the difference between let and var?', back: 'let is block-scoped, var is function-scoped. let does not allow redeclaration, and variables are not hoisted to the top.' },
            { front: 'What is the event loop?', back: 'A mechanism that allows JavaScript to perform non-blocking operations despite being single-threaded.' },
            { front: 'What is a Promise?', back: 'An object representing the eventual completion or failure of an asynchronous operation and its resulting value.' },
            { front: 'What is destructuring in JavaScript?', back: 'A syntax that allows unpacking values from arrays or properties from objects into distinct variables.' }
        ];

        // React cards
        const reactCards = [
            { front: 'What is JSX?', back: 'A syntax extension for JavaScript that looks similar to HTML and allows you to create React elements easily.' },
            { front: 'What are React hooks?', back: 'Functions that let you use state and other React features without writing a class.' },
            { front: 'What is the virtual DOM?', back: 'A lightweight in-memory representation of the real DOM that React uses to improve performance.' },
            { front: 'What is a React component?', back: 'A reusable piece of UI that can be a function or a class that returns a React element.' },
            { front: 'What is state in React?', back: 'An object that determines how a component renders and behaves.' },
            { front: 'What is React Context?', back: 'A way to pass data through the component tree without having to pass props down manually at every level.' }
        ];

        // Python cards
        const pythonCards = [
            { front: 'What are Python decorators?', back: 'Functions that modify the behavior of other functions or methods.' },
            { front: 'What is a list comprehension?', back: 'A concise way to create lists using a single line of code.' },
            { front: 'What is the difference between a tuple and a list?', back: 'Tuples are immutable (cannot be changed), while lists are mutable.' },
            { front: 'What is PEP 8?', back: 'A style guide for Python code that provides coding conventions.' },
            { front: 'What is the Global Interpreter Lock (GIL)?', back: 'A mutex that protects access to Python objects, preventing multiple threads from executing Python bytecode at once.' }
        ];

        // Spanish cards
        const spanishCards = [
            { front: '¿Cómo estás?', back: 'How are you?' },
            { front: 'Buenos días', back: 'Good morning' },
            { front: 'Gracias', back: 'Thank you' },
            { front: 'Por favor', back: 'Please' },
            { front: 'Me llamo...', back: 'My name is...' },
            { front: '¿Dónde está el baño?', back: 'Where is the bathroom?' }
        ];

        // French cards
        const frenchCards = [
            { front: 'Bonjour', back: 'Hello/Good day' },
            { front: 'Au revoir', back: 'Goodbye' },
            { front: 'Comment allez-vous?', back: 'How are you?' },
            { front: 'Je m\'appelle...', back: 'My name is...' },
            { front: 'Merci beaucoup', back: 'Thank you very much' }
        ];

        // World War II cards
        const ww2Cards = [
            { front: 'When did World War II begin?', back: 'September 1, 1939, with the German invasion of Poland' },
            { front: 'Who were the main Allied Powers?', back: 'United States, Soviet Union, Great Britain, and France' },
            { front: 'Who were the main Axis Powers?', back: 'Germany, Italy, and Japan' },
            { front: 'What was D-Day?', back: 'June 6, 1944 - Allied invasion of Normandy, France' },
            { front: 'When did World War II end?', back: 'September 2, 1945, with the surrender of Japan' }
        ];

        // Ancient Rome cards
        const romeCards = [
            { front: 'Who was the first Roman Emperor?', back: 'Augustus (Octavian)' },
            { front: 'What was the Roman Senate?', back: 'A governing and advisory assembly of Roman patricians' },
            { front: 'What were the Roman Legions?', back: 'The professional units that formed the Roman army' },
            { front: 'What was the Colosseum used for?', back: 'Gladiatorial contests and public spectacles' },
            { front: 'When was Rome founded (legendary date)?', back: '753 BCE' }
        ];

        // Human Anatomy cards
        const anatomyCards = [
            { front: 'What are the four chambers of the heart?', back: 'Right atrium, right ventricle, left atrium, left ventricle' },
            { front: 'What is the largest organ of the human body?', back: 'Skin' },
            { front: 'What does the pancreas do?', back: 'Produces insulin and other hormones, and digestive enzymes' },
            { front: 'What is the cerebellum responsible for?', back: 'Coordination, precision, and timing of movements' },
            { front: 'What are the major types of blood cells?', back: 'Red blood cells (erythrocytes), white blood cells (leukocytes), and platelets (thrombocytes)' }
        ];

        // Cell Biology cards
        const cellCards = [
            { front: 'What is the function of mitochondria?', back: 'Produce energy (ATP) through cellular respiration' },
            { front: 'What does the endoplasmic reticulum do?', back: 'Synthesizes, processes, and transports proteins and lipids' },
            { front: 'What is the Golgi apparatus?', back: 'Processes, packages, and distributes molecules manufactured by the cell' },
            { front: 'What is the cell membrane made of?', back: 'Phospholipid bilayer with embedded proteins' },
            { front: 'What is the difference between prokaryotic and eukaryotic cells?', back: 'Eukaryotic cells have a nucleus and membrane-bound organelles, while prokaryotic cells do not' }
        ];

        // Map the cards to each set
        const allCards = [
            { setIndex: 0, cards: jsCards },
            { setIndex: 1, cards: reactCards },
            { setIndex: 2, cards: pythonCards },
            { setIndex: 3, cards: spanishCards },
            { setIndex: 4, cards: frenchCards },
            { setIndex: 5, cards: ww2Cards },
            { setIndex: 6, cards: romeCards },
            { setIndex: 7, cards: anatomyCards },
            { setIndex: 8, cards: cellCards }
        ];

        // Insert all cards
        for (const { setIndex, cards } of allCards) {
            const setId = newSets[setIndex].id;
            for (const card of cards) {
                await pool.query(
                    `INSERT INTO flashcards (front, back, set_id) VALUES ($1, $2, $3) RETURNING id`,
                    [card.front, card.back, setId]
                );
            }
        }            // Mark one card as studied
        // First get a card ID
        const cardRes = await pool.query('SELECT id FROM flashcards WHERE set_id = $1 LIMIT 1', [newSets[0].id]);
        if (cardRes.rows.length > 0) {
            const cardId = cardRes.rows[0].id;

            // Check if the analytics tables exist (they should have been created by setupAnalytics.js)
            try {
                // Mark the card as studied with "correct" status using the analytics table
                await pool.query(
                    `INSERT INTO analytics (user_id, set_id, card_id, status) 
                    VALUES ($1, $2, $3, $4)`,
                    [users[0].id, newSets[0].id, cardId, 'correct']
                );

                console.log(`Successfully marked card ${cardId} as studied.`);
            } catch (err) {
                console.log("Note: Could not mark card as studied. Analytics tables might not exist yet:", err.message);
            }
        }

        console.log('Additional seed data inserted successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding additional data:', err);
        process.exit(1);
    }
}

seedMoreData();
