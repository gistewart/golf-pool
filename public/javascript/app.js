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

  $(document).on("click", "#seasonData", function (data) {
    $.get("/api/allEvents", function (data) {
      sumData(data);
    });
  });

  $(document).on("click", "#eventData", function (data) {
    $.get("/api/lastEvent", function (data) {
      sumData(data);
    });
  });

  function sumData(data) {
    //to sum earnings by player and poolster
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
            date: b[k].date,
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
    sortData(result);
  }

  function sortData(result) {
    // to sort all the data passed to function
    const sorted = result.sort(
      (a, b) => b.poolsterEarnings - a.poolsterEarnings
    );

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
    displayData(sorted);
  }

  function displayData(sorted) {
    // to display sorted results
    $(".leaderboard-container > tbody").html("");
    for (let i = 0; i < sorted.length; i++) {
      $(".leaderboard-container").append(
        "<tr data-toggle='collapse' data-target='#demo" +
          i +
          "' class=' level1 clickabe'><td class='ranking'>" +
          sorted[i].ranking +
          "</td><td><h5>" +
          sorted[i].poolster +
          "</h5><h6>" +
          sorted[i].name +
          "</h6></td><td>" +
          "</td><td>" +
          sorted[i].poolsterEarnings.toLocaleString("us-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
          }) +
          "</td></tr>"
      );

      for (let j = 0; j < sorted[i].Players.length; j++) {
        $(".leaderboard-container").append(
          "<tr class='level2 hiddenRow collapse' id='demo" +
            i +
            "' data-toggle='collapse' data-target='#demo-" +
            i +
            "-" +
            j +
            "' class='clickable'><td>" +
            "Cat:" +
            sorted[i].Players[j].tier +
            "</td><td>" +
            sorted[i].Players[j].player +
            "</td><td>" +
            (sorted[i].Players[j].startDate > "2020-01-02"
              ? "<i class='fas fa-user-plus' style='color:green'></i>" +
                " " +
                new Date(sorted[i].Players[j].startDate).toLocaleString(
                  "default",
                  {
                    month: "short",
                    day: "numeric",
                  }
                )
              : sorted[i].Players[j].endDate < "2020-12-31"
              ? "<i class='fas fa-user-minus' style='color:red'></i>" +
                " " +
                new Date(sorted[i].Players[j].endDate).toLocaleString(
                  "default",
                  {
                    month: "short",
                    day: "numeric",
                  }
                )
              : "") +
            "</td><td>" +
            sorted[i].Players[j].playerEarnings.toLocaleString("us-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
            }) +
            "</td></tr>"
        );

        for (let k = 0; k < sorted[i].Players[j].tournaments.length; k++) {
          $(".leaderboard-container").append(
            "<tr class='level3 hiddenRow collapse' id='demo-" +
              i +
              "-" +
              j +
              "' ><td class='level3A'>" +
              sorted[i].Players[j].tournaments[k].date +
              " | " +
              sorted[i].Players[j].tournaments[k].name +
              " | " +
              sorted[i].Players[j].tournaments[k].position +
              "</td><td></td><td></td><td>" +
              sorted[i].Players[j].tournaments[k].earnings.toLocaleString(
                "us-US",
                {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 0,
                }
              ) +
              "</td></tr>"
          );
        }
      }
    }
    console.log(sorted);
  }
});
