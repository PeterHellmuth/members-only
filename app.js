const express = require("express");
const path = require("path");
const logger = require("morgan");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, ".env") });

// Set up mongoose connection
const mongoose = require("mongoose");
const DEPLOY_URL = "http://express-react-template.fly.dev";

mongoose.set("strictQuery", false);
const mongoDB = `mongodb+srv://peterhellmuth:${process.env.MONGOOSE_PASS}@cluster0.kterel9.mongodb.net/members_only?retryWrites=true&w=majority`;

async function main() {
  await mongoose.connect(mongoDB);
  console.log("Connected to MongoDB");
}
main().catch((err) => console.log(err));

// Set up rate limiter: maximum of twenty requests per minute
const RateLimit = require("express-rate-limit");

const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
});

// Add helmet to the middleware chain.
// Set CSP headers to allow our Bootstrap and Jquery to be served
const helmet = require("helmet");

const cors = require("cors");
const indexRouter = require("./routes/index");
const userRouter = require("./routes/users");

const app = express();
//app.use(passport.initialize());
// Apply rate limiter to all requests
app.use(limiter);

// Security
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "connect-src": ["'self'", `${DEPLOY_URL}`],
    },
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const buildPath = path.normalize(path.join(__dirname, "./react-client/dist"));
app.use(express.static(buildPath));
app.use(cors());
app.use("/", indexRouter);
app.use("/users", userRouter);

module.exports = app;
