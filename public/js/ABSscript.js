function buildERP(SAcode, SAlevel) {
   
    var content;

    if (SAlevel === 2) {
        var parameter = {
            SA2: SAcode,
        }
    }
    else {
        var parameter = {
            SA3: SAcode,
        }
    }
    $.getJSON("ABSerp.php", parameter).done(function(data, textStatus, jqXHR) {
        if (SAlevel === 2)
        {
            content += "<table>";
            content += "<tr>";
            content += "<td>";
            content += "SA2 Population";
            content += "</td>";
            content += "<td>";
            console.log(data.series[0].observations[0].Value);
            content += "</td>";
            content += "</tr>";
            content += "</table>";
        }
        else {
            content += "<table>";
            content += "<tr>";
            content += "<td>";
            content += "SA3 Population";
            content += "</td>";
            content += "<td>";
            console.log(data.series[0].observations[0].Value);
            content += "</td>";
            content += "</tr>";
            content += "</table>";
        }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        console.log(errorThrown.toString());
    });
    return content;
     
}



