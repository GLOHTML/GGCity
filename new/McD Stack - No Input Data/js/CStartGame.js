var maxHighInput = 3;
var minHighInput = 2;
var maxIntervalInput = 6.5;
var minIntervalInput = 5.25;
var maxTopInput = 46;
var minTopInput = 45; 
var maxWidthInput = 315; 
var minWidthInput = 200;
var maxLeftInput = 43;
var minLeftInput = 35;
var maxWindowStable = 630;
var minWindowStable = 500;

var highMulti = maxHighInput - minHighInput;
var topMulti = maxTopInput - minTopInput;
var intervalMulti = maxIntervalInput - minIntervalInput;

function reScaleFaktor(x){
    return (x - minWindowStable) / (maxWindowStable - minWindowStable);
}

function resizeForm(){
    var w  = $(window).width();
    var newHigh = maxHighInput;
    var newTop = minTopInput;
    var newInterval = maxIntervalInput;
    var newLeft = maxLeftInput;
    
    if(w < 630){
        newHigh = minHighInput + (highMulti * reScaleFaktor(w));
        newTop = maxTopInput - (topMulti * reScaleFaktor(w));
        var newInterval = minIntervalInput + (intervalMulti * reScaleFaktor(w))
    }
    newLeft = maxLeftInput - ((1-((w-500)/(1530-500))) * (maxLeftInput-minLeftInput));

    $('#nameInput').css("height",newHigh+"%")
    $('#nameInput').css("top",newTop+"%")
    
    newTop += newInterval;
    $('#phoneInput').css("height",newHigh+"%")
    $('#phoneInput').css("top",newTop+"%")

    newTop += newInterval;
    $('#emailInput').css("height",newHigh+"%")
    $('#emailInput').css("top",newTop+"%")

    $('#nameInput').css("left", newLeft+"%");
    $('#phoneInput').css("left", newLeft+"%");
    $('#emailInput').css("left", newLeft+"%");

    if(w > 630){
        var x = (1-(w/1530)) * (maxWidthInput-minWidthInput);
        x = maxWidthInput-x;
        $('#nameInput').css("width", x+"px");
        $('#phoneInput').css("width", x+"px");
        $('#emailInput').css("width", x+"px");
    }
}

$(window).resize(function() {
    resizeForm();
});

function StartGame(){
    var oMain = new CMain({
                levels:[
                            6,           //NUM BLOCK FOR LEVEL 1 12
                            12,           //NUM BLOCK FOR LEVEL 2 18
                            20            //NUM BLOCK FOR LEVEL 3 20
                           //....ADD HERE NUM OF BLOCKS IF YOU WANT MORE LEVELS (EG: [12,18,26,30])
                        ],
                start_hook_rot_speed:0.1, //HOOK ROTATION SPEED FOR THE FIRST LEVEL
                hook_rot_increase:0.03,   // AMOUNT TO ADD TO HOOK ROTATION SPEED AFTER EACH LEVEL
                hook_max_rot:1,           //MAX HOOK ROTATION ANGLE
                num_lives:5,              //NUMBER OF LIVES
                best_mult:2,              //HIGHEST MULTIPLIER 
                bonus_mult:2,             //MULTIPLIER FOR BONUS 
                block_fall_speed:2,        //INCREASE THIS VALUE TO LET THE BLOCK FALL FASTER
                audio_enable_on_startup:false, //ENABLE/DISABLE AUDIO WHEN GAME STARTS 
                fullscreen:true,        //SET THIS TO FALSE IF YOU DON'T WANT TO SHOW FULLSCREEN BUTTON
                check_orientation:true //SET TO FALSE IF YOU DON'T WANT TO SHOW ORIENTATION ALERT ON MOBILE DEVICES               
            });

    if (isIOS()) {
        setTimeout(function () {
            sizeHandler();
        }, 200);
    } else {
        sizeHandler();
    }
    resizeForm();
}