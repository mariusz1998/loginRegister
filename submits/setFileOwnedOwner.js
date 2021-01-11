function submit()
{
  var iframe = document.getElementById("AvaibleUsers");   //dobieram sie do iframe
  var select = iframe.contentWindow.document.getElementById("choosedUser");

 if( select.selectedIndex ==-1)
 { alert("Select one user!")
    return;
 }
  var option = select.options[select.selectedIndex].text;    //pobieram opcje z listy
var JSONToSend ="{";

  var optionsToAdd = option.split(' ') 
    JSONToSend = JSONToSend + "\"email\":\"" + optionsToAdd[0] + "\"}"
  //  JSONToSend = JSONToSend  + "\"email\":\"" + optionsToAdd[1] + "\", "
  //  JSONToSend = JSONToSend  + "\"lastName\":\"" + optionsToAdd[3] + "\", "  
   // JSONToSend = JSONToSend  + "\"firstName\":\"" + optionsToAdd[2] + "\"}]}"
//JSONArrayOfUsersToAdd = JSONArrayOfUsersToAdd.substring(0, JSONArrayOfUsersToAdd.length - 1); //usunięcie przecinka
 //console.log(JSONToSend)
  location='/set/file/owned/owner?JSONFrom='+JSONToSend

}