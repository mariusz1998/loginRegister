function addFunction(toAdd)
{
    var iframe = document.getElementById("Avaible"+toAdd);  
    var select = iframe.contentWindow.document.getElementById("choosed"+toAdd);   
    var options = select.getElementsByTagName('option');   

    var iframe2 = document.getElementById("Choosed"+toAdd);  
    var select2 = iframe2.contentWindow.document.getElementById("choosed"+toAdd);  
    var option = document.createElement("option");
    option.text = options[select.selectedIndex].text;
    
    select2.add(option);

    select.remove(select.selectedIndex);
    countingFunction(toAdd);
}