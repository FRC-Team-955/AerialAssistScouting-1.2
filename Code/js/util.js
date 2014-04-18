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

// Find how many members are in a object
function memberLength(obj)
{
    var len = 0;
    
    for(var m in obj)
        if(obj.hasOwnProperty(m))
            len++;
    
    return len;
}