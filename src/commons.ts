import { Task } from "grimoire-kolmafia";
import {
  Skill,
  Effect,
  toSkill,
  toEffect,
  myMp,
  mpCost,
  useSkill,
  effectModifier,
  Item,
  use,
  cliExecute,
  adv1,
  create,
  eat,
  handlingChoice,
  runChoice,
  Thrall,
  myThrall,
  availableAmount,
  monkeyPaw,
  equip,
  useFamiliar,
} from "kolmafia";
import {
  $effect,
  $effects,
  $familiar,
  $item,
  $location,
  $skill,
  $slot,
  BeachComb,
  get,
  have,
  set,
  unequip,
} from "libram";
import { CSStrategy, Macro } from "./combatMacros";
import { horsery, horse, wishEffect } from "./lib";
import { uniform } from "./outfit";

export function skillTask(x: Skill | Effect): Task {
  {
    const skill = x instanceof Skill ? x : toSkill(x);
    const effect = x instanceof Effect ? x : toEffect(x);
    return {
      name: skill.name,
      completed: () => have(effect),
      ready: () => myMp() >= mpCost(skill),
      do: () => useSkill(skill),
      outfit: () => ({
        // Ensure that April Shower Thoughts shield isn't somehow equipped
        familiar: $familiar`Cooler Yeti`,
        offhand: $item`unbreakable umbrella`,
      }),
    };
  }
}

export function aprilShieldTask(x: Skill): Task {
    {
    const APRIL_SHIELD_SKILL_TO_EFFECT: Record<number, Effect> = {
      1000: $effect`Slippery as a Seal`,
      2000: $effect`Strength of the Tortoise`,
      3000: $effect`Tubes of Universal Meat`,
      4000: $effect`Lubricating Sauce`,
      5000: $effect`Disco over Matter`,
      6000: $effect`Mariachi Moisture`,
      2009: $effect`Thoughtful Empathy`,
      3010: $effect`Leash of Linguini`,
    };
    if (APRIL_SHIELD_SKILL_TO_EFFECT[x.id] === undefined)
      throw `Casting ${x.name} with the shower thoughts shield doesn't do anything`;
    return {
      name: "April Shower Thoughts Shield: " + x.name,
      completed: () => have(APRIL_SHIELD_SKILL_TO_EFFECT[x.id]),
      ready: () => myMp() >= mpCost(x),
      do: () => useSkill(x),
      outfit: () => ({
        offhand: $item`April Shower Thoughts shield`,
      }),
    };
  }
}

export function beachTask(effect: Effect): Task {
  const num = 1 + BeachComb.headBuffs.indexOf(effect);
  return {
    name: `Beach Head: ${effect}`,
    completed: () =>
      get("_beachHeadsUsed").split(",").includes(num.toFixed(0)),
    ready: () =>
      get("_freeBeachWalksUsed") < 11 &&
      get("beachHeadsUnlocked").split(",").includes(num.toFixed(0)),
    do: () => BeachComb.tryHead(effect),
    limit: { tries: 1 },
  };
}

export function genieWishTask(effect: Effect): Task {
  return {
    name: `Genie Wish: ${effect}`,
    completed: () => have(effect),
    ready: () =>
      availableAmount($item`pocket wish`) + 3 - get("_genieWishesUsed") > 0,
    do: () => wishEffect(effect),
    limit: { tries: 1 },
  };
}

export function monkeyWishTask(effect: Effect): Task {
  return {
    name: `Monkey Wish: ${effect}`,
    completed: () => have(effect),
    ready: () => get("_monkeyPawWishesUsed") < 5,
    do: () => monkeyPaw(effect),
    limit: { tries: 1 },
  };
}

export function potionTask(item: Item): Task {
  const effect = effectModifier(item, "Effect");
  return {
    name: `${effect}`,
    completed: () => have(effect),
    ready: () => have(item),
    do: () => use(item),
  };
}

export function songTask(
  song: Effect | Skill,
  shrugSong: Effect | Skill
): Task {
  const { wantedSongSkill, wantedSongEffect } =
    song instanceof Effect
      ? { wantedSongSkill: toSkill(song), wantedSongEffect: song }
      : { wantedSongSkill: song, wantedSongEffect: toEffect(song) };
  const shrugSongEffect =
    shrugSong instanceof Effect ? shrugSong : toEffect(shrugSong);
  return {
    name: song.name,
    completed: () => have(wantedSongEffect),
    ready: () => myMp() >= mpCost(wantedSongSkill),
    do: (): void => {
      if (have(shrugSongEffect)) cliExecute(`shrug ${shrugSongEffect}`);
      useSkill(wantedSongSkill);
    },
    limit: { tries: 1 },
  };
}

export function thrallTask(thrall: Thrall): Task {
  return {
    name: thrall.toString(),
    completed: () => myThrall() === thrall,
    do: () => useSkill(thrall.skill),
  };
}

export function restore(effects: Effect[]): Task {
  return {
    name: "Restore",
    completed: () => effects.every((e) => have(e)),
    do: () => {
      if (
        !have($item`magical sausage`) &&
        have($item`magical sausage casing`)
      ) {
        create(1, $item`magical sausage`);
      }
      if (have($item`magical sausage`)) {
        eat(1, $item`magical sausage`);
      }
    },
    limit: {
      tries: 1,
    },
  };
}

