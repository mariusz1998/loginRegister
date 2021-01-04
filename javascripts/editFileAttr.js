function editAttrFile(app,checkAuthenticated,sessionNeo) {
app.get('/edit/file/attr',checkAuthenticated,(req, res)=>{ //id przekazać 
    var obj = JSON.parse(req.query.JSONFrom);
    var objAttr = JSON.parse(req.query.attrArray);
    var tempArray = []
    var choiceArray= req.query.choice
    for(var i=0;i<objAttr[choiceArray]["arrayAttrFile"].length;i++)
    tempArray.push(objAttr[choiceArray]["arrayAttrFile"][i])
    //console.log(obj[0]["id"])
  //  console.log(obj[0]["nameFile"])
    var  editfile = new Object();
    editfile.name=obj[0]["nameFile"]
    editfile.id=obj[0]["id"]
    editfile.attr=tempArray
   req.session.editfile=editfile
    res.render('userFiles/editAttrFile.ejs',{id:obj[0]["id"],nameFile:obj[0]["nameFile"],attr: req.session.editfile.attr})
})
app.get('/attr/edit/choosed',checkAuthenticated,(req,res)=>{
    res.render('userFiles/editAttrChoosedFile.ejs',{attr: req.session.editfile.attr})
});
app.get('/attr/edit/availble',checkAuthenticated,(req,res)=>{
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
     setTimeout(async () =>{ 
       
         let attributteArrayTemp = [...new Set(tempArray)] //usuwamy powtarzające się atrybuty
         let attributteArray= attributteArrayTemp.filter(x => ! req.session.editfile.attr.includes(x)); //odejmujemy tablice
         res.render('userFiles/editAttrAvailableFile.ejs',{attr: attributteArray})
 },2000)

});
app.get('/edit/file/attribute',checkAuthenticated, (req, res) => {
  var obj = JSON.parse(req.query.JSONFrom);
  var attrArray = obj["attrToEdit"]
        sessionNeo
        .run('MATCH (n:File) where id(n)=$idParam  SET n.attribute=$attrParam',
        { attrParam:attrArray,idParam: req.session.editfile.id })
        .then(function(){
          res.redirect('/show/your/files'); //do przeglądu własnych plików?
      })
      
    
});
}
module.exports = editAttrFile