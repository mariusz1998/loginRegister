function editAttrFile(app,checkAuthenticated,sessionNeo) {
app.get('/edit/file/attr',checkAuthenticated,(req, res)=>{  
    var obj = JSON.parse(req.query.JSONFrom);
    var objAttr = JSON.parse(req.query.attrArray);
   var otherFiles = JSON.parse(req.query.otherFiles)
    var tempArray = []
    var choiceArray= req.query.choice
    for(var i=0;i<objAttr[choiceArray]["arrayAttrFile"].length;i++)
    tempArray.push(objAttr[choiceArray]["arrayAttrFile"][i])
    var  editfile = new Object();
    editfile.name=obj[0]["nameFile"]
    editfile.id=obj[0]["id"]
    editfile.attr=tempArray
    editfile.otherFiles= otherFiles
   req.session.editfile=editfile
    res.render('userFiles/editAttrFile.ejs',{id:obj[0]["id"],nameFile:obj[0]["nameFile"],attr: req.session.editfile.attr})
})
app.get('/attr/edit/choosed',checkAuthenticated,(req,res)=>{ //genrate attribute of edit file
    res.render('userFiles/editAttrChoosedFile.ejs',{attr: req.session.editfile.attr})
});
app.get('/attr/edit/avaible',checkAuthenticated,(req,res)=>{ //genrate all attribute of all user files
    var tempArray = []
    sessionNeo          
    .run('MATCH (u:User{email:$emailParam}) OPTIONAL MATCH (u)-[r:OWNER]-(b:File) Where id(b)<>$idFileParam  RETURN b.attribute as attr',
    {emailParam:req.user.email,idFileParam: parseInt(req.session.editfile.id) }) 
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
       .catch((error) => {
        res.redirect('/errorConnect');
      });
     setTimeout(async () =>{ 
         let attributeArrayTemp = [...new Set(tempArray)] 
         let attributeArray= attributeArrayTemp.filter(x => ! req.session.editfile.attr.includes(x)); 
         res.render('userFiles/editAttrAvailableFile.ejs',{attr: attributeArray})
 },2000)

});
app.get('/edit/file/attribute',checkAuthenticated, (req, res) => {
  var obj = JSON.parse(req.query.JSONFrom);
  var attrArray = obj["attrToEdit"]
        sessionNeo
        .run('MATCH (n:File) where id(n)=$idParam  SET n.attribute=$attrParam',
        { attrParam:attrArray,idParam: req.session.editfile.id })
        .then(function(){
          if(req.session.editfile.otherFiles==false)
          res.redirect('/show/your/files'); //to user files
          else
          res.redirect('/files/other'); //to other files
      })
      .catch((error) => {
        res.redirect('/errorConnect');
      });
});
}
module.exports = editAttrFile