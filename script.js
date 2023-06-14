//setting up canvas
let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

//cells settings
let cellSize = canvas.width/10;
let emptyCellColor = "rgba(135, 147, 114, .3)";

let canvasRows = canvas.height/cellSize;
let canvasColumns = canvas.width/cellSize;

//figure setting
let defaultMovingDownSpeed = 1;
let figureColor = "black";
let inCellCentrSqureSize = 14;
let figureType = "";
let rotatingStartPositionX = 0;
let rotatingStartPositionY = 0;
let nextFigure = Math.floor(Math.random() * 7);
let toDo = "";

//figure allowance
let allowedLeft = false;
let allowedRight = false;
let allowedDown = false;
let allowedSpin = false;

//if button pressed 
let rightPressed = false;
let leftPressed = false;
let downPressed = false;
let upPressed = false;

//game status
let pause = false;
let reset = false;
let gameOver = false;
let gameOverAnimationSpeed = 20;

//game scores
let score = 0;
let clearedLines = 0;
let level = 1;

//remove complete row
let rowsToDel = [];
let cellsInColumnsCount = 0;
let remove;

//sounds
let mainTheme;
let muted = true;
let mainSound;
let moveSound;
let removeSounds;

//creating cells array
let field = [];
for(let r=0; r<canvasRows; r++){
    field[r] = [];
    for(let c=0; c<canvasColumns; c++){
        field[r][c] = {x: 0, y: 0, isCellDrawn: false, atTheBottom: false}
    }
}

    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    document.getElementById("pause_button_id").addEventListener("click", keyDownHandler);
    document.getElementById("reset_button_id").addEventListener("click", keyDownHandler);
    document.getElementById("mute_button_id").addEventListener("click", keyDownHandler);
    document.getElementById("rotate_button_id").addEventListener("click", keyDownHandler);


    document.getElementById("left_button_id").addEventListener("pointerdown", keyDownHandler);
    document.getElementById("left_button_id").addEventListener("pointerup", keyUpHandler);
    document.getElementById("right_button_id").addEventListener("pointerdown", keyDownHandler);
    document.getElementById("right_button_id").addEventListener("pointerup", keyUpHandler);
    document.getElementById("down_button_id").addEventListener("pointerdown", keyDownHandler);
    document.getElementById("down_button_id").addEventListener("pointerup", keyUpHandler);

//checking if buttons pressed if game not on a pause
function keyDownHandler(e) {
    if(!pause){
        if(e.key === "Right" || e.key === "ArrowRight" || e.currentTarget.id === "right_button_id") {
            leftPressed = false;
            downPressed = false;
            upPressed = false;
            rightPressed = true;
        }
        if(e.key === "Left" || e.key === "ArrowLeft" || e.currentTarget.id === "left_button_id") {
            rightPressed = false;
            downPressed = false;
            upPressed = false;
            leftPressed = true;
        }
        if(e.key === "Down" || e.key === "ArrowDown" || e.currentTarget.id === "down_button_id") {
            rightPressed = false;
            leftPressed = false;
            upPressed = false;
            downPressed = true;
        }
        if(e.key === "Up" || e.key === "ArrowUp" || e.key === " " || e.currentTarget.id === "rotate_button_id") {
            rightPressed = false;
            leftPressed = false;
            downPressed = false;
            upPressed = true;
        }
    }
    //if "P" pressed (pause)
    if(e.keyCode === 80 || e.currentTarget.id === "pause_button_id") {
        pause = !pause;
        gamePause();
        console.log("pause: " + pause)
    }
    //if "R" pressed (reset)
    if(e.keyCode === 82 || e.currentTarget.id === "reset_button_id") {
        gameReset();
    }
    //if "M" pressed (mute)
    if(e.keyCode === 77 || e.currentTarget.id === "mute_button_id") {
        muted = !muted;
        // gameMuted();
        console.log("mute")
        if(muted){
            document.getElementById("mute_id").classList.remove("inactive");
            document.getElementById("mute_id").classList.add("active");
        }else{
            document.getElementById("mute_id").classList.remove("active");
            document.getElementById("mute_id").classList.add("inactive");
        }

        if(!mainSound)sound();
        if(!removeSounds)sounds("remove");
        muteHandler();
    }
}

function keyUpHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight" || e.currentTarget.id === "right_button_id") {
        rightPressed = false;
    }
    if(e.key == "Left" || e.key == "ArrowLeft" || e.currentTarget.id === "left_button_id") {
        leftPressed = false;
    }
    if(e.key == "Down" || e.key == "ArrowDown" || e.currentTarget.id === "down_button_id") {
        downPressed = false;
    }
    
}

// drawing borders for empty cells
function emptyCellDrawing(y, x){
    ctx.beginPath();
    ctx.rect(x, y, cellSize, cellSize);
    ctx.fillStyle = emptyCellColor;
    ctx.fill();
    ctx.clearRect(x+(cellSize-inCellCentrSqureSize)/2, y+(cellSize-inCellCentrSqureSize)/2, inCellCentrSqureSize, inCellCentrSqureSize);
    ctx.closePath();
    
    ctx.beginPath();
    ctx.rect(x+cellSize/4, y+cellSize/4, cellSize/2, cellSize/2);
    ctx.fillStyle = emptyCellColor;
    ctx.fill();
    ctx.closePath();
}
function drawingEmptyCells(){
    for (let r = 0; r < canvasRows; r++){
        for (let c = 0; c < canvasColumns; c++){
            emptyCellDrawing(r*cellSize, c*cellSize);
        }
    }
}

//grid line
function GridLine(x, y, lX, lY){
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(lX,lY);
    ctx.closePath();
    ctx.strokeStyle = "white";
    ctx.stroke();
}
//draw single cell
function DrawCell(y, x){
    ctx.beginPath();
    ctx.rect(x, y, cellSize, cellSize);
    ctx.fillStyle = figureColor;
    ctx.fill();
    ctx.clearRect(x+(cellSize-inCellCentrSqureSize)/2, y+(cellSize-inCellCentrSqureSize)/2, inCellCentrSqureSize, inCellCentrSqureSize);
    ctx.closePath();

    ctx.beginPath();
    ctx.rect(x+cellSize/4, y+cellSize/4, cellSize/2, cellSize/2);
    ctx.fillStyle = figureColor;
    ctx.fill();
    ctx.closePath();
}

