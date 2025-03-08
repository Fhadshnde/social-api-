const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const authRouter = require('./routes/authRoute');
const usersRouter = require('./routes/usersRoute');
const postsRouter = require("./routes/postsRoute");
const commentsRouter = require("./routes/commentsRoute");
const categoriesRouter = require("./routes/categoriesRoute");

const app = express();

// Connect to MongoDB
const connectDB = async () => {
    try {
        if (!process.env.MONGO_URL) {
            throw new Error("MongoDB URL is not defined in .env");
        }
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error.message);
        process.exit(1); // Stop the app if DB connection fails
    }
};

// Ensure the environment variables are loaded
if (!process.env.PORT || !process.env.MONGO_URL) {
    console.error("Missing necessary environment variables. Please check your .env file.");
    process.exit(1); // Stop the app if essential environment variables are missing
}

// Middleware
// const corsOptions = {
//     origin: (origin, callback) => {
//         const allowedOrigins = [
//             "http://localhost:3000",
//             "https://magnificent-lokum-d53f11.netlify.app",
//             "https://social-api-sr3k.vercel.app"
//         ];
//         if (allowedOrigins.includes(origin) || !origin) {
//             callback(null, true); // السماح بالطلب
//         } else {
//             callback(new Error("Not allowed by CORS"));
//         }
//     },
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"]
// };

app.use(cors());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/posts", postsRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/categories", categoriesRouter);

// Global error handler for uncaught errors
app.use((err, req, res, next) => {
    console.error("Unexpected error:", err.message);
    res.status(500).json({ message: "Something went wrong on the server." });
});

// Start the server after connecting to DB
const startServer = async () => {
    await connectDB();
    app.listen(process.env.PORT || 8001, () => {
        console.log(`Server is running on port ${process.env.PORT || 8001}`);
    });
};

startServer();

// تأكد من تصدير التطبيق
module.exports = app;
