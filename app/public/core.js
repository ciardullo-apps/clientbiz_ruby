function selectClient(clientId) {
  if (!clientId) {
    console.log('No client selected');
    return;
  }

  $.ajax({
    url: "client/" + clientId,
    statusCode: {
      400: function(data) {
        $("#outcome").html(data.responseText);
      }
    },
    success: function(data) {
      var clientData = data;

      var client = clientData['client'];
      $("#client\\.id").html(client.id);
      $("#client\\.firstname").html(client.firstname);
      $("#client\\.lastname").html(client.lastname);
      $("#client\\.contactname").html(client.contactname);
      $("#client\\.city").html(client.city);
      $("#client\\.state").html(client.state);
      $("#client\\.timezone").html(client.timezone);
      $("#client\\.firstcontact").html((client.firstcontact ? new Date(client.firstcontact).toLocaleString("en-US") : ''));
      $("#client\\.firstresponse").html(new Date(client.firstresponse).toLocaleString("en-US"));
      $("#client\\.solicited").html(String(!!+client.solicited));

      // Initialize new appointment form fields
      $("#appointmentDetail input[name=client_id]").val(client.id);
      $("#appointmentDetail input[name=duration]").val(60);
      $("#appointmentDetail input[name=rate]").val(60);
      $("#appointmentDetail input[name=billingpct]").val(0.75);


      // Advance starttime for new appointment to next hour
      var date = new Date();
      var nextHour = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
      nextHour.setMinutes(0);
      nextHour.setHours(nextHour.getHours() + 1);
      $("#appointmentDetail input[name=starttime]").val(nextHour.toJSON().slice(0,16));

      $("#saveAppointmentButton").prop('disabled', false);
      return false;
    },
    error: function(data) {
    }
  });

  loadAppointmentsViaAjax(clientId);

  return false;
}

function loadAppointmentsViaAjax(clientId) {
  $.ajax({
    url: "appointments/" + clientId,
    statusCode: {
      400: function(data) {
        $("#outcome").html(data.responseText);
      }
    },
    success: function(data) {
      var tr;
      var appointmentData = data['appointments'];
      $("#appointmentDetailTable > tbody").empty();

      for (var i = 0; i < appointmentData.length; i++) {
          tr = $('<tr/>');
          tr.append("<td>" + topics[appointmentData[i].topic_id - 1].name + "</td>");
          tr.append("<td>" + new Date(appointmentData[i].starttime).toLocaleString("en-US") + "</td>");
          tr.append("<td>" + appointmentData[i].duration + "</td>");
          tr.append("<td>" + Math.trunc(appointmentData[i].rate) + "</td>");
          tr.append("<td>" + appointmentData[i].billingpct + "</td>");
          tr.append("<td>" + (appointmentData[i].paid ? new Date(appointmentData[i].paid).toLocaleDateString("en-US") : '') + "</td>");
          $("#appointmentDetailTable").append(tr);
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
        loadAppointmentsViaAjax($("#appointmentDetail input[name=client_id]").val());
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