//drawing grid
function DrawingCanvasGrid(){
    for(let c=0; c<canvasColumns+1; c++){
        if(c==canvasColumns){
            GridLine(c*cellSize, 0, c*cellSize, canvasRows*cellSize);
        }else{
            GridLine(c*cellSize, 0, c*cellSize, canvasRows*cellSize);
        }
    }
    for(let r=0; r<canvasRows+1; r++){
        if(r==canvasRows){
            GridLine(0, r*cellSize, canvasColumns*cellSize, r*cellSize);
        }else{
            GridLine(0, r*cellSize, canvasColumns*cellSize, r*cellSize);
        }
    }
}

//drawing figures using field array
function DrawCells(){
    for (let r = 0; r < canvasRows; r++){
        for (let c = 0; c < canvasColumns; c++){
            if(field[r][c].isCellDrawn){
                DrawCell(r*cellSize, c*cellSize);
            }
        }
    }
}

// choosing a figure to be drawn
function nextFigureChoose(nextFigure){
    switch(nextFigure){
        case 0:
            figure(1, 4, "OShape");
            break;
        case 1:
            figure(1, 3, "IShape1");
            break;
        case 2:
            figure(0, 4, "TShape1");
            break;
        case 3:
            figure(0, 4, "SShape1");
            break;
        case 4:
            figure(0, 3, "ZShape1");
            break;
        case 5:
            figure(0, 3, "JShape1");
            break;
        case 6:
            figure(0, 5, "LShape1");
            break;
        
    }
}

function checkAllowenceLeft(){
    //going through field arrey 
    for(let r=0; r<canvasRows; r++){
        for(let c=0; c<canvasColumns; c++){
            //cheking if cell ic drawn and if so checking if cell on a left empty
            if(field[r][c].isCellDrawn && !field[r][c].atTheBottom){ 
                if(c>0 && !field[r][c-1].isCellDrawn){
                    allowedLeft = true;
                    break;
                }else if(c==0 || field[r][c-1].isCellDrawn){
                    allowedLeft = false;
                    return;
                }
            }
        }

    }
}
function checkAllowenceRight(){
    //going through field arrey
    for(let r=canvasRows-1; r>=0; r--){
        for(let c=canvasColumns-1; c>=0; c--){
            //cheking if cell is drawn and if so checking if cell on a right empty
            if(field[r][c].isCellDrawn && !field[r][c].atTheBottom){
                if(c<canvasColumns-1 && !field[r][c+1].isCellDrawn){
                    allowedRight = true;
                    break;
                }else if(c==canvasColumns-1 || field[r][c+1].isCellDrawn){
                    allowedRight = false;
                    return;
                }
            }
        }
    }
}


function checkAllowenceDown(){
        //going through field arrey
        for(let c=0; c<canvasColumns; c++){
            for(let r=canvasRows-1; r>=0; r--){
                if(field[r][c].isCellDrawn && !field[r][c].atTheBottom){
                    if(r<canvasRows-1 && !field[r+1][c].isCellDrawn){
                        allowedDown = true;
                        break;
                    }else if(r==canvasRows-1 || field[r+1][c].isCellDrawn){
                        allowedDown = false;
                        return;
                    }
                }
            }
        
        }
    
}

