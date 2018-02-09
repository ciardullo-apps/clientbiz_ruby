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
