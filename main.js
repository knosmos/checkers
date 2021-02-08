rows = 8;
// Blue on top, red on bottom
blue = [
    [0,0],[2,0],[4,0],[6,0],
    [1,1],[3,1],[5,1],[7,1],
    [0,2],[2,2],[4,2],[6,2]
]

red = [
    [1,7],[3,7],[5,7],[7,7],
    [0,6],[2,6],[4,6],[6,6],
    [1,5],[3,5],[5,5],[7,5]
]
/*red = [
    //[1,7],[3,7],[5,7],[7,7],
    [1,5],[3,5],[5,5],[7,5],
    [1,3],[3,3],[5,3],[7,3],
]*/

const urlParams = new URLSearchParams(window.location.search);
var player = parseInt(urlParams.get('p')); // red = 0, blue = 1
var code = urlParams.get('code');

board = document.getElementById("board");
//document.getElementById("turn").innerHTML = "pink's turn";

if (player === 1){
    board.style.transform = 'rotate(180deg)'; // board is rotated for blue    
}

let justCaptured = -1;
let prefix;
if (player === 0){prefix='r_'}
else{prefix='b_'}

let currentPlayer = 0;

function setupCheckers(){
    board.innerHTML = '<img src="assets/board.jpg" id="boardImage">';
    for (let b=0; b<blue.length; b++){
        board.innerHTML += `
        <img src="assets/blue_checker.png" class=checker id=b_${b}
        draggable=false
        style="width:${100/rows}%;
        top:${(blue[b][1]/rows)*100}%;
        left:${(blue[b][0]/rows)*100}%"
        onclick="displaySteps(this.id)">`;
    }
    for (let r=0; r<red.length; r++){
        board.innerHTML += `
        <img src="assets/red_checker.png" class=checker id=r_${r}
        draggable=false
        style="width:${100/rows}%;
        top:${(red[r][1]/rows)*100}%;
        left:${(red[r][0]/rows)*100}%" 
        onclick="displaySteps(this.id)">`;
    }
}
setupCheckers();

function removeElementsByClass(className){
    // https://stackoverflow.com/questions/4777077/removing-elements-by-class-name
    var elements = document.getElementsByClassName(className);
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
}

function pointInArray(array,point){
    return (array.filter(item => item[0]===point[0]&&item[1]===point[1]).length>0)
}

function getMoves(id){
    // calculates the available moves for a certain checker
    // kings have not been implemented yet.
    let possibleMoves;
    let val = parseInt(id.split('_').pop());
    if (player === 0 && currentPlayer === 0){
        if (id[0] === 'r'){
            let x = red[val][0];
            let y = red[val][1];
            possibleMoves = [
                [x-1,y-1], // red moves "up"
                [x+1,y-1]
            ];
            if (red[val].length>2){ // King
                possibleMoves = [
                    [x-1,y-1],[x+1,y-1],[x+1,y+1],[x-1,y+1]
                ]
            }
        }
    }
    if (player === 1 && currentPlayer === 1){
        if (id[0] === 'b'){
            let x = blue[val][0];
            let y = blue[val][1];
            possibleMoves = [
                [x-1,y+1],
                [x+1,y+1]
            ]
            if (blue[val].length>2){ // King
                possibleMoves = [
                    [x-1,y-1],[x+1,y-1],[x+1,y+1],[x-1,y+1]
                ]
            }
        }
    }
    let res = [];
    if (possibleMoves){
        for (let i of possibleMoves){
            if (i[0]<rows && 0<=i[0] && 0<=i[1] && i[1]<rows){
                if (!pointInArray(red,i)&&!pointInArray(blue,i)){
                    res.push(i);
                }            
            }
        }        
    }
    return res;
}    

