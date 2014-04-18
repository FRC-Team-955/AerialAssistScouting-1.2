// Updates the team data 
function updateTeamData()
{
    for(var allianceIndex = 0; allianceIndex < $alliance.length; allianceIndex++)
    {
        for(var m in autoData[allianceIndex][teamIndexes[allianceIndex]])
            autoData[allianceIndex][teamIndexes[allianceIndex]][m] = $autoData[allianceIndex][m].value - 0;
        
        for(var m in teleopData[allianceIndex][teamIndexes[allianceIndex]])
            teleopData[allianceIndex][teamIndexes[allianceIndex]][m] = $teleopData[allianceIndex][m].value - 0;
        
        for(var m in tags[allianceIndex][teamIndexes[allianceIndex]])
            tags[allianceIndex][teamIndexes[allianceIndex]][m] = tagChecked($tags[allianceIndex][m]);
        
        comments[allianceIndex][teamIndexes[allianceIndex]] = $comments[allianceIndex].value;
    }
}

// Updates the team numbers in the gui
function updateTeamNumbers()
{
    var curMatchNumber = $matchNumber.value - 0;
    
    for(var allianceIndex = 0; allianceIndex < $alliance.length; allianceIndex++)
    {
        for(var teamIndex = 0; teamIndex < $alliance[allianceIndex].length; teamIndex++)
        {
            if(curMatchNumber && curMatchNumber <= teamNumbers.length)
                $alliance[allianceIndex][teamIndex].value = teamNumbers[curMatchNumber - 1][allianceIndex][teamIndex];
            
            else
                $alliance[allianceIndex][teamIndex].value = teamIndex + 1;
        }
    }
}

// Updates the DOM elements
function updateDom()
{  
    for(var allianceIndex = 0; allianceIndex < $alliance.length; allianceIndex++)
    {
        var tagColor = allianceIndex === 0 ? tagColors.red : tagColors.blue;
        
        for(var teamIndex = 0; teamIndex < $alliance[allianceIndex].length; teamIndex++)
            $alliance[allianceIndex][teamIndex].style.opacity = 0.5;
        
        $alliance[allianceIndex][teamIndexes[allianceIndex]].style.opacity = 1;
        
        for(var m in $autoData[allianceIndex])
            $autoData[allianceIndex][m].value = autoData[allianceIndex][teamIndexes[allianceIndex]][m];
        
        for(var m in $teleopData[allianceIndex])
            $teleopData[allianceIndex][m].value = teleopData[allianceIndex][teamIndexes[allianceIndex]][m];
        
        for(var m in $tags[allianceIndex])
            changeTagColor($tags[allianceIndex][m], tags[allianceIndex][teamIndexes[allianceIndex]][m] ? tagColor : tagColors.gray);

        $comments[allianceIndex].value = comments[allianceIndex][teamIndexes[allianceIndex]];
    }
    
    var containerColor = { auto: borderColors.gray, teleop: borderColors.gray, redTags: borderColors.lightGray, blueTags: borderColors.lightGray };
    
    if(joyMode[0] === joyMode[1] && (joyMode[0] === joyModes.teleop || joyMode[0] === joyModes.auto))
    {
        if(joyMode[0] === joyModes.auto)
            containerColor.auto = borderColors.purple;

        else
            containerColor.teleop = borderColors.purple;
    }
    
    else
    {
        if(joyMode[0] === joyModes.auto) // Red alliance
            containerColor.auto = borderColors.red;

        else if(joyMode[0] === joyModes.teleop)// Red alliance
            containerColor.teleop = borderColors.red;

        if(joyMode[1] === joyModes.auto) // Blue alliance
            containerColor.auto = borderColors.blue;

        else if(joyMode[1] === joyModes.teleop) // Blue alliance
            containerColor.teleop = borderColors.blue;
    }
    
    if(joyMode[0] === joyModes.tag)
        containerColor.redTags = borderColors.red;
    
    if(joyMode[1] === joyModes.tag)
        containerColor.blueTags = borderColors.blue;
    
    setContainerColor($containers.auto, containerColor.auto);
    setContainerColor($containers.teleop, containerColor.teleop);
    setContainerColor($containers.redTags, containerColor.redTags);
    setContainerColor($containers.blueTags, containerColor.blueTags);
}

// Prevents input from entering a non-number input
function preventNonNumber(e)
{
    var code = e.keyCode;
    
    if(code !== keyCodes.tab && (code < keyCodes.zero || code > keyCodes.nine))
        return false;
}

// Prevents empy characters
function preventEmptyInput(e)
{
    if(e.target.value === "")
        e.target.value = "0";
    
    if(e.target.id === "matchNumber" && e.target.value === "0")
    {
        e.target.value = "1";
        updateTeamNumbers();
    }
}

// Changes team to enter data for when the div is clicked
function teamClicked(e)
{
    if(e.target.id.indexOf("red") > -1)
        teamIndexes[0] = e.target.id.substring("red".length) - 0 - 1;
    
    else
        teamIndexes[1] = e.target.id.substring("blue".length) - 0 - 1;
    
    updateDom();
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
            fileData += autoData[allianceIndex][teamIndex].highAttempts + ",";
            
            // Teleop data
            fileData += teleopData[allianceIndex][teamIndex].high + ",";
            fileData += teleopData[allianceIndex][teamIndex].low + ",";
            fileData += teleopData[allianceIndex][teamIndex].passes + ",";
            fileData += teleopData[allianceIndex][teamIndex].truss + ",";
            fileData += teleopData[allianceIndex][teamIndex].highAttempts + ",";
            fileData += teleopData[allianceIndex][teamIndex].trussAttempts + ",";
   
            // Tag data
            fileData += tags[allianceIndex][teamIndex].offensive + ",";
            fileData += tags[allianceIndex][teamIndex].offensiveSuccess + ",";
            fileData += tags[allianceIndex][teamIndex].defensive + ",";
            fileData += tags[allianceIndex][teamIndex].defensiveSuccess + ",";
            fileData += tags[allianceIndex][teamIndex].broken + ",";
            fileData += tags[allianceIndex][teamIndex].canCatch + ",";
            fileData += tags[allianceIndex][teamIndex].looseGrip + ",";
            fileData += tags[allianceIndex][teamIndex].twoBallAuto + ",";
            fileData += tags[allianceIndex][teamIndex].goodWithYou + ",";
            
            // Comments
            fileData += comments[allianceIndex][teamIndex] + "\n";
        }
    }
    
    writeToFile(fileData, "Match " + $matchNumber.value + ".csv");
    reset();
}

// Reads all files
function getMatchFiles(e)
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

// Gets the teamNumbers.txt file and processes it
function getTeamNumbersFile(e)
{
    var file = e.target.files[0];
    var reader = new FileReader();

    reader.onload = function()
    {
        localStorage.teamNumbers = this.result;
        processTeamNumbers(this.result);
    };

    reader.readAsText(file);
    e.target.value = "";
}

// When the user clicks on the tag change its value
function tagsClicked(redSide, id)
{
    var allianceIndex = redSide ? 0 : 1;
    tags[allianceIndex][teamIndexes[allianceIndex]][id] = !tags[allianceIndex][teamIndexes[allianceIndex]][id];
    updateDom();
}

// Add class to tags
function changeTagColor(elm, color)
{
    for(var curColor in tagColors)
        elm.classList.remove(tagColors[curColor]);
    
    elm.classList.add(color);
}

// Checks if tag is checked
function tagChecked(elm)
{
    return !elm.classList.contains(tagColors.gray);
}