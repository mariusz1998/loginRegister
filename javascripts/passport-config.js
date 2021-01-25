const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport,sessionNeo) {
  var user
  var passwordUser
  const authenticateUser = async (email, password, done) => {  //login user and save in session
        user = new Object();
    sessionNeo
            .run('MATCH (u:User{email:$loginParam}) OPTIONAL MATCH (u)-[:ADMIN]-(a:Admin) RETURN u,a',
        {loginParam:email})
        .then(result => {  
       if(result.records.length>0){  //check exist logged user
                    user.id = result.records[0].get('u').identity.low
                   user.email=result.records[0].get('u').properties.email
                   passwordUser=result.records[0].get('u').properties.password
                    user.active = result.records[0].get('u').properties.active
                    user.firstName = result.records[0].get('u').properties.firstName
                    user.lastName = result.records[0].get('u').properties.lastName
                    if(result.records[0].get('a')!=null){
                    var d = new Date();
                    var dStart = new Date(result.records[0].get('a').properties.startDay)
                    var dEnd = new Date(result.records[0].get('a').properties.endDay)
                   if (dStart.getTime() <= d.getTime() && dEnd.getTime() >= d.getTime())
                           user.admin= true  
                    }
                    else
                    user.admin =false       
       }
            })
            .catch(error => {
              return done(null, false, { message: 'Failed connect to server' })  
            })
            setTimeout(async () =>{ 
    if (typeof (user.id)=='undefined') {
      return done(null, false, { message: 'No user with that email' }) 
    }
    if (user.active==false) {
      return done(null, false, { message: 'Account is not active' })  
    }
    try {
      if (await bcrypt.compare(password, passwordUser)) {
        return done(null, user) 
      } else {
        return done(null, false, { message: 'Password incorrect' })
      }
    } catch (e) {
      return done(e) 
    }
  } ,3000)
}

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
  passport.serializeUser((user, done) => done(null, user.id)) 
  passport.deserializeUser((id,done) => {
    return done(null, user)
  })
}

module.exports = initialize