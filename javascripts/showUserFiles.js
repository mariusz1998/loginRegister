function showUserFiles(app,checkAuthenticated,sessionNeo) {
    app.post('/add/file',checkAuthenticated,(req, res)=>{
        res.render('addFile/selectFilePanel.ejs')
    })
   
}
module.exports = showUserFiles
