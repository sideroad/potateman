# How to play?

1. Access https://potateman.now.sh
2. Read QR code by players
3. If u want to add CPU, Click human icon to add
4. Click Crash button to start game

* You can invite other people to click share icon. mirroring URL will be copied on clipboard. Share the URL to others.

* You can join other room when click "Find other room".

# Rule
## How to win?
Attack opponents to send them flying and knock them off stages. You can battle nearby friends and players across the globe via the Internet, too.

Hit opponents to increase their damage. The more damage opponents have, the farther you can send them flying.

Use powerful punch(A) or skill(C) to send opponents flying completely off stages.
If you get launched off a stage you can use jumps and special moves to return to the stage and continue to fight.

## How to use skill?
Attack opponent to increase magic point. Circle color will be changed following usable skill below.
1. White ( None )
2. Gray ( Meteorite can be used )
3. Yellow ( Thunder can be used )
4. Red ( Fire uppercut can be used )
5. Brown ( Volcano can be used )

Once your magic point reach to use skill, you can use skill by C button. ( See Controller section for more detail )

# Controller

| Command | Action|Remark|
|---------|-------|------|
|← or → | Move ||
|↑| Jump |3 consecutive jump are allowed|
|↓| Squat ||
|A| Punch | Sinkable, Directable |
|B| Guard | Decrease damage |
|B ( when flying ) | Floating ||
|← or → + A | Dash ||
|← or → + B | Teleport ||
|↓ + B ( when flying ) | Increase fall down speed ||
|↓ + B ( on ground ) | Group dropping ||
|← or → + C| Meteorite |![Meteorite](https://raw.githubusercontent.com/sideroad/potateman/master/src/images/meteorite.png)|
|↑ + C| Fire uppercut ||
|↓ + C | Thunderbolt |![Thunderbolt](https://raw.githubusercontent.com/sideroad/potateman/master/src/images/thunder-attack-left-5.png)|
|C | Volcano |![Volcano](https://raw.githubusercontent.com/sideroad/potateman/master/src/images/volcano.png)|

# Items
|Icon|Remark|
|----|------|
|![RescueBox](https://raw.githubusercontent.com/sideroad/potateman/master/src/images/rescue-box.png)|Decrease total damage|
|![MagicBox](https://raw.githubusercontent.com/sideroad/potateman/master/src/images/magic-box.png)|Increase magic point|
|![Firethrower](https://raw.githubusercontent.com/sideroad/potateman/master/src/images/flamethrower-equip-right-1.png)|Use Fire thrower|
|![Giant](https://raw.githubusercontent.com/sideroad/potateman/master/src/images/giant-leaf.png)|Become titan|

# Stages
|Stage|Image|Remark|
|-----|-----|------|
|Earth|![](https://raw.githubusercontent.com/sideroad/potateman/master/src/images/stage-earth.png)|No item. Apply flamethrowers in certain period of time.|
|Ice|![](https://raw.githubusercontent.com/sideroad/potateman/master/src/images/stage-ice.png)|No friction ground. Raging wind in certain period of time.|
|Space|![](https://raw.githubusercontent.com/sideroad/potateman/master/src/images/stage-space.png)|Increase gravity in certain period of time.|
|Moss|![](https://raw.githubusercontent.com/sideroad/potateman/master/src/images/stage-moss.png)|Moving ground. Increase power and magic point in certain period of time.|
|Volcano|![](https://raw.githubusercontent.com/sideroad/potateman/master/src/images/stage-volcano.png)|Volcanic eruption happen in certain period of time. |
|Candy|![](https://raw.githubusercontent.com/sideroad/potateman/master/src/images/stage-candy.png)|Fall down cream in certain period of time.|
|Brick|![](https://raw.githubusercontent.com/sideroad/potateman/master/src/images/stage-brick.png)|Became titan in certain period of time.|
|Sink|![](https://raw.githubusercontent.com/sideroad/potateman/master/src/images/stage-sink.png)|Washout potatemans in certain period of time.|
|Hell|![](https://raw.githubusercontent.com/sideroad/potateman/master/src/images/stage-hell.png)|Surrounded by lava walls. Get damage when touch lavas. Increase damage consecutively. |

# Params

|Parameter|Type    |Description        |
|---------|--------|-------------------|
|stage    |ice / earth / space / moss / volcano / candy / brick  |Specify stage|
|magic    |Number  |Specify initial magic point|
|damage   |Number  |Specify initial damage     |
|boundaryLimit|Number|Max zoom in, zoom out speed|
|minMagnify|Number|Minimum magnify ratio|
|maxMagnify|Number|Maximum magnify ratio|
