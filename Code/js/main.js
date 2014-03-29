var header = "TEAM #,A HIGH,A LOW,A HOT HIGH,A HOT LOW,A ZONE GOAL,A ZONE RED,A ZONE WHITE,A ZONE BLUE,T HIGH,T LOW,T PASSES,T TRUSS,T ZONE NONE,T ZONE RED,T ZONE WHITE,T ZONE BLUE,DEF,LEGIT DEF,OFFENSE,LEGIT OFFENSE,BROKEN,CATCH FROM PLAYER,LOOSE GRIP,2BALL AUTO,GOOD WITH US,COMMENTS\n";
var keyCodes = { zero: 48, nine: 57, tab: 9 };
var joyCodes = { a: 0, b: 1, x: 2, y: 3, leftBumper: 4, rightBumper: 5, leftTrigger: 6, rightTrigger: 7, back: 8, start: 9, leftStick: 10, rightStick: 11, dpadUp: 12, dpadDown: 13, dpadLeft: 14, dpadRight: 15 };
var tagKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
var maxSticks = 2;
var maxStickButtons = 16;
var pressedThreshold = 0.5;
var dataLength = 4;
var zoneColors = { black: "backgroundBlack", red: "backgroundRed", white: "backgroundWhite", blue: "backgroundBlue", length: 4 };
var borderColors = { gray: "borderGray", purple: "borderPurple", red: "borderRed", blue: "borderBlue" };

// DOM elements
var $autoContainer;
var $teleopContainer;
var $matchNumber;
var $alliance = [[], []];
var $autoData = [[], []];
var $teleopData = [[], []];
var $tags = [];
var $comments = [];

// Data for each robot
var autoData = [[[], [], []], [[], [], []]];
var teleopData = [[[], [], []], [[], [], []]];
var tags = [["", "", ""], ["", "", ""]];
var comments = [["", "", ""], ["", "", ""]]; 

var joysticks = [0, 0];
var teamIndexes = [0, 0];
var autoModes = [true, true];

$(document).ready(init);

// Called when document loads
function init()
{
    $(document).keyup(updateTeamData);
    $(document).on('click','input[type=text]',function(){ this.select(); });
    $("input").keypress(textInputCallback);
    $("input.team").click(teamClickedCallback);
    $("div[id*=Zone").click(zonesClickedCallback);
    $("#saveMatchFileBox").click(saveMatchFile);
    $("#createMasterFileBox").click(function(){ $("#createMasterFile").click(); });
    $("#createMasterFile").change(getLoadedFiles);
    
    $autoContainer = $("#autoContainer")[0];
    $teleopContainer = $("#teleopContainer")[0];
    $matchNumber = $("#matchNumber")[0];
    $matchNumber.value = 0;
    
    $alliance = [
        $("*.team[id*=red]"),
        $("*.team[id*=blue]")
    ];
    $autoData = [
        { high: $("#redAutoHigh")[0], low: $("#redAutoLow")[0], hotHigh: $("#redAutoHotHigh")[0], hotLow: $("#redAutoHotLow")[0], zone: $("#redAutoZone")[0] },
        { high: $("#blueAutoHigh")[0], low: $("#blueAutoLow")[0], hotHigh: $("#blueAutoHotHigh")[0], hotLow: $("#blueAutoHotLow")[0], zone: $("#blueAutoZone")[0] }
    ];
    $teleopData = [
        { high: $("#redTeleopHigh")[0], low: $("#redTeleopLow")[0], passes: $("#redTeleopPasses")[0], truss: $("#redTeleopTruss")[0], zone: $("#redTeleopZone")[0] },
        { high: $("#blueTeleopHigh")[0], low: $("#blueTeleopLow")[0], passes: $("#blueTeleopPasses")[0], truss: $("#blueTeleopTruss")[0], zone: $("#blueTeleopZone")[0] }
    ];
    $tags = [
        $("#redTags")[0],
        $("#blueTags")[0]
    ];
    $comments = [
        $("#redComments")[0],
        $("#blueComments")[0]
    ];
    
    print("Inited");
    reset();
    main();
}

// Resets everything in the scouting application
function reset()
{
    $matchNumber.value = 1 + ($matchNumber.value - 0);
    
    for(var stickIndex = 0; stickIndex < maxSticks; stickIndex++)
    {
        joysticks[stickIndex] = new Joystick();
        teamIndexes[stickIndex] = 0;
        autoModes[stickIndex] = true;
        
        for(var teamIndex = 0; teamIndex < $alliance[stickIndex].length; teamIndex++)
        {
            $alliance[stickIndex][teamIndex].value = teamIndex + 1;
            autoData[stickIndex][teamIndex] = { high: 0, low: 0, hotHigh: 0, hotLow: 0, zone: zoneColors.black };
            teleopData[stickIndex][teamIndex] = { high: 0, low: 0, passes: 0, truss: 0, zone: zoneColors.black };
            tags[stickIndex][teamIndex] = "";
            comments[stickIndex][teamIndex] = ""; 
        }
    }
    
    updateDom();
}

