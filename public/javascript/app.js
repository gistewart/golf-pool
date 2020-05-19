$(document).ready(function () {
  function getEarningsByPoolster2() {
    $.get("/api/temp4", function (data) {
      const sorted = data.sort(
        (a, b) => b.Players[0].total_earnings - a.Players[0].total_earnings
      );
    });
  }
  // getEarningsByPoolster2();

  // function getEarningsByPoolster() {
  //   $.get("/api/dataset", function (data) {
  //     let a, b;
  //     let result = [];
  //     for (let i = 0; i < data.length; i++) {
  //       let poolsterSum = 0;
  //       a = data[i].Players;
  //       for (let j = 0; j < a.length; j++) {
  //         b = a[j].Tournaments;
  //         for (let k = 0; k < b.length; k++) {
  //           poolsterSum += b[k].earnings;
  //         }
  //       }
  //       result.push({
  //         poolster: data[i].handle,
  //         earnings: poolsterSum,
  //       });
  //     }
  //     console.log(result);
  //     return result;
  //   }).then(function (result) {
  //     const sorted = result.sort((a, b) => b.earnings - a.earnings);
  //     console.log(sorted);
  //     return sorted;
  //   });
  // }

  function getEarningsByPoolster(sort) {
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
      sort(result);
    });
  }

  function sort(result) {
    const sorted = result.sort((a, b) => b.earnings - a.earnings);
    for (let i = 0; i < sorted.length; i++) {
      sorted[i].ranking = i + 1;
    }

    console.log(sorted);
  }

  getEarningsByPoolster(sort);
});
