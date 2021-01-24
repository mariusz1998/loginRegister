function submit()
{
  var iframe = document.getElementById("ChoosedUsers");  
  var select = iframe.contentWindow.document.getElementById("choosedUsers");
  var options = select.getElementsByTagName('option');  
if(options.length==0){
  alert("Bad numbers of users")
  return;
}
var JSONToSend ="{\"usersToAdd\": [";
var JSONArrayOfUsersToAdd = "";
for (i = 0; i < options.length; i++){
  var optionsToAdd = options[i].text.split(' ') 
    JSONArrayOfUsersToAdd = JSONArrayOfUsersToAdd + "\"" + optionsToAdd[0] + "\", "
}
JSONArrayOfUsersToAdd = JSONArrayOfUsersToAdd.substring(0, JSONArrayOfUsersToAdd.length - 2); 
JSONToSend = JSONToSend + JSONArrayOfUsersToAdd +"]}"
  location='/delete/file/access/set?JSONFrom='+JSONToSend

}