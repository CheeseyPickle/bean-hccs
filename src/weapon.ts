import { CSStrategy, Macro } from "./combatMacros";
import {
  beachTask,
  buskTasks,
  famPool,
  potionTask,
  restore,
  skillTask,
  songTask,
} from "./commons";
import { CSQuest } from "./engine";
import { getBestFamiliar, uniform } from "./outfit";
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
  $location,
  $monster,
  $skill,
  CombatLoversLocket,
  CommunityService,
  ensureEffect,
  get,
  have,
  Latte,
  set,
  SongBoom,
} from "libram";
import { ensureMp, peridotMacro } from "./lib";

const buffs = $effects`Carol of the Bulls, Rage of the Reindeer, Scowl of the Auk, Tenacity of the Snapper, Disdain of the War Snapper, Bloodbathed, Song of the North`;

const Weapon: CSQuest = {
  name: "Weapon Damage",
  type: "SERVICE",
  test: CommunityService.WeaponDamage,
  modifiers: ["Weapon Damage", "Weapon Damage Percent"],
  outfit: () => {
    return {
      modifier: ["Weapon Damage", "Weapon Damage Percent"].join(","),
      familiar: $familiar`Left-Hand Man`,
    };
  },
  turnsSpent: 0,
  maxTurns: 1,
  tasks: [
    {
      // Get this before HP is nerfed by Cowrruption
      name: "Deep Dark Visions",
      completed: () => have($effect`Visions of the Deep Dark Deeps`),
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
    songTask(
      $effect`Jackasses' Symphony of Destruction`,
      $effect`Ode to Booze`,
    ),
    beachTask($effect`Lack of Body-Building`),
    famPool(),
    {
      name: "Steal from furious giant cow and Run Away",
      completed: () =>
        have($item`corrupted marrow`) || have($effect`Cowrruption`),
      do: (): void => {
        CombatLoversLocket.reminisce($monster`furious giant cow`);
        if (handlingChoice()) runChoice(-1);
      },
      outfit: () =>
        uniform({
          changes: {
            back: $item`unwrapped knock-off retro superhero cape`,
            offhand: $item`Roman Candelabra`,
            modes: {
              retrocape: ["heck", "hold"],
            }
          },
        }),
      post: (): void => {
        const ungId = $monster`furious giant cow`.id.toFixed(0);
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
        Macro.trySkill($skill`Perpetrate Mild Evil`)
          .trySkill($skill`Blow the Green Candle!`)
          .trySkill($skill`Feel Hatred`)
          .kill(),
      ),
    },
    {
      name: "Heartstone: get U",
      ready: () =>
        !have($effect`Feeling Lost`) &&
        (get("heartstoneLetters") === "" ||
          get("heartstoneLetters").length === 4),
      completed: () =>
        get("heartstoneLetters") === "U" || have($effect`Spit Upon`),
      do: () => {
        peridotMacro(
          $location`The Overgrown Lot`,
          $monster`malt liquor golem`,
          Macro.trySkill($skill`Steal Monster's Heart`).skill(
            $skill`Reflex Hammer`,
          ),
        );
      },
      outfit: () => ({
        acc1: $item`Peridot of Peril`,
        acc2: $item`Heartstone`,
        acc3: $item`Lil' Doctor™ bag`,
        familiar: getBestFamiliar(false),
      }),
    },
    {
      name: "Heartstone: get UP",
      ready: () =>
        !have($effect`Feeling Lost`) && get("heartstoneLetters") === "U",
      completed: () =>
        get("heartstoneLetters") === "UP" || have($effect`Spit Upon`),
      do: () => {
        if (get("_latteBanishUsed")) {
          Latte.fill("pumpkin", "cinnamon", "vanilla");
        }

        peridotMacro(
          $location`The Obligatory Pirate's Cove`,
          $monster`sassy pirate`,
          Macro.trySkill($skill`Steal Monster's Heart`).skill(
            $skill`Throw Latte on Opponent`,
          ),
        );
      },
      outfit: () => ({
        offhand: $item`latte lovers member's mug`,
        acc1: $item`Peridot of Peril`,
        acc2: $item`Heartstone`,
        familiar: getBestFamiliar(false),
      }),
    },
    {
      name: "Heartstone: get UPO",
      ready: () =>
        !have($effect`Feeling Lost`) && get("heartstoneLetters") === "UP",
      completed: () =>
        get("heartstoneLetters") === "UPO" || have($effect`Spit Upon`),
      do: () => {
        peridotMacro(
          $location`The Haunted Pantry`,
          $monster`undead elbow macaroni`,
          Macro.trySkill($skill`Steal Monster's Heart`).skill(
            $skill`Reflex Hammer`,
          ),
        );
      },
      outfit: () => ({
        acc1: $item`Peridot of Peril`,
        acc2: $item`Heartstone`,
        acc3: $item`Lil' Doctor™ bag`,
        familiar: getBestFamiliar(false),
      }),
    },
    {
      name: "Heartstone: spit UPON",
      ready: () =>
        !have($effect`Feeling Lost`) && get("heartstoneLetters") === "UPO",
      completed: () => have($effect`Spit Upon`),
      do: () => {
        peridotMacro(
          $location`The Haiku Dungeon`,
          $monster`ancient insane monk`,
          Macro.trySkill($skill`Steal Monster's Heart`).skill(
            $skill`Reflex Hammer`,
          ),
        );
      },
      outfit: () => ({
        acc1: $item`Peridot of Peril`,
        acc2: $item`Heartstone`,
        acc3: $item`Lil' Doctor™ bag`,
        familiar: getBestFamiliar(false),
      }),
    },
    ...buskTasks(
      1,
      $item`prismatic beret`,
      $item`Jurassic Parka`,
      $item`tinsel tights`,
    ), // Filled with Magic (100 % spell dmg)
    ...buskTasks(
      2,
      $item`prismatic beret`,
      $item`makeshift garbage shirt`,
      $item`alpha-mail pants`,
    ), // Sparkly (200 % spell dmg)
    ...buskTasks(
      3,
      $item`prismatic beret`,
      $item`makeshift garbage shirt`,
      $item`troutpiece`,
    ), // Feline Ferocity (100 % weapon dmg)
    ...buskTasks(
      4,
      $item`prismatic beret`,
      $item`Jurassic Parka`,
      $item`chain-mail monokini`,
    ), // Nigh-Invincible (100 % weapon & spell dmg)
    potionTask($item`corrupted marrow`),
    {
      name: "Swagger",
      completed: () => get("_bowleggedSwaggerUsed"),
      do: () => useSkill($skill`Bow-Legged Swagger`),
    },
    {
      name: "Songboom",
      completed: () => SongBoom.song() === "These Fists Were Made for Punchin'",
      do: () => SongBoom.setSong("These Fists Were Made for Punchin'"),
    },
    {
      name: "Twinkly Weapon",
      ready: () => availableAmount($item`twinkly nuggets`) > 0,
      completed: () => have($effect`Twinkly Weapon`),
      do: () => ensureEffect($effect`Twinkly Weapon`),
    },
    {
      name: "Yeg's Toothbrush",
      ready: () => !get("_cargoPocketEmptied"),
      completed: () =>
        have($item`Yeg's Motel toothbrush`) || have($effect`Rictus of Yeg`),
      do: () => cliExecute("cargo 284"),
    },
    potionTask($item`Yeg's Motel toothbrush`),
    {
      name: "Glass of Raw Eggs",
      ready: () => availableAmount($item`glass of raw eggs`) > 0,
      completed: () => have($effect`Boxing Day Breakfast`),
      do: () => eat(1, $item`glass of raw eggs`),
    },
    potionTask($item`wasabi marble soda`),
  ],
};

export default Weapon;
