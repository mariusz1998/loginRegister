function submit(){
  var startDay = document.getElementById("startDay").value
  var endDay = document.getElementById("endDay").value
  if(startDay>endDay){
  alert("Bad dates!")
  return;
  }
  var JSONToSend = "{\"dateToSet\": [{";
  JSONToSend = JSONToSend  + "\"startDay\":\"" +  startDay + "\", "
  JSONToSend = JSONToSend  + "\"endDay\":\"" +  endDay + "\"}]}"
  location='/user/setAdmin/date?JSONFrom='+JSONToSend
}
function back(){
  location='/users/showStatistics/new'
}
