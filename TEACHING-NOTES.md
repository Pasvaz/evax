# Teaching Notes

Topics to discuss with the developer during our sessions.
Mark as DISCUSSED once covered.

## Behavior-Driven Animal Design (explain to dev)

**Status:** NOT YET DISCUSSED

### The Problem Right Now
Some animal behaviors are hardcoded per animal instead of being generic behaviors that any animal can opt into. For example:
- Egg stealing is coded only inside the fox's state machine — if we want a badger to steal eggs too, we'd have to copy-paste all that code
- Fighting back against geese is detected only inside fox code
- The `canStealEggs` flag exists in data but is never actually checked!

### The Principle: Behaviors, Not Animals
When you design a new behavior, don't think "what should the FOX do?" — think "what should ANY egg-thief do?" Then let the fox opt into that behavior through a data flag.

**Bad approach (hardcoded per animal):**
```
if (enemy is fox) {
    creep toward nest
    steal egg
    flee from goose
}
```

**Good approach (behavior-driven):**
```
if (enemy has canStealEggs flag) {
    creep toward nest
    steal egg
    flee from defending animal
}
```

This way, adding egg-stealing to a badger is just one line in the data file: `canStealEggs: true`

### What Needs Refactoring

1. **`fightsBack` → rename to `fightsGeeseBack`**
   - Be honest about what it does — it only means "fights back when a goose attacks"
   - The detection code needs to move from fox-only to the generic hostile enemy section

2. **`canStealEggs` → make it a real behavior**
   - Right now the flag exists but does nothing! The egg-stealing code is inside fox-specific logic
   - Should become a generic behavior: any animal with `canStealEggs: true` approaches nests, takes eggs, and flees
   - The fox can still have its unique "creeping" animation, but the core logic (find nest → approach → steal → flee) should work for any animal

3. **`attacksEnemies` → rename to `defendsNest` (or `defendsEggs`)**
   - If this behavior is specifically about defending eggs/nests, the name should say so
   - Should automatically activate for any animal with `canLayEggs: true`
   - The damage boost when defending offspring should apply generically

### The Rule Going Forward
> **When you create a new animal ability, ask yourself: "Could another animal ever need this?"**
> If yes, make it a behavior flag in the data, not a hardcoded `if (animal === 'fox')` check.

### Examples of Current Generic vs Hardcoded

| Flag | Generic? | Notes |
|------|----------|-------|
| `friendly` | YES | Works for any animal |
| `immuneToWater` | YES | Works for any animal |
| `chaseSpeed` / `fleeSpeed` | YES | Works for any animal |
| `dodgeChance` | YES | Works for any animal |
| `attacksEnemies` + `attackRange` | YES | Works but name is misleading |
| `fightsBack` | HALF | Flag is generic, detection is fox-only |
| `canStealEggs` | NO | Flag exists but logic is fox-hardcoded |

### Think About It Like Minecraft
In Minecraft, "hostile mob" is a behavior — zombies, skeletons, and creepers all share it. But each has a unique twist (zombies grab, skeletons shoot, creepers explode). The BASE behavior is generic, the TWIST is per-animal.

That's what we want:
- **Generic behavior:** "steal eggs" (find nest → approach → take egg → flee)
- **Animal twist:** Fox creeps slowly, badger charges in fast, weasel is sneaky and small
