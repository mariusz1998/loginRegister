function submit()
{
  var iframe = document.getElementById("ChoosedAttr");   //dobieram sie do iframe
  var select = iframe.contentWindow.document.getElementById("choosedAttr");
  var options = select.getElementsByTagName('option');    //pobieram opcje z listy
if(options.length==0){
  alert("Bad numbers of attribute")
  return;
}
var JSONToSend ="{\"attrToEdit\": [";
var JSONArrayOfUsersToAdd = "";
for (i = 0; i < options.length; i++)
{
    JSONArrayOfUsersToAdd = JSONArrayOfUsersToAdd + "\"" + options[i].text + "\", "
}
JSONArrayOfUsersToAdd = JSONArrayOfUsersToAdd.substring(0, JSONArrayOfUsersToAdd.length - 2); //usunięcie przecinka

JSONToSend = JSONToSend + JSONArrayOfUsersToAdd +"]}"
 // console.log(JSONToSend)
  location='/edit/file/attribute?JSONFrom='+JSONToSend
}