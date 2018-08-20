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
    console.log(date);
    // API url for city + date search:
    var queryURL = "https://api.seatgeek.com/2/events?venue.city=" + city + "&datetime_local.gt=" + date + "&client_id=MTE1ODQyMjB8MTUzNDQzNTkwNi4wMw";

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

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {

        console.log(response);
        for (var i = 0; i < response.events.length; i++) {

            var eventDate = response.events[i].datetime_local;
            var fixEventDate = fixTheDateAndTime(eventDate);
            var eventTitle = response.events[i].title;
            var eventID = response.events[i].id;

            $("#event_select_container").append(
                `<div class="card event_select_item" style="width: 16rem;">
                  <img class="card-img-top" src="http://via.placeholder.com/250x130" alt="Card image cap">
                  <div class="card-body">
                      <h5 class="card-title">${eventTitle}</h5>
                      <h6 class="card-subtitle mb-2 text-muted">${fixEventDate}</h6>
                      <p class="card-text">${eventID}</p>
                      <a href="#" class="btn btn-primary">Pick event</a>
                  </div>
              </div>`
            )
        }
    });

});



// ==================================================================
// Firebase
var dataRef = firebase.database();

// Get Elements
const txtEmail = document.getElementById("txtEmail");
const txtPassword = document.getElementById("txtPassword");
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

    // Push data to database
    dataRef.ref('users/').push({
        email: email,
    });

    //Sign in
    const promise = auth.createUserWithEmailAndPassword(email, pass);


})

// Signout
btnLogout.addEventListener('click', function (e) {
    firebase.auth().signOut();
})

// Add a realtime listener
firebase.auth().onAuthStateChanged(function (firebaseUser) {
    if (firebaseUser) {
        console.log(firebaseUser);
        $('#btnLogout').show()

    } else {
        console.log('not logged in');
        $('#btnLogout').hide();
    }
})

// Data for events
// add click event for liked events and store event to database

// $("#event_select_item").on("click", function (event) {
//     event.preventDefault();


//     // Code in the logic for storing and retrieving the most recent user.
//     // Don't forget to provide initial data to your Firebase database.
//     eventTitle = $("#data-")
//     UID = $("#data-")


//     // Code for the push
//     dataRef.ref("events/").push({
//         eventTitle: eventTitle,
//         UID: UID,
//         dateAdded: firebase.database.ServerValue.TIMESTAMP
//     });
// });

// ====================================================


// =============================================================









