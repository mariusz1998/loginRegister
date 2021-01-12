function addNewAttr(toAdd)
{
    var iframe = document.getElementById("Choosed"+toAdd);   //dobieram sie do iframe
    var select = iframe.contentWindow.document.getElementById("choosed"+toAdd);  
    var options = select.getElementsByTagName('option'); 

    var iframe2 = document.getElementById("Avaible"+toAdd);   //dobieram sie do iframe
    var select2 = iframe2.contentWindow.document.getElementById("choosed"+toAdd);   
    var options2 = select2.getElementsByTagName('option');    //pobieram opcje z listy

    var option = document.createElement("option");
    option.text =  document.getElementById("newAttribute").value;
    if(option.text.length<1)
    return;
   
    for (i = 0; i < options.length; i++)  {
     if( options[i].text ==option.text){
           alert('Attribute exists!')
           return
        }
    }
    for (i = 0; i < options2.length; i++)  {
        if( options2[i].text ==option.text){ //upper
              alert('Attribute exists!')
              return
           }
       }
    select.add(option);

    myCountingFunction(toAdd);
}