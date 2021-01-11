function setFileOwner(app,checkAuthenticated,sessionNeo)
{
   // /set/owner/file
   app.get('/set/owner/file',checkAuthenticated,(req, res)=>{ 
    var obj = JSON.parse(req.query.JSONFrom);
    var otherFiles = JSON.parse(req.query.otherFiles)
    var  editfile = new Object();
    editfile.name=obj[0]["nameFile"]
    editfile.id=obj[0]["id"]
    editfile.startDay=obj[0]["dateStart"]
    editfile.endDay=obj[0]["dateEnd"]
    editfile.localization = obj[0]["localization"]
    editfile.otherFiles= otherFiles
   req.session.editfile=editfile
    res.render('otherFiles/setFileOwner.ejs',{id:obj[0]["id"],nameFile:obj[0]["nameFile"]})
    })

    app.get('/users/to/owner',checkAuthenticated,(req,res)=>{
         var userArray = []
        var userToDelete = []
        sessionNeo  
        .run( 'MATCH (u:User{active:true}),(b:File{localization:$localizationParam}) Where  (u)-[:OWNER|GETACCESS]->(b) RETURN u,b',
        {localizationParam: req.session.editfile.localization}) 
                  .then(result => {
                       result.records.forEach(function(record) {
                           console.log(result.records)
                           {
                            // userArray.push(record.get('u').properties.email)
                            // console.log((record.get('b').properties.firstDay+" " +(req.session.editfile.startDay)+ " "+record.get('b').properties.lastDay+" "+(req.session.editfile.startDay))) 	
                            // console.log((record.get('b').properties.firstDay<=(req.session.editfile.startDay) && record.get('b').properties.lastDay>=(req.session.editfile.startDay))) 			
                            // console.log((record.get('b').properties.firstDay<=(req.session.editfile.endDay)&& record.get('b').properties.lastDay>=(req.session.editfile.endDay)))  		
                            // console.log((record.get('b').properties.firstDay<=(req.session.editfile.startDay)&& record.get('b').properties.lastDay>=(req.session.editfile.endDay))) 
                            // console.log((record.get('b').properties.firstDay>=(req.session.editfile.startDay)&& record.get('b').properties.lastDay<=(req.session.editfile.endDay)))


                            if((record.get('b').properties.firstDay<=(req.session.editfile.startDay) && record.get('b').properties.lastDay>=(req.session.editfile.startDay)) ||			
                            (record.get('b').properties.firstDay<=(req.session.editfile.endDay)&& record.get('b').properties.lastDay>=(req.session.editfile.endDay))  ||			
                            (record.get('b').properties.firstDay<=(req.session.editfile.startDay)&& record.get('b').properties.lastDay>=(req.session.editfile.endDay)) ||
                            (record.get('b').properties.firstDay>=(req.session.editfile.startDay)&& record.get('b').properties.lastDay<=(req.session.editfile.endDay)))
                           {
                            //   console.log(record.get('u').properties.email)
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
    app.get('/set/file/owner',checkAuthenticated,(req, res)=>{ 
        var obj = JSON.parse(req.query.JSONFrom);
   //   console.log(obj["email"])
        sessionNeo
        .run('MATCH (u:User {email:$emailParam}),(f:File) Where id(f)=$idFileParam MERGE(f)<-[r:OWNER]-(u)',
        { emailParam:obj["email"],idFileParam: req.session.editfile.id})
        .then(function(){
         res.redirect('/files/other');
      })
    })
}
module.exports = setFileOwner