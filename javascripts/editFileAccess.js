function editFileAccess(app,checkAuthenticated,sessionNeo) {
    app.get('/edit/file/access',checkAuthenticated,(req, res)=>{  
        var obj = JSON.parse(req.query.JSONFrom);
        var  editfile = new Object();
        editfile.name=obj[0]["nameFile"]
        editfile.id=obj[0]["id"]
        editfile.localization=obj[0]["localization"]
        editfile.startDay=obj[0]["dateStart"]
        editfile.endDay=obj[0]["dateEnd"]
                       req.session.editfile=editfile
                        res.render('userFiles/setFileAccess.ejs',{id:obj[0]["id"],nameFile:obj[0]["nameFile"]})
          
    })
    app.get('/set/access/user/avaible',checkAuthenticated,(req,res)=>{ //generate list users which can set access
        var userArray = []
        var userToDelete = []
        sessionNeo  
        .run( 'MATCH (u:User{active:true}),(b:File{localization:$localizationParam}) Where id(u)<>$idUserParam and (u)-[:OWNER|GETACCESS]->(b) RETURN u,b',
        {idUserParam: parseInt(req.user.id),localizationParam: req.session.editfile.localization}) 
                  .then(result => {
                       result.records.forEach(function(record) {
                           {
                            userArray.push(record.get('u').properties.email)
                            if((record.get('b').properties.firstDay<=(req.session.editfile.startDay) && record.get('b').properties.lastDay>=(req.session.editfile.startDay)) ||			
                            (record.get('b').properties.firstDay<=(req.session.editfile.endDay)&& record.get('b').properties.lastDay>=(req.session.editfile.endDay))  ||			
                            (record.get('b').properties.firstDay<=(req.session.editfile.startDay)&& record.get('b').properties.lastDay>=(req.session.editfile.endDay)) || 
                            (record.get('b').properties.firstDay>=(req.session.editfile.startDay)&& record.get('b').properties.lastDay<=(req.session.editfile.endDay))) {
                              userToDelete.push( record.get('u').properties.email )
                          }
                          }
                          })
                           sessionNeo  
        .run( 'MATCH (u:User{active:true}),(b:File{localization:$localizationParam}) Where id(u)<>$idUserParam and (not (u)-[:OWNER|GETACCESS]->() or not (u)-[:OWNER|GETACCESS]->(b)) RETURN u',
        {idUserParam: parseInt(req.user.id),localizationParam: req.session.editfile.localization}) 
        .then(result => {
          result.records.forEach(function(record) {
              {
               userArray.push(record.get('u').properties.email)
              }                    
      })
           })
          })
         setTimeout(async () =>{ 
          let  userArrayTemp = [...new Set(userArray)] //delete duplicates
          let usersArray= userArrayTemp.filter(x => ! userToDelete.includes(x)); //substring arrays 
            res.render('userFiles/editAccessFileUsersAvailable.ejs',{users: usersArray})
     },1000)
    });
    app.get('/set/access/user/choosed',checkAuthenticated,(req,res)=>{ //genrate panel of choosed users
      setTimeout(async () =>{   
          res.render('userFiles/editAccessFileUsersChoosed.ejs')
        },2000)
    });
    app.get('/set/file/access',checkAuthenticated, (req, res) => { 
      var obj = JSON.parse(req.query.JSONFrom);
      var attrArray = obj["usersToAdd"]
    sessionNeo
    .run('MATCH (n:User),(f:File) Where id(f)=$idFileParam and n.email in $email MERGE(f)<-[r:GETACCESS]-(n)',
    {email:attrArray,idFileParam: req.session.editfile.id}) 
    .then(function(){
      res.redirect('/show/your/files');
          })
    });
    }
    module.exports = editFileAccess