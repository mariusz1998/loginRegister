function ownedFiles(app,checkAuthenticated,sessionNeo,auth,formidable,fs,google) {
    //edit attribute
    app.get('/files/owned',checkAuthenticated,(req, res)=>{
        var tableDataFile=""
        var  attrFiles="["
            // req.user.email=req.body.email
             sessionNeo
                 .run('MATCH (u:User{active:true}),(f:File) Where id(u)<>$idParam and (u)-[:OWNER]->(f) RETURN u,f',
                 { idParam: parseInt(req.user.id) })
                 .then(function(result){   
                 if(result.records.length ==0 || result.records[0].get('f')==null)
                  res.render('usersFiless/ownedFiles.ejs')
                 else
                 {
                    tableDataFile +="<tr><th>Id</th> <th>Name</th> <th>Localization</th> <th>First Day</th> <th>Last Day</th> <th>Owner</th> </tr>"
                    result.records.forEach(function(record) {
                            tableDataFile +="<tr><td>"+record.get('f').identity.low+" </td>";
                            tableDataFile +="<td>"+record.get('f').properties.name+"</td>";
                            tableDataFile +="<td>"+record.get('f').properties.localization+"</td>";
                            tableDataFile +="<td>"+record.get('f').properties.firstDay+"</td>";
                            tableDataFile +="<td>"+record.get('f').properties.lastDay+"</td>";
                            tableDataFile +="<td>"+record.get('u').properties.email+"</td></tr>";
                            attrFiles+="{\"id\":" + record.get('f').identity.low +",",
                            attrFiles +="\"arrayAttrFile\":["
                            for(var i=0;i<record.get('f').properties.attribute.length;i++)
                            attrFiles+= "\""+record.get('f').properties.attribute[i]+"\","
                            attrFiles =  attrFiles.substring(0,  attrFiles.length - 1); 
                            attrFiles+="]},"
                           // tableDataFile +="<td>"+record.get('f').properties.firstDay+"</td>";
                    })
                    attrFiles =  attrFiles.substring(0,  attrFiles.length - 1); //usunięcie przecinka
                    attrFiles+="]"
                 //   var obj = JSON.parse(attrFiles);
                 //   console.log(obj[0]["arrayAttrFile"])
                   // setTimeout(async () =>{ 
                    res.render('usersFiles/files.ejs',{tableData: tableDataFile,arrayFilesAttr:attrFiles})  
                  //  }  ,2000)
                  }
                  })
               
    })
    app.get('/edit/file/owned/attr',checkAuthenticated,(req, res)=>{ //id przekazać 
        var obj = JSON.parse(req.query.JSONFrom);
        var objAttr = JSON.parse(req.query.attrArray);
        var tempArray = []
        var choiceArray= req.query.choice
        for(var i=0;i<objAttr[choiceArray]["arrayAttrFile"].length;i++)
        tempArray.push(objAttr[choiceArray]["arrayAttrFile"][i])
        //console.log(obj[0]["id"])
      //  console.log(obj[0]["nameFile"])
        var  editfile = new Object();
        editfile.name=obj[0]["nameFile"]
        editfile.id=obj[0]["id"]
        editfile.attr=tempArray
        editfile.user=obj[0]["email"]
       req.session.editfile=editfile
        res.render('usersFiles/editAttrFile.ejs',
        {id:obj[0]["id"],nameFile:obj[0]["nameFile"],user:obj[0]["email"],attr: req.session.editfile.attr})
    })
    app.get('/attr/edit/file/owned/availble',checkAuthenticated,(req,res)=>{
        var tempArray = []
        sessionNeo          
        .run(' MATCH (b:File)   RETURN b.attribute as attr') 
                  .then(result => {
                       result.records.forEach(function(record) {
                           {
                             if( record.get('attr')!=null){
                               for(var i=0;i<record.get('attr').length;i++)
                               tempArray.push( record.get('attr')[i])
                             }
                                 tempArray.push("Wind speed")
                                 tempArray.push("Rainfall")
                                 tempArray.push("Pressure")
                                 tempArray.push("Humidity")
                           }
                           })
           })
         setTimeout(async () =>{ 
             let attributteArrayTemp = [...new Set(tempArray)] //usuwamy powtarzające się atrybuty
             let attributteArray= attributteArrayTemp.filter(x => ! req.session.editfile.attr.includes(x)); //odejmujemy tablice
             res.render('usersFiles/editAttrAvailableFile.ejs',{attr: attributteArrayTemp})
     },2000)
    
    });
    app.get('/attr/edit/file/owned/choosed',checkAuthenticated,(req,res)=>{
        res.render('userFiles/editAttrChoosedFile.ejs',{attr: req.session.editfile.attr})
    });
    app.get('/edit/file/owned/attribute',checkAuthenticated, (req, res) => {
        var obj = JSON.parse(req.query.JSONFrom);
        var attrArray = obj["attrToEdit"]
              sessionNeo
              .run('MATCH (n:File) where id(n)=$idParam  SET n.attribute=$attrParam',
              { attrParam:attrArray,idParam: req.session.editfile.id })
              .then(function(){
                res.redirect('/files/owned'); //to 
            })
      });
      //upload files 
      app.post('/set/upload/file/owned', (req, res) => {
        // var  addfile = new Object();
         var formData = new formidable.IncomingForm();
         formData.parse(req, function (error, fields, files) {
        sessionNeo          
        .run('MATCH (n:File) Where id(n)=$idParam RETURN n.googleID as googleId',
        {idParam: req.session.editfile.id }) 
                  .then(result => {
                var googleID=  result.records[0].get('googleId')   
                      
        const fileMetadata = {
              'name':files.file.name
            };
        const media = {
          mimeType: files.file.type,
          body: fs.createReadStream(files.file.path),
        };
        // Authenticating drive API
        const drive = google.drive({ version: 'v3', auth });
        // Uploading Single image to drive
        drive.files.update(
          {
            resource: fileMetadata,
            media: media,
            fileId:googleID,
          },
          async (err, file) => {
            if (err) {
              // Handle error
              console.error(err.msg);
              return res
                .status(400)
                .json({ errors: [{ msg: 'Server Error try again later' }] });
            } else {
              //console.log(file.data.id)
              // if file upload success then return the unique google drive id
              sessionNeo
              .run('MATCH (n:File) Where id(n)=$idParam SET n.name=$nameParam',
              {idParam: req.session.editfile.id ,nameParam:files.file.name})
              .then(function(){
               res.render('usersFiles/updateFileSucces.ejs'); 
            })
            }
          }
        );
       })
           })
     })
     app.get('/set/upload/file/owned',checkAuthenticated,(req, res)=>{ 
       var obj = JSON.parse(req.query.JSONFrom);
       var  editfile = new Object();
       editfile.name=obj[0]["nameFile"]
       editfile.id=obj[0]["id"]
      req.session.editfile=editfile
      res.render('usersFiles/selectFileUpdate.ejs',{id:obj[0]["id"],nameFile:obj[0]["nameFile"]})
      })
      //delete files
      app.get('/delete/file/owned', (req, res) => {
        var obj = JSON.parse(req.query.JSONFrom);
        console.log(obj[0]["id"]+" "+obj[0]["nameFile"])
     sessionNeo          
     .run('MATCH (n:File) Where id(n)=$idParam RETURN n.googleID as googleId',
     {idParam: obj[0]["id"] }) 
               .then(result => {
             var googleID=  result.records[0].get('googleId')   
        
     // Authenticating drive API
     const drive = google.drive({ version: 'v3', auth });
     // Uploading Single image to drive
     drive.files
     .delete({
       fileId: googleID,
     },
       async (err, file) => {
         if (err) {
           // Handle error
           console.error(err.msg);
           return res
             .status(400)
             .json({ errors: [{ msg: 'Server Error try again later' }] });
         } else {
           sessionNeo
           .run('MATCH (n:File) where id(n)=$idParam DETACH DELETE n',{idParam: obj[0]["id"]})
           .then(function(){
             res.render('usersFiles/deleteFileSucces.ejs',{information:obj[0]["id"]+" "+obj[0]["nameFile"]});
         })
         }
       }
     );
    })
  })

    // /set/owner/file
    app.get('/set/owner/file/owned',checkAuthenticated,(req, res)=>{ 
      var obj = JSON.parse(req.query.JSONFrom);
      var  editfile = new Object();
      editfile.name=obj[0]["nameFile"]
      editfile.id=obj[0]["id"]
      editfile.startDay=obj[0]["dateStart"]
      editfile.endDay=obj[0]["dateEnd"]
      editfile.localization = obj[0]["localization"]
      editfile.owner= obj[0]["email"]
     req.session.editfile=editfile
      res.render('usersFiles/setFileOwner.ejs',{id:obj[0]["id"],nameFile:obj[0]["nameFile"]})
      })
  
      app.get('/users/to/owner/file/owned',checkAuthenticated,(req,res)=>{
           var userArray = []
          var userToDelete = []
          sessionNeo  
          .run( 'MATCH (u:User{active:true}),(b:File{localization:$localizationParam}) Where u.email<>$emailParam and (u)-[:OWNER|GETACCESS]->(b) RETURN u,b',
          {localizationParam: req.session.editfile.localization,emailParam:req.session.editfile.owner}) 
                    .then(result => {
                         result.records.forEach(function(record) {
                             console.log(result.records)
                             {
                               userArray.push(record.get('u').properties.email)
                               console.log(record.get('u').properties.email)
                               console.log((record.get('b').properties.firstDay+" " +(req.session.editfile.startDay)+ " "+record.get('b').properties.lastDay+" "+(req.session.editfile.startDay))) 	
                               console.log((record.get('b').properties.firstDay<=(req.session.editfile.startDay) && record.get('b').properties.lastDay>=(req.session.editfile.startDay))) 			
                               console.log((record.get('b').properties.firstDay<=(req.session.editfile.endDay)&& record.get('b').properties.lastDay>=(req.session.editfile.endDay)))  		
                               console.log((record.get('b').properties.firstDay<=(req.session.editfile.startDay)&& record.get('b').properties.lastDay>=(req.session.editfile.endDay))) 
                               console.log((record.get('b').properties.firstDay>=(req.session.editfile.startDay)&& record.get('b').properties.lastDay<=(req.session.editfile.endDay)))
  
  
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
          .run( 'MATCH (u:User),(b:File{localization:$localizationParam}) Where not (u)-[:OWNER|GETACCESS]->() RETURN u',
          {localizationParam: req.session.editfile.localization}) 
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
              res.render('usersFiles/setFileOwnerChoosed.ejs',{users: usersArray})
       },1000)
      });
      app.get('/set/file/owned/owner',checkAuthenticated,(req, res)=>{ 
          var obj = JSON.parse(req.query.JSONFrom);
         // .run('MATCH (u:User {email:$emailParam}),(f:File) Where id(f)=$idFileParam MERGE(f)<-[r:OWNER]-(u)',
          sessionNeo
     
          .run('MATCH (u:User {email:$oldemailParam})-[r:OWNER]->(f:File),(a:User {email:$newEmailParam})'+
          'Where id(f)=$idFileParam '+
        ' CREATE (a)-[p:OWNER]->(f) '+
        'SET p=r '+
        'DELETE r',
          { oldemailParam: req.session.editfile.owner, newEmailParam:obj["email"],idFileParam: req.session.editfile.id})
          .then(function(){
           res.redirect('/files/owned');
        })
      })
}
module.exports = ownedFiles
