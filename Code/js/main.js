var header = "TEAM #,A HIGH,A LOW,A HOT HIGH,A HOT LOW,A ZONE GOAL,A ZONE RED,A ZONE WHITE,A ZONE BLUE,T HIGH,T LOW,T PASSES,T TRUSS,T ZONE NONE,T ZONE RED,T ZONE WHITE,T ZONE BLUE,DEF,LEGIT DEF,OFFENSE,LEGIT OFFENSE,BROKEN,CATCH FROM PLAYER,LOOSE GRIP,2BALL AUTO,GOOD WITH US,COMMENTS,\n";
var keyCodes = { zero: 48, nine: 57, tab: 9 };
var joyCodes = { a: 0, b: 1, x: 2, y: 3, leftBumper: 4, rightBumper: 5, leftTrigger: 6, rightTrigger: 7, back: 8, start: 9, leftStick: 10, rightStick: 11, dpadUp: 12, dpadDown: 13, dpadLeft: 14, dpadRight: 15 };
var tagKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
var maxStickButtons = 16;
var pressedThreshold = 0.5;
var borderColors = ["borderRed", "borderBlue", "borderPurple", "borderGray"];
var bgColors = ["backgroundBlack", "backgroundRed", "backgroundWhite", "backgroundBlue"];

// DOM elements
var $autoContainer;
var $teleopContainer;
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
var autoModes = [true, true];

$(document).ready(init);

// Called when document loads
function init()
{
    $("input").keypress(textInputCallback);
    $("input").blur(updateTeamData);
    $("input.team").click(teamClickedCallback);
    $("textarea").blur(updateTeamData);
    $("div[id*=Zone").click(zonesClickedCallback);
    $("#saveMatchFileBox").click(saveMatchFile);
    $("#createMasterFileBox").click(function(){ $("#createMasterFile").click(); });
    $("#createMasterFile").change(getLoadedFiles);
    $(document).on('click','input[type=text]',function(){ this.select(); });
    $autoContainer = $("#autoContainer")[0];
    $teleopContainer = $("#teleopContainer")[0];
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
    updateDom();
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
        autoModes[stickIndex] = true;
        
        for(var teamIndex = 0; teamIndex < $alliance[0].length; teamIndex++)
        {
            $alliance[stickIndex][teamIndex].value = teamIndex + 1;
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
        if(joysticks[joystickIndex].getButton(joyCodes.start))
            autoModes[joystickIndex] = false;
        
        if(joysticks[joystickIndex].getButton(joyCodes.back))
            autoModes[joystickIndex] = true;
        
        var teamIndex = -1;
        
        if(joysticks[joystickIndex].getButton(joyCodes.leftBumper))
            if((teamIndex = teamIndexes[joystickIndex] - 1) < 0)
                teamIndex = 2;
        
        if(joysticks[joystickIndex].getButton(joyCodes.rightBumper))
            if((teamIndex = teamIndexes[joystickIndex] + 1) > 2)
                teamIndex = 0;
        
        var zoneIndex = -1;
        
        if(joysticks[joystickIndex].getButton(joyCodes.dpadDown))
            zoneIndex = 0;
        
        if(joysticks[joystickIndex].getButton(joyCodes.dpadLeft))
            zoneIndex = 1;
        
        if(joysticks[joystickIndex].getButton(joyCodes.dpadUp))
            zoneIndex = 2;
        
        if(joysticks[joystickIndex].getButton(joyCodes.dpadRight))
            zoneIndex = 3;
        
        var dataIndex = -1;
            
        if(joysticks[joystickIndex].getButton(joyCodes.a))
            dataIndex = 3;

        if(joysticks[joystickIndex].getButton(joyCodes.b))
            dataIndex = 2;

        if(joysticks[joystickIndex].getButton(joyCodes.x))
            dataIndex = 1;

        if(joysticks[joystickIndex].getButton(joyCodes.y))
            dataIndex = 0;

        if(teamIndex > -1)
        {
            teamIndexes[joystickIndex] = teamIndex;
            updateDom();
        }

        if(autoModes[joystickIndex] && dataIndex > -1 && zoneIndex > -1)
        {   
            if(dataIndex > -1)
                autoData[joystickIndex][teamIndexes[joystickIndex]][dataIndex]++;

            if(zoneIndex > -1)
                autoZone[joystickIndex][teamIndexes[joystickIndex]] = bgColors[zoneIndex];

            updateDom();
        }

        else if(dataIndex > -1 && zoneIndex > -1)
        {
            if(dataIndex > -1)
                teleopData[joystickIndex][teamIndexes[joystickIndex]][dataIndex]++;

            if(zoneIndex > -1)
                teleopZone[joystickIndex][teamIndexes[joystickIndex]] = bgColors[zoneIndex];

            updateDom();
        }
    }
    
    window.webkitRequestAnimationFrame(main);
}

