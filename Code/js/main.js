// Header for writing files
var header = "TEAM #,A:HIGH HOT,A:HIGH,A:LOW HOT,A:LOW,HIGH,LOW,TRUSS,CATCH,BALL PASS,LEGIT PASS,PREF ZONE,DEFENSIVE,LEGIT DEFENSE,OFFENSIVE,LEGIT OFFENSIVE,BROKEN,CAN CATCH FROM PLAYER,BALL CAN FALL OUT EASILY,GOOD WITH US,COMMENTS,";
       
// Keyboard keys
var tagKeys = ['1', '2', '3', '4', '5', '6', '7', '8'];
var teleopKeys = [['q', 'a', 'z', 'w', 's', 'x'], ['t', 'g', 'b', 'y', 'h', 'n'], ['o', 'l', '.', 'p', ';', '/']];
var autoKeys = [['q', 'a', 'w', 's'], ['t', 'g', 'y', 'h'], ['o', 'l', 'p', ';']];

// Array lengths
var teleopLength = teleopKeys[0].length;
var autoLength = autoKeys[0].length;
var tagLength = tagKeys.length;
var robotLength = 3;
var totalLength = split(header, ",").length;

// Variables to hold DOM elements
var $teamNames = new Array(robotLength);
var $tags = new Array(robotLength);
var $comments = new Array(robotLength);
var $inputTeleop;
var $inputAuto;
var $matchNumber;

// Robot array
var robots = new Array(robotLength);

// Current match number of the match
var matchNumber = 0;

// Alliance color
var allianceColor = "";

// Hex color values of red and blue used in css style file
var colorBlue = rgbToHex(14, 127, 205);
var colorRed = rgbToHex(255, 17, 33);

// Master file 
var masterFileName = "MasterScouting.csv";

// When document is loaded call init function
$(document).ready(init);

// Called when the app is first loaded
function init()
{   
    console.log("INIT");
    var tmp = split(header, ',');
    console.log(tmp + " " + tmp.length);
    
    if(!window.chrome)
        alert("Sorry but this has been developed only for chrome.");
    
    // Check for the various File API support.
    if (!window.File || !window.FileReader || !window.FileList || !window.Blob)
      alert('The File APIs are not fully supported in this browser.');
  
    initDomRelated();
    reset();
    setAllianceButton("blue");
}

function initDomRelated()
{
    $("#writeToMasterFileActual").change(getLoadedFiles);
    
    $("div").click(function(){
        setRadioInDiv(this.id);
    });
    
    $("#writeToFile").click(function(){
        processInputData();
    });
    
    $("#writeToMasterFile").click(function(){
        $("#writeToMasterFileActual").click();
    });
    
    $("#allianceBlue").click(function(){
        setAllianceButton("blue");
    });
    
    $("#allianceRed").click(function(){
        setAllianceButton("red");
    });
    
    // Setting the variables to hold all the DOM elements
    $teamNames = [$("#teamName1"), $("#teamName2"), $("#teamName3")];
    $tags = [$("#tags1"), $("#tags2"), $("#tags3")];
    $comments = [$("#comments1"), $("#comments2"), $("#comments3")];
    $inputTeleop = $("#inputTeleop");
    $inputAuto = $("#inputAuto");
    $matchNumber = $("#matchNumber");
}

// Resets everything
function reset()
{
    for(var i = 0; i < robotLength; i++)
    {
        $teamNames[i].val("");
        $tags[i].val("");
        $comments[i].val("");
        $inputAuto.val("");
        $inputTeleop.val("");
        
        if(!robots[i])
            robots[i] = new Robot();
        
        robots[i].reset();
    }
    
    updateMatchNumber();    
    resetZones();
}

// Gets all the data, processes it, and saves it
function processInputData()
{
    var inputAuto = $inputAuto.val();
    var inputTeleop = $inputTeleop.val();
    
    for(var inputIndex = 0; inputIndex < inputAuto.length; inputIndex++)
        for(var robotIndex = 0; robotIndex < robotLength; robotIndex++)
            for(var keyIndex = 0; keyIndex < autoLength; keyIndex++)
                if(inputAuto[inputIndex] === autoKeys[robotIndex][keyIndex])
                    robots[robotIndex].dataAuto[keyIndex]++;
    
    for(var inputIndex = 0; inputIndex < inputTeleop.length; inputIndex++)
        for(var robotIndex = 0; robotIndex < robotLength; robotIndex++)
            for(var keyIndex = 0; keyIndex < teleopLength; keyIndex++)
                if(inputTeleop[inputIndex] === teleopKeys[robotIndex][keyIndex])
                    robots[robotIndex].dataTeleop[keyIndex]++;
    
    var fileData = header + "\n";
    
    for(var robotIndex = 0; robotIndex < robotLength; robotIndex++)
    { 
        robots[robotIndex].processData($teamNames[robotIndex].val(), $tags[robotIndex].val(), $comments[robotIndex].val(), getZoneVal(robotIndex));
        fileData += robots[robotIndex].getString();
    }
    
    writeToFile(fileData, matchNumber + allianceColor + ".csv");
    reset();
}

