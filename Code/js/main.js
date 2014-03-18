var keycodes = { zero: 48, nine: 57, tab: 9 };
var joycodes = { a: 0, b: 1, x: 2, y: 3, leftBumper: 4, rightBumper: 5, leftTrigger: 6, rightTrigger: 7, back: 8, start: 9, leftStick: 10, rightStick: 11, dpadUp: 12, dpadDown: 13, dpadLeft: 14, dpadRight: 15 };
var maxStickButtons = 16;
var pressedThreshold = 0.5;
var bgColors = ["backgroundBlack", "backgroundRed", "backgroundWhite", "backgroundBlue"];

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
var autoData = [[[], [], []], [[], [], []]];
var autoZone = [[0, 0, 0], [0, 0, 0]];
var teleopData = [[[], [], []], [[], [], []]];
var teleopZone = [[0, 0, 0], [0, 0, 0]];
var tags = [["", "", ""], ["", "", ""]];
var comments = [["", "", ""], ["", "", ""]]; 

var joysticks = [0, 0];
var teamIndexes = [0, 0];
var autoModes = [true, false];

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
        teamIndexes[stickIndex] = 0;
        
        for(var teamIndex = 0; teamIndex < $alliance[0].length; teamIndex++)
        {
            $alliance[stickIndex][teamIndex].value = "Team " + (teamIndex + 1);
            autoZone[stickIndex][teamIndex] = bgColors[0];
            teleopZone[stickIndex][teamIndex] = bgColors[0];
            autoData[stickIndex][teamIndex] = [0, 0, 0, 0];
            teleopData[stickIndex][teamIndex] = [0, 0, 0, 0];
            tags[stickIndex][teamIndex] = "";
            comments[stickIndex][teamIndex] = ""; 
        }
    
        for(var dataIndex = 0; dataIndex < $autoData[0].length; dataIndex++)
            $autoData[stickIndex][dataIndex].value = $teleopData[stickIndex][dataIndex].value = 0;

        for(var dataIndex = 0; dataIndex < $tags.length; dataIndex++)
            $tags[stickIndex].value = $comments[stickIndex].value = "";

        $autoZone[stickIndex].classList.remove(bgColors[1], bgColors[2], bgColors[3]);
        $autoZone[stickIndex].classList.add(bgColors[0]);
        $teleopZone[stickIndex].classList.remove(bgColors[1], bgColors[2], bgColors[3]);
        $teleopZone[stickIndex].classList.add(bgColors[0]);
        
        for(var curTeamIndex = 0; curTeamIndex < $alliance[stickIndex].length; curTeamIndex++)
            $alliance[stickIndex][curTeamIndex].style.opacity = 0.5;
            
        $alliance[stickIndex][teamIndexes[stickIndex]].style.opacity = 1;
    }
}

