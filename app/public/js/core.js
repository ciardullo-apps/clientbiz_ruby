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
      $("#main-view").html(data);

      return false;
    },
    error: function(data) {
      console.log(data);
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
  updateAppointmentData["paid"] = $('#paiddate').val();

  $.ajax({
      method: 'POST',
      url: '/updatePaidDate',
      data: updateAppointmentData,
      dataType: 'json'
    })
    .done(function(data) {
      console.log(data);
  });

  return false;
}

function newAppointment() {
  $.ajax({
    url: "newAppointment",
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

function newClient() {
  $.ajax({
    url: "newClient",
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

function saveClient() {
    $.ajax({
        method: 'POST',
        url: '/saveClient',
        data: $('form').serialize(), // pass fields as strings
        dataType: 'json'
      })
      .done(function(data) {
        console.log(data);
      });
}
