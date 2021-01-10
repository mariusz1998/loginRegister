function deleteFileAccess(app,checkAuthenticated,sessionNeo) {
    app.get('/delete/file/access',checkAuthenticated,(req, res)=>{ 
        var obj = JSON.parse(req.query.JSONFrom);
        var  editfile = new Object();
        editfile.name=obj[0]["nameFile"]
        editfile.id=obj[0]["id"]
     //  req.session.editfile=editfile
       var userArray = [] 
         sessionNeo       
       .run('MATCH (n:User),(f:File) Where id(f)=$idFileParam and id(n)<>$idUserParam MATCH(f)<-[r:GETACCESS]-(n) Return n',
       {idFileParam: editfile.id,idUserParam:req.user.id}) 
                 .then(result => {
                            result.records.forEach(function(record) {
                          {
                           userArray.push( record.get('n').properties.email +" - "+record.get('n').properties.lastName+" "+
                           record.get('n').properties.firstName)
                          }
                          })
                          setTimeout(async () =>{ 
                            editfile.accessArray=userArray
                            req.session.editfile=editfile
                            res.render('userFiles/deleteAccessFile.ejs',{id:obj[0]["id"],nameFile:obj[0]["nameFile"]})
                     },2000)
          })
    })
    app.get('/delete/access/user/availble',checkAuthenticated,(req,res)=>{
            res.render('userFiles/deleteAccessFileUsersAbailable.ejs',{users:  req.session.editfile.accessArray})
    });                 
    app.get('/delete/access/user/choosed',checkAuthenticated,(req,res)=>{
          res.render('userFiles/deleteAccessFileUsersChoosed.ejs')
    });
    app.get('/delete/file/access/set',checkAuthenticated, (req, res) => {
      var obj = JSON.parse(req.query.JSONFrom);
      var attrArray = obj["usersToAdd"]
     // console.log(attrArray)
   //   var params = {"email": []};
   //   obj["usersToAdd"].forEach((item)=>{
   //     params.email.push(item)
  //    })
      console.log(attrArray)
    sessionNeo 
    .run('MATCH (n:User)-[r:GETACCESS]->(f:File) Where id(f)=$idFileParam and n.email in {email} DELETE r',
    {email:attrArray,idFileParam: req.session.editfile.id}) 
    .then(function(){
      res.redirect('/show/your/files');
           // sessionNeo
          ////  .run('MATCH (n:File) where id(n)=$idParam  SET n.attribute=$attrParam',
         //   { attrParam:attrArray,idParam: req.session.editfile.id })
         //   .then(function(){
          //    res.redirect('/show/your/files'); //do przeglądu własnych plików?
          })
    });
    }
    module.exports = deleteFileAccess