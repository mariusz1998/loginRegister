function updateFile(app,checkAuthenticated,sessionNeo,auth,formidable,fs,google) {

    app.post('/set/upload/file', (req, res) => {
     // var  addfile = new Object();
      var formData = new formidable.IncomingForm();
      formData.parse(req, function (error, fields, files) {
   //  addfile.name=files.file.name
  //   addfile.path=files.file.path
  //   addfile.type=files.file.type
 //    req.session.addfile=addfile
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
             res.render('userFiles/updateFileSucces.ejs'); //do przeglądu własnych plików?
         })
         }
       }
     );
    })
        })
  })
  app.get('/set/upload/file',checkAuthenticated,(req, res)=>{ 
    var obj = JSON.parse(req.query.JSONFrom);
    var  editfile = new Object();
    editfile.name=obj[0]["nameFile"]
    editfile.id=obj[0]["id"]
   req.session.editfile=editfile
   res.render('userFiles/selectFileUpdate.ejs',{id:obj[0]["id"],nameFile:obj[0]["nameFile"]})
   })
}
module.exports = updateFile
