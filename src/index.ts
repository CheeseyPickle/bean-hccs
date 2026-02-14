import {
  abort,
  autosell,
  availableAmount,
  buy,
  cliExecute,
  eatsilent,
  equip,
  equippedItem,
  getWorkshed,
  haveEffect,
  myAdventures,
  myLevel,
  myMp,
  runChoice,
  setAutoAttack,
  use,
  useFamiliar,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $coinmaster,
  $effect,
  $familiar,
  $item,
  $location,
  $monster,
  $skill,
  $slot,
  adventureMacro,
  AprilingBandHelmet,
  AutumnAton,
  Clan,
  CommunityService,
  ensureEffect,
  get,
  have,
  Leprecondo,
  MayamCalendar,
  Requirement,
  set,
  SongBoom,
  TakerSpace,
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
  peridotMacro,
  pullIfPossible,
  sausageFightGuaranteed,
  setChoice,
  tryUse,
} from "./lib";
import Noncombat from "./noncombat";
import Spell from "./spell";
import { Hitpoints, Moxie, Muscle, Mysticality } from "./stattest";
import Weapon from "./weapon";
import { useBestFamiliar } from "./outfit";

function doGuaranteedGoblin() {
  // kill a kramco for the sausage before coiling wire
  if (!haveEffect($effect`Feeling Lost`) && sausageFightGuaranteed()) {
    ensureMp(12);
    equipStatOutfit();
    useBestFamiliar(true);
    const offHand = equippedItem($slot`off-hand`);
    equip($item`Kramco Sausage-o-Matic™`);
    if (myMp() < 20) {
      equip($item`bat wings`);
      useSkill($skill`Rest upside down`);
    }
    adventureMacro(
      $location`Noob Cave`,
      Macro.if_(
        `!monsterid ${$monster`sausage goblin`.id}`,
        new Macro().step("abort")
      ).step(Macro.easyFight().itemSkills().kill())
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
  if (have($item`toy accordion`) || myLevel() > 1) return;

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

  // Numberology 69
  cliExecute("numberology 69");

  // Buy things from 2002 Mr. Store
  use($item`2002 Mr. Store Catalog`);
  buy($coinmaster`Mr. Store 2002`, 1, $item`Charter: Nellyville`);
  buy($coinmaster`Mr. Store 2002`, 1, $item`Loathing Idol Microphone`);

  // Use TakerSpace first then switch to model train set
  if (getWorkshed() === $item.none && !get("_workshedItemUsed")) {
    use($item`TakerSpace letter of Marque`);
    TakerSpace.collect();
    TakerSpace.make($item`pirate dinghy`);
    TakerSpace.make($item`tankard of spiced Goldschlepper`);
    TakerSpace.make($item`harpoon`);
    TakerSpace.make($item`cursed Aztec tamale`);
    TakerSpace.make($item`spices`);
  }

  if (getWorkshed() !== $item`model train set`) {
    use($item`model train set`);
    // Trainset configuration is set later at levelling
  }

  set("autoSatisfyWithNPCs", true);
  set("autoSatisfyWithCoinmasters", true);

  cliExecute("mood apathetic");
  cliExecute("ccs bb-hccs");
  cliExecute("backupcamera reverser on");
  cliExecute("backupcamera ml");

  setChoice(1340, 3); // Turn off Lil' Doctor quests.
  setChoice(1387, 3); // set saber to drop items

  // unlock shops
  visitUrl("shop.php?whichshop=meatsmith&action=talk");
  runChoice(1);
  visitUrl("shop.php?whichshop=doc&action=talk");
  runChoice(1);
  visitUrl("shop.php?whichshop=armory&action=talk");
  runChoice(1);
  
  if (!get("_sitCourseCompleted")) {
    // 1 = Rocks, 2 = Insects, 3 = Plants
    withChoice(1494, 2, () => use($item`S.I.T. Course Completion Certificate`));
  }

  if (!have($item`McHugeLarge left ski`)) {
    visitUrl("inventory.php?action=skiduffel&pwd");
  }

  // Not seeded, so just hope you get lucky lol
  Leprecondo.setFurniture("cupcake treadmill", "UltraDance karaoke machine", "programmable blender", "four-poster bed");

  AutumnAton.sendTo($location`The Sleazy Back Alley`);

  pullIfPossible(1, $item`abstraction: category`, 2000);
  pullIfPossible(1, $item`tobiko marble soda`, 5000);
  pullIfPossible(1, $item`Stick-Knife of Loathing`, 0);
  pullIfPossible(1, $item`witch's bra`, 0);
  pullIfPossible(1, $item`Belt of Loathing`, 0);

  cliExecute("mcd 10");
  ensureSewerItem(1, $item`saucepan`);
  ensureSewerItem(1, $item`turtle totem`);
  ensureItem(1, $item`toy accordion`);
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

  if (get("_photoBoothEquipment") < 3) {
    Clan.join("Bonus Adventures from Hell");
    cliExecute("make Sheriff pistol");
    cliExecute("make Sheriff moustache");
    cliExecute("make Sheriff badge");
    Clan.join("Redemption City");
  }

  while (!get("_septEmberBalanceChecked") || get("availableSeptEmbers") >= 2) {
    cliExecute("make Mmm-brr! brand mouthwash");
  }

  if (get("availableSeptEmbers") === 1) {
    cliExecute("make bembershoot");
  }

  getBatteries();

  cliExecute("garden pick"); // Should be peppermint

  cliExecute("daycare item");

  useSkill($skill`Summon Crimbo Candy`);

  // Upgrade saber for fam wt
  cliExecute("saber fam");

  AprilingBandHelmet.conduct("Apriling Band Celebration Bop");

  MayamCalendar.submit("vessel", "yam2", "cheese", "explosion");
  MayamCalendar.submit("yam1", "bottle", "wall", "clock");

  cliExecute(
    "pantogram mysticality|cold|nail clippings|some self-respect|your hopes|silent"
  );
}

function getHeartstoneSP() {
  ensureEffect($effect`Feeling Excited`);
  ensureEffect($effect`The Magical Mojomuscular Melody`);
  ensureEffect($effect`Pasta Oneness`);

  // Get S from fantaSy ourk
  // Runaway with Roman Candelabra green candle
  if (!have($item`FantasyRealm G. E. M.`)) {
    cliExecute("make FantasyRealm Mage's Hat");
  }

  useFamiliar($familiar.none);
  new Requirement(
    ["init"],
    {
      forceEquip: [
        $item`FantasyRealm G. E. M.`,
        $item`Heartstone`,
        $item`Roman Candelabra`,
        $item`unwrapped knock-off retro superhero cape`,
      ],
      preventEquip: [$item`Daylight Shavings Helmet`, $item`bat wings`],
    }
  ).maximize();
  cliExecute("retrocape heck hold");
  if (!have($effect`Everything Looks Green`) && get("heartstoneLetters") === "") {
    adventureMacro(
      $location`The Towering Mountains`,
      Macro.trySkill($skill`Steal Monster's Heart`)
      .step(Macro.skill($skill`Blow the Green Candle!`))
    );
  }

  // Get P from sassy Pirate
  // Runaway with latte banish
  useBestFamiliar(false);
  new Requirement(
    ["init"],
    {
      forceEquip: [
        $item`Peridot of Peril`,
        $item`Heartstone`,
        $item`latte lovers member's mug`,
        $item`unwrapped knock-off retro superhero cape`,
      ],
      preventEquip: [$item`Daylight Shavings Helmet`, $item`bat wings`],
    }
  ).maximize();
  cliExecute("retrocape heck hold");
  if (!get("_latteBanishUsed") && have($item`pirate dinghy`) && get("heartstoneLetters") === "S") {
    peridotMacro(
      $location`The Obligatory Pirate's Cove`, 
      $monster`sassy pirate`, 
      Macro.trySkill($skill`Steal Monster's Heart`)
      .step(Macro.skill($skill`Throw Latte on Opponent`))
    );
  }
}

function getSkellyFruits() {
  ensureEffect($effect`Feeling Excited`);
  ensureEffect($effect`The Magical Mojomuscular Melody`);
  ensureEffect($effect`Pasta Oneness`);

  useBestFamiliar(false);
  new Requirement(
    ["100 mysticality experience percent, mysticality experience"],
    {
      forceEquip: [
        $item`Peridot of Peril`,
        $item`Heartstone`,
        $item`latte lovers member's mug`,
        $item`Jurassic Parka`,
      ],
      preventEquip: [$item`Daylight Shavings Helmet`, $item`bat wings`],
    }
  ).maximize();

  cliExecute("parka acid");

  while (!have($item`cherry`)) {
    peridotMacro(
      $location`The Skeleton Store`,
      $monster`novelty tropical skeleton`,
      Macro.trySkill($skill`Gulp Latte`)
        .trySkill($skill`Steal Monster's Heart`)
        .step(Macro.skill($skill`Spit jurassic acid`))
    );
  }
}

function get20MoreAdventures() {
  if (myAdventures() >= 60) return;

  // Eat bowl full of jelly & peppermint patty
  if (!get("_bowlFullOfJellyUsed")) {
    useSkill($skill`Bowl Full of Jelly`);
  }
  if (availableAmount($item`peppermint sprout`) >= 2) {
    cliExecute("make peppermint patty");
  }

  if (availableAmount($item`bowl full of jelly`) > 0) {
    eatsilent($item`bowl full of jelly`);
  }

  if (availableAmount($item`peppermint patty`) > 0) {
    eatsilent($item`peppermint patty`);
  }

  // pull and use borrowed time
  // if (
  //   availableAmount($item`borrowed time`) === 0 &&
  //   !get("_borrowedTimeUsed")
  // ) {
  //   pullIfPossible(1, $item`borrowed time`, 40000);
  //   if (!have($item`borrowed time`)) abort("Couldn't get borrowed time");
  //   use($item`borrowed time`);
  // }
}

export function main(): void {
  setAutoAttack(0);
  doDailies();

  const coilWireStatus = CommunityService.CoilWire.run(() => {
    setup();
    doGuaranteedGoblin();
    getHeartstoneSP();
    getSkellyFruits();
    get20MoreAdventures();
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
