function selectClient(clientId) {
  $.ajax({
    url: "appointments/" + clientId,
    statusCode: {
      400: function(data) {
        $("#outcome").html(data.responseText);
      }
    },
    success: function(data) {
      $("#main-view").html(data);

      return false;
    },
    error: function(data) {
      console.log("ERROR");
      console.log(data);
    }
  });

}

function loadClients() {
  $.ajax({
    url: "client",
    statusCode: {
      400: function(data) {
        $("#outcome").html(data.responseText);
      }
    },
    success: function(data) {
      $("#main-view").html(data);

      return false;
    },
    error: function(data) {
      console.log("ERROR");
      console.log(data);
    }
  });

  return false;
}

function loadReceivables() {
  $.ajax({
    url: "receivables",
    statusCode: {
      400: function(data) {
        $("#outcome").html(data.responseText);
      }
    },
    success: function(data) {
      var tr;
      var receivablesData = data['receivables'];
      $("#receivablesDetailTable > tbody").empty();

      for (var i = 0; i < receivablesData.length; i++) {
          tr = $('<tr/>');
          tr.append("<td>" + receivablesData[i].id + "</td>");
          tr.append("<td>" + receivablesData[i].firstname + "</td>");
          tr.append("<td>" + receivablesData[i].lastname + "</td>");
          tr.append("<td>" + receivablesData[i].topicname + "</td>");
          tr.append("<td>" + new Date(receivablesData[i].starttime).toLocaleString("en-US") + "</td>");
          tr.append("<td>" + receivablesData[i].duration + "</td>");
          tr.append("<td>" + Math.trunc(receivablesData[i].rate) + "</td>");
          tr.append("<td>" + receivablesData[i].billingpct + "</td>");
          tr.append("<td> $ " + (receivablesData[i].rate * (receivablesData[i].duration / 60) * receivablesData[i].billingpct).toFixed(2) + "</td>");
          tr.append("<td><a href onclick=\"getPaid(" + receivablesData[i].id + "); return false;\">Mark Paid</td>");
          $("#receivablesDetailTable").append(tr);
      }

      return false;
    },
    error: function(data) {
    }
  });

}

function saveAppointment() {
    // $.post( '/saveAppointment', $('form').serialize(), function(data){
    //   // Do whatever you want with the response from the server here
    //   // data is a JavaScript object.
    // }, 'json');
    //
    $.ajax({
        method: 'POST',
        url: '/saveAppointment',
        data: $('form').serialize(), // pass fields as strings
        dataType: 'json'
      })
      .done(function(data) {
        console.log(data);
      });
}

function getPaid(appointmentId) {
  var updateAppointmentData = {};
  updateAppointmentData["id"] = appointmentId;
  updateAppointmentData["paid"] = $('#datePicker').val();

  $.ajax({
      method: 'POST',
      url: '/updateAppointment',
      data: updateAppointmentData,
      dataType: 'json'
    })
    .done(function(data) {
      console.log(data);
      // loadAppointmentsViaAjax($("#appointmentDetail input[name=client_id]").val());
  });

}


$( document ).ready(function() {
  $.ajax({
    url: "receivables",
    statusCode: {
      400: function(data) {
        $("#outcome").html(data.responseText);
      }
    },
    success: function(data) {
      var tr;
      var receivablesData = data['receivables'];
      $("#receivablesDetailTable > tbody").empty();

      for (var i = 0; i < receivablesData.length; i++) {
          tr = $('<tr/>');
          tr.append("<td>" + receivablesData[i].id + "</td>");
          tr.append("<td>" + receivablesData[i].firstname + "</td>");
          tr.append("<td>" + receivablesData[i].lastname + "</td>");
          tr.append("<td>" + receivablesData[i].topicname + "</td>");
          tr.append("<td>" + new Date(receivablesData[i].starttime).toLocaleString("en-US") + "</td>");
          tr.append("<td>" + receivablesData[i].duration + "</td>");
          tr.append("<td>" + Math.trunc(receivablesData[i].rate) + "</td>");
          tr.append("<td>" + receivablesData[i].billingpct + "</td>");
          tr.append("<td> $ " + (receivablesData[i].rate * (receivablesData[i].duration / 60) * receivablesData[i].billingpct).toFixed(2) + "</td>");
          tr.append("<td><a href onclick=\"getPaid(" + receivablesData[i].id + "); return false;\">Mark Paid</td>");
          $("#receivablesDetailTable").append(tr);
      }

      return false;
    },
    error: function(data) {
    }
  });

  // Advance to next hour
  var date = new Date();
  var nextHour = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  nextHour.setMinutes(0);
  nextHour.setHours(nextHour.getHours() + 1);
  $('#datePicker').val(nextHour.toJSON().slice(0,10));

});
