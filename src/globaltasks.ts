import { OutfitSpec, Quest, Task } from "grimoire-kolmafia";
import { abort, haveEffect, totalTurnsPlayed } from "kolmafia";
import { $effect, $item, $location, get, have } from "libram";
import { CSStrategy, Macro } from "./combatMacros";
import { getBestFamiliar, sausageFightGuaranteed, voterMonsterNow } from "./lib";
import { levelUniform } from "./outfit";

const PRE_QUEST: Quest<Task> = {
    name: "Pre-Quest Global", tasks: [
        {
            name: "Beaten Up!",
            completed: () => !have($effect`Beaten Up`),
            do: () => abort("Beaten up!"),
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