//checking if figure allowed to rotate
function checkRotateAllowence(r, c, type){
    if(type=="IShape1"){
        //drawing line
        //      ####
        //     
        if(c>=0 && c<canvasColumns -3 && r>=0 && r<canvasRows &&
            !field[r][c].atTheBottom &&
            !field[r][c+1].atTheBottom &&  
            !field[r][c+2].atTheBottom &&
            !field[r][c+3].atTheBottom){
                allowedSpin =true;
            }else{
                allowedSpin = false;
            }
    }else if(type=="IShape2"){
        //drawing line
        //      #
        //      #
        //      #
        //      #
        if(c>=0 && c<canvasColumns && r>=0 && r<canvasRows-3 &&
            !field[r][c].atTheBottom &&
            !field[r+1][c].atTheBottom &&
            !field[r+2][c].atTheBottom &&
            !field[r+3][c].atTheBottom){
                allowedSpin =true;
            }else{
                allowedSpin = false;
            }
            
    }else if(type=="TShape1"){
        //drawing T shape
        //       #
        //      ###
        if(c>=1 && c<canvasColumns-1 && r>=0 && r<canvasRows-1 &&
        !field[r][c].atTheBottom &&
        !field[r+1][c-1].atTheBottom &&
        !field[r+1][c].atTheBottom &&
        !field[r+1][c+1].atTheBottom ){
            allowedSpin =true;
        }else{
            allowedSpin = false;
        }
    }else if(type=="TShape2"){
        //drawing T shape
        //      #
        //      ##
        //      #
        if(c>=0 && c<canvasColumns-1 && r>=0 && r<canvasRows-2 &&
        !field[r][c].atTheBottom &&
        !field[r+1][c].atTheBottom &&
        !field[r+1][c+1].atTheBottom &&
        !field[r+2][c].atTheBottom){
            allowedSpin =true;
        }else{
            allowedSpin = false;
        }
    }else if(type=="TShape3"){
        //drawing T shape
        //      ###
        //       #
        if(c>=0 && c<canvasColumns-2 && r>=0 && r<=canvasRows &&
        !field[r][c].atTheBottom &&
        !field[r][c+1].atTheBottom &&
        !field[r][c+2].atTheBottom &&
        !field[r+1][c+1].atTheBottom){
            allowedSpin =true;
        }else{
            allowedSpin = false;
        }
    }else if(type=="TShape4"){
        //drawing T shape
        //       #
        //      ##
        //       #
        if(c>=1 && c<canvasColumns && r>=0 && r<canvasRows-2 &&
        !field[r][c].atTheBottom &&
        !field[r+1][c-1].atTheBottom &&
        !field[r+1][c].atTheBottom &&
        !field[r+2][c].atTheBottom){
            allowedSpin =true;
        }else{
            allowedSpin = false;
        }

    }else if(type=="SShape1"){
        //drawing S shape
        //       ##
        //      ##
        if(c>=1 && c<canvasColumns-1 && r>=0 && r<canvasRows-1 &&
        !field[r][c].atTheBottom &&
        !field[r][c+1].atTheBottom &&
        !field[r+1][c-1].atTheBottom &&
        !field[r+1][c].atTheBottom){
            allowedSpin =true;
        }else{
            allowedSpin = false;
        }
    }else if(type=="SShape2"){
        //drawing S shape
        //      #
        //      ##
        //       #
        if(c>=0 && c<canvasColumns-1 && r>=0 && r<canvasRows-2 &&
        !field[r][c].atTheBottom &&
        !field[r+1][c].atTheBottom &&
        !field[r+1][c+1].atTheBottom &&
        !field[r+2][c+1].atTheBottom){
            allowedSpin =true;
        }else{
            allowedSpin = false;
        }
    }else if(type=="ZShape1"){
        //drawing Z shape
        //      ##
        //       ##
        if(c>=0 && c<canvasColumns-2 && r>=0 && r<canvasRows-1 &&
        !field[r][c].atTheBottom &&
        !field[r][c+1].atTheBottom &&
        !field[r+1][c+1].atTheBottom &&
        !field[r+1][c+2].atTheBottom){
            allowedSpin =true;
        }else{
            allowedSpin = false;
        }
    }else if(type=="ZShape2"){
        //drawing Z shape
        //       #
        //      ##
        //      #
        if(c>0 && c<canvasColumns && r>=0 && r<canvasRows-2 &&
        !field[r][c].atTheBottom &&
        !field[r+1][c-1].atTheBottom &&
        !field[r+1][c].atTheBottom &&
        !field[r+2][c-1].atTheBottom){
            allowedSpin =true;
        }else{
            allowedSpin = false;
        }

    }else if(type=="JShape1"){
        //drawing J shape
        //      #
        //      ###
        if(c>=0 && c<canvasColumns-2 && r>=0 && r<canvasRows-1 &&
        !field[r][c].atTheBottom &&
        !field[r+1][c].atTheBottom &&
        !field[r+1][c+1].atTheBottom &&
        !field[r+1][c+2].atTheBottom){
            allowedSpin =true;
        }else{
            allowedSpin = false;
        }
    }else if(type=="JShape2"){
        //drawing J shape
        //      ##
        //      #
        //      #
        if(c>=0 && c<canvasColumns-1 && r>=0 && r<canvasRows-2 &&
        !field[r][c].atTheBottom &&
        !field[r][c+1].atTheBottom &&
        !field[r+1][c].atTheBottom &&
        !field[r+2][c].atTheBottom){
            allowedSpin =true;
        }else{
            allowedSpin = false;
        }
    }else if(type=="JShape3"){
        //drawing J shape
        //      ###
        //        #
        if(c>=0 && c<canvasColumns-2 && r>=0 && r<canvasRows-1 &&
        !field[r][c].atTheBottom &&
        !field[r][c+1].atTheBottom &&
        !field[r][c+2].atTheBottom &&
        !field[r+1][c+2].atTheBottom){
            allowedSpin =true;
        }else{
            allowedSpin = false;
        }
    }else if(type=="JShape4"){
        //drawing J shape
        //       #
        //       #
        //      ##
        if(c>0 && c<canvasColumns-1 && r>=0 && r<canvasRows-2 &&
        !field[r][c].atTheBottom &&
        !field[r+1][c].atTheBottom &&
        !field[r+2][c-1].atTheBottom &&
        !field[r+2][c].atTheBottom ){
            allowedSpin =true;
        }else{
            allowedSpin = false;
        }


    }else if(type=="LShape1"){
        //drawing L shape
        //        #
        //      ###
        if(c>=2 && c<canvasColumns && r>=0 && r<canvasRows-1 &&
            !field[r][c].atTheBottom &&
            !field[r+1][c-2].atTheBottom &&
            !field[r+1][c-1].atTheBottom &&
            !field[r+1][c].atTheBottom){
                allowedSpin =true;
            }else{
                allowedSpin = false;
            }
    }else if(type=="LShape2"){
        //drawing L shape
        //      #
        //      #
        //      ##
        if(c>=0 && c<canvasColumns-1 && r>=0 && r<canvasRows-2 &&
        !field[r][c].atTheBottom &&
        !field[r+1][c].atTheBottom &&
        !field[r+2][c].atTheBottom &&
        !field[r+2][c+1].atTheBottom){
            allowedSpin =true;
        }else{
            allowedSpin = false;
        }
    }else if(type=="LShape3"){
        //drawing L shape
        //      ###
        //      #
        if(c>=0 && c<canvasColumns-2 && r>=0 && r<canvasRows-1 &&
        !field[r][c].atTheBottom &&
        !field[r][c+1].atTheBottom &&
        !field[r][c+2].atTheBottom &&
        !field[r+1][c].atTheBottom){
            allowedSpin =true;
        }else{
            allowedSpin = false;
        }
    }else if(type=="LShape4"){
        //drawing L shape
        //      ##
        //       #
        //       #
        if(c>=0 && c<canvasColumns-1 && r>=0 && r<canvasRows-2 &&
        !field[r][c].atTheBottom &&
        !field[r][c+1].atTheBottom &&
        !field[r+1][c+1].atTheBottom &&
        !field[r+2][c+1].atTheBottom){
            allowedSpin =true;
        }else{
            allowedSpin = false;
        }
    }
    
}

