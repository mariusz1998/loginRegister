function addFile(app,checkAuthenticated,sessionNeo,auth,formidable,fs,google) {
    app.post('/add/file',checkAuthenticated,(req, res)=>{ //render add file panel
        res.render('addFile/selectFilePanel.ejs')
    })
    app.post('/get/file/property', (req, res) => { //save file data in session and render choose attribute panel
      var  addfile = new Object();
      var formData = new formidable.IncomingForm();
      formData.parse(req, function (error, fields, files) {
     addfile.name=files.file.name
     addfile.path=files.file.path
     addfile.type=files.file.type
     req.session.addfile=addfile
      res.render('addFile/addFileAttrPanel.ejs')
    })
    app.get('/get/file/property', (req, res) => {
      res.render('addFile/addFileAttrPanel.ejs')
    })
  })
    app.get('/attr/avaible',checkAuthenticated,(req,res)=>{ //generate array of attribute by downloading attributes in other files
       var tempArray = []
       sessionNeo          
       .run('MATCH (u:User{email:$emailParam}) OPTIONAL MATCH (u)-[r:OWNER]-(b:File) RETURN b.attribute as attr',
       {emailParam:req.user.email }) 
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
            let attributeArray = [...new Set(tempArray)] //delete duplicates
      res.render('addFile/availableAttrFile.ejs',{attr: attributeArray})
    },2000)
  });
  app.get('/attr/choosed',checkAuthenticated,(req,res)=>{// genrate select option of choosed attribute
    res.render('addFile/choosedAttrList.ejs')
  })
   app.get('/add/file/attribute',checkAuthenticated, (req, res) => { //add file to Google Drive and data base
    var obj = JSON.parse(req.query.JSONFrom);
    var localization = obj["localization"]
    var attrArray = obj["attrToAdd"]
    sessionNeo          
    .run('MATCH (u:User{email:$emailParam}),(b:File{localization:$localizationParam}) Where(u)-[:OWNER|GETACCESS]->(b) and NOT (date(b.firstDay)>date($dateEndParam) OR date(b.lastDay)<date($dateStartParam)) RETURN b',
    {emailParam:req.user.email,localizationParam:localization,dateStartParam:obj["firstDay"] 
    ,dateEndParam:obj["lastDay"] }) 
              .then(result => {
                  if(result.records.length==0)
                  {
    const fileMetadata = {
          'name': req.session.addfile.name
        };
    const media = {
      mimeType: req.session.addfile.type,
      body: fs.createReadStream(req.session.addfile.path),
    };
    const drive = google.drive({ version: 'v3', auth });
    drive.files.create(
      {
        resource: fileMetadata,
        media: media,
      },
      async (err, file) => {
        if (err) {
          res.render('addFile/addFileError.ejs'); 
        } else {
          sessionNeo
          .run('CREATE(n:File {name:$nameParam, googleID:$googleIDParam, localization:$localizationParam, attribute:$attrParam, firstDay:date($firstDayParam),lastDay:date($lastDayParam)}) WITH n MATCH (u:User {email:$emailParam}) MERGE(n)<-[r:OWNER]-(u)',
          {nameParam:req.session.addfile.name,googleIDParam:file.data.id,localizationParam: localization, attrParam:attrArray,emailParam:req.user.email,
            firstDayParam:obj["firstDay"], lastDayParam:obj["lastDay"] })
          .then(function(){
            res.render('addFile/addFileSucces.ejs'); 
        })
        }
      }
    );
                  }
                  else
                    res.render('addFile/addFileFailed.ejs',{localization:localization,firstDay:obj["firstDay"],lastDay:obj["lastDay"]});
                });
  });
}
module.exports = addFile
