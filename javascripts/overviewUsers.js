//const { compareSync } = require("bcrypt");

function overviewUsers(app,checkAuthenticated,sessionNeo)
{
    app.post('/users/overview',checkAuthenticated,(req, res)=>{
       // console.log ( "Dlugosc: ")
       // console.log( req.session.usersChoose.length)
        res.render('listUsers/overviewUsers.ejs')
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
        res.render('statisticsUsers/statisticsUserList.ejs',{users: allUsers})
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
          var d = new Date();
         user.adminDayStart = result.records[0].get('a').properties.startDay
         user.adminDayEnd = result.records[0].get('a').properties.endDay
          var dStart = new Date(result.records[0].get('a').properties.startDay)
          var dEnd = new Date(result.records[0].get('a').properties.endDay)
         if (dStart.getTime() <= d.getTime() && dEnd.getTime() >= d.getTime())
                 user.admin= 'yes'
                 else if (dStart.getTime() > d.getTime() && dEnd.getTime() > d.getTime())
                 user.admin= 'after'
                 else
                 user.admin = 'no'
        }
        else
        user.admin = 'no'
        req.session.selectUser=user;  //?
        res.render('statisticsUsers/statisticsUser.ejs',{user: user})
      })
     });  

     app.get('/user/setAdmin',checkAuthenticated,(req, res)=>{
     var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; 
  var yyyy = today.getFullYear();
  if(dd<10) 
    dd='0'+dd;
  if(mm<10) 
    mm='0'+mm; 
    var dateToday = yyyy+"-"+mm+"-"+dd;

   dd= req.session.selectUser.adminDayStart.day.low
   mm= req.session.selectUser.adminDayStart.month.low
   yyyy= req.session.selectUser.adminDayStart.year.low
   if(dd<10) 
   dd='0'+dd;
   if(mm<10) 
   mm='0'+mm; 
    var startDayAdmin = yyyy+"-"+mm+"-"+dd;

  dd= req.session.selectUser.adminDayEnd.day.low
   mm= req.session.selectUser.adminDayEnd.month.low
   yyyy= req.session.selectUser.adminDayEnd.year.low
     if(dd<10) 
    dd='0'+dd;
    if(mm<10) 
    mm='0'+mm;
     var endDayAdmin = yyyy+"-"+mm+"-"+dd;

    res.render('adminUsers/setAdminDateRange.ejs',{user: req.session.selectUser,minDate:dateToday,startDay: startDayAdmin 
    , endDay:endDayAdmin })
   })

   app.get('/user/setAdmin/date',checkAuthenticated,(req, res)=>{
    var obj = JSON.parse(req.query.JSONFrom);
    console.log(obj["dateToSet"][0]["startDay"])
    console.log(obj["dateToSet"][0]["endDay"])
    sessionNeo
   .run('MATCH (u:User{email:$emailParam}) MERGE (u)-[r:ADMIN]-(b:Admin) Set   b.startDay=date($startDayParam), b.endDay=date($endDayParam)',
   {emailParam:req.session.selectUser.email ,startDayParam:obj["dateToSet"][0]["startDay"],endDayParam:obj["dateToSet"][0]["endDay"] })
    .then(function(result){

    res.redirect('/user/showStatistics/new')
      })  
  })

  app.get('/user/showStatistics/new',checkAuthenticated,(req, res)=>{
  var  user = new Object();
  user.email =  req.session.selectUser.email
  user.id =   req.session.selectUser.id
  user.lastName =   req.session.selectUser.lastName
  user.firstName =   req.session.selectUser.firstName
    sessionNeo
    .run('MATCH (u:User{email:$emailParam}) OPTIONAL MATCH (u)-[:ADMIN]-(a:Admin) RETURN a'
    ,{emailParam: req.session.selectUser.email}) 
    .then(function(result){
      if(result.records[0].get('a')!=null){
        var d = new Date();
       user.adminDayStart = result.records[0].get('a').properties.startDay
       user.adminDayEnd = result.records[0].get('a').properties.endDay
        var dStart = new Date(result.records[0].get('a').properties.startDay)
        var dEnd = new Date(result.records[0].get('a').properties.endDay)
       if (dStart.getTime() <= d.getTime() && dEnd.getTime() >= d.getTime())
               user.admin= 'yes'
               else if (dStart.getTime() > d.getTime() && dEnd.getTime() > d.getTime())
               user.admin= 'after'
               else
               user.admin = 'no'
      }
      else
      user.admin = 'no'
      req.session.selectUser=user;  //
      res.render('statisticsUsers/statisticsUser.ejs',{user: user})
    })
   });  
}
module.exports =  overviewUsers