//removing filled rows
function delCompleteRow(){
    
    rowsToDel = [];
    
    //checking if row is filled
    for (let r=0; r<canvasRows; r++){
        cellsInColumnsCount = 0;

        for (let c=0; c<canvasColumns; c++){
            if(field[r][c].atTheBottom && field[r][c].isCellDrawn){cellsInColumnsCount++;}
        }
        if(cellsInColumnsCount !== 0 && cellsInColumnsCount === canvasColumns){
            rowsToDel.push(r);
        }

    }




    //marking filled rows as undrawn
    for (let r=rowsToDel.length-1; r>=0; r--){            
        remove = rowsToDel[r];
        for (let c=0; c<canvasColumns; c++){
            field[remove][c].isCellDrawn = false;
        }
    }
    DrawCells();

    //revercing rowsToDel an array
    rowsToDel.reverse();
    

    //moving cells down on removed place
    for (let n=rowsToDel.length; n>0; n--){
        if(!muted)removeLineSound.play();
        for (let r = rowsToDel[n-1]; r >= 0; r--){
            for (let c = canvasColumns-1; c >= 0; c--){
                if(field[r][c].isCellDrawn){
                    field[r][c].isCellDrawn =false;
                    field[r+1][c].isCellDrawn=true;
                }
            }

        }
    }
    //giving to all the cells ".atTheBottom = true" value after moving cells down
    if (rowsToDel.length > 0){
        for(let r = 0; r < canvasRows; r++){
            for(let c = 0; c < canvasColumns; c++){
                field[r][c].atTheBottom=false;
                if(field[r][c].isCellDrawn){field[r][c].atTheBottom=true;}
            }
        }
    }
    DrawCells();
    //adding scores for deleting lines
    switch(rowsToDel.length){
        case 1:
            clearedLines+=1;
            score+=100;
            break;
        case 2:
            clearedLines+=2;
            score+=300;
            break;
        case 3:
            clearedLines+=3;
            score+=700;
            break;
        case 4:
            clearedLines+=4;
            score+=1500;
            break; 
        default:
            break;
    }
}

//if "P" pressed - pause/continue
function gamePause() {
    pause ? clearTimeout(fallingDown) : figureMovingDown();
    if(pause && !gameOver){
        document.getElementById("pause_id").classList.remove("inactive");
        document.getElementById("pause_id").classList.add("active");
    }else{
        document.getElementById("pause_id").classList.remove("active");
        document.getElementById("pause_id").classList.add("inactive");
    }
}

//if "R" pressed - reset game
function gameReset() {
    pause = false;
    document.location.reload();
}

//game over
function gameOverHandler(){
    for(let c=0; c<canvasColumns; c++){
        
        if(field[1][c].atTheBottom){
            if(!muted)removeLineSound.play();
            clearTimeout(fallingDown);
            gameOverAnimation();
            gameOver = true;
            if(mainTheme){mainTheme.stop()};
           
            return;
        }
    }
}

function gameOverAnimation(){
    document.getElementById("game_over").classList.add("active");
    fillingFieldBlackCells();
}

//drawing black lines bottom to top
let countGameOverBlackRows = canvasRows - 1;
function fillingFieldBlackCells(){

    if (countGameOverBlackRows >= 0){
        for (let c=0; c<canvasColumns; c++){
            field[countGameOverBlackRows][c].isCellDrawn=true;
            // console.log(c);
        }
        
        countGameOverBlackRows--;
        setTimeout(function(){
            
            fillingFieldBlackCells();
            
        }, 1000/gameOverAnimationSpeed)
    }else{
        //drawing empty lines top to bottom
        let countGameOverEmptyRows = 0;
        function fillingFieldEmptyCells(){
            if (countGameOverEmptyRows < canvasRows){
                for (let c=0; c<canvasColumns; c++){
                    field[countGameOverEmptyRows][c].isCellDrawn=false;
                    // console.log(c);
                }
                
                countGameOverEmptyRows++;
                setTimeout(function(){
                    
                    fillingFieldEmptyCells();
                    
                }, 1000/gameOverAnimationSpeed)
            }    
        }
        fillingFieldEmptyCells();
    }

}

//score calculating
function scoreCalculate(){
    let scoreString;
    let scoreLenght = score.toString().length;
    switch(scoreLenght){
        case 1:
            scoreString = "<span>00000</span>"+score.toString();
            break;
        case 2:
            scoreString = "<span>0000</span>"+score.toString();
            break;
        case 3:
            scoreString = "<span>000</span>"+score.toString();
            break;
        case 4:
            scoreString = "<span>00</span>"+score.toString();
            break;
        case 5:
            scoreString = "<span>0</span>"+score.toString();
            break;
        case 6:
            scoreString = score.toString();
            break;
    }

    document.getElementById("score_id").innerHTML = scoreString;
}

//next figure board calculating
function nextFigureBoard(){
    switch(nextFigure){
        case 0:
            boardCellsChanger(1, 2, 5, 6);
            // figure(1, 4, "OShape");
            break;
        case 1:
            boardCellsChanger(0, 1, 2, 3);
            // figure(1, 3, "IShape1");
            break;
        case 2:
            boardCellsChanger(1, 4, 5, 6);
            // figure(0, 4, "TShape1");
            break;
        case 3:
            boardCellsChanger(1, 2, 4, 5);
            // figure(0, 4, "SShape1");
            break;
        case 4:
            boardCellsChanger(0, 1, 5, 6);
            // figure(0, 3, "ZShape1");
            break;
        case 5:
            boardCellsChanger(0, 4, 5, 6);
            // figure(0, 3, "JShape1");
            break;
        case 6:
            boardCellsChanger(2, 4, 5, 6);
            // figure(0, 5, "LShape1");
            break;
        
    }
    function boardCellsChanger(c1, c2, c3, c4){
        for(let i=0; i<8; i++){
            document.getElementById("next_cell"+i).classList.remove("next_cell_active");
            document.getElementById("next_cell_in"+i).classList.remove("next_cell_active");
        }
            document.getElementById("next_cell"+c1).classList.add("next_cell_active");
            document.getElementById("next_cell"+c2).classList.add("next_cell_active");
            document.getElementById("next_cell"+c3).classList.add("next_cell_active");
            document.getElementById("next_cell"+c4).classList.add("next_cell_active");

            // document.getElementById("next_cell_in"+c1).classList.add("next_cell_active");
            // document.getElementById("next_cell_in"+c2).classList.add("next_cell_active");
            // document.getElementById("next_cell_in"+c3).classList.add("next_cell_active");
            // document.getElementById("next_cell_in"+c4).classList.add("next_cell_active");
    }
    // console.log(figureCellsActive);

}

