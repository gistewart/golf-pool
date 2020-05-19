$(document).ready(function () {
  function getEarningsByPoolster2() {
    $.get("/api/temp4", function (data) {
      // console.log(data);
      const sorted = data.sort(
        (a, b) => b.Players[0].total_earnings - a.Players[0].total_earnings
      );
      // console.log(sorted);
    });
  }
  getEarningsByPoolster2();

  function getEarningsByPoolster() {
    let a,
      b,
      c,
      arr = [];

    $.get("/api/test", function (data) {
      for (let i = 0; i < data.length; i++) {
        arr.push({ name: data[i].name, handle: data[i].handle, Players: [] });
        for (let j = 0; j < data[i].PoolsterPlayers.length; j++) {
          a = data[i].PoolsterPlayers;
          arr[i].Players.push({
            name: a[j].Player.playerName,
            startDate: a[j].startDate,
            endDate: a[j].endDate,
            tier: a[j].Player.tier,
            Tournaments: [],
          });
          for (
            let k = 0;
            k < data[i].PoolsterPlayers[j].Player.Results.length;
            k++
          ) {
            b = a[j].Player.Results;
            if (
              a[j].startDate < b[k].Schedule.tStartDate &&
              a[j].endDate > b[k].Schedule.tStartDate
            ) {
              arr[i].Players[j].Tournaments.push({
                name: b[k].Schedule.name,
                start: b[k].Schedule.tStartDate,
                earnings: b[k].earnings,
              });
            }
          }
        }
      }
      console.log(arr);
    });
  }
  getEarningsByPoolster();
});
