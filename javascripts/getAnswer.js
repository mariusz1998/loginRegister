function getAnswer(app,checkAuthenticated,sessionNeo,auth,formidable,fs,google) 
{  app.get('/get/question',checkAuthenticated,(req, res)=>{ 
   var attrArry = []
   var localizationArray = []
        sessionNeo
        .run('MATCH (u:User),(b:File) Where id(u)=$idParam and (u)-[:OWNER|GETACCESS]->(b) RETURN b.localization as place' +
        ',b.attribute as attr',{ idParam: req.user.id})
        .then(function(result){
         if(result.records.length!=0)
         {
            result.records.forEach(function(record){
                for(var i=0;i<record.get('attr').length;i++)
                attrArry.push( record.get('attr')[i])
                localizationArray.push(record.get('place'))
              });
              let attributteArray = [...new Set(attrArry)] //usuwamy powtarzające się atrybuty
              let placesArray = [...new Set( localizationArray)] 
              //console.log(attributteArray)
             // console.log(placesArray)
             res.render('makeQuestion/createQuestionPanel.ejs',{attr:attributteArray,localizations:placesArray})
            }
            else
            res.render('makeQuestion/noFilesToQuestion.ejs')
      })
    })
    app.get('/create/question',checkAuthenticated,(req, res)=>{ 
        var obj = JSON.parse(req.query.JSONFrom);
       // console.log(obj["attribute"])
        //console.log(obj["localization"])
        console.log(obj["firstDay"])
        console.log(obj["lastDay"])
        var lastDay=(obj["lastDay"])
        var firstDay=obj["firstDay"]
        var localization = obj["localization"]
        var attribute = obj["attribute"]

       // var  editfile = new Object(); //?
        var filesArray = []
        var  dateRangeFile= []
       var  dateRangeCheck = []
       var dateRangeStart = new Date(firstDay);
       var dateRangeEnd = new Date(lastDay);
       while(dateRangeEnd>=dateRangeStart){ //uzupełnianie tablicy każdym dniem 
        dateRangeCheck.push(new Date(dateRangeStart))
        dateRangeStart.setDate(dateRangeStart.getDate() + 1)
    }
        sessionNeo
        .run('MATCH (b:File{localization:$localizationParam}),(u:User) Where any(x IN b.attribute WHERE x =$attributeParam)'+
         'and (u)-[:OWNER|GETACCESS]-(b) and id(u)=$idParam'+
        ' and ((b.firstDay<=date($dateStartParam) and b.lastDay>=date($dateStartParam)) or'+							
        '(b.firstDay<=date($dateEndParam) and b.lastDay>=date($dateEndParam))	or '+									
        '(b.firstDay<=date($dateStartParam) and b.lastDay>=date($dateEndParam))	or 	'+								
        '(b.firstDay>=date($dateStartParam) and b.lastDay<=date($dateEndParam)))  RETURN b'
        ,{ idParam: req.user.id,localizationParam:localization,dateStartParam:firstDay,dateEndParam:lastDay,
        attributeParam:attribute})
        .then(function(result){
         if(result.records.length!=0)
         {
            result.records.forEach(function(record){
              console.log("rozpoczynam")
            console.log(record.get('b').properties.name)
             // console.log(record.get('b').properties.firstDay) 
              //console.log(record.get('b').properties.lastDay) 
              var dateFileStart = new Date(record.get('b').properties.firstDay);
              var dateFileEnd = new Date(record.get('b').properties.lastDay);
              while(dateFileEnd>=dateFileStart ){ //uzupełnianie tablicy każdym dniem 
                dateRangeFile.push(new Date(dateFileStart))
                dateFileStart.setDate(dateFileStart.getDate() + 1)
           }
           var dateRageFileSizeBeforeDelete = dateRangeCheck.length
          console.log(dateRangeCheck.length)
           for (var i=0; i< dateRangeFile.length;i++)
           for(var j=0;j<dateRangeCheck.length;j++) {
               if(dateRangeCheck[j].getTime()===dateRangeFile[i].getTime()){ //jeśli dni równe to odemujemy{  
                dateRangeCheck.splice(j, 1);
             }
            } 
           console.log(dateRangeCheck.length)
           dateRangeFile=[]
            if(dateRageFileSizeBeforeDelete>dateRangeCheck.length)
            {
                var file = new Object();
                file.id= record.get('b').identity.low
                file.googleId= record.get('b').properties.googleID
                file.name =  record.get('b').properties.name
                filesArray.push(file)
            }

              });
              if(dateRangeCheck.length==0)
           {
               // console.log(filesArray)
                downloadFiles(filesArray)



           }
              else
              res.render('makeQuestion/noDatesToQuestion.ejs',{dates:dateRangeCheck})
              //console.log("nie czytamy",{dates:dateRangeCheck}) //można przekazać jako argument tą tablicę
              //jeżeli puste to czytamy jeśli nie to strona 
            //  let attributteArray = [...new Set(attrArry)] //usuwamy powtarzające się atrybuty
             // let placesArray = [...new Set( localizationArray)] 
              //console.log(attributteArray)
             // console.log(placesArray)
           //  res.render('makeQuestion/createQuestionPanel.ejs',{attr:attributteArray,localizations:placesArray})
            }
            else
            res.render('makeQuestion/noFilesToQuestion.ejs')
      })
    })
    function downloadFiles(filesArray)
    {
        //pobiermay pliki które bd czytane do folderu 
        console.log(filesArray)
      filesArray.forEach(function(file){
            const homeDir = require('os').homedir();
            const desktopDir = homeDir+`\\Desktop`+"\\DataLakeFiles";
            fs.promises.mkdir(desktopDir, { recursive: true })
            const dest = fs.createWriteStream(desktopDir+"/"+file.name);
          // Authenticating drive API
          const drive = google.drive({ version: 'v3', auth });
          drive.files.get({fileId: file.googleId, alt: 'media'}, {responseType: 'stream'},
          function(err, response){
            response.data
              .on('end', () => {
                  console.log('Done');
              })
              .on('error', err => {
                  console.log('Error', err);
              })
              .pipe(dest);
          }
      );
    });
    }
}
module.exports = getAnswer