//line cleared calculating
function delitedLinesCalc(){
    let delLinesString;
    let scoreLenght = clearedLines.toString().length;
    switch(scoreLenght){
        case 1:
            delLinesString = "<span>00000</span>"+clearedLines.toString();
            break;
        case 2:
            delLinesString = "<span>0000</span>"+clearedLines.toString();
            break;
        case 3:
            delLinesString = "<span>000</span>"+clearedLines.toString();
            break;
        case 4:
            delLinesString = "<span>00</span>"+clearedLines.toString();
            break;
        case 5:
            delLinesString = "<span>0</span>"+clearedLines.toString();
            break;
        case 6:
            delLinesString = clearedLines.toString();
            break;
    }

    document.getElementById("clean_id").innerHTML = delLinesString;
    
    
}

//calculating game speed
function levelCalc(){
    let tempLevel = level;

    if(clearedLines < 20){
        level = 1;
    }else if(clearedLines >= 20 && clearedLines <40){
        level = 2;
    }else if(clearedLines >= 40 && clearedLines <60){
        level = 3;
    }else if(clearedLines >= 60 && clearedLines <80){
        level = 4;
    }else if(clearedLines >= 80 && clearedLines <100){
        level = 5;
    }else if(clearedLines >= 100 && clearedLines <120){
        level = 6;
    }else if(clearedLines >= 120 && clearedLines <140){
        level = 7;
    }else if(clearedLines >= 140 && clearedLines <160){
        level = 8;
    }else {
        level = 9;
    }
    document.getElementById("level_id").innerHTML = level;

    function levelListener(){
        if(tempLevel != level)
        {
            switch(level){
                case 2:
                    defaultMovingDownSpeed = 2;
                    break;
                case 3:
                    defaultMovingDownSpeed = 3;
                    break;
                case 4:
                    defaultMovingDownSpeed = 4;
                    break;
                case 5:
                    defaultMovingDownSpeed = 5;
                    break;
                case 6:
                    defaultMovingDownSpeed = 7;
                    break;
                case 7:
                    defaultMovingDownSpeed = 10;
                    break;
                case 8:
                    defaultMovingDownSpeed = 14;
                    break;
                case 9:
                    defaultMovingDownSpeed = 20;
                    break;
                default:
                    break;
            }
            clearTimeout(fallingDown);
            figureMovingDown();
        }
    }
    levelListener();
}

//mainTheme sounds
function sound(){
    mainTheme = new soundPlayer("sounds/mainTheme.mp3", true, "mainTheme");
    mainTheme.play();
    //main thame volume lowering
    mainSound = document.getElementById("mainTheme");
    mainSound.volume = .4;
}
//sounds that creating each time new audio element in DOM, to be able to correctly play moving beeps. 
function sounds(type){
    if(type == "side" && !muted){
        moveSound = new soundPlayer("sounds/speen.mp3", false, "moveBeep");
        moveSound.play();
    }
    // else if(type == "fastDown" && !muted){
    //     moveSound = new soundPlayer("sounds/moveDownQuick.mp3", false, "moveBeep");
    //     moveSound.play();
    // }
    else if(type == "rotate" && !muted){
        moveSound = new soundPlayer("sounds/speen.mp3", false, "moveBeep");
        moveSound.play();
    }else if(type == "remove" && !muted){
        //here we creating only one audio element as those sounds not playing often
        atTheBottomSound = new soundPlayer("sounds/figureAtBottom.mp3", false, "remove");
        removeLineSound = new soundPlayer("sounds/fatal.mp3", false, "remove");
    }
    
    
    
}
function muteHandler(){
    mainSound = document.getElementById("mainTheme");

    if(!muted){
        mainSound.muted = false;
    }
    else if(muted){
        mainSound.muted = true;
    };
    
}
function soundPlayer(src, loop, id) {
    let s = document.createElement("audio");
    s.setAttribute("id", id);
    if(loop){s.loop = true;}
    this.sound = s;
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }    
}

