// server.js
import express from 'express';
import CryptoJS from 'crypto-js';
import fetch from 'node-fetch';
import cors from 'cors';
import * as dotenv from 'dotenv';

// Carga el archivo de entorno
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: envFile });

const app = express();
const PORT = process.env.PORT || 3000;

// Verifica que las variables de entorno estén configuradas
if (!process.env.BASE_URL || !process.env.API_KEY || !process.env.API_SECRET) {
    throw new Error('Faltan configuraciones en el archivo .env. Asegúrate de incluir BASE_URL, API_KEY y API_SECRET.');
}

// Middleware para habilitar CORS
app.use(cors({
    origin: 'http://localhost:5173', // Permite solicitudes desde el origen de desarrollo
}));

const BASE_URL = process.env.BASE_URL; // Ejemplo: https://testnet.binance.vision
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

// Endpoint para obtener detalles de la cuenta
app.get('/account', async (req, res) => {
    try {
        console.log('Solicitud recibida en /account');

        const timestamp = Date.now();
        const query = `timestamp=${timestamp}`;
        const signature = CryptoJS.HmacSHA256(query, API_SECRET).toString(CryptoJS.enc.Hex);

        console.log('Query:', query);
        console.log('Signature:', signature);

        const response = await fetch(`${BASE_URL}/api/v3/account?${query}&signature=${signature}`, {
            method: 'GET',
            headers: {
                'X-MBX-APIKEY': API_KEY,
            },
        });

        console.log('Respuesta de Binance:', response.status);

        const data = await response.json();
        if (response.ok) {
            res.json(data);
        } else {
            res.status(response.status).json({ error: data.msg || 'Error desconocido.' });
        }
    } catch (error) {
        console.error('Error al conectar con Binance API:', error.message);
        res.status(500).json({ error: `Error al conectar con Binance API: ${error.message}` });
    }
});


// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor proxy escuchando en el puerto ${PORT}`);
});
