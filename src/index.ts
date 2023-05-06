import {
  abort,
  autosell,
  availableAmount,
  cliExecute,
  equip,
  equippedItem,
  getCampground,
  haveEffect,
  myLevel,
  myMp,
  runChoice,
  setAutoAttack,
  toItem,
  use,
  useFamiliar,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $location,
  $monster,
  $skill,
  $slot,
  adventureMacro,
  AutumnAton,
  Clan,
  CommunityService,
  ensureEffect,
  get,
  have,
  Requirement,
  set,
  SongBoom,
  withChoice,
} from "libram";
import { Macro } from "./combatMacros";
import Drink from "./drink";
import { CSEngine } from "./engine";
import FamiliarWeight from "./familiar";
import HotRes from "./hotres";
import ItemDrop from "./item";
import Level from "./level";
import {
  ensureItem,
  ensureMp,
  ensureSewerItem,
  pullIfPossible,
  sausageFightGuaranteed,
  setChoice,
  tryUse,
  useBestFamiliar,
} from "./lib";
import Noncombat from "./noncombat";
import Spell from "./spell";
import { Hitpoints, Moxie, Muscle, Mysticality } from "./stattest";
import Weapon from "./weapon";

function doGuaranteedGoblin() {
  // kill a kramco for the sausage before coiling wire
  if (!haveEffect($effect`Feeling Lost`) && sausageFightGuaranteed()) {
    ensureMp(12);
    useBestFamiliar();
    equipStatOutfit();
    const offHand = equippedItem($slot`off-hand`);
    equip($item`Kramco Sausage-o-Matic™`);
    if (myMp() < 20) {
      cliExecute("rest free");
    }
    adventureMacro(
      $location`Noob Cave`,
      Macro.if_(
        `!monsterid ${$monster`sausage goblin`.id}`,
        new Macro().step("abort")
      ).step(Macro.itemSkills().easyFight().kill())
    );
    equip(offHand);
  }
}

const getBatteries = () => {
  // use the power plant
  cliExecute("inv_use.php?pwd&whichitem=10738");

  for (let i = 1; i < 8; i++) {
    cliExecute(`choice.php?pwd&whichchoice=1448&option=1&pp=${i}`);
  }
};

function vote() {
  if (!get("_voteToday")) {
    visitUrl("place.php?whichplace=town_right&action=townright_vote");
    visitUrl(
      "choice.php?option=1&whichchoice=1331&g=2&local%5B%5D=2&local%5B%5D=3"
    );
    visitUrl("place.php?whichplace=town_right&action=townright_vote"); // Let mafia see the voted values
  }
}

function equipStatOutfit() {
  cliExecute("umbrella ml");
  new Requirement(
    ["100 mysticality experience percent, mysticality experience"],
    {
      forceEquip: [$item`makeshift garbage shirt`, $item`unbreakable umbrella`],
      preventEquip: [$item`Daylight Shavings Helmet`],
    }
  ).maximize();
}

function setup() {
  if (get("_sitCourseCompleted") || myLevel() > 1) return;

  // Sell pork gems + tent
  visitUrl("tutorial.php?action=toot");
  tryUse(1, $item`letter from King Ralph XI`);
  tryUse(1, $item`pork elf goodies sack`);
  autosell(5, $item`baconstone`);
  autosell(5, $item`hamethyst`);
  // Save 2 porquoises, if you get them
  if (availableAmount($item`porquoise`) > 2) {
    autosell(availableAmount($item`porquoise`) - 2, $item`porquoise`);
  }

  // Numberology 14 & Sell
  cliExecute("numberology 14");
  autosell(14, $item`moxie weed`);

  if (getCampground()[$item`model train set`.name] !== 1) {
    use(toItem(`model train set`));
    // Trainset configuration is set later at levelling
  }

  set("autoSatisfyWithNPCs", true);
  set("autoSatisfyWithCoinmasters", true);

  cliExecute("mood apathetic");
  cliExecute("ccs bb-hccs");
  cliExecute("backupcamera reverser on");
  cliExecute("backupcamera ml");

  ensureItem(1, $item`toy accordion`);
  ensureSewerItem(1, $item`saucepan`);
  ensureSewerItem(1, $item`turtle totem`);
  cliExecute("mcd 10");

  setChoice(1340, 3); // Turn off Lil' Doctor quests.
  setChoice(1387, 3); // set saber to drop items

  // pull and use borrowed time
  if (
    availableAmount($item`borrowed time`) === 0 &&
    !get("_borrowedTimeUsed")
  ) {
    pullIfPossible(1, $item`borrowed time`, 40000);
    if (!have($item`borrowed time`)) abort("Couldn't get borrowed time");
    use($item`borrowed time`);
  }

  // unlock shops
  visitUrl("shop.php?whichshop=meatsmith&action=talk");
  runChoice(1);
  visitUrl("shop.php?whichshop=doc&action=talk");
  runChoice(1);
  visitUrl("shop.php?whichshop=armory&action=talk");
  runChoice(1);

  // 1 = Rocks, 2 = Insects, 3 = Plants
  withChoice(1494, 1, () => use($item`S.I.T. Course Completion Certificate`));

  AutumnAton.sendTo($location`The Sleazy Back Alley`);

  pullIfPossible(1, $item`abstraction: category`, 2000);
  pullIfPossible(1, $item`bran muffin`, 0);
  pullIfPossible(1, $item`wasabi marble soda`, 5000);
  pullIfPossible(1, $item`Staff of Kitchen Royalty`, 0);
}