// Main loop for program
function main()
{
    updateJoysticks();
    var needUpdateDom = false;
    
    for(var joystickIndex = 0; joystickIndex < joysticks.length; joystickIndex++)
    {
        if(joysticks[joystickIndex].getButton([joyCodes.start, joyCodes.back]))
        {
            if(joysticks[joystickIndex].getButton(joyCodes.start))
                autoModes[joystickIndex] = false;
            
            else
                autoModes[joystickIndex] = true;
            
            needUpdateDom = true;
        }
        
        if(joysticks[joystickIndex].getButton([joyCodes.leftBumper, joyCodes.rightBumper]))
        {
            if(joysticks[joystickIndex].getButton(joyCodes.leftBumper))
            {
                if(--teamIndexes[joystickIndex] < 0)
                    teamIndexes[joystickIndex] = $alliance[joystickIndex].length - 1;
            }
            
            else
            {
                if(++teamIndexes[joystickIndex] > $alliance[joystickIndex].length - 1)
                    teamIndexes[joystickIndex] = 0;
            }
            
            needUpdateDom = true;
        }
        
        var newZoneColor = null;
            
        if(joysticks[joystickIndex].getButton(joyCodes.dpadDown))
            newZoneColor = zoneColors.black;

        if(joysticks[joystickIndex].getButton(joyCodes.dpadLeft))
            newZoneColor = zoneColors.red;

        if(joysticks[joystickIndex].getButton(joyCodes.dpadUp))
            newZoneColor = zoneColors.white;

        if(joysticks[joystickIndex].getButton(joyCodes.dpadRight))
            newZoneColor = zoneColors.blue;
        
        if(joysticks[joystickIndex].getButton([joyCodes.a, joyCodes.b, joyCodes.x, joyCodes.y]) || newZoneColor !== null)
        {
            if(autoModes[joystickIndex])
            {
                if(newZoneColor !== null)
                    autoData[joystickIndex][teamIndexes[joystickIndex]].zone = newZoneColor;
                
                if(joysticks[joystickIndex].getButton(joyCodes.y))
                    autoData[joystickIndex][teamIndexes[joystickIndex]].high++;

                if(joysticks[joystickIndex].getButton(joyCodes.a))
                    autoData[joystickIndex][teamIndexes[joystickIndex]].low++;

                if(joysticks[joystickIndex].getButton(joyCodes.x))
                    autoData[joystickIndex][teamIndexes[joystickIndex]].hotHigh++;

                if(joysticks[joystickIndex].getButton(joyCodes.b))
                    autoData[joystickIndex][teamIndexes[joystickIndex]].hotLow++;
            }
            
            else
            {
                if(newZoneColor !== null)
                    teleopData[joystickIndex][teamIndexes[joystickIndex]].zone = newZoneColor;
                
                if(joysticks[joystickIndex].getButton(joyCodes.y))
                    teleopData[joystickIndex][teamIndexes[joystickIndex]].high++;

                if(joysticks[joystickIndex].getButton(joyCodes.a))
                    teleopData[joystickIndex][teamIndexes[joystickIndex]].low++;

                if(joysticks[joystickIndex].getButton(joyCodes.x))
                    teleopData[joystickIndex][teamIndexes[joystickIndex]].passes++;

                if(joysticks[joystickIndex].getButton(joyCodes.b))
                    teleopData[joystickIndex][teamIndexes[joystickIndex]].truss++;
            }
        
            needUpdateDom = true;
        }
    }
    
    if(needUpdateDom)
        updateDom();
    
    window.webkitRequestAnimationFrame(main);
}

// Sets the zone color of the specified zone
function setZoneColor(curColors, newColor)
{
    curColors.remove(zoneColors.black, zoneColors.red, zoneColors.white, zoneColors.blue);
    curColors.add(newColor);
    return curColors;
}

// Gets the zone color of the specified zone
function getZoneColor(curColors)
{
    if(curColors.contains(zoneColors.red))
        return zoneColors.red;
    
    if(curColors.contains(zoneColors.white))
        return zoneColors.white;
    
    if(curColors.contains(zoneColors.blue))
        return zoneColors.blue;
    
    return zoneColors.black;
}

