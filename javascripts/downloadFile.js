function downloadFile(app,checkAuthenticated,sessionNeo,auth,fs,google) {
   app.get('/download/file',checkAuthenticated, (req, res) => { //download file to folder in desktop 
    var obj = JSON.parse(req.query.JSONFrom);
    var myFiles = JSON.parse(req.query.myFiles);
    sessionNeo          
    .run('MATCH (n:File) Where id(n)=$idParam RETURN n.googleID as googleId',
    {idParam: obj[0]["id"] }) 
              .then(result => {
            var googleID=  result.records[0].get('googleId')   
            const homeDir = require('os').homedir();
            const desktopDir = homeDir+`\\Desktop`+"\\DataLakeFiles";
            fs.promises.mkdir(desktopDir, { recursive: true })
            const dest = fs.createWriteStream(desktopDir+"/"+obj[0]["nameFile"]);
            dest.on('error', function(err) {
              if(myFiles==true)
              res.render('userFiles/downloadFileError.ejs'); 
              else
              res.render('userAccessFiles/downloadFileError.ejs'); 
          });
          const drive = google.drive({ version: 'v3', auth });
          drive.files.get({fileId: googleID, alt: 'media'}, {responseType: 'stream'},
          function(err, response){
            response.data
              .on('end', () => {
             
                  if(myFiles==true)
                  res.render('userFiles/downloadFileSucces.ejs',{path:desktopDir}); 
                  else
                  res.render('userAccessFiles/downloadFileSucces.ejs',{path:desktopDir}); 
              })
              .on('error', err => {
                if(myFiles==true)
                res.render('userFiles/downloadFileError.ejs'); 
                else
                res.render('userAccessFiles/downloadFileError.ejs'); 
              })
              .pipe(dest);
          }
      );
         })
             })    
}
module.exports = downloadFile
