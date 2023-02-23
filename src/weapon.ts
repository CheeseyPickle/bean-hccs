import { CSStrategy, Macro } from "./combatMacros";
import { beachTask, doYouCrush, famPool, potionTask, restore, skillTask, songTask } from "./commons";
import { CSQuest } from "./engine";
import { uniform } from "./outfit";
import {
    availableAmount,
    cliExecute,
    eat,
    handlingChoice,
    myHp,
    myMaxhp,
    runChoice,
    useSkill,
} from "kolmafia";
import {
    $effect,
    $effects,
    $familiar,
    $item,
    $monster,
    $skill,
    CombatLoversLocket,
    CommunityService,
    ensureEffect,
    get,
    have,
    set,
    SongBoom,
} from "libram";
import { ensureMp } from "./lib";

const buffs = $effects`Carol of the Bulls, Scowl of the Auk`;

const Weapon: CSQuest = {
    name: "Weapon Damage",
    type: "SERVICE",
    test: CommunityService.WeaponDamage,
    modifiers: ["Weapon Damage", "Weapon Damage Percent"],
    outfit: () => {
        return {
            modifier: ["Weapon Damage", "Weapon Damage Percent"].join(','),
            familiar: $familiar`Left-Hand Man`
        };
    },
    turnsSpent: 0,
    maxTurns: 20,
    tasks: [
        {
            name: "Deep Dark Visions",
            completed: () => have($effect`Visions of the Deep Dark Deeps`, 40),
            do: (): void => {
                while (myHp() < myMaxhp()) {
                    ensureMp(20);
                    useSkill(1, $skill`Cannelloni Cocoon`);
                }
                ensureMp(100);
                useSkill(1, $skill`Deep Dark Visions`);
            },
            outfit: {
                modifier: "10 spooky res, 10 cold res, HP",
                familiar: $familiar`Exotic Parrot`,
            },
        },
        ...buffs.map(skillTask),
        restore(buffs),
        skillTask($effect`Frenzied, Bloody`),
        beachTask($effect`Lack of Body-Building`),
        famPool(),
        {
            name: "Kill Ungulith",
            completed: () => have($item`corrupted marrow`) || have($effect`Cowrruption`),
            do: (): void => {
                CombatLoversLocket.reminisce($monster`ungulith`);
                if (handlingChoice()) runChoice(-1);
            },
            outfit: () =>
                uniform({
                    changes: {
                        shirt: $item`Jurassic Parka`,
                        modes: {parka: "dilophosaur"}
                    },
                }),
            post: (): void => {
                const ungId = $monster`ungulith`.id.toFixed(0);
                const locketIdStrings = get("_locketMonstersFought")
                    .split(",")
                    .map((x) => x.trim())
                    .filter((x) => x.length > 0);
                if (!locketIdStrings.includes(ungId)) {
                    locketIdStrings.push(ungId);
                    set("_locketMonstersFought", locketIdStrings.join(","));
                }
            },
            combat: new CSStrategy(() =>
                Macro.trySkill($skill`Sing Along`)
                    .trySkill($skill`Spit jurassic acid`)
                    .kill()
            ),
        },
        potionTask($item`corrupted marrow`),
        {
            name: "Swagger",
            completed: () => get("_bowleggedSwaggerUsed"),
            do: () => useSkill($skill`Bow-Legged Swagger`),
        },
        {
            name: "Songboom",
            completed: () => (SongBoom.song() === "These Fists Were Made for Punchin'"),
            do: () => (SongBoom.setSong("These Fists Were Made for Punchin'"))
        },
        {
            name: 'Twinkly Weapon',
            ready: () => availableAmount($item`twinkly nuggets`) > 0,
            completed: () => have($effect`Twinkly Weapon`),
            do: () => ensureEffect($effect`Twinkly Weapon`)
        },
        {
            name: "Yeg's Toothbrush",
            ready: () => !get("_cargoPocketEmptied"),
            completed: () => have($item`Yeg's Motel toothbrush`) || have($effect`Rictus of Yeg`),
            do: () => cliExecute("cargo 284")
        },
        potionTask($item`Yeg's Motel toothbrush`),
        {
            name: 'Glass of Raw Eggs',
            ready: () => availableAmount($item`glass of raw eggs`) > 0,
            completed: () => have($effect`Boxing Day Breakfast`),
            do: () => eat(1, $item`glass of raw eggs`)
        },
        potionTask($item`wasabi marble soda`)
    ],
};

export default Weapon;