function colorOption(optionArray,toAdd)
{
    var iframe = document.getElementById("Choosed"+toAdd);  
    var select = iframe.contentWindow.document.getElementById("choosed"+toAdd);  
    var options = select.getElementsByTagName('option');   
    for(var i=0;i<options.length;i++)
    {
        optionArray.forEach(function(element){
            if(options[i].text==element)
        options[i].style.backgroundColor="yellowgreen"
        });  
    }
}