// Saves the match data into a .csv match file
function saveMatchFile()
{
    var fileData = header;
    
    for(var allianceIndex = 0; allianceIndex < autoData.length; allianceIndex++)
    {
        for(var teamIndex = 0; teamIndex < autoData[allianceIndex].length; teamIndex++)
        {
            // Team number
            fileData += $alliance[allianceIndex][teamIndex].value + ",";
            
            // Auto data
            for(var dataIndex = 0; dataIndex < autoData[allianceIndex][teamIndex].length; dataIndex++)
                fileData += autoData[allianceIndex][teamIndex][dataIndex] + ",";
            
            // Auto zone data
            for(var bgIndex = 0; bgIndex < bgColors.length; bgIndex++)
            {
                var foundZone = false;
                
                if(autoZone[allianceIndex][teamIndex] === bgColors[bgIndex])
                    foundZone = true;
                
                fileData += foundZone + ",";
            }
                 
            // Teleop data
            for(var dataIndex = 0; dataIndex < teleopData[allianceIndex][teamIndex].length; dataIndex++)
                fileData += teleopData[allianceIndex][teamIndex][dataIndex] + ",";
            
            // Teleop zone data
            for(var bgIndex = 0; bgIndex < bgColors.length; bgIndex++)
            {
                var foundZone = false;
           
                if(teleopZone[allianceIndex][teamIndex] === bgColors[bgIndex])
                    foundZone = true;
                
                fileData += foundZone + ",";
            }
            
            // Tag data
            for(var tagIndex = 0; tagIndex < tagKeys.length; tagIndex++)
            {
                var foundTag = false;
                
                for(var tagDataIndex = 0; tagDataIndex < tags[allianceIndex][teamIndex].length; tagDataIndex++)
                {
                    if(tagKeys[tagIndex] === tags[allianceIndex][teamIndex][tagDataIndex])
                    {
                        foundTag = true;
                        break;
                    }
                }
                
                fileData += foundTag + ",";
            }
            
            // Comments
            fileData += comments[allianceIndex][teamIndex] + ",\n";
        }
    }
    
    writeToFile(fileData, "Match " + $matchNumber.value + ".csv");
    reset();
}

// Reads all files
function getLoadedFiles(evt)
{
    print("MASTERFILE BUTTON CLICKED");
    
    var files = evt.target.files;
    var data = "";
    var filesLoaded = 0;
    var filesLength = files.length;
    
    for (var i = 0, f; (f = files[i]); i++)
    {   
        var reader = new FileReader();

        reader.onload = function()
        {
            data += this.result;
            
            if(++filesLoaded === filesLength)
                createMasterFile(data);
        };

        reader.readAsText(f);
    }
}

// Created master file of teams
function createMasterFile(matchesData)
{
    var matches = matchesData.split("\n");
    matches.pop();
    var teams = [];
    var curTeamIndex = 0;
    
    for(var matchIndex = 0; matchIndex < matches.length; matchIndex++)
    {
        if(matchIndex % 7 !== 0)
        {
            var foundTeam = false;
            var curTeamNumber = parseInt(matches[matchIndex].substring(0, matches[matchIndex].indexOf(",")));

            for(var teamsIndex = 0; teamsIndex < teams.length; teamsIndex++)
            {
                if(teams[teamsIndex].teamNumber === curTeamNumber)
                {
                    curTeamIndex = teamsIndex;
                    foundTeam = true;
                    break;
                }
            }

            if(!foundTeam)
            {
                teams.push(new Team(curTeamNumber));
                curTeamIndex = teams.length - 1;
            }

            teams[curTeamIndex].processData(matches[matchIndex].substring(matches[matchIndex].indexOf(",") + 1));
        }
    }
    
    var fileData = header;
    
    for(var curTeamIndex in teams)
        fileData += teams[curTeamIndex].getAvgDataStr() + "\n" + teams[curTeamIndex].getTotalDataStr() + "\n";
    
    writeToFile(fileData, "MasterFile.csv");
}

// Writes the data to the users computer with the specified name
function writeToFile(data, fileName)
{
    var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
    saveAs(blob, fileName);
}

// Updates joystick
function updateJoysticks()
{
    var sticks = navigator.webkitGetGamepads();
    
    for(var stickIndex = 0; stickIndex < sticks.length && stickIndex < 2; stickIndex++)
        if(sticks[stickIndex])
            for(var buttonIndex = 0; buttonIndex < sticks[stickIndex].buttons.length && buttonIndex < maxStickButtons; buttonIndex++)
                joysticks[stickIndex].updateButton(buttonIndex, sticks[stickIndex].buttons[buttonIndex] > pressedThreshold);
}

