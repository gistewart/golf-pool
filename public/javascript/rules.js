$(document).ready(function () {
  $.getJSON("../rules.json", function (data) {
    console.log(data);
    displayData(data);
  });
  function displayData(data) {
    $(".accordion").html("");
    for (let i = 0; i < data.length; i++) {
      $(".accordion").append(
        "<div class='card'><div class='card-header' id='heading" +
          i +
          "'><button class='btn btn-link' type='button' data-toggle='collapse' data-target ='#collapse" +
          i +
          "'>" +
          data[i].section +
          "</button></div><div id='collapse" +
          i +
          "' class='collapse' data-parent='#rulesAccordion'><div class='card-body'>" +
          data[i].text +
          "</div></div></div>"
      );
    }
  }
});