function displayMoves(id){
    // Add ghosts, if positions are not obstructed
    removeElementsByClass("ghost"); // First remove all existing ghosts
    let possibleMoves = getMoves(id);
    let val = parseInt(id.split('_').pop());
    if (possibleMoves){
        for (let possibleMove of possibleMoves){
            board.innerHTML += `
            <img class="ghost" src="assets/ghost.png"
            draggable=false
            style="width:${100/rows}%;
            top:${possibleMove[1]/rows*100}%;
            left:${possibleMove[0]/rows*100}%"
            onclick="move(${val},${possibleMove[0]},${possibleMove[1]});justCaptured=-1;nextTurn();">`;
        }        
    }
}

function getCaptures(id){
    // gets the available capture points for any point.
    let possibleMoves;
    let captureLocations;
    let val = parseInt(id.split('_').pop());
    if (player === 0){
        if (id[0] === 'r'){
            let x = red[val][0];
            let y = red[val][1];
            if (x==-2){return [];}
            possibleMoves = [
                [x-2,y-2], // red moves "up"
                [x+2,y-2]
            ];
            captureLocations = [
                [x-1,y-1],
                [x+1,y-1]
            ]
            if (red[val].length>2){ // King
                possibleMoves = [
                    [x-2,y-2],[x+2,y-2],[x+2,y+2],[x-2,y+2]
                ]
                captureLocations = [
                    [x-1,y-1],[x+1,y-1],[x+1,y+1],[x-1,y+1]
                ]
            }
        }
    }
    else{
        if (id[0] === 'b'){
            let x = blue[val][0];
            let y = blue[val][1];
            if (x==-1){return [];}
            possibleMoves = [
                [x-2,y+2],
                [x+2,y+2]
            ]
            captureLocations = [
                [x-1,y+1],
                [x+1,y+1]
            ]
            if (blue[val].length>2){ // King
                possibleMoves = [
                    [x-2,y-2],[x+2,y-2],[x+2,y+2],[x-2,y+2]
                ]
                captureLocations = [
                    [x-1,y-1],[x+1,y-1],[x+1,y+1],[x-1,y+1]
                ]
            }
        }
    }
    let res = [];
    if (possibleMoves){
        for (let j=0; j<possibleMoves.length; j++){
            let i = possibleMoves[j];
            let k = captureLocations[j];
            if (i[0]<rows && 0<=i[0] && 0<=i[1] && i[1]<rows){
                if (!pointInArray(red,i)&&!pointInArray(blue,i)){
                    if ((pointInArray(red,k)&&player===1)||(pointInArray(blue,k)&&player===0)){
                        let captured;
                        if (player===0){
                            captured = blue.findIndex(item => item[0]===k[0]&&item[1]===k[1]);
                        }
                        else{
                            captured = red.findIndex(item => item[0]===k[0]&&item[1]===k[1]);
                        }
                        res.push([i,captured]);
                    }
                }            
            }
        }        
    }
    //console.log("captures: ",res,id)
    return res;
}

function displayCaptures(id){
    removeElementsByClass("ghost"); // First remove all existing ghosts
    let res = getCaptures(id);
    let val = parseInt(id.split('_').pop());
    if (res){
        for (let m of res){
            board.innerHTML += `
            <img class="ghost" src="assets/ghost.png"
            draggable=false
            style="width:${100/rows}%;
            top:${m[0][1]/rows*100}%;
            left:${m[0][0]/rows*100}%"
            onclick="move(${val},${m[0][0]},${m[0][1]});capture(${val},${m[1]});">`;
        }        
    }
}

function move(val,x,y){
    if (player == 0){
        if (red[val].length>2){
            red[val] = [x,y,1];
        }
        else{
            red[val] = [x,y];
            if (y == 0){
                red[val].push(1);
            }            
        }
    }
    if (player == 1){
        if (blue[val].length>2){
            blue[val] = [x,y,1];
        }
        else{
            blue[val] = [x,y];
            if (y == rows-1){
                blue[val].push(1);
            }            
        }
    }
    updateBoard();
    sendUpdate();
    removeElementsByClass("ghost");
}

