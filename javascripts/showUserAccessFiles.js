function showUserAccessFiles(app,checkAuthenticated,sessionNeo) {
    app.get('/show/your/access/files',checkAuthenticated,(req, res)=>{
        var tableDataFile=""
       // var  attrFiles="["
            // req.user.email=req.body.email
             sessionNeo
                 .run('MATCH (u:User ) WHERE id(u)=$idParam MATCH (f:File)<-[:OWNER]-(a:User) MATCH (f)<-[:GETACCESS]-(u) RETURN f,a',
                 { idParam: parseInt(req.user.id) })
                 .then(function(result){   
                 if(result.records.length==0 || result.records[0].get('f')==null || result.records[0].get('a')==null)
                  res.render('userAccessFiles/noAccessFilesUser.ejs')
                 else
                 {
                    tableDataFile +="<tr><th>Id</th> <th>Name</th> <th>Localization</th> <th>First Day</th> <th>Last Day</th> <th>Owner</th> </tr>"
                    result.records.forEach(function(record) {
                            tableDataFile +="<tr><td>"+record.get('f').identity.low+" </td>";
                            tableDataFile +="<td>"+record.get('f').properties.name+"</td>";
                            tableDataFile +="<td>"+record.get('f').properties.localization+"</td>";
                            tableDataFile +="<td>"+record.get('f').properties.firstDay+"</td>";
                            tableDataFile +="<td>"+record.get('f').properties.lastDay+"</td>";
                            tableDataFile +="<td>"+record.get('a').identity.low+") "+record.get('a').properties.email+"</td></tr>";
                           // tableDataFile +="<td>"+record.get('f').properties.firstDay+"</td>";
                    })
                    res.render('userAccessFiles/accessFiles.ejs',{tableData: tableDataFile})  
                  }
                  })
               
    })
    app.get('/access/file/delete', (req, res) => {
        var obj = JSON.parse(req.query.JSONFrom);
        var count = Object.keys(obj["idFiles"]).length;

        var idArray = obj["idFiles"]
      //  console.log(obj["idFiles"][0])
       // var params = {"idFiles": []};
      //  obj["filesToDelete"].forEach((item)=>{
       //   params.idFiles.push(item[0])
      //  })
     sessionNeo          
     .run('MATCH (n:User{email:$emailParam})-[r:GETACCESS]->(f:File) Where id(f) in {idFiles} DELETE r',
     {idFiles:idArray,emailParam: req.user.email})  
               .then(result => {
                res.redirect('/show/your/access/files');
    })
  })
}
module.exports = showUserAccessFiles
