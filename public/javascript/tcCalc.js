$(function () {
  async function getResults() {
    await $.get("api/tcTable", function (result) {
      result = result;
      console.log(result);

      $("#tcTable > tbody").html("");
      for (let i = 0; i < result.length; i++) {
        $("#tcTable > tbody").append(
          "<tr><td class='playerName'>" +
            result[i].playerName +
            "</td><td class='pos'>" +
            result[i].pos +
            "</td><td>" +
            result[i].toPar +
            "</td><td>" +
            result[i].handicap +
            "</td><td>" +
            result[i].toParTCDisplay +
            "</td><td class='posTCDisplay'>" +
            result[i].posTCDisplay +
            "</td><td class='avgPercent'>" +
            result[i].avgPercent +
            "%" +
            "</td><td class='earnings'>" +
            result[i].earnings.toLocaleString("us-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }) +
            "</td></tr>"
        );
      }
      $.tablesorter.addParser({
        id: "position",
        is: function (s) {
          return false;
        },
        format: function (s) {
          return s.replace(/T/g, "");
        },
        type: "numeric",
      });

      $.tablesorter.addParser({
        id: "toPar",
        is: function (s) {
          return false;
        },
        format: function (s) {
          return s.replace(/E/g, "0");
        },
        type: "numeric",
      });

      $("table").tablesorter({
        theme: "jui",
        headerTemplate: "{content}{icon}",
        widgets: ["zebra", "uitheme"],
        sortList: [[4, 0]],
        headers: {
          1: { sorter: "position" },
          2: { sorter: "toPar" },
          4: { sorter: "toPar" },
          5: { sorter: "position" },
        },
      });
    });
  }

  getResults();

  // $(document).on("click", "#returnLink", returnLink);

  // setTimeout(function returnLink() {
  //   eventData();
  // }, 5000);
});
