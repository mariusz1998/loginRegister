function getAnswer(app,checkAuthenticated,sessionNeo,auth,formidable,fs,google) 
{ 
  //var Timer = require('time-counter')
 // var countUpTimer = new Timer();
 var startTime, endTime
  var response
  var answer
  var attribute
  var attributeWithoutUnit
  var functionOption
  max=-9999.9; //reset variables
  min=9999.9;
  avg=0;
  counter=0;
  var day;
  var time;
  var showResults =  false;
  const homeDir = require('os').homedir();
  const desktopDir = homeDir+`\\Desktop`+"\\DataLakeFiles";
  app.get('/get/question',checkAuthenticated,(req, res)=>{ 
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
      //countUpTimer.start();
      var hrTime = process.hrtime()
      startTime=(hrTime[0]* 1000000000 +hrTime[1]) / 1000000;
      max=-9999.9; //reset variables
      min=9999.9;
      avg=0;
      counter=0;
        var obj = JSON.parse(req.query.JSONFrom);
       // console.log(obj["attribute"])
        //console.log(obj["localization"])
        console.log(obj["firstDay"])
        console.log(obj["lastDay"])
        var lastDay=(obj["lastDay"])
        var firstDay=obj["firstDay"]
        var localization = obj["localization"]
        attribute = obj["attribute"]
        functionOption =  obj["function"]
        var dateFileStart;
        var dateFileStartCopy;
        var dateFileEnd;
       // var  editfile = new Object(); //?
       var fileNumber=0;
        var filesArray = []
        var  dateRangeFile= []
       var  dateRangeCheck = []
       var dateRangeStart = new Date(firstDay);
       var dateRangeStartCopy= new Date(firstDay);
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

              if(dateFileStartCopy<dateRangeStartCopy)
              dateFileStartCopy=dateRangeStartCopy
              if(dateFileEnd>dateRangeEnd)
              dateFileEnd=dateRangeEnd
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
               response=res;
              // try{
                downloadFiles(filesArray)
            //   }
            //   finally{
             //   res.render('makeQuestion/errorQuestion.ejs')
            //   }
           }
              else
              res.render('makeQuestion/noDatesToQuestion.ejs',{dates:dateRangeCheck})
            }
            else
            res.render('makeQuestion/noFilesToQuestion.ejs')
      })
    })
    function downloadFiles(filesArray)
    {
      console.log("Download files ")
        //pobiermay pliki które bd czytane do folderu 
        console.log(filesArray.length)
     var counterFiles=0
      filesArray.forEach(function(file){
        console.log("Download file ")
            fs.promises.mkdir(desktopDir, { recursive: true })
            console.log("Download file part2")
            const dest = fs.createWriteStream(desktopDir+"/"+file.name);
            console.log("Download file part3")
          // Authenticating drive API
          const drive = google.drive({ version: 'v3', auth });
          console.log("Download file part4")
          drive.files.get({fileId: file.googleId, alt: 'media'}, {responseType: 'stream'},
          function(err, responseDrive){
            console.log("Download file part5")
            responseDrive.data
              .on('end', () => {
                  console.log('Done');
                  counterFiles++;
                  if(filesArray.length==counterFiles)
                  generateAnswer(filesArray)
              })
              .on('error', err => {
                  console.log('Error rr ', err);
               //   response.render('makeQuestion/errorDownloadFile.ejs',{file:file.name})
              })
              .pipe(dest);
          }
      );
    });
    }
    function convertDate(date){
      var datearray = date.split("-");
      var newdate = datearray[2] + '-' + datearray[1] + '-' + datearray[0];
      return newdate;
    }
    function readCSV(file)
    {
      var attrNumber=-1;
      try{
        var array = fs.readFileSync(desktopDir+"/"+file.name,'ascii').toString().split("\n");
      }
      catch(err)
      {
        console.log("Nie ma takeigo pliku")
      }
    //  console.log(file.dayStart)
     /// var dateTemp = new Date(convert("08-01-2021"))
     // console.log(typeof(dateTemp))
    //  console.log(dateTemp>(file.dayStart))
            //console.log(array[1]);
    for(var i=0;i<array.length;i++){
      var line = array[i].split(';')
      if(attrNumber==-1){
          for (var j=0;j<line.length;j++){
            if(line[j].search(attributeWithoutUnit)!=-1){
            attrNumber=j; 
          }
          }
      }
      else{
        if ( isNaN(line[attrNumber])  || ((new Date(convertDate(line[0])))<(file.dayStart) ||
        (new Date(convertDate(line[0])))>(file.dayEnd))) {
        continue;
        }   
        switch (functionOption){
          case "MAX":
        if (parseFloat(line[attrNumber]) > max) {
          max = parseFloat(line[attrNumber]);
          day=line[0];
          time=line[1];
           showResults=true;
        }
          break;
          case "MIN":
            if (parseFloat(line[attrNumber]) <min) {
              min = parseFloat(line[attrNumber]);
              day=line[0];
              time=line[1];
                 showResults=true;
            }
              break;
              case "AVERAGE":
              avg+=  parseFloat(line[attrNumber]);
              counter++;
                   showResults=true;
                  break;
    }
      }  
    }
  }
    function readJSON(file)
  {
   //   var array = fs.readFileSync(desktopDir+"/"+file.name,'ascii').toString().split("\n");
  var reader =  fs.readFileSync(desktopDir+"/"+file.name)
  console.log("Ostatni znak : " +reader.slice(reader.length - 1));
  if(!(reader.slice(reader.length - 1)=='}' || reader.slice(reader.length - 1)==']'))
      return;
  console.log(!(reader.slice(reader.length - 1)=='}' || reader.slice(reader.length - 1)==']'))
    var obj = JSON.parse(reader);
// console.log(obj.length)
   //console.log(obj[0]["Data"])
  // console.log(obj[0][attribute])
    console.log(obj[0].length)


  for(var i=0;i<obj.length;i++){
      if ( isNaN(obj[i][attribute])  || (new Date(convertDate(obj[i]["Data"])))<(file.dayStart) ||
      (new Date(convertDate(obj[i]["Data"])))>(file.dayEnd)) {
      continue;
      }   
      switch (functionOption){
        case "MAX":
      if (parseFloat(obj[i][attribute]) > max) {
        max = parseFloat(obj[i][attribute]);
        day=obj[i]["Data"];
        time=obj[i]["Czas"];
         showResults=true;
      }
        break;
        case "MIN":
          if (parseFloat(obj[i][attribute]) <min) {
            min = parseFloat(obj[i][attribute]);
            day=obj[i]["Data"];
            time=obj[i]["Czas"];
               showResults=true;
          }
            break;
            case "AVERAGE":
            avg+=  parseFloat(obj[i][attribute]);
            counter++;
            showResults=true;
                break;
  }
  
    }  

}
    function readXML(file)
{
  console.log("czyt xml")
  // var array = fs.readFileSync(desktopDir+"/"+file.name,'ascii').toString().split("\n");
   //var fs = require('fs'),
  // path = require('path'),
   xmlReader = require('read-xml');
   let xmlParser = require('xml2json');
//var FILE = path.join(__dirname, 'test/xml/simple-iso-8859-1.xml');

// pass a buffer or a path to a xml file
xmlReader.readXML(fs.readFileSync(desktopDir+"/"+file.name), function(err, data) {
 if (err) {
   console.error("Bład xml " +err);
 }
var obj = xmlParser.toJson( data.content)
var objJson = JSON.parse(obj);
//console.log(typeof(objJson))
//console.log('JSON output',objJson["document"]["Dane"][0]["Pogoda"]["Czas"])
//var nodeList = data.content.getElementsByTagName("Pogoda");  
//console.log(objJson["document"]["Dane"].length)
//console.log(attrSplit[attrSplit.length-1]) //jednostka
//var nazwa="asd asd a"
//console.log(nazwa.replace(/ /g, '')) //wszytkie spacje usuwamy

attributeWithoutUnit = attributeWithoutUnit.replace(/ /g, '')
console.log(attributeWithoutUnit )
for(var i=0;i<objJson["document"]["Dane"].length;i++){
  if ( isNaN(objJson["document"]["Dane"][i]["Pogoda"][attributeWithoutUnit]) || 
  new Date(convertDate(objJson["document"]["Dane"][i]["Pogoda"]["Data"]))<file.dayStart ||
  new Date(convertDate(objJson["document"]["Dane"][i]["Pogoda"]["Data"]))>file.dayEnd) {
  continue;
  }   
  console.log(objJson["document"]["Dane"][i]["Pogoda"][attributeWithoutUnit])
  switch (functionOption){
    case "MAX":
  if (parseFloat(objJson["document"]["Dane"][i]["Pogoda"][attributeWithoutUnit]) > max) {
    max = parseFloat(objJson["document"]["Dane"][i]["Pogoda"][attributeWithoutUnit]);
    day=objJson["document"]["Dane"][i]["Pogoda"]["Data"];
    time=objJson["document"]["Dane"][i]["Pogoda"]["Czas"];
     showResults=true;
  }
    break;
    case "MIN":
      if (parseFloat(objJson["document"]["Dane"][i]["Pogoda"][attributeWithoutUnit]) <min) {
        min = parseFloat(objJson["document"]["Dane"][i]["Pogoda"][attributeWithoutUnit]);
        day=objJson["document"]["Dane"][i]["Pogoda"]["Data"];
        time=objJson["document"]["Dane"][i]["Pogoda"]["Czas"];
           showResults=true;
      }
        break;
        case "AVERAGE":
        avg+=  parseFloat(objJson["document"]["Dane"][i]["Pogoda"][attributeWithoutUnit]);
        counter++;
        showResults=true;
            break;
}
}  
});
}
    function generateAnswer(filesArray)
    {   
 //     console.log(attribute)
var attrSplit=attribute.split(' ')
//console.log(attrSplit[attrSplit.length-1]) //jednostka
//console.log(attrSplit.length)
if(attrSplit.length>1)
attributeWithoutUnit=attribute.substring(0,attribute.lastIndexOf(" ") ); //przycinam jednostkę 
else
attributeWithoutUnit=attribute
//console.log(attributeWithoutUnit)
 //console.log(attribute)
      //  console.log(filesArray)
      filesArray.forEach(function(file){
        console.log("zaczynam")
    
        var extensionFile = (file.name.split(".")[1])
        if(extensionFile=="csv"||extensionFile=="txt")
        readCSV(file)
        else if(extensionFile=="json")
        readJSON(file)
        else if(extensionFile=="xml")
        readXML(file)
      //  fs.promises.mkdir(desktopDir, { recursive: true }
     // var reader = new BufferedReader(new FileReader(desktopDir+"/"+file.name));
  //   var readline = require('readline');

  //countUpTimer.stop();
  var hrTime = process.hrtime()
 
  endTime= (hrTime[0]* 1000000000 +hrTime[1]) / 1000000;
    });
    if(showResults==true)
    switch (functionOption){
      case "MAX":
     answer="Max is : "+max+" " + attrSplit[attrSplit.length-1] +" Day and time "+ day+" "+time
      break;
      case "MIN":
      
   answer = "Min is : "+min+" " + attrSplit[attrSplit.length-1] +" Day and time "+ day+" "+time
          break;
          case "AVERAGE":    
    answer = "Average is : "+(avg/counter).toFixed(2)+" " + attrSplit[attrSplit.length-1]
              break;
    }
    else
   answer = "Nie wygenerowano wyniku"
    console.log(answer+" "+(endTime-startTime))

  var rimraf = require("rimraf");
      rimraf(desktopDir, function () { console.log("done"); });
     //location='/show/answer?answer='+answer+'&time=20'
     console.log("Sending")
     if(showResults==true)
     response.render('makeQuestion/showAnswer.ejs',{answer:answer,time:endTime-startTime})
     else
     response.render('makeQuestion/errorReadFile.ejs')
    }
}
module.exports = getAnswer