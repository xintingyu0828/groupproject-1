// Add event cards
$("#searchingBtn").on("click", function () {
    event.preventDefault();

    // Clean card from previous serch
    $("#event_select_container").empty();

    // Fetching user searched city and date:
    var city = $("#userInputCity").val().trim();
    var date = $("#userInputDate").val();

    // SeatGeek API url for city + date search:
    var queryURL = "https://api.seatgeek.com/2/events?per_page=12&venue.city=" + city + "&datetime_local.gt=" + date + "&client_id=MTE1ODQyMjB8MTUzNDQzNTkwNi4wMw";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {

        for (var i = 0; i < response.events.length; i++) {

            var noImg = " ";
            var eventImgUrl = response.events[i].performers[0].image;
            var eventType = response.events[i].type;
            var eventVenue = response.events[i].venue.address;
            var eventDate = fixTheDateAndTime(response.events[i].datetime_local);
            var cardEventTitle = response.events[i].title;
            var cardEventID = response.events[i].id;

            // Event has no img
            if (eventImgUrl === null) {
                noImg = "noImg";
                // Set a default img
                var eventImgUrl = "assets/images/eventDefaultImg.jpg";
            }

            // Append event card to the DOM
            $("#event_select_container").append(
                `<div class="card event_select_item" style="width: 16rem;" data-event_id="${cardEventID}" data-event_title="${cardEventTitle}">
                    <img class="card-img-top event_img ${noImg}" data-type=${eventType} src="${eventImgUrl}" alt="Event image">
                    <div class="card-body">
                        <h5 class="card-title">${cardEventTitle}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${eventDate}</h6>
                        <p class="card-text">${eventVenue}</p>
                        <a data-event_id=${cardEventID} class="btn btn-primary event-btn">Pick event</a>
                    </div>
                </div>`)
        }
        // Set new pictures for event card with no img
        $(".noImg").each(function () {
            var type = $(this).attr("data-type");
            var imgSrc = $(this);
            // Unsplash API url for query search:
            var imgQueryURL = "https://api.unsplash.com/search/photos?query=" + type + "&per_page=1&client_id=0e8aefac333279df358a5cb77c7e1be1b59af8de38ea6175cee56d86d5e9ecec";
            $.ajax({
                url: imgQueryURL,
                method: "GET"
            }).then(function (response) {
                var newImg = (response.results[0].urls.small);
                imgSrc.attr("src", newImg);
            });
        });
    });
});

// Change time & date from UTC to US:
function fixTheDateAndTime(dateandtime) {
    var dateAndTimeArray = dateandtime.split("T");
    // Changing the date from UTC to US local
    var dateArray = dateAndTimeArray[0].split("-");
    var month = dateArray[1];
    dateArray[1] = dateArray[2];
    dateArray[2] = dateArray[0];
    dateArray[0] = month;
    var newDate = dateArray.join(".");
    // Shows only HH:MM 
    var timeArray = dateAndTimeArray[1].split(":", 2);
    var newTime = timeArray.join(":");
    // Convert time from UTC to US local
    var hour = parseInt(timeArray[0], 10);
    if (hour > 12) {
        newHour = hour - 12;
        timeArray[0] = newHour;
        newTime = timeArray.join(":") + " PM";
        return newDate + ", " + newTime;
        console.log(newDate);
    } else {
        newTime = newTime + " AM";
        return newDate + ", " + newTime;
        console.log(newDate);
    };
};

// Firebase
var database = firebase.database();
// Get user info
const txtEmail = document.getElementById("loginEmail");
const txtPassword = document.getElementById("loginPassword");
const btnLogin = document.getElementById('btnLogin');
const btnSignUp = document.getElementById('btnSignUp');
const btnLogout = document.getElementById('btnLogout');

// Log in user
btnLogin.addEventListener('click', function (e) {
    // Get email and password
    const email = txtEmail.value;
    const pass = txtPassword.value;
    const auth = firebase.auth();
    // If user in database - Log in user
    const promise = auth.signInWithEmailAndPassword(email, pass);
});

