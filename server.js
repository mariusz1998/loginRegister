if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const initializePassport = require('./javascripts/passport-config')
const activeUsers = require('./javascripts/activeUser')
const overviewUsers = require('./javascripts/overviewUsers')
const editUsers = require('./javascripts/editUsers')
const editUser = require('./javascripts/editUser')
const addFile = require('./javascripts/addFile')
const updateFile = require('./javascripts/updateFile')
const deleteFile=require('./javascripts/deleteFile')
const editAttrFile = require('./javascripts/editFileAttr')
const editDatesFile = require('./javascripts/editFileDates')
const showUserFiles = require('./javascripts/showUserFiles')
const editFileAccess = require('./javascripts/editFileAccess')
const deleteFileAccess = require('./javascripts/deleteFileAccess')
const showUserAccessFiles = require('./javascripts/showUserAccessFiles')
const deleteUserAccount = require('./javascripts/deleteUserAccount')
const deleteOtherUserAccount = require('./javascripts/deleteOtherUserAccount')
const otherFiles = require('./javascripts/otherFiles')
const setFileOwner = require('./javascripts/setFileOwner')
const ownedFiles = require('./javascripts/ownedFiles')
const downloadFile = require('./javascripts/downloadFile')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const neo4j = require('neo4j-driver');

const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
var formidable = require("formidable");
let auth;
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

const driver = neo4j.driver('bolt://54.172.13.65:33476',
                  neo4j.auth.basic('neo4j', 'spares-daybreak-linkage'), 
                  {/* encrypted: 'ENCRYPTION_OFF' */});
var sessionNeo = driver.session();

initializePassport(passport,sessionNeo)

//sesja z paszportem przesyła aktualnie uwierzytelnionego użytkownika

app.set('view-engine', 'ejs')
app.use("/CSS", express.static(__dirname + "/CSS")); 
app.use("/forLists", express.static(__dirname + "/forLists"));
app.use("/forTables", express.static(__dirname + "/forTables"));
app.use("/submits", express.static(__dirname + "/submits"));
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false,  //bylo true przy aktywacji 
  saveUninitialized: false,   //bylo true przy aktywacji 
  cookie: { maxAge: 5 * 60 * 1000 } //5 minutes 
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
  
app.get('/',checkAuthenticated, (req, res) => {
// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.
  authorize(JSON.parse(content));
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);
  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    auth = oAuth2Client;
    addFile(app,checkAuthenticated,sessionNeo,auth,formidable,fs,google)
    updateFile(app,checkAuthenticated,sessionNeo,auth,formidable,fs,google)
    deleteFile(app,checkAuthenticated,sessionNeo,auth,google)
    ownedFiles(app,checkAuthenticated,sessionNeo,auth,formidable,fs,google)
    downloadFile(app,checkAuthenticated,sessionNeo,auth,formidable,fs,google)
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      auth = authoAuth2Client;
    });
  });
}
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
    app.get('/logout', (req, res) => {
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
      editUser(app,checkAuthenticated,sessionNeo)
      showUserFiles(app,checkAuthenticated,sessionNeo)
      editAttrFile(app,checkAuthenticated,sessionNeo)
      editDatesFile(app,checkAuthenticated,sessionNeo)
      editFileAccess(app,checkAuthenticated,sessionNeo)
      deleteFileAccess(app,checkAuthenticated,sessionNeo)
      showUserAccessFiles(app,checkAuthenticated,sessionNeo)
      deleteUserAccount(app,checkAuthenticated,sessionNeo)
      deleteOtherUserAccount(app,checkAuthenticated,sessionNeo)
      otherFiles(app,checkAuthenticated,sessionNeo)
      setFileOwner(app,checkAuthenticated,sessionNeo)

app.listen(3000)