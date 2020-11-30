if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const initializePassport = require('./passport-config')
const flash = require('express-flash')
const session = require('express-session')
initializePassport(passport,email =>
    users.find(user=>user.email === email), //wyszukiwanie użytkownika przekazanie funkcji getUserbyEmail
   id=> users.find(user=>user.id === id))

//sesja z paszportem przesyła aktualnie uwierzytelnionego użytkownika

const users=[] //użytkownicy 

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET, //klucz który szyfruje wszystko
  resave: false, //zapisujemy sesję gdy się nic nie zmieniło
  saveUninitialized: false //nie zapisuj nie zinicjalizowanego
}))
app.use(passport.initialize())
app.use(passport.session())
//app.use(methodOverride('_method'))

app.get('/', (req, res) => {
    res.render('index.ejs', {name:  req.user.name})
  })

 app.get('/login',  (req, res) => { //przejście do login
    res.render('login.ejs')
  })
  app.post('/login', passport.authenticate('local', { //uwietrzlnienie paszportu
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true //przesyłamy komunikat
  }))

  app.get('/register', (req, res) => {
    res.render('register.ejs')
  })
  app.post('/register',  async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
          id: Date.now().toString(),
          name: req.body.name,
          email: req.body.email,
          password: hashedPassword //haszowanie hasłaaa
        })
        res.redirect('/login')
      } catch{
        res.redirect('/register')
      }
      console.log(users)
    })
app.listen(3000)