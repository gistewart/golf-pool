$(document).ready(function () {
  function getEarningsByPoolster() {
    $.get("/api/temp4", function (data) {
      console.log(data);
      const sorted = data.sort(
        (a, b) => b.Players[0].total_earnings - a.Players[0].total_earnings
      );
      console.log(sorted);
    });
  }

  getEarningsByPoolster();
});
