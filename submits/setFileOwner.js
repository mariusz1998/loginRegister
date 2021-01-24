function submit()
{
  var iframe = document.getElementById("AvaibleUsers");   
  var select = iframe.contentWindow.document.getElementById("choosedUser");

 if( select.selectedIndex ==-1){ 
  alert("Select one user!")
  return;
 }
  var option = select.options[select.selectedIndex].text;   
  var JSONToSend ="{";
  var optionsToAdd = option.split(' ') 
  JSONToSend = JSONToSend + "\"email\":\"" + optionsToAdd[0] + "\"}"
  location='/set/file/owner?JSONFrom='+JSONToSend
}