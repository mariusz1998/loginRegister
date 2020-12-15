//const { compareSync } = require("bcrypt");
const bcrypt = require('bcrypt')

function editUsers(app,checkAuthenticated,sessionNeo)
{
    app.get('/users/edit',checkAuthenticated,(req, res)=>{
     res.render('editUsers/editUsersData.ejs',{user: req.session.selectUser })
      })

      app.post('/users/editData',checkAuthenticated, (req, res) => {
        var doEdit=true;
          if(req.body.email!=req.session.selectUser.email) {
        sessionNeo
        .run('MATCH (n:User{email:$emailParam}) RETURN count(n) as user_exists',
        {emailParam:req.body.email})
              .then(function(result2){
                if(result2.records[0].get('user_exists').low > 0) {//==1
                  doEdit=false
                res.render('editUsers/editUsersData.ejs',{alert:"Email is used",user: req.session.selectUser})
                }
              })
            }
         
         
            setTimeout(() =>{ 
              if(doEdit==true){
            req.session.selectUser.email=req.body.email
            sessionNeo
                .run('MATCH (n:User) WHERE id(n)=$idParam SET n.lastName=$lastNameParam ,n.firstName=$firstNameParam, n.email=$emailParam',
                { idParam: parseInt(req.session.selectUser.id),
                    firstNameParam:req.body.firstName,lastNameParam:req.body.lastName,emailParam: req.body.email})
                .then(function(result){   
                    res.redirect('/users/showStatistics/new')
               })
              }
              } ,3000)
            
      })
      app.get('/users/edit/password',checkAuthenticated,(req, res)=>{
        res.render('editUsers/editUsersPassword.ejs',{user: req.session.selectUser })
         })
      app.post('/users/editPassword',checkAuthenticated, async  (req, res) => { //zmaiana hasła

          const hashedPassword = await bcrypt.hash(req.body.password1, 10)
        setTimeout(async () =>{ 
          sessionNeo
              .run('MATCH (n:User) WHERE id(n)=$idParam SET  n.password=$passwordParam',
              { idParam: parseInt(req.session.selectUser.id),  passwordParam:hashedPassword })
              .then(function(result){   
           //     console.log(req.session.selectUser)
                 // res.render('statisticsUsers/statisticsUser.ejs',{user: req.session.selectUser })
                  res.redirect('/users/showStatistics/new')
             })                
               }  ,2000)
    })
}
module.exports =  editUsers