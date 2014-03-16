var keycodes = { zero: 48, nine: 57, tab: 9 };
var $matchNumber;
// Red
var $redAlliance = [];
var $redAutoData = [];
var $redAutoZone;
var $redTeleopData = [];
var $redTeleopZone;
var $redTags;
var $redComments;
// Blue
var $blueAlliance = [];
var $blueAutoData = [];
var $blueAutoZone;
var $blueTeleopData = [];
var $blueTeleopZone;
var $blueTags;
var $blueComments;

$(document).ready(init);

// Called when document loads
function init()
{
    $("input").keypress(textInputCallback);
    $matchNumber = $("#matchNumber")[0];
    $matchNumber.value = 0;
    // Red
    $redAlliance = $("*.team[id*=red]");
    $redAutoData = $("input.data[id*=redAuto");
    $redAutoZone = $("#redAutoZone")[0];
    $redTeleopData = $("input.data[id*=redTeleop");
    $redTeleopZone = $("#redTeleopZone")[0];
    $redTags = $("#redTags")[0];
    $redComments = $("#redComments")[0];
    // Blue
    $blueAlliance = $("*.team[id*=blue]");
    $blueAutoData = $("input.data[id*=blueAuto");
    $blueAutoZone = $("#blueAutoZone")[0];
    $blueTeleopData = $("input.data[id*=blueTeleop");
    $blueTeleopZone = $("#blueTeleopZone")[0];
    $blueTags = $("#blueTags")[0];
    $blueComments = $("#blueComments")[0];
    print("Inited");
    
    reset();
}

// Resets everything in the scouting application
function reset()
{
    $matchNumber.value = 1 + ($matchNumber.value - 0);
    for(var teamIndex = 0; teamIndex < $redAlliance.length; teamIndex++)
        $redAlliance[teamIndex].value = $blueAlliance[teamIndex].value = "Team " + (teamIndex + 1);
    
    for(var dataIndex = 0; dataIndex < $redAutoData.length; dataIndex++)
    {
        $redAutoData[dataIndex].value = $redTeleopData[dataIndex].value = 0;
        $blueAutoData[dataIndex].value = $blueTeleopData[dataIndex].value = 0;
    }
    
    for(var dataIndex = 0; dataIndex < $redTags.length; dataIndex++)
    {
        $redTags[dataIndex].value = $redComments[dataIndex].value = "";
        $blueTags[dataIndex].value = $blueComments[dataIndex].value = "";
    }
    
    // Red
    $redAutoZone.classList.remove("backgroundWhite", "backgroundRed", "backgroundBlue");
    $redAutoZone.classList.add("backgroundBlack");
    $redTeleopZone.classList.remove("backgroundWhite", "backgroundRed", "backgroundBlue");
    $redTeleopZone.classList.add("backgroundBlack");
    // Blue
    $blueAutoZone.classList.remove("backgroundWhite", "backgroundRed", "backgroundBlue");
    $blueAutoZone.classList.add("backgroundBlack");
    $blueTeleopZone.classList.remove("backgroundWhite", "backgroundRed", "backgroundBlue");
    $blueTeleopZone.classList.add("backgroundBlack");
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