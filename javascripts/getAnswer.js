const { RSA_NO_PADDING } = require('constants');

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
        var dateFileStart;
        var dateFileStartCopy;
        var dateFileEnd;
       // var  editfile = new Object(); //?
       var fileNumber=0;
        var filesArray = []
        var  dateRangeFile= []
       var  dateRangeCheck = []
       var dateRangeStart = new Date(firstDay);
       //var dateRangeStartCopy= new Date(firstDay);
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
            console.log(record.get('b').properties.name)
             // console.log(record.get('b').properties.firstDay) 
              //console.log(record.get('b').properties.lastDay) 
              dateFileStart = new Date(record.get('b').properties.firstDay);
              dateFileStartCopy= new Date(record.get('b').properties.firstDay);
             dateFileEnd = new Date(record.get('b').properties.lastDay);
              while(dateFileEnd>=dateFileStart ){ //uzupełnianie tablicy każdym dniem 
                dateRangeFile.push(new Date(dateFileStart))
                dateFileStart.setDate(dateFileStart.getDate() + 1)
           }
           var dateRageFileSizeBeforeDelete = dateRangeCheck.length
        //  console.log(dateRangeCheck.length)
           for (var i=0; i< dateRangeFile.length;i++)
           for(var j=0;j<dateRangeCheck.length;j++) {
               if(dateRangeCheck[j].getTime()===dateRangeFile[i].getTime()){ //jeśli dni równe to odemujemy{  
                dateRangeCheck.splice(j, 1);
             }
            } 
         //  console.log(dateRangeCheck.length)
           dateRangeFile=[]
            if(dateRageFileSizeBeforeDelete>dateRangeCheck.length)
            {
                var file = new Object();
                file.id= record.get('b').identity.low
                file.googleId= record.get('b').properties.googleID
                file.name = + fileNumber.toString() + record.get('b').properties.name 
                file.dayStart =dateFileStartCopy
                file.dayEnd = dateFileEnd
                filesArray.push(file)
            }
            fileNumber++;
              });
              if(dateRangeCheck.length==0)
           {
            
               // console.log(filesArray)
                downloadFiles(filesArray,attribute)
            //  console.log("koniec")


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
    function downloadFiles(filesArray,attribute)
    {
        //pobiermay pliki które bd czytane do folderu 
        console.log(filesArray.length)
     var counterFiles=0
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
                  counterFiles++;
                  if(filesArray.length==counterFiles)
                  generateAnswer(filesArray,attribute)
              })
              .on('error', err => {
                  console.log('Error', err);
              })
              .pipe(dest);
          }
      );
    });
    }
    function convert(date){
      var datearray = date.split("-");
      var newdate = datearray[2] + '-' + datearray[1] + '-' + datearray[0];
      return newdate;
    }
    function generateAnswer(filesArray,attribute)
    {
      var max=-9999.9;
      var day;
      var time;
var attrSplit=attribute.split(' ')
console.log(attrSplit[attrSplit.length-1])
 attribute=attribute.substring(0,attribute.lastIndexOf(" ") ); //przycinam jednostkę 
 console.log(attribute)
        //pobiermay pliki które bd czytane do folderu 
      //  console.log(filesArray)
      filesArray.forEach(function(file){
        console.log("zaczynam")
        const homeDir = require('os').homedir();
        const desktopDir = homeDir+`\\Desktop`+"\\DataLakeFiles";
      //  fs.promises.mkdir(desktopDir, { recursive: true }
     // var reader = new BufferedReader(new FileReader(desktopDir+"/"+file.name));
  //   var readline = require('readline');

  //sprawdzanie rozszerzenia 
  //txt and csv
  var attrNumber=-1;
  try{
    var array = fs.readFileSync(desktopDir+"/"+file.name,'ascii').toString().split("\n");
  }
  catch(err)
  {
    console.log("Nie ma takeigo pliku")
  }
  console.log(file.dayStart)
  var dateTemp = new Date(convert("08-01-2021"))
 // console.log(typeof(dateTemp))
  console.log(dateTemp>(file.dayStart))
 
        //console.log(array[1]);
for(var i=0;i<array.length;i++){
  var line = array[i].split(';')
  if(attrNumber==-1){
      for (var j=0;j<line.length;j++){
        if(line[j].search(attribute)!=-1){
        attrNumber=j; 
      }
      }
  }
  else{
    if ( isNaN(line[attrNumber])  || ((new Date(convert(line[0])))<(file.dayStart) ||
    (new Date(convert(line[0])))>(file.dayEnd))) {
    continue;
    }   
    if (parseFloat(line[attrNumber]) > max) {
      max = parseFloat(line[attrNumber]);
      day=line[0];
      time=line[1];
        // showResults=true;
  }
}

  }  
    });
    console.log("Max is : "+max+" Day and time "+ day+" "+time)
    }
}
module.exports = getAnswer