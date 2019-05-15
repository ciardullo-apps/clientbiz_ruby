var sortOrders =  [ 'asc', 'desc' ];
var sortOrderIndex = 1;

function loadClients(sortColumn) {
  $.ajax({
    url: "client.html",
    data: {
      'sortColumn': sortColumn,
      'sortOrder': sortOrders[(sortOrderIndex ^= 1)]
    },
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

function loadClientData(clientId) {
  $.ajax({
    url: "client/" + clientId + '.html',
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

function loadAppointments(clientId) {
  $.ajax({
    url: "appointments/" + clientId + '.html',
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

function loadReceivables() {
  $.ajax({
    url: "receivables.html",
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

function loadMonthlyActivity(sortColumn) {
    $.ajax({
      url: "monthly-activity.html",
      data: {
        'sortColumn': sortColumn,
        'sortOrder': sortOrders[(sortOrderIndex ^= 1)]
      },
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

function loadActivityYearMonth(year, month, sortColumn) {
  console.log("HI");
    $.ajax({
      url: "activity-year-month.html/" + year + "/" + month,
      data: {
        'sortColumn': sortColumn,
        'sortOrder': sortOrders[(sortOrderIndex ^= 1)]
      },
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
