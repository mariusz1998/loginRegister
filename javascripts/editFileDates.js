function editDatesFile(app,checkAuthenticated,sessionNeo) {
    app.get('/edit/file/date',checkAuthenticated,(req, res)=>{  // ganrate page to edit property of file
        var obj = JSON.parse(req.query.JSONFrom);
        var otherFiles = JSON.parse(req.query.otherFiles)
        var  editfile = new Object();
        editfile.name=obj[0]["nameFile"]
        editfile.id=obj[0]["id"]
        editfile.dateStart=obj[0]["dateStart"]
        editfile.dateEnd=obj[0]["dateEnd"]
        editfile.localization = obj[0]["localization"]
        editfile.otherFiles= otherFiles
       req.session.editfile=editfile
        res.render('userFiles/editDateRangeFile.ejs',{id:obj[0]["id"],nameFile:obj[0]["nameFile"],dateStart:obj[0]["dateStart"],
                    dateEnd:obj[0]["dateEnd"],localization:obj[0]["localization"]})
    })
    app.get('/edit/file/properties',checkAuthenticated,(req, res)=>{ 
        var obj = JSON.parse(req.query.JSONFrom);
        if(req.session.editfile.otherFiles==false){
           sessionNeo     
           .run('MATCH (u:User),(b:File{localization:$localizationParam}),(c:File) Where ((u)-[:OWNER|GETACCESS]->(b) and'+
           ' id(b)<>$idFileParam and NOT (date(b.firstDay)>date($dateEndParam) OR date(b.lastDay)<date($dateStartParam))'+
            ' and (u)-[:OWNER|GETACCESS]->(c) and id(c)=$idFileParam) RETURN b,u',
           {idFileParam: parseInt(req.session.editfile.id),localizationParam:obj["localization"],
           dateStartParam:obj["dateToEdit"][0]["startDay"] ,dateEndParam:obj["dateToEdit"][0]["endDay"]}) 
                     .then(result => {
                        if(result.records.length==0)
                         {
                sessionNeo
          .run('MATCH(n:File) where id(n)=$idParam SET n.localization=$localizationParam, n.firstDay=date($firstDayParam), n.lastDay=date($lastDayParam)',
          {idParam:req.session.editfile.id,localizationParam: obj["localization"],
            firstDayParam:obj["dateToEdit"][0]["startDay"], lastDayParam:obj["dateToEdit"][0]["endDay"]})
          .then(function(){
            res.render('userFiles/editFileSucces.ejs'); 
        })     
        .catch((error) => {
          res.redirect('/errorConnect');
        });    
                         }
                         else
                            res.render('userFiles/editFileFailed.ejs', {localization:obj["localization"],
                            firstDay:obj["dateToEdit"][0]["startDay"],lastDay:obj["dateToEdit"][0]["endDay"]});
              })
              .catch((error) => {
                res.redirect('/errorConnect');
              });
            }
            else
            {
              sessionNeo
              .run('MATCH(n:File) where id(n)=$idParam SET n.localization=$localizationParam, n.firstDay=date($firstDayParam), n.lastDay=date($lastDayParam)',
              {idParam:req.session.editfile.id,localizationParam: obj["localization"],
                firstDayParam:obj["dateToEdit"][0]["startDay"], lastDayParam:obj["dateToEdit"][0]["endDay"]})
              .then(function(){
                res.redirect('/files/other'); //to other files
            })  
            .catch((error) => {
              res.redirect('/errorConnect');
            });       

            }
       })
       app.get('/edit/file/property/error',checkAuthenticated,(req, res)=>{ 
            res.render('userFiles/editDateRangeFile.ejs',{id: req.session.editfile.id,nameFile: req.session.editfile.name,
               dateStart: req.session.editfile.dateStart, dateEnd:req.session.editfile.dateEnd,
               localization:req.session.editfile.localization})
        })
        
}
module.exports = editDatesFile