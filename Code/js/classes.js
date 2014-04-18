function Joystick()
{    
    this.buttons = [];
    this.rawButtons = [];
    
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
    this.autoData = [];
    this.teleopData = [];
    this.tags = [];
    this.comments = "";
    
    for(var m in $autoData[0])
        this.autoData.push(0);
    
    for(var m in $teleopData[0])
        this.teleopData.push(0);
    
    for(var m in $tags[0])
        this.tags.push(0);
}

Team.prototype.processData = function(data)
{
    this.matches++;
    data = data.split(",");
    print("Process Called: " + data);
    var dataIndex = 0;
    
    for(var curDataIndex = 0; curDataIndex < this.autoData.length; curDataIndex++)
        this.autoData[curDataIndex] += parseInt(data[curDataIndex + dataIndex]);
    
    dataIndex += this.autoData.length;
    
    for(var curDataIndex = 0; curDataIndex < this.teleopData.length; curDataIndex++)
        this.teleopData[curDataIndex] += parseInt(data[curDataIndex + dataIndex]);
    
    dataIndex += this.teleopData.length;
    
    for(var curTagIndex = 0; curTagIndex < this.tags.length; curTagIndex++)
        if(data[curTagIndex + dataIndex] === "true")
            this.tags[curTagIndex]++;
    
    dataIndex += this.tags.length;
    this.comments += data[dataIndex] + "-";
};

Team.prototype.getAvgDataStr = function()
{
    var str = this.teamNumber + ",";
    
    for(var dataIndex = 0; dataIndex < this.autoData.length; dataIndex++)
        str += round(this.autoData[dataIndex] / this.matches) + ",";
    
    for(var dataIndex = 0; dataIndex < this.teleopData.length; dataIndex++)
        str += round(this.teleopData[dataIndex] / this.matches) + ",";
    
    for(var dataIndex = 0; dataIndex < this.tags.length; dataIndex++)
        str += round((this.tags[dataIndex] / this.matches) * 100) + "%,";
    
    str += this.comments;
    return str;
};

Team.prototype.getTotalDataStr = function()
{
    var str = this.teamNumber + ",";
    
    for(var dataIndex = 0; dataIndex < this.autoData.length; dataIndex++)
        str += this.autoData[dataIndex] + ",";
    
    for(var dataIndex = 0; dataIndex < this.teleopData.length; dataIndex++)
        str += this.teleopData[dataIndex] + ",";
    
    for(var dataIndex = 0; dataIndex < this.tags.length; dataIndex++)
        str += this.tags[dataIndex] + ",";
    
    str += this.comments;
    return str;
};