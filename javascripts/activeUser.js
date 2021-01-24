function activeUser(app,checkAuthenticated,sessionNeo) {
 
  app.post('/users/activate',checkAuthenticated,(req, res)=>{ //render page to set activity users
      res.render('activateUsers/activateUsers.ejs')
  })
  app.get('/users/activate/success',checkAuthenticated,(req,res)=>{
    res.render('activateUsers/activateUsers.ejs')
  })
  app.get('/users/activate',checkAuthenticated,(req,res)=>{//get all user with active is false
    var allUsersEmails = []
    sessionNeo
    .run('MATCH (n:User{active:false}) RETURN (n)') 
    .then(function(result){
      result.records.forEach(function(record){
        allUsersEmails.push(record._fields[0].identity.low+") "+record._fields[0].properties.email 
        + " "+ record._fields[0].properties.firstName + " "+ record._fields[0].properties.lastName )
      });
    res.render('activateUsers/activateUsersList.ejs',{users: allUsersEmails})
  })
});
 app.get('/users/choosed',checkAuthenticated,(req,res)=>{ //render select panel
    res.render('listUsers/choosedUsersList.ejs')
  })
  app.get('/users/activates',checkAuthenticated,(req, res)=>{ //set active in graph data base 
  var obj = JSON.parse(req.query.JSONFrom);
    var params = {"email": []};
    obj["usersToAdd"].forEach((item)=>{
      params.email.push(item)})
  sessionNeo
  .run('MATCH (n:User) WHERE n.email IN $email  SET n.active = true',params) 
  .then(function(){
    res.redirect('/users/activate/success');
})
 });
}
module.exports = activeUser