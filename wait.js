function makeid(length) {
    // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    var result           = '';
    var characters       = 'abcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

let code = makeid(5);
sendPost('create',{'code':code});
document.getElementById('code').innerHTML = code;

function hasGameStarted(){
    let resp = sendPost('gamestarted',{'code':code})
    console.log(resp);
    if (resp=="yes"){
        location.href="main.html?p=0&code="+code;
    }
}
setInterval(hasGameStarted,1000);