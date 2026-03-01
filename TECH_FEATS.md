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

# Test mode
At the moment the test mode is a popup, better to move it to the console as Game.test() and Game.test(false) to go out of the test mode.

# Physics (Rapier)
Right now your game has no physics engine — everything is hand-coded:

## Before
    * Player movement: manual position updates in player.js
    * Collisions: distance checks (distanceTo()) between positions
    * Jumping: manual velocity.y with gravity in the update loop
    * Animals: manual movement with speed values

What a physics engine like Rapier would give you:

## After
    * Realistic collisions (walls, objects, slopes)
    * Gravity, bouncing, friction for free
    * Ragdoll effects, knockback from attacks
    * Objects rolling downhill in snowy mountains
    * Animals pushing each other
