import express from 'express';
import CryptoJS from 'crypto-js';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';

// Carga el archivo correcto según el entorno (desarrollo o producción)
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: envFile });

const app = express();
const PORT = process.env.PORT || 3000;

// Variables de entorno para Testnet o Mainnet
const BASE_URL = process.env.BASE_URL; // Asegúrate de que sea "https://testnet.binance.vision" en tu .env
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

// Endpoint para obtener detalles de la cuenta
app.get('/api/account', async (req, res) => {
    try {
        const timestamp = Date.now();
        const query = `timestamp=${timestamp}`;

        console.log('Query:', query);
        console.log('API_SECRET:', API_SECRET);

        const signature = CryptoJS.HmacSHA256(query, API_SECRET).toString(CryptoJS.enc.Hex);

        console.log('Signature:', signature);

        const response = await fetch(`${BASE_URL}/api/v3/account?${query}&signature=${signature}`, {
            method: 'GET',
            headers: {
                'X-MBX-APIKEY': API_KEY,
            },
        });

        const data = await response.json();
        if (response.ok) {
            res.json(data);
        } else {
            res.status(response.status).json(data);
        }
    } catch (error) {
        console.error('Error al conectar con Binance API:', error.message);
        res.status(500).json({ error: 'Error al conectar con Binance API' });
    } if (!API_SECRET) {
        throw new Error('El secreto de la API no está configurado. Verifica tu archivo .env');
    }
});



// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor proxy escuchando en el puerto ${PORT}`);
});
