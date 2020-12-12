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
        res.render('statisticsUserList.ejs',{users: allUsers})
      })
    });

    app.get('/user/showStatistics',checkAuthenticated,(req, res)=>{
      var obj = JSON.parse(req.query.JSONFrom);
    var  user = new Object();
    user.email = obj["userToAdd"][0]["email"]
    user.id =  obj["userToAdd"][0]["id"]
    user.lastName =  obj["userToAdd"][0]["lastName"]
    user.firstName =  obj["userToAdd"][0]["firstName"]
      sessionNeo
      .run('MATCH (u:User{email:$emailParam}) OPTIONAL MATCH (u)-[:ADMIN]-(a:Admin) RETURN a'
      ,{emailParam: obj["userToAdd"][0]["email"]}) 
      .then(function(result){
        if(result.records[0].get('a')!=null){
          user.adminDayStart = result.records[0].get('a').properties.startDay;
          user.adminDayEnd = result.records[0].get('a').properties.endDay;
          user.admin=true
        }
        else
        user.admin = false
        req.session.selectUser=user;
        res.render('statisticsUser.ejs',{user: user})
        //console.log(user.adminDayEnd)
      })
     });  

     app.post('/user/setAdmin',checkAuthenticated,(req, res)=>{
     // req.session.selectUser
     //pobierz dzisiejsza date
    res.render('setAdminDateRange.ejs',{user: req.session.selectUser})
    
   })


   //  app.get('/user/setAdmin/date',checkAuthenticated,(req, res)=>{
   //  var user = req.session.usersChoose[0];
  // console.log(req.session.usersChoose.length)
//  if(req.session.usersChoose.length!=0){
 //    var user  =  req.session.usersChoose.pop(0) //wyjmujemy + usuwamy
 //    console.log(user)
  //   console.log(req.session.usersChoose.length)
 //      res.render('setAdmin.ejs',{user:user})
 //     }
  //    else
  //    {
  //      res.render('/users/overview')
  //    }
  //   });
}
module.exports =  overviewUsers