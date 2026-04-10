if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const engine = require("ejs-mate");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const passport = require("passport");
const localPassport = require("passport-local");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

const User = require("./models/user");

const AppError = require("./utilities/AppError");
const CampgroundRouter = require("./routes/campgrounds");
const ReviewRouter = require("./routes/reviews");
const UserRouter = require("./routes/users");

// atlas
// process.env.DB_URL;
// local
// "mongodb://127.0.0.1:27017/YelpCampDB"

const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/YelpCampDB";

mongoose
  .connect(dbUrl)
  .then(() => console.log("Connection Open"))
  .catch((e) => console.log(e));

const app = express();

app.use(express.static(path.join(__dirname, "/publics")));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(mongoSanitize());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/",
];
const connectSrcUrls = [
  "https://api.maptiler.com",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com",
];
const fontSrcUrls = [];

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        objectSrc: [],
        imgSrc: [
          "'self'",
          "blob:",
          "data:",
          "https://res.cloudinary.com/divqhgf1j/",
          "https://api.maptiler.com/",
          "https://images.unsplash.com",
        ],
        fontSrc: ["'self'", ...fontSrcUrls],
      },
    },
    crossOriginEmbedderPolicy: { policy: "credentialless" },
  }),
);

app.use(methodOverride("_method"));

app.engine("ejs", engine);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const secret = process.env.SECRET || "secretKey";

const store = MongoStore.create({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60,
});

app.use(
  session({
    store,
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      // over HTTPS secure: true,
    },
  }),
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localPassport(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  if (!["/login", "/"].includes(req.originalUrl)) {
    req.session.returnTo = req.originalUrl;
  }
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get("/", (req, res) => {
  res.render("home");
});

app.use("/", UserRouter);
app.use("/campgrounds", CampgroundRouter);
app.use("/campgrounds/:id/reviews", ReviewRouter);

app.all("*", (req, res, next) => {
  next(new AppError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { status = 500 } = err;
  if (!err.message) {
    err.message = "Something went wrong";
  }

  res.status(status).render("error", { err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Serving on port ${port}`));
