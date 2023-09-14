var express = require("express");
var path = require("path");
const methodOverride = require("express-method-override");
var cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");
const speakeasy = require("speakeasy");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const session = require("express-session");
const db = require("./config/connection");
// const fileUpload = require('express-fileupload');

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//route for error page
app.get("/error", (req, res) => {
  res.render("error");
});

//route for server error
app.get("/serverError", (req, res) => {
  res.render("serverError");
});

// databse connection calling
db.connect((err) => {
  if (err) {
    console.log("There is an error connecting to your databse" + err);
  } else {
    console.log("Successfully connected to your database");
  }
});

//session
app.use(
  session({
    secret: uuidv4(),
    cookie: { maxAge: 86400000 },
    resave: false,
    saveUninitialized: true,
  })
);

app.use(function (req, res, next) {
  res.set(
    "Cache-control",
    "no-cache ,private , no-store , must-revalidate , max-stale = 0, post-check=0 , pre-check=0"
  );
  next();
});

app.use("/admin", indexRouter);
app.use("/", usersRouter);

//catch 404 and  forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

//error handler
app.use(function (err, req, res, next) {
  //set locals only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  //render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
