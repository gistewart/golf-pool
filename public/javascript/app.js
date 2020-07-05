$(document).ready(function () {
  let resultsRefresh = false;
  $("#lastEventTitle").hide();
  $("#subIconLang").hide();
  $(".comments-container").hide();

  $("#seasonData").addClass("is-loading");

  pageLoad();

  async function pageLoad() {
    await eventCheck();
    await missingResults();
    lastEventDetails();
    setTimeout(function () {
      seasonData();
    }, 1000);
  }

  async function eventCheck() {
    let appScheduleArr,
      webScheduleArr,
      diffScheduleArr = [],
      newTournament = {},
      newTournamentArr = [];
    await $.get("api/appSchedule", function (result) {
      appScheduleArr = result;
      console.log("appSchedule: ", appScheduleArr);
    });
    await $.get("api/webSchedule", function (result) {
      webScheduleArr = result;
      console.log("webSchedule: ", webScheduleArr);
    }).then(function (result) {
      console.log("wait");
      diffScheduleArr = webScheduleArr.filter(
        ({ tournamentId: id1 }) =>
          !appScheduleArr.some(({ tournamentId: id2 }) => id2 === id1)
      );
      console.log("diffSchedule: ", diffScheduleArr);
      if (diffScheduleArr.length) {
        console.log("ready to post new event details");
        for (let i = 0; i < diffScheduleArr.length; i++) {
          console.log("in loop");
          newTournament = {
            tournamentId: diffScheduleArr[i].tournamentId,
            tDate: diffScheduleArr[i].tDate,
            tStartDate: diffScheduleArr[i].tStartDate,
            tEndDate: diffScheduleArr[i].tEndDate,
            name: diffScheduleArr[i].name,
            winner: diffScheduleArr[i].winner,
          };
          newTournamentArr.push(newTournament);
        }
        resultsRefresh = true;
        console.log(resultsRefresh);
        submitTournament(newTournamentArr);
      } else {
        console.log("no new events to post");
      }
    });
    return;
  }

  async function submitTournament(newPost) {
    await $.ajax({
      type: "POST",
      url: "api/submitTournament",
      data: JSON.stringify(newPost),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      error: function () {
        alert("Error");
      },
    });
    console.log("new event posted");
    return;
    // missingResults();
  }

  async function missingResults() {
    let diffResultsArr = [];
    await $.get("api/resultsPosted", function (result) {
      resultsPosted = result;
      console.log("resultsPosted: ", resultsPosted);
    });
    await $.get("api/appSchedule", function (list) {
      completedEvents = list;
      console.log("completedEvents: ", completedEvents);
    });
    diffResultsArr = completedEvents.filter(
      ({ tournamentId: id1 }) =>
        !resultsPosted.some(({ tournamentId: id2 }) => id2 === id1)
    );
    console.log("diffResultsArr: ", diffResultsArr);
    if (diffResultsArr.length) {
      getMissingResults(diffResultsArr);
    } else {
      console.log("skipping getMissingResults function");
    }
    return;
  }

  function getMissingResults(results) {
    console.log("calling missingResults api");
    $.ajax({
      type: "POST",
      url: "api/missingResults",
      data: JSON.stringify(results),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      // error: function () {
      //   alert("Error");
      // },
    });
    return;
  }

  //for the section at the top of the leaderboard
  function lastEventDetails() {
    console.log("entering lastEventDetails function");
    $.get("api/lastEventDetails", function (result) {
      for (let i = 0; i < result.length; i++) {
        $("#lastEventDetails").append(
          "<p>" +
            result[i].name +
            " (" +
            "winner: " +
            result[i].winner +
            ", " +
            result[i].tDate +
            ")" +
            "</p>"
        );
      }
    });
    console.log("exiting lastEventDeails function");
  }

  let mainData = [],
    partData = [],
    apiCall = "";

  $(document).on("click", "#seasonData", seasonData);

  function seasonData() {
    $(".main-container").show();
    console.log("entering seasonData function");
    $("#seasonData").addClass("is-loading");
    $("#lastEventTitle").show();
    $("#lastEventTitle").text(
      "Results reflect all tournaments up to and including:"
    );

    apiCall = "Season";
    $("#eventData").removeClass("is-active");
    $("#commentsPage").removeClass("is-active");
    $("#seasonData").addClass("is-active");
    $.get("/api/allEvents", function (data) {
      mainData = data;
    }).then(function () {
      $.get("/api/allExclLastEvent", function (data2) {
        partData = data2;
      }).then(function () {
        $.get("/api/playerRankings", function (data3) {
          playerRankings = data3;
        }).then(function () {
          let a, b;
          let partResult = [];
          for (let i = 0; i < partData.length; i++) {
            let poolsterSum = 0;
            partResult.push({
              poolster: partData[i].handle,
              Players: [],
            });
            a = partData[i].Players;
            for (let j = 0; j < a.length; j++) {
              partResult[i].Players.push({
                player: a[j].name,
                tournaments: [],
              });
              b = a[j].Tournaments;
              for (let k = 0; k < b.length; k++) {
                poolsterSum += b[k].earnings;
              }
              partResult[i]["poolsterEarnings"] = poolsterSum;
            }
          }
          const sortedPartResult = partResult.sort(
            (a, b) => b.poolsterEarnings - a.poolsterEarnings
          );

          for (let i = 0; i < sortedPartResult.length; i++) {
            sortedPartResult[i].ranking = i + 1;
          }
          console.log(sortedPartResult);
          sumData(mainData, sortedPartResult, playerRankings);
        });
      });
    });
    $("#seasonData").removeClass("is-loading");
  }

  $(document).on("click", "#eventData", eventData);

  function eventData() {
    $(".main-container").show();
    $(".comments-container").hide();
    $("#lastEventTitle").show();
    $("#lastEventTitle").text("Tournament details:");
    apiCall = "Event";
    $("#eventData").addClass("is-loading");
    $.get("/api/lastEvent", function (data) {
      sumData(data);
      $("#eventData").addClass("is-active");
      $("#seasonData").removeClass("is-active");
      $("#commentsPage").removeClass("is-active");
    });
    $("#eventData").removeClass("is-loading");
  }

  function sumData(data, sortedPartResult, playerRankings) {
    //to sum earnings by player and poolster
    let a, b;
    let result = [];
    for (let i = 0; i < data.length; i++) {
      let poolsterSum = 0;
      let playerCount = 0;
      result.push({
        poolster: data[i].handle,
        name: data[i].name,
        image: data[i].image,
        Players: [],
      });
      a = data[i].Players;
      for (let j = 0; j < a.length; j++) {
        let playerSum = 0;
        result[i].Players.push({
          player: a[j].name,
          tier: a[j].tier,
          startDate: a[j].startDate,
          active: "yes",
          endDate: a[j].endDate,
          reStartDate: a[j].reStartDate,
          reEndDate: a[j].reEndDate,
          effDate: a[j].effDate,
          type: a[j].type,
          tournaments: [],
        });
        if (a[j].endDate < "2020-12-31" && !a[j].reStartDate) {
          result[i].Players[j].active = "no";
        }
        if (a[j].effDate < "2020-07-07" && a[j].type == "regular") {
          playerCount++;
        }
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
        result[i]["playerCount"] = playerCount;
      }
    }
    console.log(result);
    sortData(result, sortedPartResult, playerRankings);
  }

  function sortData(result, sortedPartResult, playerRankings) {
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
        sorted[i].Players[j].tournaments.sort(function (a, b) {
          if (a.start < b.start) return -1;
          if (a.start > b.start) return 1;
        });
      }
    }
    console.log(sorted, playerRankings);
    displayData(sorted, sortedPartResult, playerRankings);
  }

  function displayData(sorted, sortedPartResult, playerRankings) {
    // to display sorted results
    // to add prior ranking data to main arr
    if (apiCall == "Season") {
      for (let f = 0; f < sorted.length; f++) {
        for (let p = 0; p < sortedPartResult.length; p++) {
          if (sorted[f].poolster == sortedPartResult[p].poolster) {
            sorted[f].priorRanking = sortedPartResult[p].ranking;
            sorted[f].rankingChange =
              sorted[f].priorRanking - sorted[f].ranking;
            sorted[f].ranking < sorted[f].priorRanking
              ? (sorted[f].rankingMove = "up")
              : sorted[f].ranking > sorted[f].priorRanking
              ? (sorted[f].rankingMove = "down")
              : "nc";
            sorted[f].rankingChangeAbs = Math.abs(sorted[f].rankingChange);
          }
        }
      }
      console.log("inserting new code here");
      for (let i = 0; i < sorted.length; i++) {
        for (let j = 0; j < playerRankings.length - 1; j++)
          if (sorted[i].name == playerRankings[j].name) {
            for (let k = 0; k < sorted[i].Players.length; k++) {}
          }
      }
    }
    console.log(sorted);

    $(".leaderboard-container > tbody").html("");
    for (let i = 0; i < sorted.length; i++) {
      $(".leaderboard-container > tbody").append(
        "<tr data-toggle='collapse' data-target='#demo" +
          i +
          "' class='level1 clickabe'><td class='ranking'>" +
          sorted[i].ranking +
          "</td><td class='rankingChange'>" +
          (sorted[i].rankingMove == "up"
            ? "<i class='fas fa-caret-up' style='color:green'></i>" +
              sorted[i].rankingChangeAbs
            : sorted[i].rankingMove == "down"
            ? "<i class='fas fa-caret-down' style='color:red'></i>" +
              sorted[i].rankingChangeAbs
            : " -") +
          "</td><td class='imageDiv'><img class='poolsterImage' src=" +
          sorted[i].image +
          "></td><td class='poolsterHandle'>" +
          sorted[i].poolster +
          " " +
          (sorted[i].playerCount > 0 && apiCall == "Season"
            ? "<i class='subIcon2 material-icons md-dark md-inactive md-15'>swap_horizontal_circle</i>"
            : sorted[i].playerCount == 0 && apiCall == "Season"
            ? "<i class='subIcon1 material-icons md-15'>swap_horizontal_circle</i>"
            : "") +
          "<p class='poolsterName'>" +
          sorted[i].name +
          "<p></td><td class='earnings'>" +
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
            "' class='clickable'><td colspan='4' class='level2A'>" +
            "Cat " +
            sorted[i].Players[j].tier +
            ": " +
            sorted[i].Players[j].player +
            "  " +
            (sorted[i].Players[j].startDate > "2020-01-01"
              ? "<i class='fas fa-user-plus fa-xs' style='color:green'></i>" +
                "  " +
                new Date(sorted[i].Players[j].startDate).toLocaleString(
                  "default",
                  {
                    month: "short",
                    day: "numeric",
                  }
                )
              : sorted[i].Players[j].endDate < "2020-12-31"
              ? "<i class='fas fa-user-minus fa-xs' style='color:red'></i>" +
                "  " +
                new Date(sorted[i].Players[j].endDate).toLocaleString(
                  "default",
                  {
                    month: "short",
                    day: "numeric",
                  }
                )
              : "") +
            (sorted[i].Players[j].startDate > "2020-01-01" &&
            sorted[i].Players[j].endDate < "2020-12-31"
              ? " | " +
                "<i class='fas fa-user-minus fa-xs' style='color:red'></i>" +
                "  " +
                new Date(sorted[i].Players[j].endDate).toLocaleString(
                  "default",
                  {
                    month: "short",
                    day: "numeric",
                  }
                )
              : "") +
            (sorted[i].Players[j].reStartDate > "2020-01-01"
              ? " | " +
                "<i class='fas fa-user-plus fa-xs' style='color:green'></i>" +
                "  " +
                new Date(sorted[i].Players[j].reStartDate).toLocaleString(
                  "default",
                  {
                    month: "short",
                    day: "numeric",
                  }
                )
              : "") +
            "</td><td class='earnings'>" +
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
              "' ><td class='level3A' colspan='4'>" +
              sorted[i].Players[j].tournaments[k].date +
              " | " +
              sorted[i].Players[j].tournaments[k].name +
              " | " +
              sorted[i].Players[j].tournaments[k].position +
              "</td><td class='earnings'>" +
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
    $(".subIcon1").attr("title", "Sub available for this period");
    $(".subIcon2").attr("title", "Sub already used for this period");

    $("#subIconLang").show(3000);

    console.log(sorted);
  }

  // ---------COMMENTS PAGE SECTION-------------

  $(document).on("click", "#commentsPage", commentsPage);

  function commentsPage() {
    $(".main-container").hide();
    $("#seasonData").removeClass("is-active");
    $("#eventData").removeClass("is-active");
    $("#commentsPage").addClass("is-active");

    $(".comments-container").show();
    $(".tabs-container").show();
    $(".submit-comments-container").show();
    $("#submitComments").addClass("is-active");
    $(".display-comments-container").hide();
  }

  // ---------SUBMIT COMMENT SECTION--------------

  $(document).on("click", "#submitComments", submitComments);

  function submitComments() {
    $(".submit-comments-container").show();
    $(".display-comments-container").hide();
    $("#submitComments").addClass("is-active");
    $("#displayComments").removeClass("is-active");
  }
  var bodyInput = $("#body");
  var categoryInput = $("#category");
  var cmsForm = $("#cms");
  var poolsterSelect = $("#poolster");
  // Adding an event listener for when the form is submitted
  $(cmsForm).on("submit", handleFormSubmit);
  var poolsterId;

  getPoolsters();

  // A function for handling what happens when the form to create a new post is submitted
  function handleFormSubmit(event) {
    event.preventDefault();
    if (
      !categoryInput.val().trim() ||
      !bodyInput.val().trim() ||
      !poolsterSelect.val()
    ) {
      alert("All fields must be completed");
      return;
    }
    // Constructing a newPost object to hand to the database
    var newPost = {
      category: categoryInput.val().trim(),
      body: bodyInput.val().trim(),
      handle: poolsterSelect.val(),
    };

    console.log(newPost);

    // If we're updating a post run updatePost to update a post
    // Otherwise run submitPost to create a whole new post
    // if (updating) {
    //   newPost.id = postId;
    //   updatePost(newPost);
    // } else {
    submitPost(newPost);
    // }
  }

  // Submits a new post
  function submitPost(post) {
    $.post("/api/posts", post, function () {
      displayComments();
      getPosts();
      $("#cms")[0].reset();
    });
  }

  // function to get Poolsters and render list of them
  function getPoolsters() {
    $.get("api/poolsters", renderPoolsterList);
  }

  // function to render list of poolsters
  function renderPoolsterList(data) {
    // console.log(data);
    const sortedData = data.sort((a, b) => a.handle.localeCompare(b.handle));
    var rowstoAdd = [
      "<option value='' disabled selected>" + "Select Poolster" + "</option",
    ];
    for (let i = 0; i < sortedData.length; i++) {
      rowstoAdd.push(createPoolsterRow(sortedData[i]));
    }
    poolsterSelect.empty();
    // console.log(rowstoAdd);
    // console.log(poolsterSelect);
    poolsterSelect.append(rowstoAdd);
    // poolsterSelect.val(poolsterId);
  }

  // Creates the poolster options in the dropdown
  function createPoolsterRow(poolster) {
    var listOption = $("<option>");
    // listOption.attr("value", poolster.poolsterId);
    listOption.attr("value", poolster.handle);
    listOption.text(poolster.handle);
    return listOption;
  }
  // ---------DISPLAY COMMENTS SECTION--------------

  $(document).on("click", "#displayComments", displayComments);

  function displayComments() {
    $(".submit-comments-container").hide();
    $(".display-comments-container").show();
    $("#submitComments").removeClass("is-active");
    $("#displayComments").addClass("is-active");
  }

  // blogContainer holds all of our posts
  var blogContainer = $(".blog-container");
  var posts;

  getPosts();

  function getPosts() {
    $.get("api/posts", function (data) {
      // console.log("Posts", data);
      posts = data;
      if (!posts || !posts.length) {
        displayEmpty(author);
      } else {
        initializeRows();
      }
    });
  }

  function initializeRows() {
    blogContainer.empty();
    var postsToAdd = [];
    for (var i = 0; i < posts.length; i++) {
      postsToAdd.unshift(createNewRow(posts[i]));
    }
    blogContainer.append(postsToAdd);
    // console.log(postsToAdd);
  }

  // This function constructs a post's HTML
  function createNewRow(post) {
    var newPostCard = $("<div>");
    newPostCard.addClass("card");

    var newPostCardHeading = $("<div>");
    newPostCardHeading.addClass("card-header");
    newPostCardHeading.css({
      padding: "0.25em 1.25em",
    });

    var newPostCardBody = $("<div>");
    newPostCardBody.addClass("card-body");
    newPostCardBody.css({
      padding: "0.25em 1.25em",
      "margin-bottom": "0.5em",
    });
    var newPostBody = $("<p>");

    var newPostTitle = $("<p>");

    var formattedDate = new Date(post.createdAt);
    formattedDate = moment(formattedDate).format("MMM DD, YYYY");
    var newPostDate = $("<span>");
    newPostDate.text(formattedDate);

    newPostTitle.append(post.handle + " | ");
    newPostTitle.append(post.category + " | ");
    newPostTitle.append(newPostDate);
    newPostCardHeading.append(newPostTitle);
    newPostCard.append(newPostCardHeading);

    newPostBody.text(post.body);
    newPostBody.css({
      color: "black",
      "font-size": "1.15em",
    });
    newPostCardBody.append(newPostBody);
    newPostCard.append(newPostCardBody);
    newPostCard.data("post", post);

    return newPostCard;
  }
});
