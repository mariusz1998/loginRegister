const activeUser = require("./activeUser")

function deleteUserAccount(app,checkAuthenticated,sessionNeo) {
    app.get('/user/delete/account',checkAuthenticated,(req, res)=>{ //imie email nazwisko
        
        if(req.user.admin!=true) //nie jest adminem
        {
            sessionNeo
            .run('MATCH (n:User) where id(n)=$idParam DETACH DELETE n',{idParam: req.user.id})
            .then(function(){
              res.redirect('/logout?_method=POST');
            })
        }
        else //is admin 
        {
          var today = new Date();
          var dd = today.getDate();
          var mm = today.getMonth()+1; 
          var yyyy = today.getFullYear();
          if(dd<10) 
            dd='0'+dd;
          if(mm<10) 
            mm='0'+mm; 
            var dateToday = yyyy+"-"+mm+"-"+dd;
          // var dateToday="2022-03-20"
          sessionNeo
          
            .run(' MATCH (u:User)-[r:ADMIN]-(b:Admin) Where id(u)<>$idParam and b.endDay>=date($todayParam) and b.startDay<=date($todayParam) RETURN u'
            ,{idParam: req.user.id,todayParam:dateToday})
            .then(function(result){
              console.log(result.records.length)
              if(result.records.length == 0 || result.records[0].get('u')==null)
              res.render('editUser/deleteUserWarning.ejs')
              else{
                sessionNeo
          
                .run('MATCH (n:User) where id(n)=$idParam OPTIONAL MATCH (n)-[r:ADMIN]-(a:Admin) where id(n)=$idParam DETACH DELETE n,r,a',{idParam: req.user.id})
                .then(function(){
                  res.redirect('/logout?_method=POST');
                })
              }
            })
         

        }
       //  res.render('editUser/editUserData.ejs',{user: req.user})
         })
    }
    module.exports = deleteUserAccount