//removing all audio players, that was created by moving beep
function removeUnusedSounds(){     //this is sucks I know((
    //waiting few moments befor remove all audio elements, to avoid most promices mistake with play()/pause()
    setTimeout(function(){
        let i =0;
        while(i<100){
            let elem = document.querySelector('#moveBeep');
            if(elem){
                elem.parentNode.removeChild(elem);
                i++;
            }else{return;}
            
        }
    }, 300);    
    
}
//drawing figure falling dawn
function figureMovingDown(){
    fallingDown = setInterval(function(){
        checkAllowenceDown();
        for (let r = canvasRows-1; r >= 0; r--){
            for (let c = canvasColumns-1; c >= 0; c--){
                if(field[r][c].isCellDrawn && !field[r][c].atTheBottom && allowedDown ){ //
                    field[r][c].atTheBottom =false;
                    field[r][c].isCellDrawn =false;
                    field[r+1][c].isCellDrawn =true;

                }else if(field[r][c].isCellDrawn && !allowedDown){
                    field[r][c].atTheBottom = true;
                    if(!muted)atTheBottomSound.play();
                }
            }   
        }
        

        delCompleteRow();
        newFigure();
        gameOverHandler();
        scoreCalculate();
        delitedLinesCalc();
        levelCalc();
        nextFigureBoard();
    }, 1000/defaultMovingDownSpeed);
   
}
//quick moving figure to the down and figure rotating
//while down or up arrow pressed
setInterval(function(){
    if(downPressed) {
        // sounds("side");mr
        checkAllowenceDown();
        for (let r = canvasRows-1; r >= 0; r--){
            for (let c = canvasColumns-1; c >= 0; c--){
                if(field[r][c].isCellDrawn && !field[r][c].atTheBottom && allowedDown ){ //
                    field[r][c].isCellDrawn =false;
                    field[r+1][c].isCellDrawn =true;
                }else if(field[r][c].isCellDrawn && !allowedDown){
                    field[r][c].atTheBottom = true;
                    if(!muted)atTheBottomSound.play();
                    
                }
            }
        }
    }
    if(upPressed){
        sounds("rotate");
        upPressed = false;
        for (let r = canvasRows-1; r >= 0; r--){
            for (let c = canvasColumns-1; c >= 0; c--){
                if(!field[r][c].atTheBottom && field[r][c].isCellDrawn){
                    rotatingStartPositionX = c;
                    rotatingStartPositionY = r;
                }
            }
        }

        // checking wether we allowed to rotate a figure
        rotateFigure(figureType, rotatingStartPositionY, rotatingStartPositionX, toDo="checkRotate");
        if(!allowedSpin) return;
            for (let r = canvasRows-1; r >= 0; r--){
                for (let c = canvasColumns-1; c >= 0; c--){
                    if(!field[r][c].atTheBottom && field[r][c].isCellDrawn){
                        rotatingStartPositionX = c;
                        rotatingStartPositionY = r;
                    }
                    if(!field[r][c].atTheBottom ){
                        field[r][c].isCellDrawn = false;
                    }
                }
            }
            //rotating figure
        rotateFigure(figureType, rotatingStartPositionY, rotatingStartPositionX, toDo="rotate");
    }
}, 1000/30);

//moving figure to the left/right
//while right or left arrow pressed
setInterval(function(){
      //moving figure to the left 
      if(leftPressed) {
        sounds("side");
                checkAllowenceLeft();
        for(let r=0; r<canvasRows; r++){
            for(let c=0; c<canvasColumns; c++){
                if(field[r][c].isCellDrawn && allowedLeft && !field[r][c].atTheBottom){ 
                    field[r][c].isCellDrawn = false;
                    field[r][c-1].isCellDrawn = true;
                }
            }
        }
    }

    //moving figure to the left
    if(rightPressed) {
        sounds("side");
        checkAllowenceRight();
        for(let r=0; r<canvasRows; r++){
            for(let c=canvasColumns-1; c>=0; c--){
                if(field[r][c].isCellDrawn && allowedRight  && !field[r][c].atTheBottom){ 

                    field[r][c].isCellDrawn = false;
                    field[r][c+1].isCellDrawn = true;
                }
            }
        }
    }
}, 1000/10);

//checking if all Cells at the bottom position and if so sending new figure
function newFigure(){
    let drawnCells = 0; 
    let сellsAtTheBottom = 0;
    for(let r=0; r<canvasRows; r++){
        for(let c=0; c<canvasColumns; c++){
            if(field[r][c].isCellDrawn == true){
                drawnCells++;
            } 
            if(field[r][c].atTheBottom == true){
                сellsAtTheBottom++;
            } 
        }
    }
    if(drawnCells>0  && drawnCells==сellsAtTheBottom){   
        //choosing new figure
        nextFigureChoose(nextFigure);
        nextFigure = Math.floor(Math.random() * 7);
        score+=10;
        removeUnusedSounds();

        return;
    }
}

