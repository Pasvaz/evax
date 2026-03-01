# Save game
## Rationale
Since this is becoming a complex game and it takes time to explore it all, ee need to be able to save the progresses.
I am thinking to save a json into the local storage. Maybe have an icon or a key shortcut (ctrl-s) that saves the game, ideally it should open a bit of UI that shows the saved games to overwrite or add a new one.

## Data
What data should be saved? I think the following are essential, feel free to add the ones that you think matter in order to restore the player experience, I don't think that animals and spawnnable elements matter since they will just respawn.
* Player progression
* Player score
* Player inventory
* Player position
* Traders inventory? Assuming they have limited items
* Artifacts in world???

## Load
In the initial screen, there should be a New, Continue and Load choice to make, New works as of now, Continue loads last session from the local storage and Load shows all the available sessions.

## Export
the Json saved, in the popup with the saves, should be exportable for debug.