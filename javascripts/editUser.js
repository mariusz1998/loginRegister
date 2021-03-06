const bcrypt = require('bcrypt')

function editUser(app,checkAuthenticated,sessionNeo)
{
    app.post('/user/edit',checkAuthenticated,(req, res)=>{
     res.render('editUser/editUser.ejs',{user: req.user})
      })
    app.get('/user/edit/data',checkAuthenticated,(req, res)=>{ 
        res.render('editUser/editUserData.ejs',{user: req.user})
         })
    app.post('/user/editData',checkAuthenticated,  (req, res) => { 
        var doEdit=true;
        if(req.body.email!= req.user.email) {
      sessionNeo
      .run('MATCH (n:User{email:$emailParam}) RETURN count(n) as user_exists',
      {emailParam:req.body.email})
            .then(function(result2){
              if(result2.records[0].get('user_exists').low > 0){ //if email repeat in system render error page
                doEdit=false
                res.render('editUser/editUserData.ejs',{alert:"Email is used",user: req.user})
            }
            })
            .catch((error) => {
              res.redirect('/errorConnect');
            });
          }
          setTimeout(() =>{ 
            if(doEdit==true){
          sessionNeo
              .run('MATCH (n:User) WHERE id(n)=$idParam SET n.lastName=$lastNameParam ,n.firstName=$firstNameParam, n.email=$emailParam',
              { idParam: parseInt(req.user.id),
                  firstNameParam:req.body.firstName,lastNameParam:req.body.lastName,emailParam: req.body.email})
              .then(function(result){   
                  res.redirect('/user/showStatistics/your/new')
             })
             .catch((error) => {
              res.redirect('/errorConnect');
            });
            }
          } ,3000)
    })
    app.get('/user/showStatistics/your/new',checkAuthenticated,(req, res)=>{ //set new account property
        var  user = new Object();
          sessionNeo
          .run('MATCH (u:User) WHERE id(u) = $idParam RETURN u'
          ,{idParam: parseInt(req.user.id)}) 
          .then(function(result){
            user.id = result.records[0].get('u').identity.low
            user.email=result.records[0].get('u').properties.email
            user.password=result.records[0].get('u').properties.password
            user.active = result.records[0].get('u').properties.active
            user.firstName = result.records[0].get('u').properties.firstName
            user.lastName = result.records[0].get('u').properties.lastName
            user.admin = req.user.admin 
            req.user=user;  
            res.render('editUser/editUser.ejs',{user: user})
      
          })
          .catch((error) => {
            res.redirect('/errorConnect');
          });
         });  
    app.get('/user/edit/password',checkAuthenticated,(req, res)=>{ 
          res.render('editUser/editUserPassword.ejs',{user: req.user})
           })
    app.post('/user/editPassword',checkAuthenticated, async  (req, res) => { //edit password in graph base data 
            const hashedPassword = await bcrypt.hash(req.body.password1, 10)
          setTimeout(async () =>{ 
            sessionNeo
                .run('MATCH (n:User) WHERE id(n)=$idParam SET n.password=$passwordParam',
                { idParam: parseInt(req.user.id),  passwordParam:hashedPassword })
                .then(function(result){   
                    res.render('editUser/editUser.ejs',{user: req.user})
               })
               .catch((error) => {
                res.redirect('/errorConnect');
              });
                 }  ,2000)
      })
}
module.exports =  editUser