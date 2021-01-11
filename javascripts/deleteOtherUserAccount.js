function deleteOtherUserAccount(app,checkAuthenticated,sessionNeo) {
    app.get('/user/delete/other/account',checkAuthenticated,(req, res)=>{ //imie email nazwisko
        console.log(req.query.email)
        sessionNeo
          
                 .run('MATCH (n:User{email:$emailParam})  OPTIONAL MATCH (n)-[r:ADMIN]-(a:Admin)  DETACH DELETE n,r,a',
                 {emailParam:req.query.email})
                 .then(function(){
                  res.redirect('/users/overview/after/delete');
                })
         })
    }
    module.exports = deleteOtherUserAccount