function deleteFunction(toDelete,optionArray)
{
    var iframe = document.getElementById("Choosed"+toDelete);  
    var select = iframe.contentWindow.document.getElementById("choosed"+toDelete);   
    var options = select.getElementsByTagName('option');  

    var iframe2 = document.getElementById("Avaible"+toDelete);  
    var select2 = iframe2.contentWindow.document.getElementById("choosed"+toDelete);  
    var option = document.createElement("option");
    option.text = options[select.selectedIndex].text;
    
    optionArray.forEach(function(element){
        if( option.text==element)
     option.style.backgroundColor="yellowgreen" //color option
    });  
    select2.add(option);

    select.remove(select.selectedIndex);
    countingFunction(toDelete);
}