// Writes the data to the users computer with the specified name
function writeToFile(data, fileName)
{
    var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
    saveAs(blob, fileName);
}

// Reads all files
function getLoadedFiles(evt)
{
    console.log("MASTERFILE BUTTON CLICKED");
    
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
                processLoadedData(split(data, ","));
        };

        reader.readAsText(f);
    }
}

// Process and write to master file
function processLoadedData(data)
{
    console.log("DATA USED FOR MASTERFILE: " + data.length);
    console.log(data);
    var newRobots = [];
    var curRobot = 0;
    
    for(var dataIndex = 0; dataIndex < data.length - 1; dataIndex += totalLength)
    {
        var curTeamName = removeNewLine(data[dataIndex]);
        console.log("Team Name: " + curTeamName);
        
        if(curTeamName === "TEAM #") // Means we're looking at the header
            continue;
        
        var foundRobot = false;

        for(var robotIndex = 0; robotIndex < newRobots.length; robotIndex++)
        {
            if(newRobots[robotIndex].teamName === curTeamName)
            {
                curRobot = robotIndex;
                newRobots[curRobot].matches++;
                foundRobot = true;
                break;
            }
        }

        if(!foundRobot)
        {
            newRobots.push(new Robot());
            curRobot = newRobots.length - 1;
            newRobots[curRobot].teamName = curTeamName;
        }

        console.log("ROBOT DATA");
        console.log(data.slice(dataIndex, dataIndex + totalLength));
        newRobots[curRobot].loadData(data.slice(dataIndex + 1, dataIndex + totalLength));
    }
    
    var fileData = header + "\n";
    
    for(var robotIndex = 0; robotIndex < newRobots.length; robotIndex++)
        fileData += newRobots[robotIndex].getString();
    
    writeToFile(fileData, masterFileName);
}

// Removes commas from strings
function removeCommas(data)
{
    var ret = "";
    
    for(var i = 0; i < data.length; i++)
        if(data[i] !== ',')
            ret += data[i];
    
    return ret;
}

// Resets zones to false
function resetZones()
{
    $('input[name="zone1"]').prop('checked', false);
    $('input[name="zone2"]').prop('checked', false);
    $('input[name="zone3"]').prop('checked', false);
}

// Sets the radio button to true if its parent div has been clicked
function setRadioInDiv(divName)
{
    switch(divName)
    {
        case "blue1": $("#btBlue1").prop("checked", !$("#btBlue1").is(":checked")); break;
        case "white1": $("#btWhite1").prop("checked", !$("#btWhite1").is(":checked")); break;
        case "red1": $("#btRed1").prop("checked", !$("#btRed1").is(":checked")); break;
            
        case "blue2": $("#btBlue2").prop("checked", !$("#btBlue2").is(":checked")); break;
        case "white2": $("#btWhite2").prop("checked", !$("#btWhite2").is(":checked")); break;
        case "red2": $("#btRed2").prop("checked", !$("#btRed2").is(":checked")); break;
        
        case "blue3": $("#btBlue3").prop("checked", !$("#btBlue3").is(":checked")); break;
        case "white3": $("#btWhite3").prop("checked", !$("#btWhite3").is(":checked")); break;
        case "red3": $("#btRed3").prop("checked", !$("#btRed3").is(":checked")); break;
    }
}

// Gets the value of the selected button in specified zone
function getZoneVal(index)
{
    var ret = $("input:radio[name=zone" + (index + 1) + "]:checked").val();
    
    if(!ret)
        ret = "NONE";
    
    return ret;
}

// Splits the string
function split(str, delim)
{
    var index = 0; 
    var delimIndex = 0;
    var delimLen = delim.length;
    var ret = [];
    
    while((delimIndex = str.indexOf(delim, index)) !== -1)
    {
        ret.push(str.substring(index, delimIndex));
        index = delimIndex + delimLen;
    }
    
    if(index !== str.length)
        ret.push(str.substring(index, str.length));
    
    return ret;
}

