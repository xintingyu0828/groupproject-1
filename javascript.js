// From: https://getbootstrap.com/docs/4.0/components/forms/
// This is the Bootstrap that haldles the "Event Search Card" buttons
// Example starter JavaScript for disabling form submissions if there are invalid fields
(function() {
    'use strict';
    window.addEventListener('load', function() {
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.getElementsByClassName('needs-validation');
        // Loop over them and prevent submission
        var validation = Array.prototype.filter.call(forms, function(form) {
            form.addEventListener('submit', function(event) {
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);
})();

// API url for city + date search:
$("")


var queryURL = "https://api.seatgeek.com/2/events?venue.city=" + +"&datetime_utc=2018-08-25&client_id=MTE1ODQyMjB8MTUzNDQzNTkwNi4wMw";

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
    } else {
        newTime = newTime + " AM";
        return newDate + ", " + newTime;
    };
};

$.ajax({
    url: queryURL,
    method: "GET"
}).then(function(response) {

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

//Event Image API Code @cici

var searchEvnent;
var giphyKey = "dc6zaTOxFJmzC";

queryURL = "https://api.giphy.com/v1/gifs/search?q=" + searchEvent + "&limit=1" + "&api_key=dc6zaTOxFJmzC";
console.log(queryURL);
$.ajax({ url: queryURL, method: 'GET' }) // i am limiting only 1 picture each time
    .then(function(response) {
        console.log(response.data);
        for (var i = 0; i < response.data.length; i++) {
            console.log(response.data[i]);

            // $('.cardheader').append(" " + response.data[i].rating.toUpperCase())
            // we will decide how to append the response later 
        }

    });



Collapse  Message Input


Message @Erandro