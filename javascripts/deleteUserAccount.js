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
        else
        {


        }
       //  res.render('editUser/editUserData.ejs',{user: req.user})
         })
    }
    module.exports = deleteUserAccount