// Sets the data container border color
function setContainerColor(curColors, newColor)
{
    curColors.remove(borderColors.purple, borderColors.red, borderColors.blue);
    curColors.add(newColor);
    return curColors;
}

// Saves the match data into a .csv match file
function saveMatchFile()
{
    var fileData = header;
    
    for(var allianceIndex = 0; allianceIndex < $alliance.length; allianceIndex++)
    {
        for(var teamIndex = 0; teamIndex < $alliance[allianceIndex].length; teamIndex++)
        {
            // Team number
            fileData += $alliance[allianceIndex][teamIndex].value + ",";
            
            // Auto data
            fileData += autoData[allianceIndex][teamIndex].high + ",";
            fileData += autoData[allianceIndex][teamIndex].low + ",";
            fileData += autoData[allianceIndex][teamIndex].hotHigh + ",";
            fileData += autoData[allianceIndex][teamIndex].hotLow + ",";
            fileData += (autoData[allianceIndex][teamIndex].zone === zoneColors.black) + ",";
            fileData += (autoData[allianceIndex][teamIndex].zone === zoneColors.red) + ",";
            fileData += (autoData[allianceIndex][teamIndex].zone === zoneColors.white) + ",";
            fileData += (autoData[allianceIndex][teamIndex].zone === zoneColors.blue) + ",";
            
            // Teleop data
            fileData += teleopData[allianceIndex][teamIndex].high + ",";
            fileData += teleopData[allianceIndex][teamIndex].low + ",";
            fileData += teleopData[allianceIndex][teamIndex].passes + ",";
            fileData += teleopData[allianceIndex][teamIndex].truss + ",";
            fileData += (teleopData[allianceIndex][teamIndex].zone === zoneColors.black) + ",";
            fileData += (teleopData[allianceIndex][teamIndex].zone === zoneColors.red) + ",";
            fileData += (teleopData[allianceIndex][teamIndex].zone === zoneColors.white) + ",";
            fileData += (teleopData[allianceIndex][teamIndex].zone === zoneColors.blue) + ",";
            
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
            fileData += comments[allianceIndex][teamIndex] + "\n";
        }
    }
    
    writeToFile(fileData, "Match " + $matchNumber.value + ".csv");
    reset();
}

// Reads all files
function getLoadedFiles(e)
{
    print("MASTERFILE BUTTON CLICKED");
 
    var files = e.target.files;
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
    
    e.target.value = "";
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
        if(matchIndex % 7 !== 0) // Skip the header data
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
    
    for(var stickIndex = 0; stickIndex < sticks.length && stickIndex < maxSticks; stickIndex++)
        if(sticks[stickIndex])
            for(var buttonIndex = 0; buttonIndex < sticks[stickIndex].buttons.length && buttonIndex < maxStickButtons; buttonIndex++)
                joysticks[stickIndex].updateButton(buttonIndex, sticks[stickIndex].buttons[buttonIndex] > pressedThreshold);
}

// Updates the team data 
function updateTeamData()
{
    for(var allianceIndex = 0; allianceIndex < $alliance.length; allianceIndex++)
    {
        autoData[allianceIndex][teamIndexes[allianceIndex]].high = $autoData[allianceIndex].high.value - 0;
        autoData[allianceIndex][teamIndexes[allianceIndex]].low = $autoData[allianceIndex].low.value - 0;
        autoData[allianceIndex][teamIndexes[allianceIndex]].hotHigh = $autoData[allianceIndex].hotHigh.value - 0;
        autoData[allianceIndex][teamIndexes[allianceIndex]].hotLow = $autoData[allianceIndex].hotLow.value - 0;
        autoData[allianceIndex][teamIndexes[allianceIndex]].zone = getZoneColor($autoData[allianceIndex].zone.classList);
        
        teleopData[allianceIndex][teamIndexes[allianceIndex]].high = $teleopData[allianceIndex].high.value - 0;
        teleopData[allianceIndex][teamIndexes[allianceIndex]].low = $teleopData[allianceIndex].low.value - 0;
        teleopData[allianceIndex][teamIndexes[allianceIndex]].passes = $teleopData[allianceIndex].passes.value - 0;
        teleopData[allianceIndex][teamIndexes[allianceIndex]].truss = $teleopData[allianceIndex].truss.value - 0;
        teleopData[allianceIndex][teamIndexes[allianceIndex]].zone = getZoneColor($teleopData[allianceIndex].zone.classList);
        
        tags[allianceIndex][teamIndexes[allianceIndex]] = $tags[allianceIndex].value;
        comments[allianceIndex][teamIndexes[allianceIndex]] = $comments[allianceIndex].value;
    }
}

