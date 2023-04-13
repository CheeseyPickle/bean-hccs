import { commonFamiliarWeightBuffs, famPool, potionTask, restore, skillTask, songTask, genieWishTask } from "./commons";
import { CSQuest } from "./engine";
import { availableAmount, cliExecute, retrieveItem } from "kolmafia";
import { $effect, $effects, $familiar, $item, CommunityService, ensureEffect, get, have } from "libram";

const Noncombat: CSQuest = {
    name: "Noncombat",
    type: "SERVICE",
    test: CommunityService.Noncombat,
    modifiers: ['Combat Rate'],
    outfit: () => ({
        modifier: '-combat -tie',
        familiar: $familiar`Disgeist`,
        hat: $item`porkpie-mounted popper`
    }),
    turnsSpent: 0,
    maxTurns: 6,
    tasks: [
        {
            name: 'Firework Hat',
            completed: () => availableAmount($item`porkpie-mounted popper`) > 0,
            ready: () => !get("_fireworksShopHatBought"),
            do: () => retrieveItem(1, $item`porkpie-mounted popper`)
        },
        ...commonFamiliarWeightBuffs(),
        skillTask($effect`Smooth Movements`),
        skillTask($effect`Feeling Lonely`),
        songTask($effect`The Sonata of Sneakiness`, $effect`Fat Leon's Phat Loot Lyric`),
        restore($effects`Smooth Movements, The Sonata of Sneakiness`),
        potionTask($item`shady shades`),
        genieWishTask($effect`Disquiet Riot`),
        // {
        //     name: "Swim Sprints",
        //     completed: () => get("_olympicSwimmingPool"),
        //     do: () => cliExecute("swim sprints"),
        // },
        
        // I still need all the fam weight buffs to cap this test :(
        potionTask($item`short stack of pancakes`),
        potionTask($item`lump of loyal latite`),
        {
            name: 'Drink Hot Socks',
            ready: () => get("_speakeasyDrinksDrunk") < 3,
            completed: () => have($effect`[1701]Hip to the Jive`),
            do: (): void => {
                ensureEffect($effect`Ode to Booze`);
                cliExecute("drink 1 Hot Socks");
            }
        },
        famPool()
    ],
};

export default Noncombat;