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

      jQuery.extend(jQuery.fn.dataTableExt.oSort, {
        "position-pre": function (a) {
          a = a.replace(/T/g, "");
          return parseInt(a);
        },
        "position-asc": function (a, b) {
          return a - b;
        },
        "position-desc": function (a, b) {
          return b - a;
        },
      });

      jQuery.extend(jQuery.fn.dataTableExt.oSort, {
        "toPar-pre": function (a) {
          a = a.replace(/\+/g, "").replace(/E/, "0");
          return parseInt(a);
        },
        "toPar-asc": function (a, b) {
          return a - b;
        },
        "toPar-desc": function (a, b) {
          return b - a;
        },
      });

      $("#tcTable").DataTable({
        paging: false,
        info: false,
        order: [[5, "asc"]],
        responsive: true,
        bFilter: false,
        fixedHeader: { header: true },
        scrollY: 500,
        scrollX: true,
        scrollCollapse: true,
        scroller: true,
        fixedColumns: true,
        columnDefs: [
          {
            targets: [1, 2, 3, 4, 5, 6, 7],
            className: "dt-center",
          },
          {
            targets: [0],
            className: "dt-left",
          },
          { type: "position", targets: [1, 5] },
          { type: "toPar", targets: [2, 4] },
        ],
      });

      // $.tablesorter.addParser({
      //   id: "position",
      //   is: function (s) {
      //     return false;
      //   },
      //   format: function (s) {
      //     return s.replace(/T/g, "");
      //   },
      //   type: "numeric",
      // });

      // $.tablesorter.addParser({
      //   id: "toPar",
      //   is: function (s) {
      //     return false;
      //   },
      //   format: function (s) {
      //     return s.replace(/E/g, "0");
      //   },
      //   type: "numeric",
      // });

      // $("table").tablesorter({
      //   theme: "jui",
      //   headerTemplate: "{content}{icon}",
      //   widgets: ["zebra", "uitheme"],
      //   sortList: [[4, 0]],
      //   headers: {
      //     1: { sorter: "position" },
      //     2: { sorter: "toPar" },
      //     4: { sorter: "toPar" },
      //     5: { sorter: "position" },
      //   },
      // });
    });
  }

  getResults();
});
