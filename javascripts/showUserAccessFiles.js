function showUserAccessFiles(app,checkAuthenticated,sessionNeo) {
    app.get('/show/your/access/files',checkAuthenticated,(req, res)=>{ //generate table of user files which have acccess
        var tableDataFile=""
             sessionNeo
            
                 .run('MATCH (u:User ) WHERE id(u)=$idParam  MATCH (f:File)<-[:GETACCESS]-(u) optional MATCH (f)<-[:OWNER]-(a:User) RETURN f,a',
                 { idParam: parseInt(req.user.id) })
                 .then(function(result){   
                 if(result.records.length==0 || result.records[0].get('f')==null )
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
                            if(record.get('a')!=null)
                            tableDataFile +="<td>"+record.get('a').identity.low+") "+record.get('a').properties.email+"</td></tr>";
                            else
                            tableDataFile +="<td>"+"Empty"+"</td></tr>";
                    })
                    res.render('userAccessFiles/accessFiles.ejs',{tableData: tableDataFile})  
                  }
                  })
                  .catch((error) => {
                    res.redirect('/errorConnect');
                  });
               
    })
    app.get('/access/file/delete', (req, res) => { //removing access to files that have been accessed
        var obj = JSON.parse(req.query.JSONFrom);
        var idArray = obj["idFiles"]
     sessionNeo          
     .run('MATCH (n:User{email:$emailParam})-[r:GETACCESS]->(f:File) Where id(f) in {idFiles} DELETE r',
     {idFiles:idArray,emailParam: req.user.email})  
               .then(result => {
                res.redirect('/show/your/access/files');
    })
    .catch((error) => {
      res.redirect('/errorConnect');
    });
  })
}
module.exports = showUserAccessFiles