// Updates the DOM elements
function updateDom()
{  
    for(var allianceIndex = 0; allianceIndex < $alliance.length; allianceIndex++)
    {
        for(var curTeamIndex = 0; curTeamIndex < $alliance[allianceIndex].length; curTeamIndex++)
            $alliance[allianceIndex][curTeamIndex].style.opacity = 0.5;
        
        $alliance[allianceIndex][teamIndexes[allianceIndex]].style.opacity = 1;
        $autoData[allianceIndex].high.value = autoData[allianceIndex][teamIndexes[allianceIndex]].high;
        $autoData[allianceIndex].low.value = autoData[allianceIndex][teamIndexes[allianceIndex]].low;
        $autoData[allianceIndex].hotHigh.value = autoData[allianceIndex][teamIndexes[allianceIndex]].hotHigh;
        $autoData[allianceIndex].hotLow.value = autoData[allianceIndex][teamIndexes[allianceIndex]].hotLow;
        $autoData[allianceIndex].zone.classList = setZoneColor($autoData[allianceIndex].zone.classList, autoData[allianceIndex][teamIndexes[allianceIndex]].zone);
        
        $teleopData[allianceIndex].high.value = teleopData[allianceIndex][teamIndexes[allianceIndex]].high;
        $teleopData[allianceIndex].low.value = teleopData[allianceIndex][teamIndexes[allianceIndex]].low;
        $teleopData[allianceIndex].passes.value = teleopData[allianceIndex][teamIndexes[allianceIndex]].passes;
        $teleopData[allianceIndex].truss.value = teleopData[allianceIndex][teamIndexes[allianceIndex]].truss;
        $teleopData[allianceIndex].zone.classList = setZoneColor($teleopData[allianceIndex].zone.classList, teleopData[allianceIndex][teamIndexes[allianceIndex]].zone);

        $tags[allianceIndex].value = tags[allianceIndex][teamIndexes[allianceIndex]];
        $comments[allianceIndex].value = comments[allianceIndex][teamIndexes[allianceIndex]];
    }
    
    var autoColor = borderColors.gray;
    var teleopColor = borderColors.gray;
    
    if(autoModes[0] !== autoModes[1])
    {
        if(autoModes[0]) // Red alliance
            autoColor = borderColors.red;

        else // Red alliance
            teleopColor = borderColors.red;
        
        if(autoModes[1]) // Blue alliance
            autoColor = borderColors.blue;

        else // Red alliance
            teleopColor = borderColors.blue;
    }
    
    else if(autoModes[0])
        autoColor = borderColors.purple;
    
    else
        teleopColor = borderColors.purple;
    
    $autoContainer.classList = setContainerColor($autoContainer.classList, autoColor);
    $teleopContainer.classList = setContainerColor($teleopContainer.classList, teleopColor);
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
    var curZoneColor = getZoneColor(e.target.classList);
    
    if(curZoneColor === zoneColors.black)
        setZoneColor(e.target.classList, zoneColors.red);
    
    if(curZoneColor === zoneColors.red)
        setZoneColor(e.target.classList, zoneColors.white);
    
    if(curZoneColor === zoneColors.white)
        setZoneColor(e.target.classList, zoneColors.blue);
    
    if(curZoneColor === zoneColors.blue)
        setZoneColor(e.target.classList, zoneColors.black);
    
    updateTeamData();
}

// Changes team to enter data for when the div is clicked
function teamClickedCallback(e)
{
    if(e.target.id.indexOf("red") > -1)
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
    if(typeof(index) === "number")
        return this.buttons[index];
    
    else
        for(var newIndex in index)
            if(this.buttons[index[newIndex]])
                return true;
    
    return false;
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
    print("Process Called: " + data);
    var dataIndex = 0;
    
    for(var curDataIndex = 0; curDataIndex < dataLength; curDataIndex++)
        this.autoData[curDataIndex] += parseInt(data[curDataIndex + dataIndex]);
    
    dataIndex += dataLength;
    
    for(var curDataIndex = 0; curDataIndex < zoneColors.length; curDataIndex++)
        if(data[curDataIndex + dataIndex] === "true")
            this.autoZones[curDataIndex]++;
    
    dataIndex += zoneColors.length;
    
    for(var curDataIndex = 0; curDataIndex < dataLength; curDataIndex++)
        this.teleopData[curDataIndex] += parseInt(data[curDataIndex + dataIndex]);
    
    dataIndex += dataLength;
    
    for(var curDataIndex = 0; curDataIndex < zoneColors.length; curDataIndex++)
        if(data[curDataIndex + dataIndex] === "true")
            this.teleopZones[curDataIndex]++;
    
    dataIndex += zoneColors.length;
    
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
    
    str += this.comments;
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
    
    str += this.comments;
    return str;
};