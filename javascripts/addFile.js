function addFile(app,checkAuthenticated,sessionNeo,auth,formidable,fs,google) {
    app.post('/add/file',checkAuthenticated,(req, res)=>{
        res.render('addFile/selectFilePanel.ejs')
    })
    app.post('/get/file/property', (req, res) => {
      var  addfile = new Object();
      var formData = new formidable.IncomingForm();
      formData.parse(req, function (error, fields, files) {
     addfile.name=files.file.name
     addfile.path=files.file.path
     addfile.type=files.file.type
     req.session.addfile=addfile
      res.render('addFile/addFileAttrPanel.ejs',{addFileProperty: addfile})
    })
  })
    app.get('/attr/availble',checkAuthenticated,(req,res)=>{
      //pobranie wszystkich atrybutów plików danego użytkonika?
       var attributteArray = []
       attributteArray.push("Wiatr")
       attributteArray.push("Deszcz")
       attributteArray.push("Cisnienie")
       attributteArray.push("Wilgotnosc")
      // sessionNeo
      // .run('MATCH (n:User{active:false}) RETURN (n)') 
      // .then(function(result){
      //   result.records.forEach(function(record){
      //     allUsersEmails.push(record._fields[0].identity.low+") "+record._fields[0].properties.email 
      //     + " "+ record._fields[0].properties.firstName + " "+ record._fields[0].properties.lastName )
      //   });
      res.render('addFile/availableAttrFile.ejs',{attr: attributteArray})
   // })
  });
  app.get('/attr/choosed',checkAuthenticated,(req,res)=>{
    res.render('addFile/choosedAttrList.ejs')
  })
   app.get('/add/file/attribute',checkAuthenticated, (req, res) => {
    var obj = JSON.parse(req.query.JSONFrom);
    var localization = obj["localization"]
    var attrArray = obj["attrToAdd"]
    const fileMetadata = {
          'name': req.session.addfile.name
        };
    const media = {
      mimeType: req.session.addfile.type,
      body: fs.createReadStream(req.session.addfile.path),
    };
    // Authenticating drive API
    const drive = google.drive({ version: 'v3', auth });
    // Uploading Single image to drive
    drive.files.create(
      {
        resource: fileMetadata,
        media: media,
      },
      async (err, file) => {
        if (err) {
          // Handle error
          console.error(err.msg);
          return res
            .status(400)
            .json({ errors: [{ msg: 'Server Error try again later' }] });
        } else {
          // if file upload success then return the unique google drive id
          sessionNeo
          .run('CREATE(n:File {name:$nameParam, googleID:$googleIDParam, localization:$localizationParam, attribute:$attrParam}) WITH n MATCH (u:User {email:$emailParam}) MERGE(n)<-[r:OWNER]-(u)',
          {nameParam:req.session.addfile.name,googleIDParam:file.data.id,localizationParam: localization, attrParam:attrArray,emailParam:req.user.email })
          .then(function(){
            res.render('addFile/addFileSucces.ejs'); //do przeglądu własnych plików?
        })
        }
      }
    );
  });
}
module.exports = addFile
