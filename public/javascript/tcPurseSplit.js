$(document).ready(function () {
  async function grabTCPurseSplit() {
    console.log("grabbing purse split");
    await $.get("api/grabTCPurseSplit", function (result) {
      console.log(result);
      for (let i = 0; i < result.length; i++) {
        result[i].pos = result[i].pos + ".";
        result[i].percent = result[i].percent.slice(0, -5) + "%";
      }
      display(result);
    });
  }
  grabTCPurseSplit();

  function display(result) {
    console.log(result);
    $(".tcPurseSplit > tbody").html("");
    for (let i = 0; i < result.length; i++) {
      $(".tcPurseSplit > tbody").append(
        "<tr id='tcPurseSplitRow'><td>" +
          result[i].pos +
          "</td><td class='tcPurseSplitPercent'>" +
          result[i].percent +
          "</td><tr>"
      );
    }
  }
});
