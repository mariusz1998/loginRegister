function init(toInit)
{
    var iframe = document.getElementById("Avaible"+toInit);  
    var select = iframe.contentWindow.document.getElementById("choosed"+toInit);
    select.addEventListener("click", addFunction.bind(this,toInit),false);

    var iframe2 = document.getElementById("Choosed"+toInit);  
    var select2 = iframe2.contentWindow.document.getElementById("choosed"+toInit);
    select2.addEventListener("click", deleteFunction.bind(this,toInit),false);
}