//const { compareSync } = require("bcrypt");
const bcrypt = require('bcrypt')

function editUsers(app,checkAuthenticated,sessionNeo)
{
    app.get('/user/edit',checkAuthenticated,(req, res)=>{
     res.render('editUsers/editUsersData.ejs',{user: req.session.selectUser })
      })

      app.post('/user/editData',checkAuthenticated, async  (req, res) => {
          if(req.body.email!=req.session.selectUser.email) {
        sessionNeo
        .run('MATCH (n:User{email:$emailParam}) RETURN count(n) as user_exists',
        {emailParam:req.body.email})
              .then(function(result2){
                if(result2.records[0].get('user_exists').low > 0) //==1
                res.render('editUsers/editUsersData.ejs',{alert:"Email is used",user: req.session.selectUser})
              })
            }
                    
            const hashedPassword = await bcrypt.hash(req.body.password1, 10)
          setTimeout(async () =>{ 
            req.session.selectUser.email=req.body.email
            sessionNeo
                .run('MATCH (n:User) WHERE id(n)=$idParam SET n.lastName=$lastNameParam ,n.firstName=$firstNameParam, n.email=$emailParam, n.password=$passwordParam',
                { idParam: parseInt(req.session.selectUser.id),
                    firstNameParam:req.body.firstName,lastNameParam:req.body.lastName,emailParam: req.body.email, 
                    passwordParam:hashedPassword })
                .then(function(result){   
                    res.redirect('/user/showStatistics/new')
               })
                 }  ,2000)
      })
}
module.exports =  editUsers