function submit()
{
    if(document.getElementById("localization").value.length==0)
    {
        alert("Bad localization!")
        return;
    }
  var iframe = document.getElementById("ChoosedAttr");   //dobieram sie do iframe
  var select = iframe.contentWindow.document.getElementById("choosedAttr");
  var options = select.getElementsByTagName('option');    //pobieram opcje z listy
if(options.length==0){
  alert("Bad numbers of attribute")
  return;
}
var firstDay = document.getElementById("firstDay").value
var lastDay = document.getElementById("lastDay").value
if(firstDay=="" || lastDay =="")
{
  alert("You must select date!")
  return;
}
var JSONToSend ="{\"attrToAdd\": [";
var JSONArrayOfUsersToAdd = "";
for (i = 0; i < options.length; i++)
{
    JSONArrayOfUsersToAdd = JSONArrayOfUsersToAdd + "\"" + options[i].text + "\", "
}
JSONArrayOfUsersToAdd = JSONArrayOfUsersToAdd.substring(0, JSONArrayOfUsersToAdd.length - 2); //usunięcie przecinka

JSONToSend = JSONToSend + JSONArrayOfUsersToAdd +"]"
JSONToSend = JSONToSend +",\"localization\":\""+document.getElementById("localization").value+"\",";
JSONToSend = JSONToSend  + "\"firstDay\":\"" +  firstDay + "\", "
JSONToSend = JSONToSend  + "\"lastDay\":\"" +  lastDay + "\"}"
  console.log(JSONToSend)
  location='/add/file/attribute?JSONFrom='+JSONToSend

}