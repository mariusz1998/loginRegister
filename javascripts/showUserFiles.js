function showUserFiles(app,checkAuthenticated,sessionNeo) {
    app.get('/show/your/files',checkAuthenticated,(req, res)=>{
        var tableDataFile=""
        var  attrFiles="["
            // req.user.email=req.body.email
             sessionNeo
                 .run('MATCH (u:User ) WHERE id(u)=$idParam OPTIONAL MATCH (f:File)<-[:OWNER]-(u) RETURN f',
                 { idParam: parseInt(req.user.id) })
                 .then(function(result){   
                 if(result.records[0].get('f')==null)
                  res.render('userFiles/noFilesUser.ejs')
                 else
                 {
                    tableDataFile +="<tr><th>Id</th> <th>Name</th> <th>Localization</th> <th>First Day</th> <th>Last Day</th> </tr>"
                    result.records.forEach(function(record) {
                            tableDataFile +="<tr><td>"+record.get('f').identity.low+" </td>";
                            tableDataFile +="<td>"+record.get('f').properties.name+"</td>";
                            tableDataFile +="<td>"+record.get('f').properties.localization+"</td>";
                            tableDataFile +="<td>"+record.get('f').properties.firstDay+"</td>";
                            tableDataFile +="<td>"+record.get('f').properties.lastDay+"</td></tr>";
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
                    res.render('userFiles/files.ejs',{tableData: tableDataFile,arrayFilesAttr:attrFiles})  
                  //  }  ,2000)
                  }
                  })
               
    })
   
}
module.exports = showUserFiles
