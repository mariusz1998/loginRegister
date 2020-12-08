function activeUser(app,checkAuthenticated,sessionNeo) {
 
    app.post('/users/activate',checkAuthenticated,(req, res)=>{
      var allUsersEmails = []
    sessionNeo
    .run('MATCH (n:User{active:false}) RETURN (n)') 
    .then(function(result){
      result.records.forEach(function(record){
        allUsersEmails.push(record._fields[0].identity.low+" "+record._fields[0].properties.email)

      });
      console.log(allUsersEmails)
      res.render('activateUsers.ejs', {users: allUsersEmails})
    //  res.render('activateUsers.ejs', {users: 'sdfssdsd'})
  })
   });
}
module.exports = activeUser