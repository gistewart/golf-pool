$(document).ready(function () {
  function getEarningsByPoolster2() {
    $.get("/api/temp4", function (data) {
      const sorted = data.sort(
        (a, b) => b.Players[0].total_earnings - a.Players[0].total_earnings
      );
    });
  }

  function getEarningsByPoolster(sortEbyP) {
    $.get("/api/dataset", function (data) {
      let a, b;
      let result = [];
      for (let i = 0; i < data.length; i++) {
        let poolsterSum = 0;
        a = data[i].Players;
        for (let j = 0; j < a.length; j++) {
          b = a[j].Tournaments;
          for (let k = 0; k < b.length; k++) {
            poolsterSum += b[k].earnings;
          }
        }
        result.push({
          poolster: data[i].handle,
          earnings: poolsterSum,
        });
      }
      sortEbyP(result);
    });
  }

  function sortEbyP(result) {
    const sorted = result.sort((a, b) => b.earnings - a.earnings);
    for (let i = 0; i < sorted.length; i++) {
      sorted[i].ranking = i + 1;
    }
    console.log(sorted);
    for (var i = 0; i < sorted.length; i++) {
      $("#article-container").append(
        "<tr><td>" +
          sorted[i].ranking +
          "</td><td>" +
          sorted[i].poolster +
          "</td><td>" +
          sorted[i].earnings +
          "</td></tr>"
      );
    }
  }
  // getEarningsByPoolster(sortEbyP);

  function getEarningsByPxP(sortExPxP) {
    $.get("/api/dataset", function (data) {
      let a, b;
      let result = [];
      for (let i = 0; i < data.length; i++) {
        let poolsterSum = 0;
        a = data[i].Players;
        result.push({
          poolster: data[i].handle,
          name: data[i].name,
          Players: [],
        });
        for (let j = 0; j < a.length; j++) {
          let playerSum = 0;
          result[i].Players.push({
            player: a[j].name,
            tier: a[j].tier,
            startDate: a[j].startDate,
            endDate: a[j].endDate,
            tournaments: [],
          });
          b = a[j].Tournaments;
          for (let k = 0; k < b.length; k++) {
            playerSum += b[k].earnings;
            poolsterSum += b[k].earnings;
            result[i].Players[j].tournaments.push({
              name: b[k].name,
              start: b[k].start,
              position: b[k].position,
              earnings: b[k].earnings,
            });
          }
          result[i].Players[j]["playerEarnings"] = playerSum;
          result[i]["poolsterEarnings"] = poolsterSum;
        }
      }
      console.log(result);
      sortExPxP(result);
    });
  }

  function sortExPxP(result) {
    const sorted = result.sort(
      (a, b) => b.poolsterEarnings - a.poolsterEarnings
    );
    console.log(sorted);
    for (let i = 0; i < sorted.length; i++) {
      sorted[i].ranking = i + 1;
    }
    //sorting by Players on each team by Tier then their Start Date
    for (let i = 0; i < sorted.length; i++) {
      sorted[i].Players.sort(function (a, b) {
        if (a.tier < b.tier) return -1;
        if (a.tier > b.tier) return 1;
        if (a.startDate < b.startDate) return -1;
        if (a.startDate > b.startDate) return 1;
      });
    }
    //sorting each Player's results based on tournament Start Date
    for (let i = 0; i < sorted.length; i++) {
      for (let j = 0; j < sorted[i].Players.length; j++) {
        sorted[i].Players[j].tournaments.sort((a, b) => a.start - b.start);
      }
    }
    console.log(sorted);
    for (let i = 0; i < sorted.length; i++) {
      $("#article-container").append(
        "<tr><td>" +
          sorted[i].ranking +
          "</td><td><h5>" +
          sorted[i].poolster +
          "</h5><h6>" +
          sorted[i].name +
          "</h6></td><td>" +
          "</td><td>" +
          sorted[i].poolsterEarnings +
          "</td></tr>"
      );
      for (let j = 0; j < sorted[i].Players.length; j++) {
        $("#article-container").append(
          "<tr><td>" +
            "</td><td><h6><span>" +
            "Tier:" +
            "</span>" +
            sorted[i].Players[j].tier +
            "<span>" +
            " " +
            "</span>" +
            sorted[i].Players[j].player +
            "</td><td>" +
            (sorted[i].Players[j].startDate > "Jan 1"
              ? sorted[i].Players[j].startDate
              : "") +
            "</td><td>" +
            sorted[i].Players[j].playerEarnings +
            "</td></tr>"
        );
      }
    }
  }
  getEarningsByPxP(sortExPxP);
});
