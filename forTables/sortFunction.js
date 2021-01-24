function sortingFunction() {

   var choice =document.getElementById("option").value;
    var table, rows, switching, i, x, y, makeChange,  typeOfSorting;
    typeOfSorting = sort.options[sort.selectedIndex].value;
    table = document.getElementById("filesTable");
    switching = true;
    while (switching) {
      switching = false;
      rows = table.rows;
      for (i = 1; i < (rows.length - 1); i++) {
        makeChange = false;
        x = rows[i].getElementsByTagName("TD")[choice]; 
        y = rows[i + 1].getElementsByTagName("TD")[choice];

        if(choice==0) //for id 
    {
      var numberX = parseInt(x.innerHTML)
      var numberY = parseInt(y.innerHTML)

      if(typeOfSorting.localeCompare("Ascending")==0)
      {
          if (numberX  > numberY) { //ascending
          makeChange = true;
          break;
          }
      }
      else if(typeOfSorting.localeCompare("Descending")==0)
      {
          if (numberX  < numberY ) { //descending
          makeChange = true;
          break;
          }
      }
    }
    else
    {
        if(typeOfSorting.localeCompare("Ascending")==0)
        {
            if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) { //ascending
            makeChange = true;
            break;
            }
        }
        else if(typeOfSorting.localeCompare("Descending")==0)
        {
            if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) { //descending
            makeChange = true;
            break;
            }
        }
      }
    }
      if (makeChange) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      }
    }
}
