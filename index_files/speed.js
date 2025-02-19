"use strict";

function handleGPSInfo(position){
    // Handle GPS location updates here
    let speed = position.coords.speed;  // set speed variable to store current speed, used to change html speed text
    let localSpeedUnit = '';

    fetch("https://devweb2024.cis.strath.ac.uk/aes02112-nodejs/speed?lat=" + position.coords.latitude + "&lon=" + position.coords.longitude)
    //fetch("https://devweb2024.cis.strath.ac.uk/aes02112-nodejs/speed?lat=48.8575&lon=2.3514")
        .then(response => response.json()
            .then(json => {
                if (json.status === "OK") {
                    localSpeedUnit = json.localSpeedUnit;

                    if (localSpeedUnit != localStorage.getItem('units') && localStorage.getItem('units') != "local") {
                        if (localSpeedUnit === "kph") {
                            json.localSpeedLimit /= 1.609;
                            json.localSpeedLimit = Math.round(json.localSpeedLimit);

                        } else {
                            json.localSpeedLimit *= 1.609;
                            json.localSpeedLimit = Math.round(json.localSpeedLimit);

                        }
                    }

                    document.getElementById('street').innerText = json.name;
                    document.getElementById('localLimit').innerText = json.localSpeedLimit;

                    if (localStorage.getItem('units') === "local") {
                        document.getElementById('unit').innerText = localSpeedUnit.toUpperCase();
                    }

                } else {
                    document.getElementById('street').innerText = "--";
                    document.getElementById('localLimit').innerText = "--";
                    console.log("Error: Current latitude and longitude does not have a corresponding street / speed limit");
                }
            })
        )
        .catch(error => console.log(error));

    if (speed == null) {    // if not moving, set speed to be dashes
        document.getElementById('speed').innerText = "--";
        return;
    } else {                // if moving, convert speed to mph
        if (localStorage.getItem('units') === "mph") {
            speed *= 2.23694;
        } else if (localStorage.getItem('units') === "kph") {
            speed *= 3.6;
        } else {
            if (document.getElementById("unit").innerText === "MPH") {
                speed *= 2.23694;
            } else if (document.getElementById("unit").innerText === "KPH") {
                speed *= 3.6;
            } else {
                document.getElementById('speed').innerText = "--";
                return;
            }
        }

        speed = Math.round(speed);
        document.getElementById('speed').innerText = speed;

        if ((document.getElementById('localLimit').innerText - speed) < 0) {
            document.getElementById('speed').style.color = "red";
        } else if ((document.getElementById('localLimit').innerText - speed) <= 5) {
            document.getElementById('speed').style.color = "orange";
        } else {
            document.getElementById('speed').style.color = localStorage.getItem("text_colour");
        }

    }

}

function GPSError(error) {
    console.log("Geolocation Error: ", error);
}



function unitMPH() {
    localStorage.setItem("units", "mph");
    document.getElementById('unit').innerText = "MPH";
}

function unitKPH() {
    localStorage.setItem("units", "kph");
    document.getElementById('unit').innerText = "KPH";
}

function unitLocal() {
    localStorage.setItem("units", "local");
    document.getElementById('unit').innerText = "--";
}


function limitLeft() {
    localStorage.setItem("limit_pos", "limit_left");
    document.getElementById("roadSign").style.position = "absolute";
    document.getElementById("roadSign").style.bottom = "5px";
    document.getElementById("roadSign").style.removeProperty('right');
    document.getElementById("roadSign").style.left = "5px";

}

function limitRight() {
    localStorage.setItem("limit_pos", "limit_right");
    document.getElementById("roadSign").style.position = "absolute";
    document.getElementById("roadSign").style.bottom = "5px";
    document.getElementById("roadSign").style.removeProperty('left');
    document.getElementById("roadSign").style.right = "5px";

}



window.matchMedia("(orientation: portrait)").addEventListener("change", e=>{

    const portrait = e.matches;

    if (portrait) {
        showSettings();
    } else hideSettings();

});



function showSettings() {
    document.body.style.backgroundColor = "#000000";
    document.body.style.backgroundImage = "";
    document.getElementById("speedometer").style.display = "none";
    document.getElementById("settings").style.display = "block";
}

