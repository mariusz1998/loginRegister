const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport,sessionNeo) {
  var user  = new Object();
  const authenticateUser = async (email, password, done) => { //done gdy zakończyliśmy uwietrzlnienie użytkownika
    //const user = getUserByEmail(email)
    sessionNeo
            .run('MATCH (u:User{email:$loginParam}),((u)-[:ADMIN]-(a:Admin)) RETURN EXISTS ((u)-[:ADMIN]-(a)) as adminExists,u,a',
  {loginParam:email})
      .then(result => {
       if(result.records.length!==0){ //sprawdzenie czy jest jakiś user
                    user.id = result.records[0].get('u').identity.low
                   user.email=result.records[0].get('u').properties.email
                    user.password=result.records[0].get('u').properties.password
                    var d = new Date();
                    var dStart = new Date(result.records[0].get('a').properties.startDay)
                    var dEnd = new Date(result.records[0].get('a').properties.endDay)
                    user.active = result.records[0].get('u').properties.active
                    if(result.records[0].get('adminExists')===true && dStart.getTime() <= d.getTime() &&
                    dEnd.getTime() >= d.getTime())
                           user.admin= true  
                           else
                           user.admin =false                    
                console.log(user)
       }
            });
            setTimeout(async () =>{ 
    if (typeof (user.id)=='undefined') {
      return done(null, false, { message: 'No user with that email' }) //parametr 1 ->błąd , parametr 2 czy zwracamy użytkownika 
    }
    if (user.active==false) {
      return done(null, false, { message: 'Account is not active' }) //parametr 1 ->błąd , parametr 2 czy zwracamy użytkownika 
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
  passport.deserializeUser((id,done) => {
    return done(null, user)
  })
}

module.exports = initialize