function submit(){
  var startDay = document.getElementById("startDay").value
  var endDay = document.getElementById("endDay").value
  var JSONToSend = "{\"dateToSet\": [{";
  JSONToSend = JSONToSend  + "\"startDay\":\"" +  startDay + "\", "
  JSONToSend = JSONToSend  + "\"endDay\":\"" +  endDay + "\"}]}"
  location='/user/setAdmin/date?JSONFrom='+JSONToSend
}