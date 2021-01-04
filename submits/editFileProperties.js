function submit(){
    var startDay = document.getElementById("startDay").value
    var endDay = document.getElementById("endDay").value
 var localization =  document.getElementById("localization").value
    var JSONToSend = "{\"dateToEdit\": [{";
  // w req.session.select user mam req.session.selectUser
     // JSONToSend = JSONToSend  + "\"email\":\"" + email + "\", "
      JSONToSend = JSONToSend  + "\"startDay\":\"" +  startDay + "\", "
      JSONToSend = JSONToSend  + "\"endDay\":\"" +  endDay + "\"}],"
      JSONToSend = JSONToSend + "\"localization\":\""+localization+"\"}"
  //JSONArrayOfUsersToAdd = JSONArrayOfUsersToAdd.substring(0, JSONArrayOfUsersToAdd.length - 1); //usunięcie przecinka
   console.log(JSONToSend)
   location='/edit/file/properties?JSONFrom='+JSONToSend
 }