// Sign up user
btnSignUp.addEventListener('click', function (e) {
    // Get email and pass
    const email = txtEmail.value;
    const pass = txtPassword.value;
    const auth = firebase.auth();
    // Create user in database and log him in
    const promise = auth.createUserWithEmailAndPassword(email, pass);
});

// Sign out user
btnLogout.addEventListener('click', function (e) {
    firebase.auth().signOut();
});

// Set new comment to comment area 
var eventPostsRef;
function handleNewBlogPost(snapshot) {
    var newPost = snapshot.val();
    $("#comments").prepend('<div class="comment">' +
        '<h4>' + escapeHtml(newPost.name) + '</h4>' +
        '<div class="profile-image"><img src="http://www.gravatar.com/avatar/' + escapeHtml(newPost.md5Email) + '?s=100&d=retro"/></div> ' +
        '<span class="date">' + moment(newPost.postedAt).fromNow() + '</span><p>' + escapeHtml(newPost.message) + '</p></div>');
};

// Check if user is loged in
firebase.auth().onAuthStateChanged(function (firebaseUser) {
    // user is loged in
    if (firebaseUser) {
        userEmail = firebaseUser.email;
        // Hide login cover
        $(".login-cover").hide();

        var dialog = document.querySelector('#loginDialog');
        if (!dialog.showModal) {
            dialogPolyfill.registerDialog(dialog);
        }
        dialog.close();

        // Set info to event's comment area
        $(document).on("click", ".event_select_item", function () {
            event.preventDefault();
            // Change event's comment area's title and info
            var eventTitle = this.getAttribute("data-event_title");
            $("#event_comment_window").text(eventTitle);
            var eventID = this.getAttribute("data-event_id");
            $("#event_comment_details h5").text(eventID)
            var alreadyInDatabase = false;

            // Remove the previous comments
            $('.comment').remove()
            // Stop showing previous comments
            if (eventPostsRef) {
                eventPostsRef.off("child_added", handleNewBlogPost);
            }
            // Show current comments
            eventPostsRef = database.ref('events').child(eventID).child('blog');
            eventPostsRef.on("child_added", handleNewBlogPost);

            // Check if user info is in event's databas
            database.ref('events/' + eventID).once('value', function (snapshot) {
                var response = snapshot.val();
                for (var key in response) {
                    var record = response[key].email;
                    if (record === userEmail) {
                        alreadyInDatabase = true;
                        break;
                    };
                };
                if (alreadyInDatabase === false) {
                    // Push data to database
                    database.ref('events/' + eventID).push({
                        email: userEmail
                    });
                };
            });

            // show all event user emails in comment area
            database.ref('events/' + eventID).once('value', function (snapshot) {
                $('#event_comment_users').text('');
                var response = snapshot.val();
                for (var key in response) {
                    var record = response[key].email;
                    x = $('<p>').append(record)
                    $('#event_comment_users').append(x);
                }
            });
        });

        // if user is not loged in - show log in dialog
    } else {
        $(".login-cover").show();
        var dialog = document.querySelector('#loginDialog');
        if (!dialog.showModal) {
            dialogPolyfill.registerDialog(dialog);
        };
        dialog.showModal();
    };
});

// ???
$('#btnLogin').click(function () {
    var email = $('#loginEmail').val();
    var password = $('#loginPassword').val();

    if (email != "" && password != "") {
        $('#loginProgress').show();
        $('#loginBtn').hide();

        firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
            $('#loginError').show().text(error.message);
            $('#loginProgress').hide();
            $('#loginBtn').show();
        });
    };
});

// Comments - add comment to database
$("#event-comment-btn").on("click", function (element) {
    event.preventDefault();
    addCommentToEventBlog()
});
function addCommentToEventBlog() {
    eventIDforComment = $("#event_comment_details h5")[0].innerHTML;
    var userMessage = $("#message").val();
    var userName = $("#name").val();
    var userEmail = $("#email").val();

    var eventPostsRef = database.ref('events/' + eventIDforComment);

    eventPostsRef.child("/blog/").push({
        name: userName,
        message: userMessage,
        md5Email: md5(userEmail),
        postedAt: Firebase.ServerValue.TIMESTAMP
    });

    $("input[type=text], textarea").val("");
};
function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
};