function downloadFile(app,checkAuthenticated,sessionNeo,auth,formidable,fs,google) {
   app.get('/download/file',checkAuthenticated, (req, res) => {
    var obj = JSON.parse(req.query.JSONFrom);
    var myFiles = JSON.parse(req.query.myFiles);
    sessionNeo          
    .run('MATCH (n:File) Where id(n)=$idParam RETURN n.googleID as googleId',
    {idParam: obj[0]["id"] }) 
              .then(result => {
            var googleID=  result.records[0].get('googleId')   
           // console.log( googleID)
            const homeDir = require('os').homedir();
           // console.log(homeDir)
            const desktopDir = homeDir+`\\Desktop`+"\\DataLakeFiles";
          //  console.log(desktopDir);
            fs.promises.mkdir(desktopDir, { recursive: true })
            const dest = fs.createWriteStream(desktopDir+"/"+obj[0]["nameFile"]);
          // Authenticating drive API
          const drive = google.drive({ version: 'v3', auth });
          drive.files.get({fileId: googleID, alt: 'media'}, {responseType: 'stream'},
          function(err, response){
            response.data
              .on('end', () => {
                  console.log('Done');
                  if(myFiles==true)
                  res.render('userFiles/downloadFileSucces.ejs',{path:desktopDir}); 
                  else
                  res.render('userAccessFiles/downloadFileSucces.ejs',{path:desktopDir}); 
              })
              .on('error', err => {
                  console.log('Error', err);
              })
              .pipe(dest);
          }
      );
         })
             })
             
}
module.exports = downloadFile
