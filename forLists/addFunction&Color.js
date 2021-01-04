//Funkcja odpowiedzialna za przenoszenie pozycji z 
//listy "do wyboru" do listy "wybrane"
function addFunction(toAdd,optionArray)
{
    var iframe = document.getElementById("Avaible"+toAdd);   //dobieram sie do iframe
    var select = iframe.contentWindow.document.getElementById("choosed"+toAdd);   
    var options = select.getElementsByTagName('option');    //pobieram opcje z listy

    var iframe2 = document.getElementById("Choosed"+toAdd);   //dobieram sie do iframe
    var select2 = iframe2.contentWindow.document.getElementById("choosed"+toAdd);  
    var option = document.createElement("option");
    option.text = options[select.selectedIndex].text;
    

        optionArray.forEach(function(element){
            if( option.text==element)
                option.style.backgroundColor="yellowgreen"
        });  

    select2.add(option);

    select.remove(select.selectedIndex);
    myCountingFunction(toAdd);
}