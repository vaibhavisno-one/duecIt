import 'dotenv/config'
import { httpServer } from './app.js'
import connectDB from "./db/index.js";
import { initializeSocket } from './services/socket.service.js';

connectDB()
    .then(() => {
        initializeSocket(httpServer);
        
        httpServer.listen(process.env.PORT || 8000, () => {
            console.log(`🚀 Server running on port ${process.env.PORT}`);
            console.log(`⚡ WebSocket ready`);
        })
    })
    .catch((err) => {
        console.log('MONGODB CONNECTION FAILED', err);
    })