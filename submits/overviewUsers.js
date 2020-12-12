function submit()
{
    //admin 
  var iframe = document.getElementById("ChoosedUsers");   //dobieram sie do iframe
  var select = iframe.contentWindow.document.getElementById("choosedUsers");
  var options = select.getElementsByTagName('option');    //pobieram opcje z listy
if(options.length==0){
  alert("Bad numbers of users")
  return;
}
var JSONToSend ="{\"usersToAdd\": [";
var JSONArrayOfUsersToAdd = "";
for (i = 0; i < options.length; i++)
{
    JSONArrayOfUsersToAdd +="{"
  var optionsToAdd = options[i].text.split(' ') 
    JSONArrayOfUsersToAdd = JSONArrayOfUsersToAdd + "\"id\":\"" + optionsToAdd[0].substring(0, optionsToAdd[0].length - 1) + "\","
    JSONArrayOfUsersToAdd = JSONArrayOfUsersToAdd + "\"email\":\"" + optionsToAdd[1] + "\", "
    JSONArrayOfUsersToAdd = JSONArrayOfUsersToAdd + "\"lastName\":\"" + optionsToAdd[3] + "\", "
    JSONArrayOfUsersToAdd = JSONArrayOfUsersToAdd + "\"firstName\":\"" + optionsToAdd[2] + "\"},"
}
JSONArrayOfUsersToAdd = JSONArrayOfUsersToAdd.substring(0, JSONArrayOfUsersToAdd.length - 1); //usunięcie przecinka
JSONToSend = JSONToSend + JSONArrayOfUsersToAdd +"]}";
 console.log(JSONToSend)
  location='/users/setAdmin?JSONFrom='+JSONToSend

}