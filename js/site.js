const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const personName = "Nick"

var weatherData

updateData()
setInterval(updateDivs, 1000)
setInterval(updateData, 1000)

function updateDivs(){
    updateGreeting()
    updateDates()
    updateWeatherDivs()
}

function updateGreeting(){
    var today = new Date()
    var text
    var hours = today.getHours()
    if(hours <= 11){
        text = "Good Morning, " + personName
    }
    else if(hours >= 12 && hours <= 17){
        text = "Good Afternoon, " + personName
    }
    else{
        text = "Good Evening, " + personName
    }
    var greetingDivs = document.getElementsByClassName("welcome-message")
    greetingDivs[0].innerHTML = text
}

function updateDates(){
    var todaysDateDivs = document.getElementsByClassName("date")
    var futureDateDivs = document.getElementsByClassName("date-future")
    var today = new Date()
    todaysDateDivs[0].innerHTML = prettyDate(today, true)
    var currentDate = today
    for(var i=0; i<futureDateDivs.length; i++){
        currentDate = nextDate(currentDate)
        futureDateDivs[i].innerHTML = prettyDate(currentDate, false)
    }
}

function prettyDate(date, withYear){
    var dayName = days[date.getDay()]
    var monthName = months[date.getMonth()]
    var year = date.getFullYear()
    var date = date.getDate()
    var pretty = `${dayName}, ${date} ${monthName}`
    if(withYear){
        pretty = pretty + " " + year
    }
    return pretty
}

function nextDate(date){
    var nextDate = new Date(date)
    nextDate.setDate(date.getDate() + 1)
    return nextDate
}

function updateData(){
    $.ajax({
        url: 'apirequest.php',
        type: 'GET',
        dataType: 'json',
    })
    .done(function (result) { weatherData = result })
}


function updateWeatherDivs(){
    if(weatherData != null){
        var tempDivs = document.getElementsByClassName("status")
        var windDivs = document.getElementsByClassName("wind")
        var precipDivs = document.getElementsByClassName("precip")
        var lowDivs = document.getElementsByClassName("low")
        var highDivs = document.getElementsByClassName("high")
        var date = new Date()
        for(var i=0;i<tempDivs.length;i++){
            var [temp, minTemp, maxTemp, windSpeed, precip, conditionCode] = extractData(date, weatherData)
            windDivs[i].innerHTML = `${String(metersPerSecToMilesPerHour(windSpeed).toFixed(0))}<small style="font-size:20px">mph</small>`
            precipDivs[i].innerHTML = String(precip * 100) + "%"
            lowDivs[i].innerHTML = String(kelvinToCelcius(minTemp).toFixed(0)) + "&#176;"
            highDivs[i].innerHTML = String(kelvinToCelcius(maxTemp).toFixed(0)) + "&#176;"
            tempDivs[i].innerHTML = getStatusHtml(String(conditionCode), String(kelvinToCelcius(temp).toFixed(1)))
            date = nextDate(date)
        }
    }
    
}

function metersPerSecToMilesPerHour(mps){
    return mps * 2.23694
}

function kelvinToCelcius(kelvinTemp){
    return kelvinTemp-273.15
}

function getStatusHtml(conditionCode, temp){
    var tempHtml = temp + "&#176;"
    var icon
    switch (conditionCode.charAt(0)){
        case '2':
            //Thunder
            icon = "wi-lightning"
            break;
        case '3':
            //Drizzle
            icon = "wi-showers"
            break;
        case '5':
            //Rain
            icon = "wi-rain"
            break;
        case '6':
            //Snow
            icon = "wi-snow"
            break;
        case '7':
            //Atmosphere
            //Ignore
            icon = "wi-day-cloudy"
            break;
        case '8':
            //Clouds
            if(conditionCode == "800"){
                //Clear
                icon = "wi-day-sunny"
                break;
            }
            icon = "wi-cloudy"
            //Clouds
            break;
    }
    return `<i class=\"wi ${icon}\"></i> ${tempHtml}`
}

function extractData(date, data){
    var minTemp = Number.POSITIVE_INFINITY
    var maxTemp = Number.NEGATIVE_INFINITY
    var temp
    var windSpeed
    var precip
    var conditionCode
    var today = new Date()
    const datesAreOnSameDay = (first, second) =>
        first.getFullYear() === second.getFullYear() &&
        first.getMonth() === second.getMonth() &&
        first.getDate() === second.getDate();
    for(var i=0;i<data.list.length;i++){
        var tempDate = new Date(data.list[i].dt_txt)
        if(datesAreOnSameDay(tempDate, date)){
            if(data.list[i].main.temp < minTemp){
                minTemp = data.list[i].main.temp
            }
            if(data.list[i].main.temp > maxTemp){
                maxTemp = data.list[i].main.temp
            }
            if(!datesAreOnSameDay(today, tempDate) && tempDate.getHours() == 12){
                temp = data.list[i].main.temp
                windSpeed = data.list[i].wind.speed
                precip = data.list[i].pop
                conditionCode = data.list[i].weather[0].id
            }
        }
    }
    if(datesAreOnSameDay(today, date)){
        temp = data.list[0].main.temp
        windSpeed = data.list[0].wind.speed
        precip = data.list[0].pop
        conditionCode = data.list[0].weather[0].id
    }
    return [temp, minTemp, maxTemp, windSpeed, precip, conditionCode]
}
