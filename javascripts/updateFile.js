function updateFile(app,checkAuthenticated,sessionNeo,auth,formidable,fs,google) {

    app.post('/set/upload/file', (req, res) => { //upload file in Google Drive and graph data base
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
     const drive = google.drive({ version: 'v3', auth });
     drive.files.update(
       {
         resource: fileMetadata,
         media: media,
         fileId:googleID,
       },
       async (err, file) => {
         if (err) {
           res.render('userFiles/updateFileError.ejs'); 
         } else {
           sessionNeo
           .run('MATCH (n:File) Where id(n)=$idParam SET n.name=$nameParam',
           {idParam: req.session.editfile.id ,nameParam:files.file.name})
           .then(function(){
            if(req.session.editfile.otherFiles==false)
            res.render('userFiles/updateFileSucces.ejs'); 
            else
            res.render('otherFiles/updateOtherFileSuccess.ejs');
         })
         }
       }
     );
    })
        })
  })
  app.get('/set/upload/file',checkAuthenticated,(req, res)=>{ 
    var obj = JSON.parse(req.query.JSONFrom);
    var otherFiles = JSON.parse(req.query.otherFiles)
    var  editfile = new Object();
    editfile.name=obj[0]["nameFile"]
    editfile.id=obj[0]["id"]
    editfile.otherFiles= otherFiles
   req.session.editfile=editfile
   res.render('userFiles/selectFileUpdate.ejs',{id:obj[0]["id"],nameFile:obj[0]["nameFile"]})
   })
}
module.exports = updateFile
