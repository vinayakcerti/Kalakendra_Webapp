import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

const sessionSecret = process.env["SESSION_SECRET"];
if (!sessionSecret) {
  logger.warn("SESSION_SECRET not set — using insecure fallback for sessions");
}

app.use(
  session({
    secret: sessionSecret ?? "kala-kendra-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,           // required for SameSite=None
      sameSite: "none",       // required for cross-domain (Vercel → Render)
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
// Allow requests from the frontend (Vercel) and local dev
const allowedOrigins = [
  process.env["APP_URL"],          // e.g. https://kalakendra-sweden.vercel.app
  "http://localhost:5173",
  "http://localhost:80",
  "http://localhost:3000",
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Render health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o))) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
