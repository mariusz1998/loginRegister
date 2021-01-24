function filterFunction(valueFilter,nameInput) {

    var table, rows,row,input;
    input = document.getElementById(nameInput);
    var filter = input.value.toUpperCase();

    console.log(valueFilter+ " " +nameInput+" "+filter)
    table = document.getElementById("filesTable");
    rows = table.rows;
    for (i = 1; i < (rows.length ); i++) {
       row = rows[i].getElementsByTagName("TD")[valueFilter]; //valueFilter - column number, td - get row
       if (row.innerHTML.toUpperCase().indexOf(filter) > -1)
       rows[i].style.display = "";
       else
       rows[i].style.display = "none";
    } 
}