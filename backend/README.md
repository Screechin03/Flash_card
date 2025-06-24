# Flashcard API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

**Body:**
```json
{
  "username": "string (3-20 chars, alphanumeric + underscore)",
  "email": "string (valid email)",
  "password": "string (min 6 chars)"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  },
  "token": "jwt_token_here"
}
```

#### Login User
```http
POST /auth/login
```

**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  },
  "token": "jwt_token_here"
}
```

#### Get Current User
```http
GET /auth/me
```
*Requires authentication*

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

### Flashcard Sets

#### Create Flashcard Set
```http
POST /flashcards/sets
```
*Requires authentication*

**Body:**
```json
{
  "title": "string (2-100 chars)",
  "description": "string (optional)"
}
```

#### Get All User Sets
```http
GET /flashcards/sets
```
*Requires authentication*

**Response:**
```json
{
  "message": "Sets retrieved successfully",
  "sets": [
    {
      "id": 1,
      "title": "Spanish Vocabulary",
      "description": "Basic Spanish words",
      "user_id": 1,
      "created_at": "2025-06-19T06:29:47.271Z",
      "card_count": "2"
    }
  ]
}
```

#### Get Specific Set with Cards
```http
GET /flashcards/sets/:setId
```
*Requires authentication*

#### Update Flashcard Set
```http
PUT /flashcards/sets/:setId
```
*Requires authentication*

#### Delete Flashcard Set
```http
DELETE /flashcards/sets/:setId
```
*Requires authentication*

### Flashcards

#### Create Flashcard
```http
POST /flashcards/sets/:setId/cards
```
*Requires authentication*

**Body:**
```json
{
  "front": "string (required, max 1000 chars)",
  "back": "string (required, max 1000 chars)"
}
```

#### Update Flashcard
```http
PUT /flashcards/cards/:cardId
```
*Requires authentication*

#### Delete Flashcard
```http
DELETE /flashcards/cards/:cardId
```
*Requires authentication*

#### Get Random Cards for Study
```http
GET /flashcards/sets/:setId/study?limit=10
```
*Requires authentication*

**Query Parameters:**
- `limit`: Number of random cards to return (default: 10)

## Error Responses

### Validation Error (400)
```json
{
  "message": "Validation failed",
  "errors": [
    "Username is required",
    "Password must be at least 6 characters long"
  ]
}
```

### Authentication Error (401)
```json
{
  "message": "No token, authorization denied"
}
```

### Not Found Error (404)
```json
{
  "message": "Flashcard set not found"
}
```

### Server Error (500)
```json
{
  "message": "Server error during registration"
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Flashcard Sets Table
```sql
CREATE TABLE flashcard_sets (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Flashcards Table
```sql
CREATE TABLE flashcards (
  id SERIAL PRIMARY KEY,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  set_id INTEGER REFERENCES flashcard_sets(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Environment Variables

Create a `.env` file in the root directory:
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=flashcards_db
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
```

## Running the Server

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```
