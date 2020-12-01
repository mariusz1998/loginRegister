const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport,sessionNeo) {
  var user  = new Object();
  const authenticateUser = async (email, password, done) => { //done gdy zakończyliśmy uwietrzlnienie użytkownika
    //const user = getUserByEmail(email)
    sessionNeo
            .run('MATCH (n:User{email:$loginParam}) RETURN n',
  {loginParam:email})
        .then(function(result2){
            result2.records.forEach(function(record){
                    console.log(record._fields[0].identity.low)
                    console.log(record._fields[0].properties.email)
                    user.id = record._fields[0].identity.low
                   user.email=record._fields[0].properties.email
                    user.password=record._fields[0].properties.password
                   
                });
            });
            setTimeout(async () =>{ 
 // console.log(typeof (user.id)=='undefined')
    if (typeof (user.id)=='undefined') {
      return done(null, false, { message: 'No user with that email' }) //parametr 1 ->błąd , parametr 2 czy zwracamy użytkownika 
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user) //parametr2 -> zwracamy użytkownika
      } else {
        return done(null, false, { message: 'Password incorrect' })
      }
    } catch (e) {
      return done(e) //parametr1 -> wystąpił błąd 
    }
  }
            ,1000)
}

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
  passport.serializeUser((user, done) => done(null, user.id)) //zapisanie użytkownika do sesji
  passport.deserializeUser((id, done) => {
    return done(null, user)
  })
}

module.exports = initialize