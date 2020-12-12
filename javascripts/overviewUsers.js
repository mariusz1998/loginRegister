function overviewUsers(app,checkAuthenticated,sessionNeo)
{
    app.post('/users/overview',checkAuthenticated,(req, res)=>{
       // console.log ( "Dlugosc: ")
       // console.log( req.session.usersChoose.length)
        res.render('overviewUsers.ejs')
    })
    app.get('/users/overview',checkAuthenticated,(req,res)=>{
        var allUsers = []
        sessionNeo
        .run('MATCH (n:User{active:true}) WHERE id(n)<>$idParam RETURN (n)',{idParam:req.user.id}) 
        .then(function(result){
          result.records.forEach(function(record){
            allUsers.push(record._fields[0].identity.low+") "+record._fields[0].properties.email 
            + " "+ record._fields[0].properties.firstName + " "+ record._fields[0].properties.lastName )
          });
        res.render('activate-users-list.ejs',{users: allUsers})
      })
    });

    app.get('/users/setAdmin',checkAuthenticated,(req, res)=>{

      req.session.usersChoose=[]
    //  console.log(req.query.JSONFrom)
      var obj = JSON.parse(req.query.JSONFrom);
   //   console.log( obj["usersToAdd"].length)
   //   console.log( obj["usersToAdd"][0])  //pobranie 0 użytkonika 
    //  console.log( obj["usersToAdd"][0]["id"]);
  
        obj["usersToAdd"].forEach((item)=>{

     var  user = new Object();
       user.id  =item["id"] 
       user.lastName = item["lastName"]
       user.firstName = item["firstName"]
       user.email = item["email"]
          req.session.usersChoose.push(user)
        })
        console.log( req.session.usersChoose)
    //  sessionNeo
    //  .run('MATCH (n:User) WHERE n.email IN $email  SET n.active = true',params) 
    //  .then(function(){
    //    res.redirect('/users/activate/success');
       //res.render('activateUsers.ejs')
  //  })
     });
}
module.exports =  overviewUsers