function doDailies() {
  if (have($item`pantogram pants`)) return;

  Clan.join("Redemption City");

  visitUrl("council.php"); // Initialize council.
  visitUrl("clan_viplounge.php?action=fwshop"); // manual visit to fireworks shop to allow purchases
  visitUrl("clan_viplounge.php?action=lookingglass&whichfloor=2"); // get DRINK ME potion
  visitUrl(
    "shop.php?whichshop=lathe&action=buyitem&quantity=1&whichrow=1162&pwd"
  ); // lathe wand

  vote();

  cliExecute("fold makeshift garbage shirt");
  SongBoom.setSong("Total Eclipse of Your Meat");

  if (!get("_floundryItemCreated")) {
    Clan.join("Floundry");
    cliExecute("acquire fish hatchet");
    Clan.join("Redemption City");
  }

  getBatteries();

  cliExecute("garden pick"); // Should be peppermint

  cliExecute("daycare item");

  useSkill($skill`Summon Crimbo Candy`);

  // Upgrade saber for fam wt
  cliExecute("saber fam");

  cliExecute(
    "pantogram mysticality|spooky|nail clippings|some self-respect|your hopes|silent"
  );
}

function getSkellyFruits() {
  if (!have($effect`Ready to Eat`)) {
    ensureItem(1, $item`red rocket`);
  }
  ensureEffect($effect`Feeling Excited`);
  ensureEffect($effect`The Magical Mojomuscular Melody`);
  ensureEffect($effect`Pasta Oneness`);

  useFamiliar($familiar`Pocket Professor`);
  new Requirement(
    ["100 mysticality experience percent, mysticality experience"],
    {
      forceEquip: [
        $item`Lil' Doctor™ bag`,
        $item`latte lovers member's mug`,
        $item`Jurassic Parka`,
      ],
      preventEquip: [$item`Daylight Shavings Helmet`],
    }
  ).maximize();

  cliExecute("parka acid");

  while (!have($item`cherry`)) {
    adventureMacro(
      $location`The Skeleton Store`,
      Macro.trySkill($skill`Gulp Latte`)
        .tryItem($item`red rocket`)
        .if_(
          `!monsterid ${$monster`novelty tropical skeleton`.id}`,
          new Macro()
            .trySkill($skill`Throw Latte on Opponent`)
            .trySkill($skill`Reflex Hammer`)
            .trySkill($skill`Feel Hatred`)
        )
        .step(Macro.skill($skill`Spit jurassic acid`))
    );
  }
}

export function main(): void {
  setAutoAttack(0);
  doDailies();

  const coilWireStatus = CommunityService.CoilWire.run(() => {
    setup();
    doGuaranteedGoblin();
    getSkellyFruits();
  }, 60);
  if (coilWireStatus === "failed") {
    abort(`Didn't coil wire.`);
  }

  CSEngine.runTests(
    Level,
    Muscle,
    Hitpoints,
    Mysticality,
    Moxie,
    ItemDrop,
    Noncombat,
    Drink,
    FamiliarWeight,
    HotRes,
    Weapon,
    Spell
  );
}
