// Client ID and API key from the Developer Console

var CLIENT_ID = '123719781126-9t3aeu9ksvmhjfndg99ugqq6l9e4mtn0.apps.googleusercontent.com';
var API_KEY = 'AIzaSyDQLk8Nn98BH0poDi0q481A-wIbT0slWsc';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/calendar.events";

var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
  }, function(error) {
    console.log(error, null, 2);
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}


/* Creates event based on show title. */
function addEvent(title){
  title =  title.split(','); //Create array to seperate time and title
  let time = title[1]; //[0] is title, [1] is time
  time = time.slice(0,6) + ',' + time.slice(6); //Insert ',' to get right time format
  time = new Date(time);
  let nbEp = parseInt(title[2]);
  /** 
   * Get dates of current week and store it in an array. 
   */
  let curr = new Date(); 
  let week = [];
  for (let i = 1; i <= 7; i++) {
    let first = curr.getDate() - curr.getDay() + i; 
    let day = new Date(curr.setDate(first)).toISOString().slice(0, 10);
    week.push(day);
  }
  /**
   *  Use what day it was premiered on to get this weeks matching day.
   */
  let premiereDate = new Intl.DateTimeFormat('en-US', {weekday:'long'} ).format(new Date(title[1])); 
  let initDate = week.find(function (element){
    return new Intl.DateTimeFormat('en-US', {weekday:'long'} ).format(new Date(element)) === premiereDate;
  });
  let endDate = function () {
    if(title[2] !== '?'){
      let timeDiff = Math.abs(time.getTime()-new Date().getTime());
      let dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      let timeLeft = nbEp * 7 - dayDiff + 1;
      Date.prototype.addDays = function(days){
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
      }
      return new Date(initDate).addDays(timeLeft).toISOString().slice(0,10);
    } if(title[2] === '?') {
      Date.prototype.addDays = function(days){
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
      }
      return new Date(initDate).addDays(12*7+1).toISOString().slice(0,10); //12 weeks
    }
  }
  console.log(endDate());
  /**
   *  Gets hour and minute of broadcast, => start of event, +30 min end of event.
   */
  let hours = time.getHours();
  let minutes = time.getMinutes();
  //Handle 30 min additions
  function hourAndMin(h, m){
    if (m + 30 > 60 ){
      h ++;
      m = (m+30)-60;
      console.log(h, m);
      return `${h}:${m}:00`;
    } if (m + 30 === 60){
      if (h === 23) {
        h = '00';
        m = '00';
        console.log(`${h}:${m}:00`)
        return `${h}:${m}:00`;
      } else {
      h ++;
      m = '00';
      console.log(`${h}:${m}:00`)
      return `${h}:${m}:00`;
      }
    } else {
      return `${h}:${m+30}:00`;
    }
  }

  // Function to check if the show ends the following day
  let initDateFunction = function(midnight){
    if (midnight === '00:00:00') {
      return week[week.indexOf(initDate)+1];
    } else {
      return initDate;
    }
  }
  let timeDiff = Math.abs(time.getTime()-new Date().getTime());
  let dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 7));
  let epsLeft = nbEp - dayDiff;
  /* Creates the Google Calendar event. */
  let event = {
    'summary': title[0],
    'colorId': '2',
    'description': 'New episode of '+ title[0],
    'start': {
      'dateTime': `${initDate}T${hours}:${minutes}:00`,
      'timeZone': 'Asia/Tokyo'
    },
    'end': {
      'dateTime': `${initDateFunction(hourAndMin(hours,minutes))}T${hourAndMin(hours,minutes)}`,
      'timeZone': 'Asia/Tokyo'
    },
    'recurrence': [
      `RRULE:FREQ=WEEKLY;UNTIL=${endDate().replace(/-/gi,'')}`
    ],
  };
  
  let request = gapi.client.calendar.events.insert({
    'calendarId': 'primary',
    'resource': event
  });
  //Instead of alerts do modals.
  request.execute(function(event) {
    if (event.htmlLink === undefined){
      alert('Please sign in with Google first.')
    } else {
      if (title[2] !== '?' && epsLeft > 1){
        alert(`Event created in your Google Calendar on ${premiereDate}s (JST) \nTitled ${title[0]} \nfor ${epsLeft} weeks.`);
      } else {
        alert(`Event created in your Google Calendar on ${premiereDate}s (JST) \nTitled ${title[0]} \nfor 12 weeks.`);
      }
    }
  });
  
}

