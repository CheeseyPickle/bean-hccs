import { OutfitSpec, Quest, Task } from "grimoire-kolmafia";
import { abort, haveEffect, myHp, totalTurnsPlayed, useSkill } from "kolmafia";
import { $effect, $item, $location, $skill, AutumnAton, get, have } from "libram";
import { CSStrategy, Macro } from "./combatMacros";
import { getBestFamiliar, sausageFightGuaranteed, voterMonsterNow } from "./lib";
import { levelUniform } from "./outfit";

const PRE_QUEST: Quest<Task> = {
    name: "Pre-Quest Global", tasks: [
        {
            name: "Beaten Up!",
            completed: () => !have($effect`Beaten Up`),
            do: () => abort("Beaten up!"),
        },
        {
            name: "Maintain HP",
            completed: () => myHp() > 0,
            do: () => useSkill($skill`Cannelloni Cocoon`)
        },
        {
            name: "Fallbot",
            ready: () => AutumnAton.currentUpgrades().includes("base_blackhat"),
            completed: () => !AutumnAton.available(),
            do: (): void => {
                AutumnAton.upgrade();
                if (!AutumnAton.currentUpgrades().includes("leftleg1")) {
                    AutumnAton.sendTo($location`Noob Cave`);
                } else if (!AutumnAton.currentUpgrades().includes("leftarm1")) {
                    AutumnAton.sendTo($location`The Haunted Pantry`);
                } else {
                    AutumnAton.sendTo($location`The Neverending Party`);
                }
            },
        }
    ]
};

const POST_QUEST: Quest<Task> = {
    name: "Post-Quest Global",
    tasks: [{
        name: "Sausage Goblin",
        completed: () => totalTurnsPlayed() === get('_lastSausageMonsterTurn'),
        ready: () => sausageFightGuaranteed() && !have($effect`Feeling Lost`) && !haveEffect($effect`Meteor Showered`) && !haveEffect($effect`Fireproof Foam Suit`),
        outfit: (): OutfitSpec => {
            return levelUniform({
                changes: {
                    offhand: $item`Kramco Sausage-o-Matic™`,
                }
            });
        },
        do: $location`Noob Cave`,
        combat: new CSStrategy(() => Macro.if_(
            '!monstername "sausage goblin"',
            new Macro().step("abort")
        ).itemSkills().easyFight().kill()),
        limit: { tries: 1 }
    }, {
        name: "Voting Monster",
        completed: () => totalTurnsPlayed() === get('lastVoteMonsterTurn'),
        ready: () => voterMonsterNow() && !have($effect`Feeling Lost`),
        outfit: (): OutfitSpec => {
            return {
                acc3: $item`"I Voted!" sticker`,
                familiar: getBestFamiliar()
            };
        },
        do: $location`Noob Cave`,
        combat: new CSStrategy(() => Macro.default()),
        limit: { tries: 1 }
    }
    ]
};

export { PRE_QUEST, POST_QUEST };