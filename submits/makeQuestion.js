function submit()
{
var firstDay = document.getElementById("firstDay").value
var lastDay = document.getElementById("lastDay").value
if(firstDay=="" || lastDay ==""){
  alert("You must select date!")
  return;
}
var JSONToSend ="{\"localization\":\""+document.getElementById("optionLocalization").value+"\","
JSONToSend = JSONToSend  + "\"attribute\":\"" +  document.getElementById("optionAttr").value + "\", "
JSONToSend = JSONToSend  + "\"function\":\"" +  document.getElementById("optionFunction").value + "\", "
JSONToSend = JSONToSend  + "\"firstDay\":\"" +  firstDay + "\", "
JSONToSend = JSONToSend  + "\"lastDay\":\"" +  lastDay + "\"}"
  location='/create/question?JSONFrom='+JSONToSend
}