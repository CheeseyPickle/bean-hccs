import { OutfitSpec, Quest, Task } from "grimoire-kolmafia";
import {
  abort,
  haveEffect,
  myHp,
  myMaxhp,
  myParadoxicity,
  totalTurnsPlayed,
  useSkill,
} from "kolmafia";
import {
  $effect,
  $item,
  $location,
  $skill,
  AutumnAton,
  CommunityService,
  get,
  have,
} from "libram";
import { CSStrategy, Macro } from "./combatMacros";
import { sausageFightGuaranteed, voterMonsterNow } from "./lib";
import { getBestFamiliar, levelUniform } from "./outfit";

const PRE_QUEST: Quest<Task> = {
  name: "Pre-Quest Global",
  tasks: [
    {
      name: "Beaten Up!",
      completed: () => !have($effect`Beaten Up`),
      do: (): void => {
        if ("Poetic Justice" !== get("lastEncounter")) {
          abort("Beaten up!");
        }
        useSkill($skill`Tongue of the Walrus`);
      },
    },
    {
      name: "Maintain HP",
      completed: () => myHp() > 0,
      do: () => useSkill($skill`Cannelloni Cocoon`),
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
    },
  ],
};

const POST_QUEST: Quest<Task> = {
  name: "Post-Quest Global",
  tasks: [
    {
      name: "Heal HP",
      ready: () => myMaxhp() > 200,
      completed: () => myHp() > 200,
      do: () => useSkill($skill`Cannelloni Cocoon`),
    },
    {
      name: "Sausage Goblin",
      completed: () => totalTurnsPlayed() === get("_lastSausageMonsterTurn"),
      ready: () =>
        sausageFightGuaranteed() &&
        !have($effect`Feeling Lost`) &&
        !have($effect`Meteor Showered`) &&
        !have($effect`Fireproof Foam Suit`) &&
        (CommunityService.FamiliarWeight.isDone() ||
          have($effect`[1701]Hip to the Jive`)), // We use post-wire guarenteed goblin to get E for heartstone
      outfit: (): OutfitSpec => {
        return levelUniform({
          changes: {
            offhand: $item`Kramco Sausage-o-Matic™`,
          },
        });
      },
      do: $location`Noob Cave`,
      combat: new CSStrategy(() =>
        Macro.itemSkills()
          .easyFight()
          .kill(),
      ),
      choices: { [1562]: myParadoxicity() >= 1 ? 7 : 19 },
      limit: { tries: 3 },
    },
    {
      name: "Voting Monster",
      completed: () => totalTurnsPlayed() === get("lastVoteMonsterTurn"),
      ready: () =>
        voterMonsterNow() &&
        !have($effect`Feeling Lost`) &&
        !haveEffect($effect`Meteor Showered`) &&
        !haveEffect($effect`Fireproof Foam Suit`),
      outfit: (): OutfitSpec => {
        return {
          acc3: $item`"I Voted!" sticker`,
          familiar: getBestFamiliar(true),
        };
      },
      do: $location`Noob Cave`,
      combat: new CSStrategy(() => Macro.default()),
      choices: { [1562]: myParadoxicity() >= 1 ? 7 : 19 },
      limit: { tries: 3 },
    },
  ],
};

export { PRE_QUEST, POST_QUEST };
