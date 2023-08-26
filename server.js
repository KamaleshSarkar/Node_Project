const express = require("express")
require('dotenv').config()
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static(path.join(__dirname, "public")));

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());
app.use(session({
    secret: 'B1A2$P3',
    saveUninitialized: true,
    resave: true,
  })
);
app.use(flash());

app.set("view engine", "ejs");
app.set("views", "views");

const jwtAuth = require("./middleware/authJwt");
app.use(jwtAuth.authJwt);

const adminRouter = require("./routes/admin.routes");
app.use("/admin",adminRouter);




const port = process.env.PORT || 1994;

mongoose
  .connect(process.env.dbDriver, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    app.listen(port, () => {
      console.log(`Db is connected`);
      console.log(`Server is running on http://localhost:${port}/admin`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