// Main loop for program
function main()
{
    updateJoysticks();
    
    for(var joystickIndex = 0; joystickIndex < joysticks.length; joystickIndex++)
    {
        if(joysticks[joystickIndex].getButton(joycodes.start))
            autoModes[joystickIndex] = false;
        
        if(joysticks[joystickIndex].getButton(joycodes.back))
            autoModes[joystickIndex] = true;
        
        var teamIndex = -1;
        
        if(joysticks[joystickIndex].getButton(joycodes.leftBumper))
            if((teamIndex = teamIndexes[joystickIndex] - 1) < 0)
                teamIndex = 2;
        
        if(joysticks[joystickIndex].getButton(joycodes.rightBumper))
            if((teamIndex = teamIndexes[joystickIndex] + 1) > 2)
                teamIndex = 0;
        
        var zoneIndex = -1;
        
        if(joysticks[joystickIndex].getButton(joycodes.dpadDown))
            zoneIndex = 0;
        
        if(joysticks[joystickIndex].getButton(joycodes.dpadLeft))
            zoneIndex = 1;
        
        if(joysticks[joystickIndex].getButton(joycodes.dpadUp))
            zoneIndex = 2;
        
        if(joysticks[joystickIndex].getButton(joycodes.dpadRight))
            zoneIndex = 3;
        
        var dataIndex = -1;
            
        if(joysticks[joystickIndex].getButton(joycodes.a))
            dataIndex = 3;

        if(joysticks[joystickIndex].getButton(joycodes.b))
            dataIndex = 2;

        if(joysticks[joystickIndex].getButton(joycodes.x))
            dataIndex = 1;

        if(joysticks[joystickIndex].getButton(joycodes.y))
            dataIndex = 0;

        if(teamIndex > -1)
        {
            for(var curTeamIndex = 0; curTeamIndex < $alliance[joystickIndex].length; curTeamIndex++)
                $alliance[joystickIndex][curTeamIndex].style.opacity = 0.5;
            
            teamIndexes[joystickIndex] = teamIndex;
            $alliance[joystickIndex][teamIndexes[joystickIndex]].style.opacity = 1;
            
            for(var allianceIndex = 0; allianceIndex < joysticks.length; allianceIndex++)
            {
                for(var curDataIndex = 0; curDataIndex < $autoData[allianceIndex].length; curDataIndex++)
                {
                    $autoData[allianceIndex][curDataIndex].value = autoData[allianceIndex][teamIndexes[allianceIndex]][curDataIndex];
                    $teleopData[allianceIndex][curDataIndex].value = teleopData[allianceIndex][teamIndexes[allianceIndex]][curDataIndex];
                }
                
                $autoZone[allianceIndex].classList.remove(bgColors[0], bgColors[1], bgColors[2], bgColors[3]);
                $autoZone[allianceIndex].classList.add(autoZone[allianceIndex][teamIndexes[allianceIndex]]);
                $teleopZone[allianceIndex].classList.remove(bgColors[0], bgColors[1], bgColors[2], bgColors[3]);
                $teleopZone[allianceIndex].classList.add(teleopZone[allianceIndex][teamIndexes[allianceIndex]]);
            }
        }
        
        if(autoModes[joystickIndex])
        {            
            if(dataIndex > -1)
            {
                $autoData[joystickIndex][dataIndex].value = ($autoData[joystickIndex][dataIndex].value - 0) + 1; 
                autoData[joystickIndex][teamIndexes[joystickIndex]][dataIndex] = $autoData[joystickIndex][dataIndex].value - 0;
            }
            
            if(zoneIndex > -1)
            {
                autoZone[joystickIndex][teamIndexes[joystickIndex]] = bgColors[zoneIndex];
                $autoZone[joystickIndex].classList.remove(bgColors[0], bgColors[1], bgColors[2], bgColors[3]);
                $autoZone[joystickIndex].classList.add(autoZone[joystickIndex][teamIndexes[joystickIndex]]);
            }
        }
        
        else
        {
            if(dataIndex > -1)
            {
                $teleopData[joystickIndex][dataIndex].value = ($teleopData[joystickIndex][dataIndex].value - 0) + 1;
                teleopData[joystickIndex][teamIndexes[joystickIndex]][dataIndex] =  $teleopData[joystickIndex][dataIndex].value - 0;
            }
                
            if(zoneIndex > -1)
            {
                teleopZone[joystickIndex][teamIndexes[joystickIndex]] = bgColors[zoneIndex];
                $teleopZone[joystickIndex].classList.remove(bgColors[0], bgColors[1], bgColors[2], bgColors[3]);
                $teleopZone[joystickIndex].classList.add(teleopZone[joystickIndex][teamIndexes[joystickIndex]]);
            }
        }
    }
   
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
            for(var buttonIndex = 0; buttonIndex < tmpStick.buttons.length && buttonIndex < maxStickButtons; buttonIndex++)
                joysticks[stickIndex].updateButton(buttonIndex, tmpStick.buttons[buttonIndex] > pressedThreshold);
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