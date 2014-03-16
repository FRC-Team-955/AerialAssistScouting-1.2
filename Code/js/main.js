var keycodes = { zero: 48, nine: 57, tab: 9 };
var $autoData = [];
var $teleopData = [];

$(document).ready(init);

// Called when document loads
function init()
{
    $("input").keydown(textInputCallback);
    print("Inited");
}

// Prevents input from entering a non-number input
function textInputCallback(e)
{
    var code = e.keyCode;
    
    if(code != keycodes.tab && (code < keycodes.zero || code > keycodes.nine))
        return false;
}

// Lazy print function, dont want to type "console.log()" a lot
function print(str)
{
    console.log(str);
}