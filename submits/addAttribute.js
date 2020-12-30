function addNewAttr(toAdd)
{
    var iframe = document.getElementById("Choosed"+toAdd);   //dobieram sie do iframe
    var select = iframe.contentWindow.document.getElementById("choosed"+toAdd);  
    var options = select.getElementsByTagName('option'); 
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
    select.add(option);

    myCountingFunction(toAdd);
}