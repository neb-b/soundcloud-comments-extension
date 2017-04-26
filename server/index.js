// server that will fetch soundcloud comments
// hopes and dreams: cache comments for ~x minutes
require('dotenv').config()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

app.use(morgan('dev'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', function (req, res) {
  const url = req.query.url


  console.log("url", url)
  res.send('200')
})

app.listen(PORT)
