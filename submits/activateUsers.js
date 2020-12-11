function submit()
{
  var iframe = document.getElementById("ChoosedUsers");   //dobieram sie do iframe
  var select = iframe.contentWindow.document.getElementById("choosedUsers");
  var options = select.getElementsByTagName('option');    //pobieram opcje z listy
  console.log(options[0].text)
  console.log("jestem w submit");
  var data = "{\"usersToAdd\": [\"123\", \"aligator123@wp.pl\", \"asdasd@wp.pl\", \"bedres2@email.com\", \"123\"]}";
   location='/users/activates?JSONFrom='+data

}