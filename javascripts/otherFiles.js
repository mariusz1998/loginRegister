function otherFiles(app,checkAuthenticated,sessionNeo) {
    app.get('/files/other',checkAuthenticated,(req, res)=>{ //get table of files without owner
        var tableDataFile=""
        var  attrFiles="["
             sessionNeo
                 .run('MATCH (f:File) WHERE NOT (f)-[]-() RETURN f')
                 .then(function(result){   
                 if(result.records.length ==0 || result.records[0].get('f')==null)
                  res.render('otherFiles/noFiles.ejs')
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
                    })
                    attrFiles =  attrFiles.substring(0,  attrFiles.length - 1); 
                    attrFiles+="]"
                    res.render('otherFiles/files.ejs',{tableData: tableDataFile,arrayFilesAttr:attrFiles})  
                  }
                  })
               
    })
}
module.exports = otherFiles
