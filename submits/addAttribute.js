function addNewAttr(toAdd)
{
    var iframe = document.getElementById("Choosed"+toAdd);   //dobieram sie do iframe
    var select = iframe.contentWindow.document.getElementById("choosed"+toAdd);  
   
    var option = document.createElement("option");
    option.text =  document.getElementById("newAttribute").value;
    if(option.text.length<1)
    return;
    select.add(option);

    myCountingFunction(toAdd);
}