function setFileOwner(app,checkAuthenticated,sessionNeo)
{
   // /set/owner/file
   app.get('/set/owner/file',checkAuthenticated,(req, res)=>{ 
    var obj = JSON.parse(req.query.JSONFrom);
    var otherFiles = JSON.parse(req.query.otherFiles)
    var  editfile = new Object();
    editfile.name=obj[0]["nameFile"]
    editfile.id=obj[0]["id"]
    editfile.dateStart=obj[0]["dateStart"]
    editfile.dateEnd=obj[0]["dateEnd"]
    editfile.localization = obj[0]["localization"]
    editfile.otherFiles= otherFiles
   req.session.editfile=editfile
    res.render('otherFiles/setFileOwner.ejs',{id:obj[0]["id"],nameFile:obj[0]["nameFile"]})
})

    app.get('/users/to/owner',checkAuthenticated,(req,res)=>{
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
            res.render('otherFiles/setFileOwnerChoosed.ejs',{users: usersArray})
     },1000)
    });

    
}
module.exports = setFileOwner