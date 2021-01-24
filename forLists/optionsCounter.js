function countingFunction(toCount) {
    
    var iframe = document.getElementById("Avaible"+toCount);  
    if(iframe!=null)
    {
        var select = iframe.contentWindow.document.getElementById("choosed"+toCount);   
        var options = select.getElementsByTagName('option');  
        iframe.contentWindow.document.getElementById("amount").value = options.length;
    }
    
    var iframe2 = document.getElementById("Choosed"+toCount);   
    if(iframe2!=null)
    {
        var select2 = iframe2.contentWindow.document.getElementById("choosed"+toCount);  
        var options2 = select2.getElementsByTagName('option');  
        iframe2.contentWindow.document.getElementById("amount").value = options2.length;
    }
}