function capture(piece,val){
    if (player === 0){
        blue[val] = [-1,-1];
    }
    if (player === 1){
        red[val] = [-1,-1];
    }
    updateBoard();
    removeElementsByClass("ghost");
    justCaptured = prefix+piece;
    console.log(justCaptured);
    sendUpdate();
    if (getCaptures(justCaptured).length==0){
        justCaptured = -1;
        console.log("no jump");
        nextTurn();
    }
}

function displaySteps(id){
    // Is it not possible for the piece that just captured to capture another piece?
    if (player == currentPlayer){
        if (justCaptured==id){
            if (getCaptures(id).length>0){
                console.log("double jump!");
                displayCaptures(id);
            }
        }
        else if (justCaptured==-1 || getCaptures(justCaptured).length==0){
            // Can we capture a piece?
            if (getCaptures(id).length>0){
                displayCaptures(id);
            }
            else{
                // Is there another piece that can capture?
                let other = false;          
                for (let i=0;i<blue.length;i++){
                    //console.log(i);
                    if (getCaptures(prefix+i).length>0){
                        other = true;
                        console.log('cannot move, other piece has capture');
                        document.getElementById('turn').innerHTML = 'cannot move, other piece has capture';
                    }
                }
                if (!other){
                    // Otherwise, we can move our piece.
                    displayMoves(id);  
                }
            }        
        }
    }
}

function updateBoard(){
    // Redraws the board.
    for (let b=0; b<blue.length; b++){
        checker = document.getElementById("b_"+b);
        if (player === 1){
            checker.style.transform = "rotate(180deg)";
        }
        if (blue[b][0] === -1){
            checker.style.display='none';
            continue;
        }
        else{checker.style.display='block'}
        checker.style.left = `${blue[b][0]/rows*100}%`;
        checker.style.top = `${blue[b][1]/rows*100}%`;
        if (blue[b].length > 2){
            checker.src = "assets/blue_checker_king.png";
        }
    }
    for (let r=0; r<red.length; r++){
        checker = document.getElementById("r_"+r);
        if (player === 1){
            checker.style.transform = "rotate(180deg)";
        }
        if (red[r][0] === -1){
            checker.style.display='none';
            continue;
        }
        else{checker.style.display='block'}
        checker.style.left = `${red[r][0]/rows*100}%`;
        checker.style.top = `${red[r][1]/rows*100}%`;
        if (red[r].length > 2){
            checker.src = "assets/red_checker_king.png";
        }
    }
    checkWin();
}

function checkWin(){
    let redWin = true;
    let blueWin = true;
    for (let r of red){
        if (r[0] != -1){
            blueWin = false;
        }
    }
    for (let b of blue){
        if (b[0] != -1){
            redWin = false;
        }
    }
    if (redWin && !blueWin){
        document.getElementById('turn').innerHTML = "Pink Won!";
    }
    if (blueWin && !redWin){
        document.getElementById('turn').innerHTML = "Blue Won!";
    }
}

let updateInterval;

function nextTurn(){
    let message;
    if (player === 0){
        currentPlayer = 1;
        message = "blue's turn";
    }
    else if (player === 1){
        currentPlayer = 0;
        message = "pink's turn";
    }
    //document.getElementById("turn").innerHTML = message;
    sendUpdate();
    updateInterval = setInterval(getUpdate,500);
}

function sendUpdate(){
    sendPost("send",{"code":code,"player":currentPlayer,"0":red,"1":blue});
}

function getUpdate(){
    let data = sendPost("get",{"code":code});
    console.log("data",data)
    data = JSON.parse(data);
    currentPlayer = data["player"];
    red = data["0"];
    blue = data["1"];
    updateBoard();
    if (currentPlayer == player){
        clearInterval(updateInterval);
    }
}

if (currentPlayer != player){
    updateInterval = setInterval(getUpdate,500);
}