let showers = get("_meteorShowerUses");
export function meteorShower(): Task {
  return {
    name: "Meteor Showered",
    ready: () => get("_meteorShowerUses") < 5 && get("_saberForceUses") < 5,
    completed: () => have($effect`Meteor Showered`),
    prepare: () => horsery() === "pale" && horse("dark"),
    do: () => {
      adv1($location`The Dire Warren`, -1, "");
      if (handlingChoice()) runChoice(-1);
    },
    outfit: () =>
      uniform({
        changes: {
          familiar: $familiar.none,
          famequip: $item.none,
          weapon: $item`Fourth of May Cosplay Saber`,
        },
      }),
    choices: { [1387]: 3 },
    combat: new CSStrategy(() =>
      Macro.skill($skill`Meteor Shower`).skill($skill`Use the Force`)
    ),
    post: () => {
      if (have($effect`Meteor Showered`)) showers++;
      set("_meteorShowerUses", showers);
    },
  };
}

export function doYouCrush(): Task {
  return {
    name: "Do You Crush What I Crush?",
    completed: () => have($effect`Do You Crush What I Crush?`),
    ready: () => !have($effect`Holiday Yoked`),
    do: $location`The Dire Warren`,
    outfit: () =>
      uniform({
        changes: {
          familiar: $familiar`Ghost of Crimbo Carols`,
          famequip: $item.none,
        },
      }),
    prepare: () => horsery() === "pale" && horse("dark"),
    combat: new CSStrategy(() =>
      Macro.trySkill($skill`Feel Hatred`)
        .trySkill($skill`Snokebomb`)
        .abort()
    ),
  };
}

export function commonFamiliarWeightBuffs(): Task[] {
  const buffs = $effects`Leash of Linguini, Empathy, Blood Bond, Only Dogs Love a Drunken Sailor`;
  return [
    aprilShieldTask($skill`Empathy of the Newt`),
    aprilShieldTask($skill`Leash of Linguini`),
    ...buffs.map(skillTask),
    restore(buffs),
    // {
    //     name: "Suzie's Blessing",
    //     completed: () => get("_clanFortuneBuffUsed"),
    //     do: () => cliExecute("fortune buff familiar"),
    // },
    beachTask($effect`Do I Know You From Somewhere?`),
  ];
}

export function famPool(): Task {
  return {
    name: "Play Pool",
    ready: () => get("_poolGames") < 3,
    completed: () => have($effect`Billiards Belligerence`),
    do: () => cliExecute("pool 1"),
  };
}

export function buskTasks(cast: number, hat: Item | null, shirt: Item | null, pants: Item | null): Task[] {
  const taskList: Task[] = [];

  if (hat !== null && hat !== $item`prismatic beret`) {
    taskList.push({
      name: `Acquire ${hat.name}`,
      ready: () => get("_beretBuskingUses") === cast - 1,
      completed: () => availableAmount(hat) > 0,
      do: () => {
        if (hat === $item`wad of used tape`) {
          cliExecute("fold wad of used tape");
        } else {
          cliExecute(`acquire ${hat.name}`);
        }
      }
    });
  }

  if (shirt !== null) {
    taskList.push({
      name: `Acquire ${shirt.name}`,
      ready: () => get("_beretBuskingUses") === cast - 1,
      completed: () => availableAmount(shirt) > 0,
      do: () => {
        if (shirt === $item`makeshift garbage shirt`) {
          cliExecute("fold makeshift garbage shirt");
        } else {
          cliExecute(`acquire ${shirt.name}`);
        }
      }
    });
  }

  if (pants !== null) {
    taskList.push({
      name: `Acquire ${pants.name}`,
      ready: () => get("_beretBuskingUses") === cast - 1,
      completed: () => availableAmount(pants) > 0,
      do: () => {
        if (pants === $item`tinsel tights`) {
          cliExecute("fold tinsel tights");
        } else {
          cliExecute(`acquire ${pants.name}`);
        }
      }
    });
  }

  taskList.push({
      name: `Beret Busk #${cast}`,
      ready: () => get("_beretBuskingUses") === cast - 1,
      completed: () => get("_beretBuskingUses") >= cast,
      do: () => {
        if (hat === null) {
          unequip($slot`hat`);
          useFamiliar($familiar`Mad Hatrack`);
          equip($slot`familiar`, $item`prismatic beret`);
        } else if (hat !== $item`prismatic beret`) {
          equip($slot`hat`, hat);
          useFamiliar($familiar`Mad Hatrack`);
          equip($slot`familiar`, $item`prismatic beret`);
        } else {
          equip($slot`hat`, $item`prismatic beret`);
        }

        if (shirt === null) {
          unequip($slot`shirt`);
        } else {
          equip($slot`shirt`, shirt);
        }

        if (pants === null) {
          unequip($slot`pants`);
        } else {
          equip($slot`pants`, pants);
        }

        useSkill($skill`Beret Busking`);
      },
  });
  return taskList;
}