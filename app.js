const express = require("express");
const connectToDB = require("./config/connectToDB");
const { errorHandler, notFound } = require("./middlewares/error");
const xss = require("xss-clean");
const cors = require("cors");
const helmet = require("helmet");
const rateLimiting = require("express-rate-limit")
const hpp = require("hpp");

require("dotenv").config();

// connection to db
connectToDB();

// init app
const app = express();

// middlewares
app.use(express.json());

// security headers (helmet)
app.use(helmet());

// Prevent http param pollution
app.use(hpp());

// Prevent XSS (cross site scripting) attacks
app.use(xss());

// rate limiting (means that the user can sent just 2 request every 10 minutes)
app.use(rateLimiting({ 
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 200,
}))

// cors policy
app.use(cors({
  // origin: "http://localhost:3000",
  origin: "https://jawadou29.github.io/blog-app",
}))

// routes
app.use("/api/auth/", require("./routes/auhthRoute"));
app.use("/api/users/", require("./routes/usersRoute"));
app.use("/api/posts/", require("./routes/postsRoute"));
app.use("/api/comments/", require("./routes/commentroute"));
app.use("/api/categories/", require("./routes/categotyRoute"));
app.use("/api/password/", require("./routes/passwordRoute"));

// error handler
app.use(notFound);
app.use(errorHandler);

// running the server
const PORT = process.env.PORT;
app.listen(PORT, () =>
  console.log(
    `server is running in ${process.env.MODE_ENV} mode on port ${PORT}`
  )
);
