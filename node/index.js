import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import route from "./routes/userRoute.js";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
dotenv.config();

const PORT = process.env.PORT || 7000;
const URL = process.env.MONGOURL;
const secretKey = 'atif1234@1234';

// Middleware to check JWT token, excluding authentication and some other routes
app.use((req, res, next) => {
  // Get the token from the request header
  const token = req.headers.authorization;

  // Exclude certain paths from token verification
  const excludedPaths = ['/api/authenticate', '/api/create', '/api/getall', '/api/getOne', '/api/delete', '/api/update'];

  if (excludedPaths.includes(req.path)) {
    return next();
  }

  // Verify the token
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = decoded;
    next();
  });
});

mongoose.connect(URL).then(() => {
  console.log("DB connected successfully");

  app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
}).catch(error => console.log(error));

app.use("/api", route);

// Authentication endpoint
app.post('/api/authenticate', (req, res) => {
  const { username, password } = req.body;

  // Perform authentication logic here...
  // For demonstration purposes, let's assume a simple check for a valid user
  if (username === 'demoUser' && password === 'demoPassword') {
    // If authentication is successful, create a token
    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});
