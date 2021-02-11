function setFileOwner(app,checkAuthenticated,sessionNeo)
{
   app.get('/set/owner/file',checkAuthenticated,(req, res)=>{   //set owner for files whitout owner
    var obj = JSON.parse(req.query.JSONFrom);
    var otherFiles = JSON.parse(req.query.otherFiles)
    var editfile = new Object();
    editfile.name=obj[0]["nameFile"]
    editfile.id=obj[0]["id"]
    editfile.startDay=obj[0]["dateStart"]
    editfile.endDay=obj[0]["dateEnd"]
    editfile.localization = obj[0]["localization"]
    editfile.otherFiles= otherFiles
   req.session.editfile=editfile
    res.render('otherFiles/setFileOwner.ejs',{id:obj[0]["id"],nameFile:obj[0]["nameFile"]})
    })

    app.get('/users/to/owner',checkAuthenticated,(req,res)=>{ //get all user who can being owner
         var userArray = []
        var userToDelete = []
        sessionNeo  
        .run( 'MATCH (u:User{active:true}),(b:File{localization:$localizationParam}) Where id(b)<>$idFileParam and (u)-[:OWNER|GETACCESS]->(b) RETURN u,b',
        {localizationParam: req.session.editfile.localization,idFileParam:req.session.editfile.id}) 
                  .then(result => {
                       result.records.forEach(function(record) {
                            if((record.get('b').properties.firstDay<=(req.session.editfile.startDay) && record.get('b').properties.lastDay>=(req.session.editfile.startDay)) ||			
                            (record.get('b').properties.firstDay<=(req.session.editfile.endDay)&& record.get('b').properties.lastDay>=(req.session.editfile.endDay))  ||			
                            (record.get('b').properties.firstDay<=(req.session.editfile.startDay)&& record.get('b').properties.lastDay>=(req.session.editfile.endDay)) ||
                            (record.get('b').properties.firstDay>=(req.session.editfile.startDay)&& record.get('b').properties.lastDay<=(req.session.editfile.endDay))){
                              userToDelete.push( record.get('u').properties.email )
                        }
                          })
                           sessionNeo  
        .run( 'MATCH (u:User{active:true})   RETURN u') 
        .then(result => {
          result.records.forEach(function(record) {
               userArray.push(record.get('u').properties.email)                 
      })
           })
           .catch((error) => {
            res.redirect('/errorConnect');
          });
          })
          .catch((error) => {
            res.redirect('/errorConnect');
          });
         setTimeout(async () =>{ 
          let  userArrayTemp = [...new Set(userArray)]
          let usersArray= userArrayTemp.filter(x => ! userToDelete.includes(x)); 
            res.render('otherFiles/setFileOwnerChoosed.ejs',{users: usersArray})
     },1000)
    });
    app.get('/set/file/owner',checkAuthenticated,(req, res)=>{  //ser file owner in data graph
        var obj = JSON.parse(req.query.JSONFrom);
        sessionNeo
        .run('MATCH (u:User {email:$emailParam}),(f:File) Where id(f)=$idFileParam MERGE(f)<-[r:OWNER]-(u)',
        { emailParam:obj["email"],idFileParam: req.session.editfile.id})
        .then(function(){
         res.redirect('/files/other');
      })
      .catch((error) => {
        res.redirect('/errorConnect');
      });
    })
}
module.exports = setFileOwner