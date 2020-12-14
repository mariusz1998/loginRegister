function submit(){
   var startDay = document.getElementById("startDay").value
   var endDay = document.getElementById("endDay").value
   var email = document.getElementById("email").value

   var JSONToSend = "{\"dateToSet\": [{";
 // w req.session.select user mam req.session.selectUser
    // JSONToSend = JSONToSend  + "\"email\":\"" + email + "\", "
     JSONToSend = JSONToSend  + "\"startDay\":\"" +  startDay + "\", "
     JSONToSend = JSONToSend  + "\"endDay\":\"" +  endDay + "\"}]}"
 //JSONArrayOfUsersToAdd = JSONArrayOfUsersToAdd.substring(0, JSONArrayOfUsersToAdd.length - 1); //usunięcie przecinka
  console.log(JSONToSend)
  location='/user/setAdmin/date?JSONFrom='+JSONToSend
}