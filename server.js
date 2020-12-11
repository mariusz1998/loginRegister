if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const initializePassport = require('./passport-config')
const activeUsers = require('./active-user')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const neo4j = require('neo4j-driver');

var driver = neo4j.driver('bolt://100.25.182.48:33371', neo4j.auth.basic('neo4j', 'umbrellas-insulation-carbon'));

var sessionNeo = driver.session();

initializePassport(passport,sessionNeo)

//sesja z paszportem przesyła aktualnie uwierzytelnionego użytkownika

app.set('view-engine', 'ejs')
app.use("/CSS", express.static(__dirname + "/CSS")); 
app.use("/forLists", express.static(__dirname + "/forLists"));
app.use("/submits", express.static(__dirname + "/submits"));
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: true, 
  saveUninitialized: true 
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/',checkAuthenticated, (req, res) => {
   // res.locals.app = app;
    res.render('index.ejs', {user: req.user})
  })

 app.get('/login', checkNotAuthenticated, (req, res) => { //przejście do login
    res.render('login.ejs')
  })
  app.post('/login',checkNotAuthenticated, passport.authenticate('local', { 
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true 
  }))

  app.get('/register',checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
  })
  app.post('/register',checkNotAuthenticated,  async (req, res) => {
    
    sessionNeo
    .run('MATCH (n:User{email:$emailParam}) RETURN count(n) as user_exists',
    {emailParam:req.body.email})
          .then(function(result2){
            if(result2.records[0].get('user_exists').low > 0) //==1
            res.render('register.ejs',{alert:"Email is used"})
            else
                  setTimeout(async () =>{   
    try {
        const hashedPassword = await bcrypt.hash(req.body.password1, 10)
        sessionNeo
            .run('CREATE(n:User {firstName:$firstNameParam, lastName:$lastNameParam, email:$emailParam, password:$passwordParam, active:false})',
            {firstNameParam:req.body.firstName,lastNameParam:req.body.lastName,emailParam: req.body.email, passwordParam:hashedPassword })
            .then(function(result){   
                res.render('login.ejs')
           })
             } catch{
        res.redirect('/register')
      }
    } ,10000)
  })
    })
  //  app.post('/users/activate',checkAuthenticated,(req, res)=>{
  //  res.render('activateUsers.ejs', {user: req.user})
  //  });
    app.delete('/logout', (req, res) => {
        req.logOut() 
        res.redirect('/login')
      })

    function checkAuthenticated(req, res, next) {
        if (req.isAuthenticated()) { 
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
      activeUsers(app,checkAuthenticated,sessionNeo)
      app.get('/users/activate',(req,res)=>{
        var allUsersEmails = []
        sessionNeo
        .run('MATCH (n:User{active:false}) RETURN (n)') 
        .then(function(result){
          result.records.forEach(function(record){
            allUsersEmails.push(record._fields[0].identity.low+" "+record._fields[0].properties.email)
    
          });
          //console.log(allUsersEmails)
        res.render('activate-users-list.ejs',{users: allUsersEmails})
      })
    });
     app.get('/users/choosed',(req,res)=>{
        res.render('choosed-users-list.ejs')
      })
     
      app.get('/users/activates',checkAuthenticated,(req, res)=>{
      var obj = JSON.parse(req.query.JSONFrom);
     console.log( obj)
      console.log( obj["usersToAdd"][0])  //pobranie 0 użytkonika 
        var allUsersEmails = []
      sessionNeo
      .run('MATCH (n:User{active:false}) RETURN (n)') 
      .then(function(result){
        result.records.forEach(function(record){
          allUsersEmails.push(record._fields[0].identity.low+" "+record._fields[0].properties.email)
    
        });
        console.log(allUsersEmails+"Jestem")
    
    })
     });
app.listen(3000)