const express = require('express');
const nocache=require('nocache')
const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 5000;
const userRouter = require('./routes/userRouter');
const adminRouter = require('./routes/adminRouter');
const dbConnect = require("./config/dbConnect");
const morgan = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongodbSession = require('connect-mongodb-session')(session)
const cookieParser = require('cookie-parser');


dbConnect()


app.use(express.static('public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');
app.set('views','./views/users');
app.use(cookieParser());


app.use(session({
    secret:process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge:72 * 60 * 60 * 1000,    // Session expires in 72 hours
        httpOnly: true
    },
 })
);

app.use(nocache())
app.use('/',userRouter);
app.use('/admin',adminRouter);
// Define your other routes before this catch-all route

// Your other routes go here...

// Catch-all route for handling undefined routes
app.use('*', (req, res, next) => {
    console.log("Catch-all route triggered for", req.url);
    res.status(404).render('404', { statusCode: 404, message: "Page not found" });
  });
  

  









app.listen(PORT,()=>console.log("server is runningb at port:http://localhost:5000"));