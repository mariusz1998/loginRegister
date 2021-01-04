//Funkcja odpowiedzialna za przenoszenie pozycji z 
//listy "wybrane" do listy "do wyboru"
function deleteFunction(toDelete,optionArray)
{
    var iframe = document.getElementById("Choosed"+toDelete);   //dobieram sie do iframe
    var select = iframe.contentWindow.document.getElementById("choosed"+toDelete);   //dobieram sie 
    var options = select.getElementsByTagName('option');    //pobieram opcje z listy

    var iframe2 = document.getElementById("Avaible"+toDelete);   //dobieram sie do iframe
    var select2 = iframe2.contentWindow.document.getElementById("choosed"+toDelete);   //dobieram sie
    var option = document.createElement("option");
    option.text = options[select.selectedIndex].text;
    
    optionArray.forEach(function(element){
        if( option.text==element)
     option.style.backgroundColor="yellowgreen"
    });  
    select2.add(option);

    select.remove(select.selectedIndex);
    myCountingFunction(toDelete);
}