function colorOption(optionArray,toAdd)
{
    var iframe = document.getElementById("Choosed"+toAdd);   //dobieram sie do iframe
    var select = iframe.contentWindow.document.getElementById("choosed"+toAdd);  
    //console.log(iframe.contentWindow.document) 
    var options = select.getElementsByTagName('option');    //pobieram opcje z listy
    for(var i=0;i<options.length;i++)
    {
        optionArray.forEach(function(element){
            if(options[i].text==element)
        options[i].style.backgroundColor="yellowgreen"
        });  
    }
}