// Changes the alliance color and submit box colors when alliance color buttons are pressed
function setAllianceButton(color)
{
    if(color === "blue")
    {
        allianceColor = "blue";
        $("#allianceBlue").css({"opacity" : "1"});
        $("#allianceRed").css({"opacity" : "0.2"});
        $("#writeToFile").css({"background-color" : colorBlue});
        $("#writeToMasterFile").css({"background-color" : colorBlue});
    }
    
    if(color === "red")
    {
        allianceColor = "red";
        $("#allianceBlue").css({"opacity" : "0.2"});
        $("#allianceRed").css({"opacity" : "1"});
        $("#writeToFile").css({"background-color" : colorRed});
        $("#writeToMasterFile").css({"background-color" : colorRed});
    }
}

// Converts the string to a number, retursn 0 if can't find number
function convertToNumber(str)
{
    var ret = parseInt(str);
    
    if(!ret)
    {
        console.log("ERROR, CAN'T CONVERT '" + str + "' TO A NUMBER.");
        ret = 0;
    }
    
    return ret;
}

// Update match number
function updateMatchNumber()
{
    var tmp = convertToNumber($matchNumber.val());
    
    if(tmp !== 0 && tmp > 0)
        matchNumber = tmp;
    
    $matchNumber.val(++matchNumber);
}

// Converts rgb to hex
function rgbToHex(r, g, b)
{
    var red = r.toString(16);
    var green = g.toString(16);
    var blue = b.toString(16);
    
    if(red.length < 2)
        red = "0" + red;
    
    if(green.length < 2)
        green = "0" + green;
    
    if(blue.length < 2)
        blue = "0" + blue;

    return "#" + red + green + blue;
}

// Removes new line character
function removeNewLine(data)
{
    var ret = "";
    
    for(var i = 0; i < data.length; i++)
        if(data[i] !== "\n")
            ret += data[i];
    
    return ret;
}

/*                                CLASSES                                   */
// Class to hold all the robot data
function Robot()
{
    this.matches = 1;
    this.dataTeleop = new Array(teleopLength);
    this.dataAuto = new Array(autoLength);
    this.dataTag = new Array(tagLength);
    this.comment = "";
    this.teamName = "";
    this.zone = "";
    
    for(var i = 0; i < teleopLength; i++)
        this.dataTeleop[i] = 0;

    for(var i = 0; i < autoLength; i++)
        this.dataAuto[i] = 0;

    for(var i = 0; i < tagLength; i++)
        this.dataTag[i] = 0;
}

// Resets all the members in robot
Robot.prototype.reset = function()
{
    this.matches = 1;
    this.dataTeleop = new Array(teleopLength);
    this.dataAuto = new Array(autoLength);
    this.dataTag = new Array(tagLength);
    this.comment = "";
    this.teamName = "";
    this.zone = "";
    
    for(var i = 0; i < teleopLength; i++)
        this.dataTeleop[i] = 0;

    for(var i = 0; i < autoLength; i++)
        this.dataAuto[i] = 0;

    for(var i = 0; i < tagLength; i++)
        this.dataTag[i] = 0;
};

// Sets the robots properties
Robot.prototype.processData = function(teamName, tagData, comment, zone)
{
    this.teamName = removeCommas(teamName);
    this.comment = removeCommas(comment);
    this.zone = removeCommas(zone);

    for(var dataIndex = 0; dataIndex < tagData.length; dataIndex++)
        for(var keyIndex = 0; keyIndex < tagKeys.length; keyIndex++)
            if(tagData[dataIndex] === tagKeys[keyIndex])
                this.dataTag[keyIndex]++;
};

// Converts the robots data to a string
Robot.prototype.getString = function()
{
    var ret = "";

    ret += this.teamName + ",";

    for(var i = 0; i < this.dataAuto.length; i++)
        ret += this.dataAuto[i] + ",";

    for(var i = 0; i < this.dataTeleop.length; i++)
        ret += this.dataTeleop[i] + ",";

    ret += this.zone + ",";

    for(var i = 0; i < this.dataTag.length; i++)
        ret  += this.dataTag[i] + "/" + this.matches + ",";

   ret += this.comment + ",\n";
   
   console.log(ret);
   return ret;
};

// Loads the string data into the robot data
Robot.prototype.loadData = function(data)
{
    var dataLen = data.length;
    
    for(var dataIndex = 0; dataIndex < dataLen; dataIndex++)
    {
        if(dataIndex < autoLength)
            this.dataAuto[dataIndex] += convertToNumber(data[dataIndex]);
        
        else if(dataIndex < autoLength + teleopLength)
            this.dataTeleop[dataIndex - autoLength] += convertToNumber(data[dataIndex]);
        
        else if(dataIndex < autoLength + teleopLength + 1)
            this.zone = data[dataIndex];
        
        else if(dataIndex < autoLength + teleopLength + 1 + tagLength)
            this.dataTag[dataIndex - (autoLength + teleopLength + 1)] += convertToNumber(data[dataIndex]);
        
        else
            this.comment = data[dataIndex];
    }
};