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


/*creates event based on show title*/
function addEvent(title){
  let time = new Date (document.getElementById('time'));
  let mm = new Date().getMonth();
  let yyyy =  new Date().getFullYear();
  let fullTime = `${yyyy}-${mm}-31`;
  let hours = time.getHours();
  let minutes = time.getMinutes();
  let event = {
    'summary': title,
    'description': 'New episode of '+ title,
    'start': {
      'timeZone':'Asia/Tokyo',
      'dateTime': `${fullTime}'T'${hours}':'${minutes}:00`,
    },
    'end': {
      'timeZone':'Asia/Tokyo',
      'dateTime': `${fullTime}'T'${hours}':'${minutes + 30}:00`,
    },
  };
  
  let request = gapi.client.calendar.events.insert({
    'calendarId': 'primary',
    'resource': event
  });
  
  request.execute(function(event) {
    alert('Event created: ' + event.htmlLink);
  });
  
}

