var keycodes = { zero: 48, nine: 57, tab: 9 };
var maxStickButtons = 24;
var pressedThreshold = 0.5;
var bgWhite = "backgroundWhite";
var bgRed = "backgroundRed";
var bgBlue = "backgroundBlue";
var bgBlack = "backgroundBlack";

// DOM elements
var $matchNumber;
var $alliance = [[], []];
var $autoData = [[], []];
var $autoZone = [];
var $teleopData = [[], []];
var $teleopZone = [];
var $tags = [];
var $comments = [];

// Data for each robot
var autoData = [[], [], [], [], [], []];
var autoZone = [bgBlack, bgBlack, bgBlack, bgBlack, bgBlack, bgBlack];
var teleopData = [[], [], [], [], [], []];
var teleopZone = [bgBlack, bgBlack, bgBlack, bgBlack, bgBlack, bgBlack];
var tags = ["", "", "", "", "", ""];
var comments = ["", "", "", "", "", ""]; 

var joysticks = [0, 0];
var teamIndexs = [0, 0];

$(document).ready(init);

// Called when document loads
function init()
{
    $("input").keypress(textInputCallback);
    $(document).on('click','input[type=text]',function(){ this.select(); });
    $matchNumber = $("#matchNumber")[0];
    $matchNumber.value = 0;
    
    // Red
    $alliance[0] = $("*.team[id*=red]");
    $autoData[0] = $("input.data[id*=redAuto");
    $autoZone[0] = $("#redAutoZone")[0];
    $teleopData[0] = $("input.data[id*=redTeleop");
    $teleopZone[0] = $("#redTeleopZone")[0];
    $tags[0] = $("#redTags")[0];
    $comments[0] = $("#redComments")[0];
    
    // Blue
    $alliance[1] = $("*.team[id*=blue]");
    $autoData[1] = $("input.data[id*=blueAuto");
    $autoZone[1] = $("#blueAutoZone")[0];
    $teleopData[1] = $("input.data[id*=blueTeleop");
    $teleopZone[1] = $("#blueTeleopZone")[0];
    $tags[1] = $("#blueTags")[0];
    $comments[1] = $("#blueComments")[0];
    
    print("Inited");
    reset();
    main();
}

// Resets everything in the scouting application
function reset()
{
    $matchNumber.value = 1 + ($matchNumber.value - 0);
    
    for(var stickIndex = 0; stickIndex < joysticks.length; stickIndex++)
    {
        joysticks[stickIndex] = new Joystick();
        teamIndexs[stickIndex] = 0;
        
        for(var teamIndex = 0; teamIndex < $alliance[0].length; teamIndex++)
        {
            $alliance[stickIndex][teamIndex].value = "Team " + (teamIndex + 1);
            autoData[teamIndex] = 0;
            autoZone[teamIndex] = bgBlack;
            teleopData[teamIndex] = 0;
            teleopZone[teamIndex] = bgBlack;
            tags[teamIndex] = "";
            comments[teamIndex] = ""; 
        }
    
        for(var dataIndex = 0; dataIndex < $autoData[0].length; dataIndex++)
            $autoData[stickIndex][dataIndex].value = $teleopData[stickIndex][dataIndex].value = 0;

        for(var dataIndex = 0; dataIndex < $tags.length; dataIndex++)
            $tags[stickIndex].value = $comments[stickIndex].value = "";

        $autoZone[stickIndex].classList.remove(bgWhite, bgRed, bgBlue);
        $autoZone[stickIndex].classList.add(bgBlack);
        $teleopZone[stickIndex].classList.remove(bgWhite, bgRed, bgBlue);
        $teleopZone[stickIndex].classList.add(bgBlack);
    }
}

// Main loop for program
function main()
{
    updateJoysticks();
    window.webkitRequestAnimationFrame(main);
}

// Updates joystick
function updateJoysticks()
{
    var rawSticks = navigator.webkitGetGamepads();
    
    for(var stickIndex = 0; stickIndex < rawSticks.length && stickIndex < 2; stickIndex++)
    {
        var tmpStick = rawSticks[stickIndex];
        
        if(tmpStick)
        {
            // All non-joystick stick buttons
            for(var buttonIndex = 0; buttonIndex < tmpStick.buttons.length && buttonIndex < maxStickButtons; buttonIndex++)
                joysticks[stickIndex].updateButton(buttonIndex, tmpStick.buttons[buttonIndex] > pressedThreshold);

            /* Subtracting 1 from each button value because array index are 0-based */
        //    // Left stick
        //    joysticks[stickIndex].updateButton(17 - 1, tmpStick.axes[0] > pressedThreshold);   // Button 17
        //    joysticks[stickIndex].updateButton(19 - 1, tmpStick.axes[0] < -pressedThreshold);  // Button 19
        //    joysticks[stickIndex].updateButton(18 - 1, tmpStick.axes[1] > pressedThreshold);   // Button 18
        //    joysticks[stickIndex].updateButton(20 - 1, tmpStick.axes[1] < -pressedThreshold);  // Button 20
        //
        //    // Right stick
        //    joysticks[stickIndex].updateButton(21 - 1, tmpStick.axes[2] > pressedThreshold);   // Button 21
        //    joysticks[stickIndex].updateButton(23 - 1, tmpStick.axes[2] < -pressedThreshold);  // Button 23
        //    joysticks[stickIndex].updateButton(22 - 1, tmpStick.axes[3] > pressedThreshold);   // Button 22
        //    joysticks[stickIndex].updateButton(24 - 1, tmpStick.axes[3] < -pressedThreshold);  // Button 24
        }    
    }
}

// Prevents input from entering a non-number input
function textInputCallback(e)
{
    var code = e.keyCode;
    
    if(code !== keycodes.tab && (code < keycodes.zero || code > keycodes.nine))
        return false;
}

// Lazy print function, dont want to type "console.log()" a lot
function print(str)
{
    console.log(str);
}

// CLASSES
function Joystick()
{
    this.buttons = [maxStickButtons];
    this.rawButtons = [maxStickButtons];
    
    for(var i = 0; i < maxStickButtons; i++)
        this.buttons[i] = this.rawButtons[i] = false;
}

Joystick.prototype.getButton = function(index)
{
    return this.buttons[index];
};

Joystick.prototype.getRawButton = function(index)
{
    return this.rawButtons[index];
};

Joystick.prototype.updateButton = function(index, rawVal)
{
    this.buttons[index] = this.rawButtons[index] && !rawVal;
    this.rawButtons[index] = rawVal;
};