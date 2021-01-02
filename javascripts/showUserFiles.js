function showUserFiles(app,checkAuthenticated,sessionNeo) {
    app.post('/show/your/files',checkAuthenticated,(req, res)=>{
        var tableDataFile=""
            // req.user.email=req.body.email
             sessionNeo
                 .run('MATCH (u:User ) WHERE id(u)=$idParam OPTIONAL MATCH (f:File)<-[:OWNER]-(u) RETURN f',
                 { idParam: parseInt(req.user.id) })
                 .then(function(result){   
                   // record.get('f').properties.name
                    tableDataFile +="<tr><th>Id</th> <th>Name</th> <th>Localization</th> <th>First Day</th> <th>Last Day</th> </tr>"
                    result.records.forEach(function(record) {
                            tableDataFile +="<tr><td>"+record.get('f').identity.low+" </td>";
                            tableDataFile +="<td>"+record.get('f').properties.name+"</td>";
                            tableDataFile +="<td>"+record.get('f').properties.localization+"</td>";
                            tableDataFile +="<td>"+record.get('f').properties.firstDay+"</td>";
                            tableDataFile +="<td>"+record.get('f').properties.lastDay+"</td></tr>";

                           // tableDataFile +="<td>"+record.get('f').properties.firstDay+"</td>";
                    })
                   // setTimeout(async () =>{ 
                     res.render('userFiles/files.ejs',{tableData: tableDataFile})  
                  //  }  ,2000)
                })
               
    })
   
}
module.exports = showUserFiles
