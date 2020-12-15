$(document).ready(function () {
  async function grabPlayerCategories() {
    console.log("grabbing player list");
    await $.get("api/grabPlayerCategories", function (result) {
      for (let i = 0; i < result.length; i++) {
        i < 10
          ? ((result[i].cat = "1"), (result[i].catDesc = "First Category 1-10"))
          : i < 25
          ? ((result[i].cat = "2"),
            (result[i].catDesc = "Second Category 11-25"))
          : i < 50
          ? ((result[i].cat = "3"),
            (result[i].catDesc = "Third Category 26-50"))
          : i < 75
          ? ((result[i].cat = "4"),
            (result[i].catDesc = "Fourth Category 51-75"))
          : ((result[i].cat = "5"),
            (result[i].catDesc = "Fifth Category 76-100"));
        result[i].rank = result[i].rank + ".";
      }
      display(result);
    });
  }
  grabPlayerCategories();

  function display(result) {
    console.log(result);
    $(".playerCat-container > tbody").html("");
    for (let i = 0; i < result.length; i++) {
      $(".playerCat-container > tbody").append(
        i === 0 || result[i].cat != result[i - 1 || 0].cat
          ? "<tr data-toggle='collapse' data-target='#cat" +
              result[i].cat +
              "' class='card-header'><th colspan='2'><button class='btn btn-link' type='button'>" +
              result[i].catDesc +
              "</button></th><th></th></tr>" +
              "<tr id='cat" +
              result[i].cat +
              "' class='collapse' data-parent='#accordionExample' ><td style='padding-left:1em'>" +
              result[i].rank +
              "</td><td>" +
              result[i].name +
              "</td><tr>"
          : "<tr id='cat" +
              result[i].cat +
              "' class='collapse'  data-parent='#accordionExample'><td style='padding-left:1em'>" +
              result[i].rank +
              "</td><td>" +
              result[i].name +
              "</td><tr>"
      );
    }
  }
});
