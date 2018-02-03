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
      var clientData = JSON.parse(data);

      var client = clientData['client'];
      $("#client\\.id").html(client.id);
      $("#client\\.firstname").html(client.firstname);
      $("#client\\.lastname").html(client.lastname);
      $("#client\\.contactname").html(client.contactname);
      $("#client\\.city").html(client.city);
      $("#client\\.state").html(client.state);
      $("#client\\.timezone").html(client.timezone);
      $("#client\\.firstcontact").html(client.firstcontact);
      $("#client\\.firstresponse").html(client.firstresponse);
      $("#client\\.solicited").html(String(!!+client.solicited));

      return false;
    },
    error: function(data) {
    }
  });

  return false;
}
