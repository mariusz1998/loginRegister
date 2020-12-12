function submit()
{
  var iframe = document.getElementById("AvaibleUsers");   //dobieram sie do iframe
  var select = iframe.contentWindow.document.getElementById("choosedUser");

 if( select.selectedIndex ==-1)
  alert("Select one user!")

  var option = select.options[select.selectedIndex].text;    //pobieram opcje z listy
var JSONToSend ="{\"userToAdd\": [{";

  var optionsToAdd = option.split(' ') 
    JSONToSend = JSONToSend + "\"id\":\"" + optionsToAdd[0].substring(0, optionsToAdd[0].length - 1) + "\","
    JSONToSend = JSONToSend  + "\"email\":\"" + optionsToAdd[1] + "\", "
    JSONToSend = JSONToSend  + "\"lastName\":\"" + optionsToAdd[3] + "\", "
    JSONToSend = JSONToSend  + "\"firstName\":\"" + optionsToAdd[2] + "\"}]}"
//JSONArrayOfUsersToAdd = JSONArrayOfUsersToAdd.substring(0, JSONArrayOfUsersToAdd.length - 1); //usunięcie przecinka
 console.log(JSONToSend)
  location='/user/showStatistics?JSONFrom='+JSONToSend

}