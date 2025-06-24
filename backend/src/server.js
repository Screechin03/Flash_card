import dotenv from 'dotenv';
import app from './app.js';
import cors from 'cors';

dotenv.config();

const PORT = process.env.PORT || 3000;


app.use(cors({
    origin: 'http://localhost:5174', // your frontend URL
    credentials: true
}));
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})