//checking if we can rotate the figure or just rotating it
function rotateFigure(figureShape, rotatingStartPositionX, rotatingStartPositionY, toDo){
    switch(figureShape){
         //IShape rotating
        case "OShape":
            figure(rotatingStartPositionX, rotatingStartPositionY, "OShape");
            figureType = "OShape";
            break;
               
        //IShape rotating
        case "IShape1":
            if(toDo=="rotate"){
                figure(rotatingStartPositionX-1, rotatingStartPositionY+2, "IShape2");
                figureType = "IShape2";
                break;
            }else{
                checkRotateAllowence(rotatingStartPositionX-1, rotatingStartPositionY+2, "IShape2");
                break;
            }
                
        case "IShape2":
            if(toDo=="rotate"){
                figure(rotatingStartPositionX+2, rotatingStartPositionY-2, "IShape1");
                figureType = "IShape3";
                break;
            }else{
                checkRotateAllowence(rotatingStartPositionX+2, rotatingStartPositionY-2, "IShape1");
                break;
            }
        case "IShape3":
             if(toDo=="rotate"){
                figure(rotatingStartPositionX-2, rotatingStartPositionY, "IShape2");
                figureType = "IShape4";
                break;
             }else{
                checkRotateAllowence(rotatingStartPositionX-2, rotatingStartPositionY, "IShape2");
                break;
            }
        case "IShape4":
             if(toDo=="rotate"){
                figure(rotatingStartPositionX+1, rotatingStartPositionY, "IShape1");
                figureType = "IShape1";
                break;
             }else{
                checkRotateAllowence(rotatingStartPositionX+1, rotatingStartPositionY, "IShape1");
                break;
            }

            //TShape rotating
        case "TShape1":
            if(toDo=="rotate"){
                figure(rotatingStartPositionX, rotatingStartPositionY, "TShape2");
                figureType = "TShape2";
                break;
            }else{
                checkRotateAllowence(rotatingStartPositionX, rotatingStartPositionY, "TShape2");
                break;
            }
        case "TShape2":
            if(toDo=="rotate"){
                figure(rotatingStartPositionX+1, rotatingStartPositionY-1, "TShape3");
                figureType = "TShape3";
                break;
            }else{
                checkRotateAllowence(rotatingStartPositionX+1, rotatingStartPositionY-1, "TShape3");
                break;
            }
        case "TShape3":
            if(toDo=="rotate"){
                figure(rotatingStartPositionX-1, rotatingStartPositionY+1, "TShape4");
                figureType = "TShape4";
                break;
            }else{
                checkRotateAllowence(rotatingStartPositionX-1, rotatingStartPositionY+1, "TShape4");
                break;
            }
        case "TShape4":
            if(toDo=="rotate"){
                figure(rotatingStartPositionX, rotatingStartPositionY, "TShape1");
                figureType = "TShape1";
                break;
            }else{
                checkRotateAllowence(rotatingStartPositionX, rotatingStartPositionY, "TShape1");
                break;
            }

            //SShape rotating
        case "SShape1":
            if(toDo=="rotate"){
                figure(rotatingStartPositionX, rotatingStartPositionY, "SShape2");
                figureType = "SShape2";
                break;
            }else{
                checkRotateAllowence(rotatingStartPositionX, rotatingStartPositionY, "SShape2");
                break;
            }
        case "SShape2":
            if(toDo=="rotate"){
                figure(rotatingStartPositionX+1, rotatingStartPositionY, "SShape1");
                figureType = "SShape3";
                break;
            }else{
                checkRotateAllowence(rotatingStartPositionX+1, rotatingStartPositionY, "SShape1");
                break;
            }
        case "SShape3":
            if(toDo=="rotate"){
                figure(rotatingStartPositionX-1, rotatingStartPositionY-1, "SShape2");
                figureType = "SShape4";
                break;
            }else{
                checkRotateAllowence(rotatingStartPositionX-1, rotatingStartPositionY-1, "SShape2");
                break;
            }
        case "SShape4":
            if(toDo=="rotate"){
                figure(rotatingStartPositionX, rotatingStartPositionY+1, "SShape1");
                figureType = "SShape1";
                break;
            }else{
                checkRotateAllowence(rotatingStartPositionX, rotatingStartPositionY+1, "SShape1");
                break;
            }

            //ZShape rotating
        case "ZShape1":
            if(toDo=="rotate"){
                figure(rotatingStartPositionX, rotatingStartPositionY+2, "ZShape2");
                figureType = "ZShape2";
                break;
            }else{
                checkRotateAllowence(rotatingStartPositionX, rotatingStartPositionY+2, "ZShape2");
                break;
            }
        case "ZShape2":
            if(toDo=="rotate"){
                figure(rotatingStartPositionX+1, rotatingStartPositionY-2, "ZShape1");
                figureType = "ZShape3";
                break;
            }else{
                checkRotateAllowence(rotatingStartPositionX+1, rotatingStartPositionY-2, "ZShape1");
                break;
            }
        case "ZShape3":
            if(toDo=="rotate"){
                figure(rotatingStartPositionX-1, rotatingStartPositionY+1, "ZShape2");
                figureType = "ZShape4";
                break;
            }else{
                checkRotateAllowence(rotatingStartPositionX-1, rotatingStartPositionY+1, "ZShape2");
                break;
            }
        case "ZShape4":
            if(toDo=="rotate"){
                figure(rotatingStartPositionX, rotatingStartPositionY-1, "ZShape1");
                figureType = "ZShape1";
                break;
            }else{
                checkRotateAllowence(rotatingStartPositionX, rotatingStartPositionY-1, "ZShape1");
                break;
            }
            
            //JShape rotating
        case "JShape1":
            if(toDo=="rotate"){
                figure(rotatingStartPositionX, rotatingStartPositionY+1, "JShape2");
                figureType = "JShape2";
                break;
            }else{
                checkRotateAllowence(rotatingStartPositionX, rotatingStartPositionY+1, "JShape2");
                break;
            }
        case "JShape2":
            if(toDo=="rotate"){
                figure(rotatingStartPositionX+1, rotatingStartPositionY-1, "JShape3");
                figureType = "JShape3";
                break;
            }else{
                checkRotateAllowence(rotatingStartPositionX+1, rotatingStartPositionY-1, "JShape3");
                break;
            }
        case "JShape3":
            if(toDo=="rotate"){
                figure(rotatingStartPositionX-1, rotatingStartPositionY+1, "JShape4");
                figureType = "JShape4";
                break;
            }else{
                checkRotateAllowence(rotatingStartPositionX-1, rotatingStartPositionY+1, "JShape4");
                break;
            }
        case "JShape4":
            if(toDo=="rotate"){
                figure(rotatingStartPositionX, rotatingStartPositionY-1, "JShape1");
                figureType = "JShape1";
                break;
            }else{
                checkRotateAllowence(rotatingStartPositionX, rotatingStartPositionY-1, "JShape1");
                break;
            }
            
            //LShape rotating
        case "LShape1":
            if(toDo=="rotate"){
                figure(rotatingStartPositionX, rotatingStartPositionY-1, "LShape2");
                figureType = "LShape2";
                break;
            }else{
                checkRotateAllowence(rotatingStartPositionX, rotatingStartPositionY-1, "LShape2");
                break;
            }
        case "LShape2":
            if(toDo=="rotate"){
                figure(rotatingStartPositionX+1, rotatingStartPositionY-1, "LShape3");
                figureType = "LShape3";
                break;
            }else{
                checkRotateAllowence(rotatingStartPositionX+1, rotatingStartPositionY-1, "LShape3");
                break;
            }
        case "LShape3":
            if(toDo=="rotate"){
                figure(rotatingStartPositionX-1, rotatingStartPositionY, "LShape4");
                figureType = "LShape4";
                break;
            }else{
                checkRotateAllowence(rotatingStartPositionX-1, rotatingStartPositionY, "LShape4");
                break;
            }
        case "LShape4":
            if(toDo=="rotate"){
                figure(rotatingStartPositionX, rotatingStartPositionY+2, "LShape1");
                figureType = "LShape1";
                break;
            }else{
                checkRotateAllowence(rotatingStartPositionX, rotatingStartPositionY+2, "LShape1");
                break;
            }
    };
};
//figures
function figure(r, c, type){
    if(type=="OShape"){
        //drawing square
        //      ##
        //      ##
        field[r][c].isCellDrawn=true;
        field[r][c+1].isCellDrawn=true;
        field[r+1][c].isCellDrawn=true;
        field[r+1][c+1].isCellDrawn=true;
        figureType="OShape";
    }else if(type=="IShape1"){
        //drawing line
        //      ####
        //     
            field[r][c].isCellDrawn=true;
            field[r][c+1].isCellDrawn=true;
            field[r][c+2].isCellDrawn=true;
            field[r][c+3].isCellDrawn=true;
            figureType="IShape1";
    }else if(type=="IShape2"){
        //drawing line
        //      #
        //      #
        //      #
        //      #
            field[r][c].isCellDrawn=true;
            field[r+1][c].isCellDrawn=true;
            field[r+2][c].isCellDrawn=true;
            field[r+3][c].isCellDrawn=true;
            figureType="IShape2";
    }else if(type=="TShape1"){
        //drawing T shape
        //       #
        //      ###
        field[r][c].isCellDrawn=true;
        field[r+1][c-1].isCellDrawn=true;
        field[r+1][c].isCellDrawn=true;
        field[r+1][c+1].isCellDrawn=true;
        figureType="TShape1";
    }else if(type=="TShape2"){
        //drawing T shape
        //      #
        //      ##
        //      #
        field[r][c].isCellDrawn=true;
        field[r+1][c].isCellDrawn=true;
        field[r+1][c+1].isCellDrawn=true;
        field[r+2][c].isCellDrawn=true;
        figureType="TShape2";
    }else if(type=="TShape3"){
        //drawing T shape
        //      ###
        //       #
        field[r][c].isCellDrawn=true;
        field[r][c+1].isCellDrawn=true;
        field[r][c+2].isCellDrawn=true;
        field[r+1][c+1].isCellDrawn=true;
        figureType="TShape3";
    }else if(type=="TShape4"){
        //drawing T shape
        //       #
        //      ##
        //       #
        field[r][c].isCellDrawn=true;
        field[r+1][c-1].isCellDrawn=true;
        field[r+1][c].isCellDrawn=true;
        field[r+2][c].isCellDrawn=true;
        figureType="TShape4";
    }else if(type=="SShape1"){
        //drawing S shape
        //       ##
        //      ##
        field[r][c].isCellDrawn=true;
        field[r][c+1].isCellDrawn=true;
        field[r+1][c-1].isCellDrawn=true;
        field[r+1][c].isCellDrawn=true;
        figureType="SShape1";
    }else if(type=="SShape2"){
        //drawing S shape
        //      #
        //      ##
        //       #
        field[r][c].isCellDrawn=true;
        field[r+1][c].isCellDrawn=true;
        field[r+1][c+1].isCellDrawn=true;
        field[r+2][c+1].isCellDrawn=true;
        figureType="SShape2";
    }else if(type=="ZShape1"){
        //drawing Z shape
        //      ##
        //       ##
        field[r][c].isCellDrawn=true;
        field[r][c+1].isCellDrawn=true;
        field[r+1][c+1].isCellDrawn=true;
        field[r+1][c+2].isCellDrawn=true;
        figureType="ZShape1";
    }else if(type=="ZShape2"){
        //drawing Z shape
        //       #
        //      ##
        //      #
        field[r][c].isCellDrawn=true;
        field[r+1][c-1].isCellDrawn=true;
        field[r+1][c].isCellDrawn=true;
        field[r+2][c-1].isCellDrawn=true;
        figureType="ZShape2";
    }else if(type=="JShape1"){
        //drawing J shape
        //      #
        //      ###
        field[r][c].isCellDrawn=true;
        field[r+1][c].isCellDrawn=true;
        field[r+1][c+1].isCellDrawn=true;
        field[r+1][c+2].isCellDrawn=true;
        figureType="JShape1";
    }else if(type=="JShape2"){
        //drawing J shape
        //      ##
        //      #
        //      #
        field[r][c].isCellDrawn=true;
        field[r][c+1].isCellDrawn=true;
        field[r+1][c].isCellDrawn=true;
        field[r+2][c].isCellDrawn=true;
        figureType="JShape2";
    }else if(type=="JShape3"){
        //drawing J shape
        //      ###
        //        #
        field[r][c].isCellDrawn=true;
        field[r][c+1].isCellDrawn=true;
        field[r][c+2].isCellDrawn=true;
        field[r+1][c+2].isCellDrawn=true;
        figureType="JShape3";
    }else if(type=="JShape4"){
        //drawing J shape
        //       #
        //       #
        //      ##
        field[r][c].isCellDrawn=true;
        field[r+1][c].isCellDrawn=true;
        field[r+2][c-1].isCellDrawn=true;
        field[r+2][c].isCellDrawn=true;
        figureType="JShape4";
    }else if(type=="LShape1"){
        //drawing L shape
        //        #
        //      ###
        field[r][c].isCellDrawn=true;
        field[r+1][c-2].isCellDrawn=true;
        field[r+1][c-1].isCellDrawn=true;
        field[r+1][c].isCellDrawn=true;
        figureType="LShape1";
    }else if(type=="LShape2"){
        //drawing L shape
        //      #
        //      #
        //      ##
        field[r][c].isCellDrawn=true;
        field[r+1][c].isCellDrawn=true;
        field[r+2][c].isCellDrawn=true;
        field[r+2][c+1].isCellDrawn=true;
        figureType="LShape2";
    }else if(type=="LShape3"){
        //drawing L shape
        //      ###
        //      #
        field[r][c].isCellDrawn=true;
        field[r][c+1].isCellDrawn=true;
        field[r][c+2].isCellDrawn=true;
        field[r+1][c].isCellDrawn=true;
        figureType="LShape3";
    }else if(type=="LShape4"){
        //drawing L shape
        //      ##
        //       #
        //       #
        field[r][c].isCellDrawn=true;
        field[r][c+1].isCellDrawn=true;
        field[r+1][c+1].isCellDrawn=true;
        field[r+2][c+1].isCellDrawn=true;
        figureType="LShape4";
    }
}

nextFigureChoose(nextFigure);
figureMovingDown(); 


//main function
function Draw(){

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawingEmptyCells();

    DrawCells();
    DrawingCanvasGrid();
    
    
    requestAnimationFrame(Draw);
}


requestAnimationFrame(Draw);