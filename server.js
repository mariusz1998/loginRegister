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
const methodOverride = require('method-override')
const neo4j = require('neo4j-driver');

var driver = neo4j.driver('bolt://54.234.73.102:33113', neo4j.auth.basic('neo4j', 'arrays-drug-leaper'));

var sessionNeo = driver.session();
app.get('/test', function(req,res){ 
    sessionNeo
            .run('MATCH(n:User) RETURN n')
            .then(function(result2){
                var userArr= [];
         
                result2.records.forEach(function(record){
                    userArr.push({
                        login: record._fields[0].properties.login,
                        password: record._fields[0].properties.password
                        
                    });
                });
             
    res.render('test.ejs',{users:userArr});
            })
                    .catch(function(err){
               console.log(err);         
            });
    });



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
app.use(methodOverride('_method'))

app.get('/',checkAuthenticated, (req, res) => {
    res.render('index.ejs', {name: req.user.name})
  })

 app.get('/login', checkNotAuthenticated, (req, res) => { //przejście do login
    res.render('login.ejs')
  })
  app.post('/login',checkNotAuthenticated, passport.authenticate('local', { //uwietrzlnienie paszportu
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true //przesyłamy komunikat
  }))

  app.get('/register',checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
  })
  app.post('/register',checkNotAuthenticated,  async (req, res) => {
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

    app.delete('/logout', (req, res) => {
        req.logOut() //wyolguj i przekieruj do login
        res.redirect('/login')
      })

    function checkAuthenticated(req, res, next) {
        if (req.isAuthenticated()) { //zwróci tru jeśli user uwierzytelniony lub fałszywy
          return next()
        }
      
        res.redirect('/login')
      }
      
      function checkNotAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
          return res.redirect('/')
        }
        next()
      }



app.listen(3000)