function slugify(text) {
    return text.toString().toLowerCase().trim()
        .replace(/&/g, '-and-')
        .replace(/[\s\W-]+/g, '-')
        .replace(/[^a-zA-Z0-9-_]+/g, '');
}

function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
};

// From: https://getbootstrap.com/docs/4.0/components/forms/
// This is the Bootstrap that haldles the "Event Search Card" buttons
// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
    'use strict';
    window.addEventListener('load', function () {
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.getElementsByClassName('needs-validation');
        // Loop over them and prevent submission
        var validation = Array.prototype.filter.call(forms, function (form) {
            form.addEventListener('submit', function (event) {
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);
})();

// Fetching user searched city and date:
$("#searchingBtn").on("click", function () {
    event.preventDefault();

    $("#event_select_container").empty();
    var city = $("#userInputCity").val().trim();
    var date = $("#userInputDate").val();

    // SeatGeek API url for city + date search:
    var queryURL = "https://api.seatgeek.com/2/events?per_page=12&venue.city=" + city + "&datetime_local.gt=" + date + "&client_id=MTE1ODQyMjB8MTUzNDQzNTkwNi4wMw";

    // Function to make US time:
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

    // SeatGeek API
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {

        console.log(response);

        for (var i = 0; i < response.events.length; i++) {

            var noImg = " ";
            var eventImgUrl = response.events[i].performers[0].image;
            console.log(eventImgUrl);
            if (eventImgUrl === null) {
                noImg = "noImg";
                var eventImgUrl = "assets/images/eventDefaultImg.jpg";
            }
            var eventType = response.events[i].type;
            var eventVenue = response.events[i].venue.address;
            var eventDate = response.events[i].datetime_local;
            var fixEventDate = fixTheDateAndTime(eventDate);
            var cardEventTitle = response.events[i].title;
            var cardEventID = response.events[i].id;



            $("#event_select_container").append(
                `<div class="card event_select_item" style="width: 16rem;" data-event_id="${cardEventID}" data-event_title="${cardEventTitle}">
                    <img class="card-img-top event_img ${noImg}" data-type=${eventType} src="${eventImgUrl}" alt="Event image">
                    <div class="card-body">
                        <h5 class="card-title">${cardEventTitle}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${fixEventDate}</h6>
                        <p class="card-text">${eventVenue}</p>
                        <a data-event_id=${cardEventID} class="btn btn-primary event-btn">Pick event</a>
                    </div>
                </div>`)

        }

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



// ==================================================================
// Firebase
var database = firebase.database();;
// Get Elements
const txtEmail = document.getElementById("loginEmail");
const txtPassword = document.getElementById("loginPassword");
const btnLogin = document.getElementById('btnLogin');
const btnSignUp = document.getElementById('btnSignUp');
const btnLogout = document.getElementById('btnLogout');

// Add Login Event
btnLogin.addEventListener('click', function (e) {
    // Get email and pass
    const email = txtEmail.value;
    const pass = txtPassword.value;
    const auth = firebase.auth();
    //Sign in
    const promise = auth.signInWithEmailAndPassword(email, pass);

})

// Add signup event
btnSignUp.addEventListener('click', function (e) {
    // Get email and pass
    const email = txtEmail.value;
    const pass = txtPassword.value;
    const auth = firebase.auth();

    console.log(email);

    //Sign in
    const promise = auth.createUserWithEmailAndPassword(email, pass);

})

// Signout
btnLogout.addEventListener('click', function (e) {
    firebase.auth().signOut();
})

var eventPostsRef;
function handleNewBlogPost(snapshot) {
    var newPost = snapshot.val();
    $("#comments").prepend('<div class="comment">' +
        '<h4>' + escapeHtml(newPost.name) + '</h4>' +
        '<div class="profile-image"><img src="http://www.gravatar.com/avatar/' + escapeHtml(newPost.md5Email) + '?s=100&d=retro"/></div> ' +
        '<span class="date">' + moment(newPost.postedAt).fromNow() + '</span><p>' + escapeHtml(newPost.message) + '</p></div>');
}

// Add a realtime listener
firebase.auth().onAuthStateChanged(function (firebaseUser) {
    if (firebaseUser) {
        console.log(firebaseUser);
        userEmail = firebaseUser.email;
        console.log(userEmail);
        // Hide login cover
        $(".login-cover").hide();

        var dialog = document.querySelector('#loginDialog');
        if (!dialog.showModal) {
            dialogPolyfill.registerDialog(dialog);
        }
        dialog.close();

        // "set info" after choosing an event card
        $(document).on("click", ".event_select_item", function () {
            event.preventDefault();
            //console.log($(this)) - that's another way to get info;
            var eventTitle = this.getAttribute("data-event_title");
            $("#event_comment_window").text(eventTitle);
            var eventID = this.getAttribute("data-event_id");
            $("#event_comment_details h5").text(eventID)
            var alreadyClicked = false;


            $('.comment').remove()

            if (eventPostsRef) {
                eventPostsRef.off("child_added", handleNewBlogPost);
            }
            eventPostsRef = database.ref('events').child(eventID).child('blog');
            eventPostsRef.on("child_added", handleNewBlogPost);

            database.ref('events/' + eventID).once('value', function (snapshot) {

                var response = snapshot.val();
                console.log(response);
                for (var key in response) {
                    console.log('firing');
                    var record = response[key].email;
                    if (record === userEmail) {
                        console.log('firing2');
                        alreadyClicked = true;
                        break;
                    }

                }
                if (alreadyClicked === false) {
                    console.log('firing3');
                    // Push data to database
                    database.ref('events/' + eventID).push({
                        email: userEmail
                    });
                }
            })



            database.ref('events/' + eventID).once('value', function (snapshot) {
                $('#event_comment_users').text('');
                var response = snapshot.val();
                console.log(response);
                for (var key in response) {
                    var record = response[key].email;
                    console.log(record);
                    x = $('<p>').append(record)

                    $('#event_comment_users').append(x);
                }
            });


        });

        //show the info from this event 
        //var eventLength = eventsRef.users.length;
        //var newEventKey = eventLength + 1
        //if true -
        //for loop to check if user details is in the event
        //    if false -
        //    push user details on this event
        // eventsRef.push({
        //     users: { newEventKey: email }
        // });
        //    show the info from this event

        //    if true -
        //    show the info from this event


    } else {
        $(".login-cover").show();
        var dialog = document.querySelector('#loginDialog');
        if (!dialog.showModal) {
            dialogPolyfill.registerDialog(dialog);
        }
        dialog.showModal();
    }

});

$('#loginBtn').click(function () {
    var email = $('#loginEmail').val();
    var password = $('#loginPassword').val();

    if (email != "" && password != "") {
        $('#loginProgress').show();
        $('#loginBtn').hide();

        firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
            $('#loginError').show().text(error.message);
            $('#loginProgress').hide();
            $('#loginBtn').show();
        })

    }
})

// Comments

$("#event-comment-btn").on("click", function (element) {
    event.preventDefault();

    eventIDforComment = $("#event_comment_details h5")[0].innerHTML;
    var userMessage = $("#message").val();
    var userName = $("#name").val();
    var userEmail = $("#email").val();

    var eventPostsRef = database.ref('events/' + eventIDforComment);
    postRef = eventPostsRef.child(slugify(window.location.pathname));

    eventPostsRef.child("/blog/").push({
        name: userName,
        message: userMessage,
        md5Email: md5(userEmail),
        postedAt: Firebase.ServerValue.TIMESTAMP
    });

    $("input[type=text], textarea").val("");
});