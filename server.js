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

var driver = neo4j.driver('bolt://54.226.31.67:32834', neo4j.auth.basic('neo4j', 'cosal-clothes-core'));

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
      editUser(app,checkAuthenticated,sessionNeo)

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
      app.post('/add/file',checkAuthenticated,(req, res)=>{
        res.render('selectFilePanel.ejs')
    })
    app.post('/get/file/property', (req, res) => {
      var  addfile = new Object();
      var formData = new formidable.IncomingForm();
      formData.parse(req, function (error, fields, files) {
     addfile.name=files.file.name
     addfile.path=files.file.path
     addfile.type=files.file.type
     req.session.addfile=addfile
      res.render('addFileAttrPanel.ejs',{addFileProperty: addfile})
    })
  })
    app.get('/attr/availble',checkAuthenticated,(req,res)=>{
      //pobranie wszystkich atrybutów plików danego użytkonika?
       var attributteArray = []
       attributteArray.push("Wiatr")
       attributteArray.push("Deszcz")
       attributteArray.push("Cisnienie")
       attributteArray.push("Wilgotnosc")
      // sessionNeo
      // .run('MATCH (n:User{active:false}) RETURN (n)') 
      // .then(function(result){
      //   result.records.forEach(function(record){
      //     allUsersEmails.push(record._fields[0].identity.low+") "+record._fields[0].properties.email 
      //     + " "+ record._fields[0].properties.firstName + " "+ record._fields[0].properties.lastName )
      //   });
      res.render('availableAttrFile.ejs',{attr: attributteArray})
   // })
  });
  app.get('/attr/choosed',checkAuthenticated,(req,res)=>{
    res.render('choosedAttrList.ejs')
  })
   app.get('/add/file/attribute',checkAuthenticated, (req, res) => {
    var obj = JSON.parse(req.query.JSONFrom);
    var localization = obj["localization"]
    var attrArray = obj["attrToAdd"]
    const fileMetadata = {
          'name': req.session.addfile.name
        };
    const media = {
      mimeType: req.session.addfile.type,
      body: fs.createReadStream(req.session.addfile.path),
    };
    // Authenticating drive API
    const drive = google.drive({ version: 'v3', auth });
    // Uploading Single image to drive
    drive.files.create(
      {
        resource: fileMetadata,
        media: media,
      },
      async (err, file) => {
        if (err) {
          // Handle error
          console.error(err.msg);
          return res
            .status(400)
            .json({ errors: [{ msg: 'Server Error try again later' }] });
        } else {
          // if file upload success then return the unique google drive id
          sessionNeo
          .run('CREATE(n:File {name:$nameParam, googleID:$googleIDParam, localization:$localizationParam, attribute:$attrParam}) WITH n MATCH (u:User {email:$emailParam}) MERGE(n)<-[r:OWNER]-(u)',
          {nameParam:req.session.addfile.name,googleIDParam:file.data.id,localizationParam: localization, attrParam:attrArray,emailParam:req.user.email })
          .then(function(){
            res.render('addFileSucces.ejs'); //do przeglądu własnych plików?
        })
        }
      }
    );
  });
app.listen(3000)