// Updates the team data 
function updateTeamData()
{
    for(var allianceIndex = 0; allianceIndex < joysticks.length; allianceIndex++)
    {
        for(var curDataIndex = 0; curDataIndex < $autoData[allianceIndex].length; curDataIndex++)
        {
            autoData[allianceIndex][teamIndexes[allianceIndex]][curDataIndex] = $autoData[allianceIndex][curDataIndex].value - 0;
            teleopData[allianceIndex][teamIndexes[allianceIndex]][curDataIndex] = $teleopData[allianceIndex][curDataIndex].value - 0;
        }
        
        for(var zoneIndex = 0; zoneIndex < bgColors.length; zoneIndex++)
        {
            if($autoZone[allianceIndex].classList.contains(bgColors[zoneIndex]))
                autoZone[allianceIndex][teamIndexes[allianceIndex]] = bgColors[zoneIndex];
            
            if($teleopZone[allianceIndex].classList.contains(bgColors[zoneIndex]))
                teleopZone[allianceIndex][teamIndexes[allianceIndex]] = bgColors[zoneIndex];
        }
        
        tags[allianceIndex][teamIndexes[allianceIndex]] = $tags[allianceIndex].value;
        comments[allianceIndex][teamIndexes[allianceIndex]] = $comments[allianceIndex].value;
    }
}

// Updates the DOM elements
function updateDom()
{
    $autoContainer.classList.remove(borderColors[0], borderColors[1], borderColors[2], borderColors[3]);
    $teleopContainer.classList.remove(borderColors[0], borderColors[1], borderColors[2], borderColors[3]);
        
    for(var allianceIndex = 0; allianceIndex < joysticks.length; allianceIndex++)
    {
        if(autoModes[allianceIndex])
            $autoContainer.classList.add(borderColors[allianceIndex]);
        
        else
            $teleopContainer.classList.add(borderColors[allianceIndex]);
        
        for(var curTeamIndex = 0; curTeamIndex < $alliance[allianceIndex].length; curTeamIndex++)
            $alliance[allianceIndex][curTeamIndex].style.opacity = 0.5;
        
        $alliance[allianceIndex][teamIndexes[allianceIndex]].style.opacity = 1;
        
        for(var curDataIndex = 0; curDataIndex < $autoData[allianceIndex].length; curDataIndex++)
        {
            $autoData[allianceIndex][curDataIndex].value = autoData[allianceIndex][teamIndexes[allianceIndex]][curDataIndex];
            $teleopData[allianceIndex][curDataIndex].value = teleopData[allianceIndex][teamIndexes[allianceIndex]][curDataIndex];
        }

        $autoZone[allianceIndex].classList.remove(bgColors[0], bgColors[1], bgColors[2], bgColors[3]);
        $autoZone[allianceIndex].classList.add(autoZone[allianceIndex][teamIndexes[allianceIndex]]);
        $teleopZone[allianceIndex].classList.remove(bgColors[0], bgColors[1], bgColors[2], bgColors[3]);
        $teleopZone[allianceIndex].classList.add(teleopZone[allianceIndex][teamIndexes[allianceIndex]]);
        $tags[allianceIndex].value = tags[allianceIndex][teamIndexes[allianceIndex]];
        $comments[allianceIndex].value = comments[allianceIndex][teamIndexes[allianceIndex]];
    }
    
    if($autoContainer.classList.contains(borderColors[0]) && $autoContainer.classList.contains(borderColors[1]))
    {
        $autoContainer.classList.remove(borderColors[0], borderColors[1], borderColors[2], borderColors[3]);
        $autoContainer.classList.add(borderColors[2]);
        $teleopContainer.classList.add(borderColors[3]);
    }
    
    if($teleopContainer.classList.contains(borderColors[0]) && $teleopContainer.classList.contains(borderColors[1]))
    {
        $teleopContainer.classList.remove(borderColors[0], borderColors[1], borderColors[2], borderColors[3]);
        $teleopContainer.classList.add(borderColors[2]);
        $autoContainer.classList.add(borderColors[3]);
    }
}

// Prevents input from entering a non-number input
function textInputCallback(e)
{
    var code = e.keyCode;
    
    if(code !== keyCodes.tab && (code < keyCodes.zero || code > keyCodes.nine))
        return false;
}

