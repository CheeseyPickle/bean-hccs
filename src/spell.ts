import { CSStrategy, Macro } from "./combatMacros";
import {
    beachTask,
    doYouCrush,
    meteorShower,
    potionTask,
    restore,
    skillTask,
    songTask,
} from "./commons";
import { CSQuest } from "./engine";
import { ensureItem, horse, horsery } from "./lib";
import { uniform } from "./outfit";
import {
    availableAmount,
    cliExecute,
    create,
    myLevel,
    myMeat,
    retrieveItem,
    use,
    visitUrl,
} from "kolmafia";
import {
    $effect,
    $effects,
    $familiar,
    $item,
    $location,
    $skill,
    CommunityService,
    get,
    have,
} from "libram";

const buffs = $effects`Carol of the Hells`;
// const chefstaves = $items`Staff of the Roaring Hearth, Staff of Kitchen Royalty, Staff of the Deepest Freeze, Staff of Frozen Lard, Staff of the Peppermint Twist, Staff of the Roaring Hearth`;

const Spell: CSQuest = {
    name: "Spell Damage",
    type: "SERVICE",
    test: CommunityService.SpellDamage,
    turnsSpent: 1,
    maxTurns: 50,
    modifiers: ["Spell Damage", "Spell Damage Percent"],
    outfit: () => {
        return {
            modifier: ["Spell Damage", "Spell Damage Percent"].join(','),
            modes: {
                umbrella: 'constantly twirling'
            },
            familiar: $familiar`Left-Hand Man`
        };
    },
    tasks: [
        skillTask($skill`Simmer`),
        ...buffs.map(skillTask),
        restore(buffs),
        skillTask($skill`Spirit of Cayenne`),
        potionTask($item`cordial of concentration`),
        potionTask($item`battery (AAA)`),
        {
            name: "Play Pool",
            completed: () => get("_poolGames") >= 3 || have($effect`Mental A-cue-ity`),
            do: () => cliExecute("pool 1"),
        },
        {
            name: "Get Nutcrackers",
            completed: () => availableAmount($item`obsidian nutcracker`) >= 2,
            ready: () => myMeat() > 2500,
            do: () => ensureItem(2, $item`obsidian nutcracker`)
        }
        // {
        //     name: "Pull Staff",
        //     completed: () => chefstaves.some((staff) => have(staff)),
        //     core: "soft",
        //     do: (): void => {
        //         const staff = chefstaves.find((s) => storageAmount(s) > 0 && canEquip(s));
        //         if (staff) takeStorage(staff, 1);
        //     },
        // },
    ],
};

export default Spell;