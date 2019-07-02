const malScraper = require('mal-scraper');
const $ = require('jquery')

// Current month and year variablles for the getSeason function
let time = new Date();

let yyyy = time.getFullYear();

function currentSeason(month){
    switch(month) {
        case 1:
        case 2:
        case 3:
            return 'winter';
        break;
        case 4:
        case 5:
        case 6:
            return 'spring';
        break;
        case 7:
        case 8:
        case 9:
            return 'summer';
        break;
        case 10: 
        case 11:
        case 12:
            return 'fall';
        break;
    }
}
let season = currentSeason(time.getMonth() + 1);

//Scraping MAL website with mal-scraper module to get current season data model. 

/*Loop through the returned data object and call properties:
  data["title"]
  data["link"]
  data["picture"]
   
  "done" is a html string of the created columns and cards for each entry. 
*/
$(document).ready(function() {
const dataOut = malScraper.getSeason(yyyy,season).then(function cardCreator(data){
        let obj = data['TV'];
        let html = "";
        let count = Object.keys(obj).length;
        //Filter by best rated shows.
        obj.sort((a, b) => (Number(a['members']) > Number(b['members'])) ? -1 : 1);
        //Iterate through the obj and create cards for html.
        for (let i= 0;i < count;i++) {
            if (obj[i]['releaseDate'].length === 24){
            let date = obj[i]['releaseDate'].slice(0,-6).replace(/,/gi,'');
            let day = new Intl.DateTimeFormat('en-US', {weekday:'long'} ).format(new Date(date));
            let dateTitle = [obj[i]['title'],date,obj[i]['nbEp']]
            if(obj[i]['score'] !== 'N/A' && date.length > 10){
            html += `<div class="column">
                        <div class="card">
                            <a id="link" href= "${obj[i]['link']}">
                            <img id="img" src="${obj[i]['picture']}">
                            </a>
                            <p id="title" >${obj[i]['title']}</p>
                            <p id="day">${day}s (JST)</p>
                            <p id="time" style="display: none;">${date}</p>
                            <button class="addbutton" id="${dateTitle}" onClick="addEvent(this.id)">Add</button>
                        </div>
                    </div>`;
            }}
        }
        //console.log(html.length); // Remove '//' to test
        $(".container").append(html);
    }).catch((err) => console.log(err));
});

// CORS & CORB fix
(function() {
    var cors_api_host = 'cors-anywhere.herokuapp.com';
    var cors_api_url = 'https://' + cors_api_host + '/';
    var slice = [].slice;
    var origin = window.location.protocol + '//' + window.location.host;
    var open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        var args = slice.call(arguments);
        var targetOrigin = /^https?:\/\/([^\/]+)/i.exec(args[1]);
        if (targetOrigin && targetOrigin[0].toLowerCase() !== origin &&
            targetOrigin[1] !== cors_api_host) {
            args[1] = cors_api_url + args[1];
        }
        return open.apply(this, args);
    };
})();
    
