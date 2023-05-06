import { potionTask, restore, skillTask, songTask } from "./commons";
import { CSQuest } from "./engine";
import { ensureItem } from "./lib";
import { cliExecute, create, myMeat, use } from "kolmafia";
import {
  $effect,
  $effects,
  $familiar,
  $item,
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
      modifier: ["Spell Damage", "Spell Damage Percent"].join(","),
      modes: {
        umbrella: "constantly twirling",
      },
      familiar: $familiar`Left-Hand Man`,
    };
  },
  tasks: [
    skillTask($skill`Simmer`),
    ...buffs.map(skillTask),
    songTask(
      $effect`Jackasses' Symphony of Destruction`,
      $effect`Ode to Booze`
    ),
    restore(buffs),
    skillTask($skill`Spirit of Cayenne`),
    potionTask($item`battery (AAA)`),
    {
      name: "Play Pool",
      completed: () =>
        get("_poolGames") >= 3 || have($effect`Mental A-cue-ity`),
      do: () => cliExecute("pool 1"),
    },
    {
      name: "Make & Use Cordial",
      completed: () => have($effect`Concentration`),
      ready: () => have($item`scrumptious reagent`) && myMeat() > 300,
      do: (): void => {
        if (!have($item`cordial of concentration`)) {
          ensureItem(1, $item`soda water`);
          create(1, $item`cordial of concentration`);
        }
        if (have($item`cordial of concentration`)) {
          use(1, $item`cordial of concentration`);
        }
      },
      limit: { tries: 1 },
    },
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
