var header = "TEAM #,A HIGH,A LOW,A HOT HIGH,A HOT LOW,A HIGH ATTEMPTS,T HIGH,T LOW,T PASSES,T TRUSS,T HIGH ATTEMPTS,T TRUSS ATTEMPTS,OFFENSE,LEGIT OFFENSE,DEF,LEGIT DEF,BROKEN,CATCH FROM PLAYER,LOOSE GRIP,2BALL AUTO,GOOD WITH US,COMMENTS\n";
var keyCodes = { zero: 48, nine: 57, tab: 9 };
var joyCodes = { a: 0, b: 1, x: 2, y: 3, leftBumper: 4, rightBumper: 5, leftTrigger: 6, rightTrigger: 7, back: 8, start: 9, leftStick: 10, rightStick: 11, dpadUp: 12, dpadDown: 13, dpadLeft: 14, dpadRight: 15 };
var maxSticks = 2;
var maxStickButtons = 16;
var pressedThreshold = 0.5;
var tagColors = { red: "backgroundRed", blue: "backgroundBlue", gray: "backgroundLightGray"};
var borderColors = { gray: "borderGray", purple: "borderPurple", red: "borderRed", blue: "borderBlue", lightGray: "borderLightGray" };
var teamNumbers = [];
var joyModes = { auto: 1, teleop: 2, tag: 3 };
var joyMode = [joyModes.auto, joyModes.auto];
var lastInput = [{ input: null, m: null }, { input: null, m: null }];

// DOM elements
var $containers = {};
var $matchNumber;
var $alliance = [];
var $autoData = [];
var $teleopData = [];
var $tags = [];
var $comments = [];

// Data for each robot
var autoData = [[[], [], []], [[], [], []]];
var teleopData = [[[], [], []], [[], [], []]];
var tags = [[[], [], []], [[], [], []]];
var comments = [["", "", ""], ["", "", ""]]; 

var joysticks = [0, 0];
var teamIndexes = [0, 0];

$(document).ready(init);

// Called when document loads
function init()
{
    $("input[type=text]").keypress(preventNonNumber);
    $("input[type=text]").keyup(updateTeamData);
    $("input[type=text]").change(preventEmptyInput);
    $("input[type=text]").click(function(){ this.select(); });
    $("input[type=text].team").click(teamClicked);
    $("textarea").keyup(updateTeamData);
    $("#redTags").find("div.tag").click(function(){ tagsClicked(true, this.id); });
    $("#blueTags").find("div.tag").click(function(){ tagsClicked(false, this.id); });
    $("#matchTitleBox").dblclick(function(){ $("#getTeamNumbers").click(); });
    $("#saveMatchFileBox").click(saveMatchFile);
    $("#createMasterFileBox").click(function(){ $("#createMasterFile").click(); });
    $("#createMasterFile").change(getMatchFiles);
    $("#matchNumber").keyup(updateTeamNumbers);
    $("#getTeamNumbers").change(getTeamNumbersFile);
    
    $matchNumber = $("#matchNumber")[0];
    $matchNumber.value = 0;
    
    $containers = { 
        auto: $("#autoContainer")[0],
        teleop: $("#teleopContainer")[0],
        redTags: $("#redTags")[0],
        blueTags: $("#blueTags")[0]
    };
    
    $alliance = [
        $("*.team[id*=red]"),
        $("*.team[id*=blue]")
    ];
    
    for(var i = 0; i < 2; i++)
    {
        var teamColor = i == 0 ? "#red" : "#blue";
        var $tmpTags = i == 0 ? $("div[id='redTags']") : $("div[id='blueTags']");
    
        $autoData.push({
            high: $(teamColor + "AutoHigh")[0], 
            low: $(teamColor + "AutoLow")[0], 
            hotHigh: $(teamColor + "AutoHotHigh")[0], 
            hotLow: $(teamColor + "AutoHotLow")[0], 
            highAttempts: $(teamColor + "AutoHighAttempts")[0]
        });
        
        $teleopData.push({
            high: $(teamColor + "TeleopHigh")[0], 
            low: $(teamColor + "TeleopLow")[0], 
            passes: $(teamColor + "TeleopPasses")[0], 
            truss: $(teamColor + "TeleopTruss")[0], 
            highAttempts: $(teamColor + "TeleopHighAttempts")[0],
            trussAttempts: $(teamColor + "TeleopTrussAttempts")[0]
        });
    
       $tags.push({ 
           offensive: $tmpTags.find("div.offensive")[0], 
           offensiveSuccess: $tmpTags.find("div.success")[0], 
           defensive: $tmpTags.find("div.defensive")[0], 
           defensiveSuccess: $tmpTags.find("div.success")[1], 
           broken: $tmpTags.find("div.broken")[0], 
           canCatch: $tmpTags.find("div.canCatch")[0], 
           looseGrip: $tmpTags.find("div.looseGrip")[0], 
           twoBallAuto: $tmpTags.find("div.twoBallAuto")[0], 
           goodWithYou: $tmpTags.find("div.goodWithYou")[0] 
       }); 
       
       $comments.push($(teamColor + "Comments")[0]);
    }
    
    print("Inited");
    if(typeof(Storage) !== "undefined")
    {
        var numbers = localStorage.teamNumbers;
        
        if(typeof(numbers) === "undefined")
            alert('Please upload a file containing team numbers by double clicking on "Match#:"');
        
        else
            processTeamNumbers(localStorage.teamNumbers);
    }
    
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
        joyMode[stickIndex] = joyModes.auto;
        
        for(var teamIndex = 0; teamIndex < $alliance[stickIndex].length; teamIndex++)
        {
            autoData[stickIndex][teamIndex] = { 
                high: 0, 
                low: 0,
                hotHigh: 0,
                hotLow: 0, 
                highAttempts: 0 
            };
            
            teleopData[stickIndex][teamIndex] = { 
                high: 0, 
                low: 0, 
                passes: 0,
                truss: 0, 
                highAttempts: 0,
                trussAttempts: 0 
            };
            
            tags[stickIndex][teamIndex] = { 
                offensive: false,
                offensiveSuccess: false, 
                defensive: false, 
                defensiveSuccess: false, 
                broken: false, 
                canCatch: false, 
                looseGrip: false, 
                twoBallAuto: false, 
                goodWithYou: false
            };
            
            comments[stickIndex][teamIndex] = ""; 
        }
    }
    
    updateTeamNumbers();
    updateDom();
}

