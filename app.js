const express = require('express')
const app = express()
const session = require('express-session');
const hashedSecret = require('./crypto');
const route = require('./routes');


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: hashedSecret,
  resave: true,
  saveUninitialized: true,
  cookie: {secure: false}
  })
);

app.use('/',route)


app.listen(3001,() => {
    console.log("Express esta escuchando en http://localhost:3001")
})