
function myFilterFunction(valueFilter,nameInput) {

  
    var table, rows,row,input;

    input = document.getElementById(nameInput);
    var filter = input.value.toUpperCase();

    console.log(valueFilter+ " " +nameInput+" "+filter)
    table = document.getElementById("filesTable");
    rows = table.rows;
    for (i = 1; i < (rows.length ); i++) {
       row = rows[i].getElementsByTagName("TD")[valueFilter]; //0 - kolumna 

       if (row.innerHTML.toUpperCase().indexOf(filter) > -1)
       rows[i].style.display = "";
       else
       rows[i].style.display = "none";
    }
   
}