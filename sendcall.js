// sends a request to server and returns the result.
server_url = 'https://bottlecap-checkers.herokuapp.com/';

/*function sendPost(url,data){
    return fetch(server_url+url, {method: "POST", body: JSON.stringify(data)});
}*/

function sendGet(url){
    return fetch(url, {method: "GET"});
}

function sendPost(url,data){
    let xhttp = new XMLHttpRequest();
    let resp;
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            resp = this.responseText;
        }
    };
    xhttp.open("POST", server_url+url, false);
    xhttp.send(JSON.stringify(data));
    return resp;
}
