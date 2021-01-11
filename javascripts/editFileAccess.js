function editFileAccess(app,checkAuthenticated,sessionNeo) {
    app.get('/edit/file/access',checkAuthenticated,(req, res)=>{ 
        var obj = JSON.parse(req.query.JSONFrom);
        var  editfile = new Object();
        editfile.name=obj[0]["nameFile"]
        editfile.id=obj[0]["id"]
        editfile.localization=obj[0]["localization"]
        editfile.startDay=obj[0]["dateStart"]
        editfile.endDay=obj[0]["dateEnd"]
     //  req.session.editfile=editfile
                       req.session.editfile=editfile
                        res.render('userFiles/setFileAccess.ejs',{id:obj[0]["id"],nameFile:obj[0]["nameFile"]})
          
    })
    app.get('/set/access/user/availble',checkAuthenticated,(req,res)=>{
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
                            (record.get('b').properties.firstDay>=(req.session.editfile.startDay)&& record.get('b').properties.lastDay<=(req.session.editfile.endDay)))
                           {
                              userToDelete.push( record.get('u').properties.email )
                    //   console.log(record.get('u').properties.email +" "+ record.get('b').properties.firstDay+" "+record.get('b').properties.lastDay)
                        //  console.log((record.get('b').properties.firstDay>=(req.session.editfile.startDay) && record.get('b').properties.lastDay<=(req.session.editfile.endDay)))
                        //  console.log((record.get('b').properties.firstDay<=(req.session.editfile.startDay) && record.get('b').properties.lastDay>=(req.session.editfile.endDay)) )
                        //  console.log((record.get('b').properties.firstDay<=(req.session.editfile.startDay) && record.get('b').properties.lastDay<=(req.session.editfile.endDay))) 
                        //  console.log( (record.get('b').properties.firstDay>=(req.session.editfile.startDay) && record.get('b').properties.lastDay<=(req.session.editfile.endDay))) 
                        }
                          }
                          })
                           sessionNeo  
        .run( 'MATCH (u:User),(b:File{localization:$localizationParam}) Where id(u)<>$idUserParam and not (u)-[:OWNER|GETACCESS]->() RETURN u',
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
           console.log(userArray)
           console.log(userToDelete)
          let  userArrayTemp = [...new Set(userArray)]
          let usersArray= userArrayTemp.filter(x => ! userToDelete.includes(x)); 
            res.render('userFiles/editAccessFileUsersAvailable.ejs',{users: usersArray})
     },1000)
    });
    app.get('/set/access/user/choosed',checkAuthenticated,(req,res)=>{
      setTimeout(async () =>{   
          res.render('userFiles/editAccessFileUsersChoosed.ejs')
        },2000)
    });
    app.get('/set/file/access',checkAuthenticated, (req, res) => {
      var obj = JSON.parse(req.query.JSONFrom);
      var attrArray = obj["usersToAdd"]
     // console.log(attrArray)
   //   var params = {"email": []};
   //   obj["usersToAdd"].forEach((item)=>{
   //     params.email.push(item)
  //    })
      console.log(attrArray)
      console.log(req.session.editfile.id)
    sessionNeo
    .run('MATCH (n:User),(f:File) Where id(f)=$idFileParam and n.email in $email MERGE(f)<-[r:GETACCESS]-(n)',
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
    module.exports = editFileAccess