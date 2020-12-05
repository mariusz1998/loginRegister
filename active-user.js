function activeUser(app,checkAuthenticated) {
  app.post('/users/activate',checkAuthenticated,(req, res)=>{
   res.render('activateUsers.ejs', {user: req.user})
   });
}
module.exports = activeUser