// Changes zone color when user clicks on them
function zonesClickedCallback(e)
{
    for(var zoneColorIndex = 0; zoneColorIndex < bgColors.length; zoneColorIndex++)
    {
        if(e.target.classList.contains(bgColors[zoneColorIndex]))
        {
            var newColor = bgColors[(zoneColorIndex + 1) % bgColors.length];
            var allianceIndex = e.target.id.indexOf("red") > -1 ? 0 : 1;
            
            if(e.target.id.indexOf("Auto") > -1)
                autoZone[allianceIndex][teamIndexes[allianceIndex]] = newColor;

            else
                teleopZone[allianceIndex][teamIndexes[allianceIndex]] = newColor;

            break;
        }
    }
   
    updateDom();
}

// Changes team to enter data for when the div is clicked
function teamClickedCallback(e)
{
    var isRed = e.target.id.indexOf("red") > -1;
    
    if(isRed)
        teamIndexes[0] = e.target.id.substring("red".length) - 0 - 1;
    
    else
        teamIndexes[1] = e.target.id.substring("blue".length) - 0 - 1;
    
    updateDom();
}

// Rounds a number to tenths place
function round(number)
{
    return Math.floor((number * 100) + 0.005) / 100;
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

function Team(teamNumber)
{
    this.matches = 0;
    this.teamNumber = teamNumber;
    this.autoData = [0, 0, 0, 0];
    this.autoZones = [0, 0, 0, 0];
    this.teleopData = [0, 0, 0, 0];
    this.teleopZones = [0, 0, 0, 0];
    this.tags = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.comments = "";
}

Team.prototype.processData = function(data)
{
    this.matches++;
    data = data.split(",");
    data.pop();
    print("Process Called: " + data);
    var dataIndex = 0;
    
    for(var curDataIndex = 0; curDataIndex < $autoData[0].length; curDataIndex++)
        this.autoData[curDataIndex] += parseInt(data[curDataIndex + dataIndex]);
    
    dataIndex += $autoData[0].length;
    
    for(var curDataIndex = 0; curDataIndex < bgColors.length; curDataIndex++)
        if(data[curDataIndex + dataIndex] === "true")
            this.autoZones[curDataIndex]++;
    
    dataIndex += bgColors.length;
    
    for(var curDataIndex = 0; curDataIndex < $teleopData[0].length; curDataIndex++)
        this.teleopData[curDataIndex] += parseInt(data[curDataIndex + dataIndex]);
    
    dataIndex += $teleopData[0].length;
    
    for(var curDataIndex = 0; curDataIndex < bgColors.length; curDataIndex++)
        if(data[curDataIndex + dataIndex] === "true")
            this.teleopZones[curDataIndex]++;
    
    dataIndex += bgColors.length;
    
    for(var curTagIndex = 0; curTagIndex < tagKeys.length; curTagIndex++)
        if(data[curTagIndex + dataIndex] === "true")
            this.tags[curTagIndex]++;
    
    dataIndex += tagKeys.length;
    this.comments += data[dataIndex] + "-";
};

Team.prototype.getAvgDataStr = function()
{
    var str = this.teamNumber + ",";
    
    for(var dataIndex = 0; dataIndex < this.autoData.length; dataIndex++)
        str += round(this.autoData[dataIndex] / this.matches) + " pts,";
    
    for(var dataIndex = 0; dataIndex < this.autoZones.length; dataIndex++)
        str += round((this.autoZones[dataIndex] / this.matches) * 100) + "%,";
    
    for(var dataIndex = 0; dataIndex < this.teleopData.length; dataIndex++)
        str += round(this.teleopData[dataIndex] / this.matches) + " pts,";
    
    for(var dataIndex = 0; dataIndex < this.teleopZones.length; dataIndex++)
        str += round((this.teleopZones[dataIndex] / this.matches) * 100) + "%,";
    
    for(var dataIndex = 0; dataIndex < this.tags.length; dataIndex++)
        str += round((this.tags[dataIndex] / this.matches) * 100) + "%,";
    
    str += this.comments + ",";
    return str;
};

Team.prototype.getTotalDataStr = function()
{
    var str = this.teamNumber + ",";
    
    for(var dataIndex = 0; dataIndex < this.autoData.length; dataIndex++)
        str += this.autoData[dataIndex] + " pts,";
    
    for(var dataIndex = 0; dataIndex < this.autoZones.length; dataIndex++)
        str += this.autoZones[dataIndex] + " times,";
    
    for(var dataIndex = 0; dataIndex < this.teleopData.length; dataIndex++)
        str += this.teleopData[dataIndex] + " pts,";
    
    for(var dataIndex = 0; dataIndex < this.teleopZones.length; dataIndex++)
        str += this.teleopZones[dataIndex] + " times,";
    
    for(var dataIndex = 0; dataIndex < this.tags.length; dataIndex++)
        str += this.tags[dataIndex] + " times,";
    
    str += this.comments + ",";
    return str;
};