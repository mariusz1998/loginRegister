function getAnswer(app,checkAuthenticated,sessionNeo,auth,formidable,fs,google) 
{ 
 var startTime, endTime
  var answer
  var attribute
  var attributeWithoutUnit
  var functionOption
  max=-9999.9; 
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
            result.records.forEach(function(record){  //generate array of attribute and places
                for(var i=0;i<record.get('attr').length;i++)
                attrArry.push( record.get('attr')[i])
                localizationArray.push(record.get('place'))
              });
              let attributeArray = [...new Set(attrArry)] 
              let placesArray = [...new Set( localizationArray)] 
             res.render('makeQuestion/createQuestionPanel.ejs',{attr:attributeArray,localizations:placesArray})
            }
            else
            res.render('makeQuestion/noFilesToQuestion.ejs')
      })
    })
    app.get('/create/question',checkAuthenticated,(req, res)=>{ 
      goToPage=false;
      var hrTime = process.hrtime()
      startTime=(hrTime[0]* 1000000000 +hrTime[1]) / 1000000;
      max=-9999.9; //reset variables
      min=9999.9;
      avg=0;
      counter=0;
        var obj = JSON.parse(req.query.JSONFrom);
        var lastDay=(obj["lastDay"])
        var firstDay=obj["firstDay"]
        var localization = obj["localization"]
        attribute = obj["attribute"]
        functionOption =  obj["function"]
        var dateFileStart;
        var dateFileStartCopy;
        var dateFileEnd;
       var fileNumber=0;
        var filesArray = []
        var  dateRangeFile= []
       var  dateRangeCheck = []
       var dateRangeStart = new Date(firstDay);
       var dateRangeStartCopy= new Date(firstDay);
       var dateRangeEnd = new Date(lastDay);
       while(dateRangeEnd>=dateRangeStart){ //genrate array days to calculations
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
         if(result.records.length!=0){
            result.records.forEach(function(record){
              dateFileStart = new Date(record.get('b').properties.firstDay);
              dateFileStartCopy= new Date(record.get('b').properties.firstDay);
             dateFileEnd = new Date(record.get('b').properties.lastDay);
              while(dateFileEnd>=dateFileStart ){ //generate array days of file
                dateRangeFile.push(new Date(dateFileStart))
                dateFileStart.setDate(dateFileStart.getDate() + 1)
           }
           var dateRageFileSizeBeforeDelete = dateRangeCheck.length
           for (var i=0; i< dateRangeFile.length;i++)
           for(var j=0;j<dateRangeCheck.length;j++) {
               if(dateRangeCheck[j].getTime()===dateRangeFile[i].getTime()){ //if days is same delete day
                dateRangeCheck.splice(j, 1);
             }
            } 
           dateRangeFile=[]
            if(dateRageFileSizeBeforeDelete>dateRangeCheck.length){
              var extensionFile = (record.get('b').properties.name .split(".")[1])
              if(extensionFile!="csv"&& extensionFile!="txt" &&
             extensionFile=="json" && extensionFile!="xml")
             res.render('makeQuestion/noFilesToQuestion.ejs')
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
              if(dateRangeCheck.length==0){
               response=res;
                downloadFiles(filesArray)
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
     var counterFiles=0
      filesArray.forEach(function(file){
            fs.promises.mkdir(desktopDir, { recursive: true })
            const dest = fs.createWriteStream(desktopDir+"/"+file.name);
          // Authenticating drive API
          const drive = google.drive({ version: 'v3', auth });
          drive.files.get({fileId: file.googleId, alt: 'media'}, {responseType: 'stream'},
          function(err, responseDrive){
            responseDrive.data
              .on('end', () => {
                  counterFiles++;
                  if(filesArray.length==counterFiles)
                  generateAnswer(filesArray)
              })
              .on('error', err => {
                 response.render('makeQuestion/errorDownloadFile.ejs',{file:file.name})
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
      catch(err){
        response.render('makeQuestion/errorQuestion.ejs',{file:file.name})
      }
    for(var i=0;i<array.length;i++){
      var line = array[i].split(';')
      if(attrNumber==-1){
          for (var j=0;j<line.length;j++){
            if(line[j].search(attributeWithoutUnit)!=-1){ //read attribute column position
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
  var reader =  fs.readFileSync(desktopDir+"/"+file.name)
  if(!(reader.slice(reader.length - 1)=='}' || reader.slice(reader.length - 1)==']'))
  response.render('makeQuestion/errorQuestion.ejs',{file:file.name}) //json have bad end of file
    var obj = JSON.parse(reader);
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
   xmlReader = require('read-xml');
   let xmlParser = require('xml2json');
xmlReader.readXML(fs.readFileSync(desktopDir+"\\"+file.name), function(err, data) {
 if (err) {
  response.render('makeQuestion/errorQuestion.ejs',{file:file.name})
 }
var obj = xmlParser.toJson( data.content)
var objJson = JSON.parse(obj);

attributeWithoutUnit = attributeWithoutUnit.replace(/ /g, '') //replace spaces to ''
for(var i=0;i<objJson["document"]["Dane"].length;i++){
  if ( isNaN(objJson["document"]["Dane"][i]["Pogoda"][attributeWithoutUnit]) || 
  new Date(convertDate(objJson["document"]["Dane"][i]["Pogoda"]["Data"]))<file.dayStart ||
  new Date(convertDate(objJson["document"]["Dane"][i]["Pogoda"]["Data"]))>file.dayEnd) {
  continue;
  }   
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
var attrSplit=attribute.split(' ')
if(attrSplit.length>1)
attributeWithoutUnit=attribute.substring(0,attribute.lastIndexOf(" ") ); //cut unit
else
attributeWithoutUnit=attribute
      filesArray.forEach(function(file){

        var extensionFile = (file.name.split(".")[1])
        if(extensionFile=="csv"||extensionFile=="txt")
        readCSV(file)
        else if(extensionFile=="json")
        readJSON(file)
        else if(extensionFile=="xml")
        readXML(file)

  var hrTime = process.hrtime()
  endTime= (hrTime[0]* 1000000000 +hrTime[1]) / 1000000;
    });
    if(showResults==true)
    switch (functionOption){
      case "MAX":
     answer="Max "+ attrSplit[attrSplit.length-1] + " is : "+max+" " + " Day and time "+ day+" "+time
      break;
      case "MIN":
        answer="Min "+ attrSplit[attrSplit.length-1] + " is : "+min+" " + " Day and time "+ day+" "+time
          break;
          case "AVERAGE":    
    answer = "Average "+attrSplit[attrSplit.length-1] +" is : "+(avg/counter).toFixed(2)+" " 
              break;
    }
    else
   answer = "The result was not generated"

  var rimraf = require("rimraf");
      rimraf(desktopDir);
      if(showResults==true)
     response.render('makeQuestion/showAnswer.ejs',{answer:answer,time:endTime-startTime})
     else
     response.render('makeQuestion/errorReadFile.ejs')
    
  }
}
module.exports = getAnswer