// Main loop for program
function main()
{
    updateJoysticks();
    var needUpdateDom = false;
    
    for(var joystickIndex = 0; joystickIndex < joysticks.length; joystickIndex++)
    {
        if(joysticks[joystickIndex].getButton([joyCodes.back, joyCodes.start]))
        {
            if(joysticks[joystickIndex].getButton(joyCodes.back))
                changeMode(joystickIndex, false);
            
            else if(joysticks[joystickIndex].getButton(joyCodes.start))
                changeMode(joystickIndex, true);
            
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
        
        if(joyMode[joystickIndex] === joyModes.auto)
        {
            if(joysticks[joystickIndex].getButton([joyCodes.a, joyCodes.b, joyCodes.x, joyCodes.y, joyCodes.dpadUp]))
            {
                lastInput[joystickIndex].input = autoData;

                if(joysticks[joystickIndex].getButton(joyCodes.y))
                    lastInput[joystickIndex].m = "high";

                if(joysticks[joystickIndex].getButton(joyCodes.a))
                    lastInput[joystickIndex].m = "low";

                if(joysticks[joystickIndex].getButton(joyCodes.x))
                    lastInput[joystickIndex].m = "hotHigh";

                if(joysticks[joystickIndex].getButton(joyCodes.b))
                    lastInput[joystickIndex].m = "hotLow";

                if(joysticks[joystickIndex].getButton(joyCodes.dpadUp))
                    lastInput[joystickIndex].m = "highAttempts";

                lastInput[joystickIndex].input[joystickIndex][teamIndexes[joystickIndex]][lastInput[joystickIndex].m]++;
                needUpdateDom = true;
            }
        }
            
        else if(joyMode[joystickIndex] === joyModes.teleop)
        {
            if(joysticks[joystickIndex].getButton([joyCodes.a, joyCodes.b, joyCodes.x, joyCodes.y, joyCodes.dpadLeft, joyCodes.dpadUp]))
            {
                lastInput[joystickIndex].input = teleopData;
                
                if(joysticks[joystickIndex].getButton(joyCodes.y))
                    lastInput[joystickIndex].m = "high";

                if(joysticks[joystickIndex].getButton(joyCodes.a))
                    lastInput[joystickIndex].m = "low";

                if(joysticks[joystickIndex].getButton(joyCodes.x))
                    lastInput[joystickIndex].m = "passes";

                if(joysticks[joystickIndex].getButton(joyCodes.b))
                    lastInput[joystickIndex].m = "truss";

                if(joysticks[joystickIndex].getButton(joyCodes.dpadUp))
                    lastInput[joystickIndex].m = "highAttempts";

                if(joysticks[joystickIndex].getButton(joyCodes.dpadLeft))
                    lastInput[joystickIndex].m = "trussAttempts";
                
                lastInput[joystickIndex].input[joystickIndex][teamIndexes[joystickIndex]][lastInput[joystickIndex].m]++;
                needUpdateDom = true;
            }
        }
            
        else if(joyMode[joystickIndex] === joyModes.tag)
        {
            if(joysticks[joystickIndex].getButton([joyCodes.a, joyCodes.b, joyCodes.x, joyCodes.y, joyCodes.dpadLeft, joyCodes.dpadRight, joyCodes.dpadDown, joyCodes.leftStick, joyCodes.rightStick]))
            {
                if(joysticks[joystickIndex].getButton(joyCodes.y))
                    tags[joystickIndex][teamIndexes[joystickIndex]].defensiveSuccess = !tags[joystickIndex][teamIndexes[joystickIndex]].defensiveSuccess;

                if(joysticks[joystickIndex].getButton(joyCodes.a))
                    tags[joystickIndex][teamIndexes[joystickIndex]].defensive = !tags[joystickIndex][teamIndexes[joystickIndex]].defensive;

                if(joysticks[joystickIndex].getButton(joyCodes.x))
                    tags[joystickIndex][teamIndexes[joystickIndex]].offensive = !tags[joystickIndex][teamIndexes[joystickIndex]].offensive;

                if(joysticks[joystickIndex].getButton(joyCodes.b))
                    tags[joystickIndex][teamIndexes[joystickIndex]].offensiveSuccess = !tags[joystickIndex][teamIndexes[joystickIndex]].offensiveSuccess;

                if(joysticks[joystickIndex].getButton(joyCodes.dpadLeft))
                    tags[joystickIndex][teamIndexes[joystickIndex]].twoBallAuto = !tags[joystickIndex][teamIndexes[joystickIndex]].twoBallAuto;

                if(joysticks[joystickIndex].getButton(joyCodes.dpadDown))
                    tags[joystickIndex][teamIndexes[joystickIndex]].goodWithYou = !tags[joystickIndex][teamIndexes[joystickIndex]].goodWithYou;

                if(joysticks[joystickIndex].getButton(joyCodes.dpadRight))
                    tags[joystickIndex][teamIndexes[joystickIndex]].broken = !tags[joystickIndex][teamIndexes[joystickIndex]].broken;

                if(joysticks[joystickIndex].getButton(joyCodes.leftStick))
                    tags[joystickIndex][teamIndexes[joystickIndex]].looseGrip = !tags[joystickIndex][teamIndexes[joystickIndex]].looseGrip;

                if(joysticks[joystickIndex].getButton(joyCodes.rightStick))
                    tags[joystickIndex][teamIndexes[joystickIndex]].canCatch = !tags[joystickIndex][teamIndexes[joystickIndex]].canCatch;
                
                needUpdateDom = true;
            }
        }
            
        if(joysticks[joystickIndex].getButton([joyCodes.leftTrigger, joyCodes.rightTrigger]))
        {
            if(joysticks[joystickIndex].getButton(joyCodes.leftTrigger))
                if(lastInput[joystickIndex].input)
                    if(lastInput[joystickIndex].input[joystickIndex][teamIndexes[joystickIndex]][lastInput[joystickIndex].m] > 0)
                        lastInput[joystickIndex].input[joystickIndex][teamIndexes[joystickIndex]][lastInput[joystickIndex].m]--;
     
            if(joysticks[joystickIndex].getButton(joyCodes.rightTrigger))
                if(lastInput[joystickIndex].input)
                    lastInput[joystickIndex].input[joystickIndex][teamIndexes[joystickIndex]][lastInput[joystickIndex].m]++;
 
            needUpdateDom = true;
        }
    }
    
    if(needUpdateDom)
        updateDom();
    
    window.webkitRequestAnimationFrame(main);
}

// Processes the teamNumbers.txt file, putting it into an array
function processTeamNumbers(data)
{
    print("processTeamNumbers");
    print(data);
    var dataArray = data.split(";");
    dataArray.pop();
    
    for(var dataIndex in dataArray)
    {
        var curData = dataArray[dataIndex];
        var matchNum = parseInt(curData.substring(0, curData.indexOf(":")));
        var teams = curData.substring(curData.indexOf(":") + 1).split(",");
        
        if(matchNum && teams.length === 6)
            teamNumbers[matchNum - 1] = [teams.slice(0, 3), teams.slice(3, 6)];
        
        else
        {
            var alertMsg = "Oh noes, error reading the team numbers file!\n\n";
            alertMsg += "Incorrect format: " + curData;
            alert(alertMsg);
            teamNumbers.push([[1, 2, 3], [4, 5, 6]]); 
        }
        
    }
    
    print(teamNumbers);
    updateTeamNumbers();
}

// Sets the data container border color
function setContainerColor(elm, newColor)
{
    for(var m in borderColors)
        elm.classList.remove(borderColors[m]);
    
    elm.classList.add(newColor);
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

// Change data input mode
function changeMode(index, increase)
{
    if(increase)
    {
        if(joyMode[index] === joyModes.auto)
            joyMode[index] = joyModes.teleop;
        
        else if(joyMode[index] === joyModes.teleop)
            joyMode[index] = joyModes.tag;
        
        else if(joyMode[index] === joyModes.tag)
            joyMode[index] = joyModes.auto;
    }
    
    else
    {
        if(joyMode[index] === joyModes.auto)
            joyMode[index] = joyModes.tag;
        
        else if(joyMode[index] === joyModes.teleop)
            joyMode[index] = joyModes.auto;
        
        else if(joyMode[index] === joyModes.tag)
            joyMode[index] = joyModes.teleop;
    }
}