function deleteFunction(toDelete)
{
    var iframe = document.getElementById("Choosed"+toDelete);   
    var select = iframe.contentWindow.document.getElementById("choosed"+toDelete);   
    var options = select.getElementsByTagName('option');  

    var iframe2 = document.getElementById("Avaible"+toDelete);  
    var select2 = iframe2.contentWindow.document.getElementById("choosed"+toDelete);   
    var option = document.createElement("option");
    option.text = options[select.selectedIndex].text;
    
    select2.add(option);

    select.remove(select.selectedIndex);
    countingFunction(toDelete);
}