function ownedFiles(app,checkAuthenticated,sessionNeo) {
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
}
module.exports = ownedFiles
