function mySortingFunction() {

   var choice =document.getElementById("option").value;
    var table, rows, switching, i, x, y, shouldSwitch,  typeOfSorting;
    typeOfSorting = sort.options[sort.selectedIndex].value;
    table = document.getElementById("filesTable");
    switching = true;
    /*Make a loop that will continue until
    no switching has been done:*/
    while (switching) {
      //start by saying: no switching is done:
      switching = false;
      rows = table.rows;
      /*Loop through all table rows (except the
      first, which contains table headers):*/
      for (i = 1; i < (rows.length - 1); i++) {
        //start by saying there should be no switching:
        shouldSwitch = false;
        /*Get the two elements you want to compare,
        one from current row and one from the next:*/
        x = rows[i].getElementsByTagName("TD")[choice]; //0 - kolumna 
        y = rows[i + 1].getElementsByTagName("TD")[choice];
        //check if the two rows should switch place:
        if(typeOfSorting.localeCompare("Ascending")==0)
        {
            if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) { //ascending
                //if so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
            }
        }
        else if(typeOfSorting.localeCompare("Descending")==0)
        {
            if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) { //descending
            shouldSwitch = true;
            break;
            }
      }
    }
      if (shouldSwitch) {
        /*If a switch has been marked, make the switch
        and mark that a switch has been done:*/
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      }
    }
}
