function deleteFileAccess(app,checkAuthenticated,sessionNeo) {
    app.get('/delete/file/access',checkAuthenticated,(req, res)=>{  //delete access to other users
        var obj = JSON.parse(req.query.JSONFrom);
        var  editfile = new Object();
        editfile.name=obj[0]["nameFile"]
        editfile.id=obj[0]["id"]
       var userArray = [] 
         sessionNeo       
       .run('MATCH (n:User),(f:File) Where id(f)=$idFileParam and id(n)<>$idUserParam MATCH(f)<-[r:GETACCESS]-(n) Return n',
       {idFileParam: editfile.id,idUserParam:req.user.id}) 
                 .then(result => {
                            result.records.forEach(function(record) {
                           userArray.push(record.get('n').properties.email)
                          })
                          setTimeout(async () =>{ 
                            editfile.accessArray=userArray
                            req.session.editfile=editfile
                            res.render('userFiles/deleteAccessFile.ejs',{id:obj[0]["id"],nameFile:obj[0]["nameFile"]})
                     },2000)
          })
          .catch((error) => {
            res.redirect('/errorConnect');
          });
    })
    app.get('/delete/access/user/avaible',checkAuthenticated,(req,res)=>{ //genrate panel current users who have access
            res.render('userFiles/deleteAccessFileUsersAbailable.ejs',{users:  req.session.editfile.accessArray})
    });                 
    app.get('/delete/access/user/choosed',checkAuthenticated,(req,res)=>{ //genrate panel current users from whom we withdraw the right
          res.render('userFiles/deleteAccessFileUsersChoosed.ejs')
    });
    app.get('/delete/file/access/set',checkAuthenticated, (req, res) => {
      var obj = JSON.parse(req.query.JSONFrom);
      var attrArray = obj["usersToAdd"]
    sessionNeo 
    .run('MATCH (n:User)-[r:GETACCESS]->(f:File) Where id(f)=$idFileParam and n.email in $email DELETE r',
    {email:attrArray,idFileParam: req.session.editfile.id}) 
    .then(function(){
      res.redirect('/show/your/files');
          })
          .catch((error) => {
            res.redirect('/errorConnect');
          });
    });
    }
module.exports = deleteFileAccess