const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport,sessionNeo) {
  var user  = new Object();
  const authenticateUser = async (email, password, done) => { //done gdy zakończyliśmy uwietrzlnienie użytkownika
    //const user = getUserByEmail(email)
    sessionNeo
            .run('MATCH (u:User{email:$loginParam}),(a:Admin) RETURN EXISTS ((u)-[:ADMIN]-(a)) as adminExists,u,a',
  {loginParam:email})
      .then(result => {
                    user.id = result.records[0].get('u').identity.low
                   user.email=result.records[0].get('u').properties.email
                    user.password=result.records[0].get('u').properties.password
                    if(result.records[0].get('adminExists')===true)
                             user.admin= true
                console.log(user)
            });
            setTimeout(async () =>{ 
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