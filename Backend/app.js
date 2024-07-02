import express from 'express'
import { dbConnection } from "./database/dbConnection.js";
import dotenv from 'dotenv'
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from 'express-fileupload';
import jobRoutes from "./routes/jobRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import { errorMiddleware } from "./middlewares/error.js";

const app = express();
dotenv.config({ path: './config/config.env' })

app.use(
    cors({
        // we are making this a array bcoz if we have more than one frontend we can put that in array.
        origin: process.env.FRONTEND_URL,
        // origin: 'http://localhost:5173/',
        method: ["GET", "POST", "DELETE", "PUT"],
        allowedHeaders: ['Content-Type', 'Authorization'],
        // in app.jsx we have withCredentials = true bcoz of this.
        credentials: true,
    })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
    })
);

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/job", jobRoutes);
app.use("/api/v1/application", applicationRoutes);

dbConnection();

// its always use at the end
app.use(errorMiddleware);
export default app; 