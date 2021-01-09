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
       var userArray = [] 
         sessionNeo       
       .run('MATCH (n:User),(f:File) Where id(f)=$idFileParam and id(n)<>$idUserParam MATCH(f)<-[r:GETACCESS]-(n) Return n',
       {idFileParam: editfile.id,idUserParam:req.user.id}) 
                 .then(result => {
                            result.records.forEach(function(record) {
                          {
                           userArray.push( record.get('n').properties.email +" - "+record.get('n').properties.lastName+" "+
                           record.get('n').properties.firstName)
                           userArray.push( record.get('n').properties.email +" - "+record.get('n').properties.lastName+" "+
                           record.get('n').properties.firstName)
                          }
                          })
                          setTimeout(async () =>{ 
                            console.log("11")
                            editfile.accessArray=userArray
                            req.session.editfile=editfile
                            console.log(userArray)
                            res.render('userFiles/setFileAccess.ejs',{id:obj[0]["id"],nameFile:obj[0]["nameFile"],users:userArray})
                     },2000)
          })
    })
    app.get('/set/access/user/availble',checkAuthenticated,(req,res)=>{
        var userArray = []
        sessionNeo  

        .run( 'MATCH (u:User),(b:File{localization:$localizationParam}) Where id(u)<>$idUserParam and (not (u)-[:OWNER|GETACCESS]->() or'+ 
        '(u)-[:OWNER|GETACCESS]->(b) and id(b)<>$idFileParam and  (date(b.firstDay)>=date($dateStartParam) '+
        'AND date(b.lastDay)<=date($dateEndParam) or date(b.firstDay)<=date($dateStartParam)'+
       ' AND date(b.lastDay)>=date($dateEndParam)  or date(b.firstDay)<=date($dateStartParam)'+ 
        'AND date(b.lastDay)<=date($dateEndParam) or date(b.firstDay)>=date($dateStartParam) '+
        'AND date(b.lastDay)<=date($dateEndParam))) RETURN u',

        {idUserParam: parseInt(req.user.id),localizationParam: req.session.editfile.localization,idFileParam:req.session.editfile.id,
         dateStartParam:req.session.editfile.startDay,dateEndParam:req.session.editfile.endDay}) 
                  .then(result => {
                       result.records.forEach(function(record) {
                           {
                                userArray.push( record.get('u').properties.email +" - "+record.get('u').properties.lastName+" "+
                                record.get('u').properties.firstName)
                           }
                         
                           })
           })
         setTimeout(async () =>{ 
          let userArrayTemp = [...new Set(userArray)]
            res.render('userFiles/editAccessFileUsersAvailable.ejs',{users: userArrayTemp})
     },1000)
    });
    app.get('/set/access/user/choosed',checkAuthenticated,(req,res)=>{
      setTimeout(async () =>{   
          res.render('userFiles/editAccessFileUsersChoosed.ejs',{users:req.session.editfile.accessArray})
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