function hideSettings() {
    document.body.style.backgroundColor = localStorage.getItem("back_colour");
    document.body.style.backgroundImage = "url('" + localStorage.getItem("back_image") + "')";
    document.getElementById("settings").style.display = "none";
    document.getElementById("speedometer").style.display = "block";
}



function backgroundColourChange() {
    localStorage.setItem("back_colour", document.getElementById("back_colour").value);
    //document.body.style.backgroundColor = localStorage.getItem("back_colour");
}

function textColourChange() {
    localStorage.setItem("text_colour", document.getElementById("text_colour").value);
    document.getElementById("speed").style.color = localStorage.getItem("text_colour");
    document.getElementById("unit").style.color = localStorage.getItem("text_colour");
    document.getElementById("street").style.color = localStorage.getItem("text_colour");
}

function imageChange() {
    localStorage.setItem("back_image", document.getElementById("back_image").value);
    //document.body.style.backgroundImage = "url('" + localStorage.getItem("back_image") + "')";
}



function init(){
    // Do any initialisation here
    if (navigator.geolocation)
        navigator.geolocation.watchPosition(handleGPSInfo, GPSError, { enableHighAccuracy: true });
    else
        alert("Geolocation is not supported by your browser.");

    document.body.style.backgroundPosition = "center";
    document.documentElement.style.height = "100%";
    document.body.style.height = "100vh";
    document.body.style.overflow = "hidden";

    if (!localStorage.getItem('units')) {
        localStorage.setItem('units', 'local');
        document.getElementById('local').checked = true;
        document.getElementById('unit').innerText = "--";

    } else {
        document.getElementById(localStorage.getItem('units')).checked = true;

        if (localStorage.getItem('units') === "local") {
            document.getElementById('unit').innerText = "--";

        } else {
            document.getElementById('unit').innerText = localStorage.getItem('units').toUpperCase();

        }
    }

    if (!localStorage.getItem('limit_pos')) {
        localStorage.setItem("limit_pos", "limit_right");
        document.getElementById("roadSign").style.position = "absolute";
        document.getElementById("roadSign").style.bottom = "5px";
        document.getElementById("roadSign").style.right = "5px";
        document.getElementById("limit_right").checked = true;
    } else {
        document.getElementById(localStorage.getItem('limit_pos')).checked = true;
        if (localStorage.getItem('limit_pos') === "limit_right") {
            document.getElementById("roadSign").style.position = "absolute";
            document.getElementById("roadSign").style.bottom = "5px";
            document.getElementById("roadSign").style.right = "5px";
        } else {
            document.getElementById("roadSign").style.position = "absolute";
            document.getElementById("roadSign").style.bottom = "5px";
            document.getElementById("roadSign").style.left = "5px";
        }
    }

    if (!localStorage.getItem("back_colour")) {
        localStorage.setItem("back_colour", "#000000");
        document.body.style.backgroundColor = localStorage.getItem("back_colour");
    } else {
        document.body.style.backgroundColor = localStorage.getItem("back_colour");
        document.getElementById("back_colour").value = localStorage.getItem("back_colour");
    }

    if (localStorage.getItem("back_image")) {
        document.body.style.backgroundImage = "url('" + localStorage.getItem("back_image") + "')";
        document.getElementById("back_image").value = localStorage.getItem("back_image");
        document.body.style.backgroundRepeat = "no-repeat";
        document.body.style.backgroundSize = "cover";

    }

    if (!localStorage.getItem("text_colour")) {
        localStorage.setItem("text_colour", "#FFFFFF");
        document.getElementById("text_colour").value = localStorage.getItem("text_colour");
    } else {
        document.getElementById("speed").style.color = localStorage.getItem("text_colour");
        document.getElementById("unit").style.color = localStorage.getItem("text_colour");
        document.getElementById("street").style.color = localStorage.getItem("text_colour");
        document.getElementById("text_colour").value = localStorage.getItem("text_colour");
    }

    if (window.matchMedia("(orientation: portrait)").matches) {
        showSettings();
    } else hideSettings();

}

document.addEventListener('DOMContentLoaded', init);