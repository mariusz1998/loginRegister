if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const initializePassport = require('./javascripts/passport-config')
const activeUsers = require('./javascripts/active-user')
const overviewUsers = require('./javascripts/overviewUsers')
const editUsers = require('./javascripts/editUsers')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const neo4j = require('neo4j-driver');

var driver = neo4j.driver('bolt://100.25.182.48:33481', neo4j.auth.basic('neo4j', 'vector-confinements-extenuation'));

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
  resave: false,  //bylo true przy aktywacji 
  saveUninitialized: false   //bylo true przy aktywacji 
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/',checkAuthenticated, (req, res) => {
    res.render('start/index.ejs', {user: req.user})
  })

 app.get('/login', checkNotAuthenticated, (req, res) => { //przejście do login
    res.render('start/login.ejs')
  })
  app.post('/login',checkNotAuthenticated, passport.authenticate('local', { 
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true 
  }))

  app.get('/register',checkNotAuthenticated, (req, res) => {
    res.render('start/register.ejs')
  })
  app.post('/register',checkNotAuthenticated,  async (req, res) => {
    
    sessionNeo
    .run('MATCH (n:User{email:$emailParam}) RETURN count(n) as user_exists',
    {emailParam:req.body.email})
          .then(function(result2){
            if(result2.records[0].get('user_exists').low > 0) //==1
            res.render('start/register.ejs',{alert:"Email is used"})
            else
                  setTimeout(async () =>{   
    try {
        const hashedPassword = await bcrypt.hash(req.body.password1, 10)
        sessionNeo
            .run('CREATE(n:User {firstName:$firstNameParam, lastName:$lastNameParam, email:$emailParam, password:$passwordParam, active:false})',
            {firstNameParam:req.body.firstName,lastNameParam:req.body.lastName,emailParam: req.body.email, passwordParam:hashedPassword })
            .then(function(result){   
                res.render('start/login.ejs')
           })
             } catch{
        res.redirect('/register')
      }
    } ,2000)
  })
    })
  //  app.post('/users/activate',checkAuthenticated,(req, res)=>{
  //  res.render('activateUsers.ejs', {user: req.user})
  //  });
    app.delete('/logout', (req, res) => {
   //   req.session.destroy(function() {

      req.logOut()
        res.redirect('/')
  //  });
    });

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
      overviewUsers(app,checkAuthenticated,sessionNeo)
      editUsers(app,checkAuthenticated,sessionNeo)
app.listen(3000)