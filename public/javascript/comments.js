$(document).ready(function () {
  // ---------COMMENTS PAGE SECTION-------------

  function commentsPage() {
    // $(".submit-comments-container").show();
    $("#submitComments").addClass("is-active");
    $(".display-comments-container").hide();
  }

  commentsPage();

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
