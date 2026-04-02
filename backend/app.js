import express from "express";
import cors from 'cors'
import { pool } from "./database/connection.js";
import routes from "./routes/routes.js";
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';
const swaggerDocument = YAML.load('../swagger.yaml');

const app = express();
app.use(express.json());
app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps, Postman)
        if (!origin) return callback(null, true);

        if (
            origin === "http://localhost:5173" ||
            origin.endsWith(".netlify.app")
        ) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}))
app.use(routes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/testDb', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1');
        // console.log(rows); //[ { '1': 1 } ]
        return res.json({
            status: 'ok',
            message: 'db connected'
        })
    } catch(err) {
        return res.status(500).json({
            error: err.message
        })
    }
})


app.get('/', (req,res) => {
    return res.status(200).json({
        status: 'ok',
        message: 'success'
    })
})
export default app;
