function submit(){
    var startDay = document.getElementById("startDay").value
    var endDay = document.getElementById("endDay").value
    if(startDay>endDay){
       alert("Bad date!")
       return;
    }
 var localization =  document.getElementById("localization").value
    var JSONToSend = "{\"dateToEdit\": [{";
      JSONToSend = JSONToSend  + "\"startDay\":\"" +  startDay + "\", "
      JSONToSend = JSONToSend  + "\"endDay\":\"" +  endDay + "\"}],"
      JSONToSend = JSONToSend + "\"localization\":\""+localization+"\"}"
   location='/edit/file/properties?JSONFrom='+JSONToSend
 }