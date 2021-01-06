function editDatesFile(app,checkAuthenticated,sessionNeo) {
    app.get('/edit/file/date',checkAuthenticated,(req, res)=>{ 
        var obj = JSON.parse(req.query.JSONFrom);
        var  editfile = new Object();
        editfile.name=obj[0]["nameFile"]
        editfile.id=obj[0]["id"]
        editfile.dateStart=obj[0]["dateStart"]
        editfile.dateEnd=obj[0]["dateEnd"]
        editfile.localization = obj[0]["localization"]
       req.session.editfile=editfile
        res.render('userFiles/editDateRangeFile.ejs',{id:obj[0]["id"],nameFile:obj[0]["nameFile"],dateStart:obj[0]["dateStart"],
                    dateEnd:obj[0]["dateEnd"],localization:obj[0]["localization"]})
    })
    app.get('/edit/file/properties',checkAuthenticated,(req, res)=>{ 
        console.log(req.query.JSONFrom)
        var obj = JSON.parse(req.query.JSONFrom);
     //   console.log(obj["dateToEdit"][0])
      //     console.log(obj["dateToEdit"][0]["startDay"])
      //     console.log(obj["dateToEdit"][0]["endDay"])
      //     console.log(obj["localization"])
      //      console.log(req.session.editfile.id)
           sessionNeo          
           .run('MATCH (u:User{email:$emailParam}) OPTIONAL MATCH (u)-[r:OWNER]-(b:File) Where id(b)<>$idFileParam AND b.localization=$localizationParam AND NOT (date(b.firstDay)>date($dateEndParam) OR date(b.lastDay)<date($dateStartParam)) RETURN b',
           {emailParam:req.user.email,idFileParam: parseInt(req.session.editfile.id),localizationParam:obj["localization"],dateStartParam:obj["dateToEdit"][0]["startDay"] ,dateEndParam:obj["dateToEdit"][0]["endDay"]}) 
                     .then(result => {
                        if(result.records[0].get('b')==null)
                         {
                sessionNeo
          .run('MATCH(n:File) where id(n)=$idParam SET n.localization=$localizationParam, n.firstDay=date($firstDayParam), n.lastDay=date($lastDayParam)',
          {idParam:req.session.editfile.id,localizationParam: obj["localization"],
            firstDayParam:obj["dateToEdit"][0]["startDay"], lastDayParam:obj["dateToEdit"][0]["endDay"]})
          .then(function(){
            res.render('userFiles/editFileSucces.ejs'); 
        })         
                         }
                         else
                            res.render('userFiles/editFileFailed.ejs', {localization:obj["localization"],
                            firstDay:obj["firstDay"],lastDay:obj["lastDay"]});
              })
       })
       app.get('/edit/file/property/error',checkAuthenticated,(req, res)=>{ 
            res.render('userFiles/editDateRangeFile.ejs',{id: req.session.editfile.id,nameFile: req.session.editfile.name,
               dateStart: req.session.editfile.dateStart, dateEnd:req.session.editfile.dateEnd,
               localization:req.session.editfile.localization})
        })
}
module.exports = editDatesFile