function deleteFile(app,checkAuthenticated,sessionNeo,auth,google) {

    app.get('/delete/file', (req, res) => {
        var obj = JSON.parse(req.query.JSONFrom);
        var otherFiles = JSON.parse(req.query.otherFiles)
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
             if(otherFiles==false)
             res.render('userFiles/deleteFileSucces.ejs',{information:obj[0]["id"]+" "+obj[0]["nameFile"]});
             else
             res.render('otherFiles/deleteOtherFileSuccess.ejs',{information:obj[0]["id"]+" "+obj[0]["nameFile"]});
         })
         }
       }
     );
    })
  })
}
module.exports = deleteFile
