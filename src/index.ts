import { canAdv } from 'canadv.ash';
import {
  abort,
  adv1,
  autosell,
  availableAmount,
  chatPrivate,
  chew,
  cliExecute,
  containsText,
  create,
  drink,
  eat,
  equip,
  equippedItem,
  familiarWeight,
  gametimeToInt,
  getProperty,
  haveEffect,
  haveFamiliar,
  haveSkill,
  inMultiFight,
  itemAmount,
  maximize,
  myAdventures,
  myBasestat,
  myBuffedstat,
  myClass,
  myFamiliar,
  myFullness,
  myHp,
  myInebriety,
  myLevel,
  myMaxhp,
  myMaxmp,
  myMeat,
  myMp,
  mySpleenUse,
  myTurncount,
  numericModifier,
  print,
  restoreHp,
  runChoice,
  runCombat,
  setAutoAttack,
  setProperty,
  toInt,
  toSlot,
  use,
  useFamiliar,
  userConfirm,
  useSkill,
  visitUrl,
  wait,
  weightAdjustment,
} from 'kolmafia';
import {
  $class,
  $effect,
  $familiar,
  $item,
  $location,
  $monster,
  $skill,
  $slot,
  $stat,
  adventureMacro,
  adventureMacroAuto,
  get,
  Macro,
  set,
} from 'libram';
import { COMBAT_MACROS } from './combat';
import { getLatteLocation } from './latte';
import {
  adventureWithCarolGhost,
  eatPizza,
  ensureCreateItem,
  ensureEffect,
  ensureItem,
  ensureNpcEffect,
  ensurePotionEffect,
  ensurePullEffect,
  ensureSewerItem,
  ensureSong,
  getPropertyBoolean,
  getPropertyInt,
  myFamiliarWeight,
  pullIfPossible,
  runawayAvailable,
  sausageFightGuaranteed,
  setChoice,
  setClan,
  setPropertyInt,
  tryUse,
  wishEffect,
} from './lib';

enum Test {
  HP = 1,
  MUS = 2,
  MYS = 3,
  MOX = 4,
  FAMILIAR = 5,
  WEAPON = 6,
  SPELL = 7,
  NONCOMBAT = 8,
  ITEM = 9,
  HOT_RES = 10,
  COIL_WIRE = 11,
  DONATE = 30,
}

interface turnsObject {
  [key: number]: number;
}

const desiredTurns: turnsObject = {
  [Test.HP]: 1,
  [Test.MUS]: 1,
  [Test.MYS]: 1,
  [Test.MOX]: 1,
  [Test.ITEM]: 1,
  [Test.WEAPON]: 15,
  [Test.HOT_RES]: 13,
  [Test.SPELL]: 41,
  [Test.NONCOMBAT]: 1,
  [Test.FAMILIAR]: 44,
  [Test.COIL_WIRE]: 60,
};

interface predObject {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [key: number]: Function;
}

const testTurnPredictions: predObject = {
  [Test.COIL_WIRE]: () => {
    return 60;
  },
  [Test.HP]: () => {
    return 60 - Math.floor((myMaxhp() - myBuffedstat($stat`muscle`) - 3) / 30);
  },
  [Test.MUS]: () => {
    return 60 - Math.floor((1 / 30) * (myBuffedstat($stat`muscle`) - myBasestat($stat`muscle`)));
  },
  [Test.MOX]: () => {
    return 60 - Math.floor((1 / 30) * (myBuffedstat($stat`moxie`) - myBasestat($stat`moxie`)));
  },
  [Test.MYS]: () => {
    return (
      60 -
      Math.floor((1 / 30) * (myBuffedstat($stat`mysticality`) - myBasestat($stat`mysticality`)))
    );
  },
  [Test.ITEM]: () => {
    return (
      60 -
      Math.floor(numericModifier('item drop') / 30 + 0.001) -
      Math.floor(numericModifier('booze drop') / 15 + 0.001)
    );
  },
  [Test.HOT_RES]: () => {
    return 60 - numericModifier('hot resistance');
  },
  [Test.NONCOMBAT]: () => {
    return 60 + (20 + numericModifier('combat rate')) * 3;
  },
  [Test.FAMILIAR]: () => {
    return 60 - Math.floor((familiarWeight(myFamiliar()) + weightAdjustment()) / 5);
  },
  [Test.WEAPON]: () => {
    return (
      60 -
      Math.floor(numericModifier('weapon damage') / 25 + 0.001) -
      Math.floor(numericModifier('weapon damage percent') / 25 + 0.001)
    );
  },
  [Test.SPELL]: () => {
    return (
      60 -
      Math.floor(numericModifier('spell damage') / 50 + 0.001) -
      Math.floor(numericModifier('spell damage percent') / 50 + 0.001)
    );
  },
};

function upkeepHpAndMp() {
  if (myHp() < 0.8 * myMaxhp()) {
    visitUrl('clan_viplounge.php?where=hottub');
  }
  if (myMp() < 500) {
    eat($item`magical sausage`);
  }
}

function doGuaranteedGoblin() {
  // kill a kramco for the sausage before coiling wire
  // Also get the mp to summon and check a love potion
  if (sausageFightGuaranteed()) {
    ensureSong($effect`The Magical Mojomuscular Melody`);

    useFamiliar($familiar`Left-Hand Man`);
    equip($item`wad of used tape`);
    equip($item`Catherine Wheel`);
    equip($item`Fourth of May Cosplay Saber`);
    equip($slot`off-hand`, $item`Kramco Sausage-o-Matic™`);
    equip($item`pantogram pants`);
    equip($slot`acc1`, $item`Beach Comb`);
    equip($slot`acc2`, $item`backup camera`);
    equip($slot`familiar`, $item`latte lovers member's mug`);
    adventureMacro(
      $location`Noob Cave`,
      Macro.if_('!monstername "sausage goblin"', new Macro().step('abort'))
        .skill($skill`Gulp Latte`)
        .skill($skill`Sing Along`)
        .attack()
        .repeat()
    );
    // unequip the latte from LHM
    equip($slot`familiar`, $item`none`);
  }
}

function tryMeatGoblin() {
  // Kill a goblin for meat if it's guaranteed
  if (sausageFightGuaranteed()) {
    useFamiliar($familiar`Hobo Monkey`);
    maximize('meat drop', false);
    adventureMacro(
      $location`Noob Cave`,
      Macro.if_('!monstername "sausage goblin"', new Macro().step('abort'))
        .skill($skill`Sing Along`)
        .skill($skill`Saucestorm`)
        .repeat()
    );
  }
}

function testDone(testNum: number) {
  print(`Checking test ${testNum}...`);
  const text = visitUrl('council.php');
  return !containsText(text, `<input type=hidden name=option value=${testNum}>`);
}

function doTest(testNum: Test) {
  if (!testDone(testNum)) {
    let predictedTurns = 60;
    if (testNum !== Test.DONATE) {
      predictedTurns = testTurnPredictions[testNum]();
      if (predictedTurns > desiredTurns[testNum]) abort('test taking too long');

      while (predictedTurns > myAdventures()) {
        eat(1, $item`magical sausage`);
      }
    }
    set(`_hccsTestExpected${testNum}`, predictedTurns);
    const turnsBeforeTest = myTurncount();
    visitUrl(`choice.php?whichchoice=1089&option=${testNum}`);
    if (!testDone(testNum)) {
      throw `Failed to do test ${Test[testNum]}. Maybe we are out of turns.`;
    }
    print(
      `${Test[testNum]} outfit: ${[
        'hat',
        'back',
        'weapon',
        'off-hand',
        'shirt',
        'pants',
        'acc1',
        'acc2',
        'acc3',
      ].reduce((acc, cur) => `${acc + equippedItem(toSlot(cur))},`, '')}`
    );
    set(`_hccsTestActual${testNum}`, myTurncount() - turnsBeforeTest);
  } else {
    print(`Test ${testNum} already completed.`);
  }
}

function setup() {
  setPropertyInt('bb_ScriptStartCS', gametimeToInt());

  // Don't buy stuff from NPC stores.
  setProperty('_saved_autoSatisfyWithNPCs', getProperty('autoSatisfyWithNPCs'));
  setProperty('autoSatisfyWithNPCs', 'true');

  // Do buy stuff from coinmasters (hermit).
  setProperty('_saved_autoSatisfyWithCoinmasters', getProperty('autoSatisfyWithCoinmasters'));
  setProperty('autoSatisfyWithCoinmasters', 'true');

  // Initialize council.
  visitUrl('council.php');

  // manual visit to fireworks shop to allow purchases
  visitUrl('clan_viplounge.php?action=fwshop');

  cliExecute('mood apathetic');

  // All combat handled by our consult script (hccs_combat.ash).
  cliExecute('ccs bean-hccs');

  // fiddle with backup camera (reverser and init)
  cliExecute('backupcamera reverser on');
  cliExecute('backupcamera init');

  // Upgrade saber for fam wt
  visitUrl('main.php?action=may4');
  runChoice(4);

  // Visiting Looking Glass in clan VIP lounge
  visitUrl('clan_viplounge.php?action=lookingglass&whichfloor=2');
  while (getPropertyInt('_genieWishesUsed') < 3) {
    cliExecute('genie wish for more wishes');
  }

  // pull and use borrowed time
  if (availableAmount($item`borrowed time`) === 0 && !get('_borrowedTimeUsed')) {
    if (pullIfPossible(1, $item`borrowed time`, 20000)) {
      use($item`borrowed time`);
    } else {
      abort("Couldn't get borrowed time");
    }
  }

  // get clan consults
  setClan('Redemption City');
  if (getPropertyInt('_clanFortuneConsultUses') < 3) {
    while (getPropertyInt('_clanFortuneConsultUses') < 3) {
      cliExecute('fortune d0rfl');
      cliExecute('wait 5');
    }
  }

  // get a FR hat
  create($item`FantasyRealm Rogue's Mask`);

  // fold a wad of tape
  cliExecute('fold wad of used tape');

  // Summon pants w/ mys, spooky res, weapon dmg, -combat, mp
  // FIXME: I...have no idea if this url will actually work.
  visitUrl('inv_use.php?pwd&whichitem=9573');
  visitUrl('choice.php?whichchoice=1270&pwd&option=1&m=2&e=3&s1=2&s2=1&s3=1');

  cliExecute('boombox meat');

  // Calculate the universe for meat
  cliExecute('numberology 14');
  autosell(14, $item`moxie weed`);

  // Sell pork gems + tent
  visitUrl('tutorial.php?action=toot');
  tryUse(1, $item`letter from King Ralph XI`);
  tryUse(1, $item`pork elf goodies sack`);
  autosell(5, $item`baconstone`);
  autosell(5, $item`hamethyst`);
  // Save a few porquoises
  if (itemAmount($item`porquoise`) > 2)
    autosell(itemAmount($item`porquoise`) - 2, $item`porquoise`);

  autosell(1, $item`Newbiesport™ tent`);

  // Buy some items
  ensureItem(1, $item`toy accordion`);
  ensureItem(1, $item`Catherine Wheel`);
  ensureItem(1, $item`detuned radio`);

  // Get buff things
  ensureSewerItem(1, $item`saucepan`);

  if (!get('_floundryItemCreated')) {
    cliExecute('acquire fish hatchet');
  }
}

function getIngredients() {
  // Put on some gear
  equip($item`wad of used tape`);
  equip($item`Catherine Wheel`);
  equip($item`Fourth of May Cosplay Saber`);
  equip($item`latte lovers member's mug`); // for the banish
  equip($item`Cargo Cultist Shorts`);
  equip($slot`acc1`, $item`backup camera`);
  equip($slot`acc2`, $item`Beach Comb`);

  useFamiliar($familiar`Plastic Pirate Skull`); // delevels things so I don't die

  setProperty('choiceAdventure1387', '3'); // set saber to drop items

  // Cherry and grapefruit in skeleton store (Saber YR)
  if (getProperty('questM23Meatsmith') === 'unstarted') {
    visitUrl('shop.php?whichshop=meatsmith&action=talk');
    runChoice(1);
  }
  if (!canAdv($location`The Skeleton Store`, false)) throw 'Cannot open skeleton store!';
  adv1($location`The Skeleton Store`, -1, '');
  if (!containsText($location`The Skeleton Store`.noncombatQueue, 'Skeletons In Store')) {
    throw 'Something went wrong at skeleton store.';
  }
  ensureItem(1, $item`red rocket`);
  do {
    adventureMacro(
      $location`The Skeleton Store`,
      Macro.tryItem($item`red rocket`).step(
        COMBAT_MACROS.banishAndSaber('novelty tropical skeleton')
      )
    );
  } while (availableAmount($item`cherry`) === 0);
  autosell(availableAmount($item`strawberry`), $item`strawberry`);
}

function useStatGains() {
  // Discount all our later buffs
  ensureEffect($effect`The Odour of Magick`);

  if (get('getawayCampsiteUnlocked') && haveEffect($effect`That's Just Cloud-Talk, Man`) === 0) {
    visitUrl('place.php?whichplace=campaway&action=campaway_sky');
  }

  ensureEffect($effect`Inscrutable Gaze`);
  ensureEffect($effect`Thaumodynamic`);
  ensurePullEffect($effect`Category`, $item`abstraction: category`);
  ensurePullEffect($effect`Different Way of Seeing Things`, $item`non-Euclidean angle`);

  // Use ten-percent bonus
  tryUse(1, $item`a ten-percent bonus`);

  // Pull & eat bran muffin
  // You should have this prepped
  if (haveEffect($effect`Ready to Eat`) > 0) {
    pullIfPossible(1, $item`bran muffin`, 200);
  } else {
    abort('I think we failed to use a red rocket somewhere...');
  }

  // Bastille for mys effect and brogues. Also mys stats, of course
  cliExecute('bastille myst brutalist');

  // Scavenge for gym equipment
  if (toInt(get('_daycareGymScavenges')) < 1) {
    visitUrl('/place.php?whichplace=town_wrong&action=townwrong_boxingdaycare');
    const pg = runChoice(3);
    if (containsText(pg, '[free]')) runChoice(2);
    runChoice(5);
    runChoice(4);
  }
}

function preLatteBuffs() {
  // I have some MP from wire test, so get some meat!
  useSkill($skill`Advanced Cocktailcrafting`);
  autosell(3, $item`magical ice cubes`);
  autosell(3, $item`little paper umbrella`);
  autosell(3, $item`coconut shell`);

  // Buffs that don't need MP, to maximize MP from Gulp
  ensureEffect($effect`Favored by Lyle`);
  ensureEffect($effect`Feeling Excited`);
  ensureEffect($effect`Uncucumbered`); // boxing daycare
  wishEffect($effect`A Contender`);
  ensurePullEffect($effect`New and Improved`, $item`warbear rejuvenation potion`);
  ensureEffect($effect`Confidence of the Votive`);
  ensureNpcEffect($effect`Glittering Eyelashes`, 1, $item`glittery mascara`);
}

function buffBeforeGoblins() {
  if (!haveEffect($effect`Fire cracked`)) {
    ensureItem(1, $item`fire crackers`);
    eat($item`fire crackers`);
  }

  // craft potions after eating to ensure we have adventures
  if (!getPropertyBoolean('hasRange')) {
    ensureItem(1, $item`Dramatic™ range`);
    use(1, $item`Dramatic™ range`);
  }

  useSkill(1, $skill`Advanced Saucecrafting`);
  ensurePotionEffect($effect`Mystically Oiled`, $item`ointment of the occult`);

  autosell(availableAmount($item`ointment of the occult`), $item`ointment of the occult`);

  // +myst stuff
  ensureSong($effect`The Magical Mojomuscular Melody`);
  ensureEffect($effect`Big`);

  // Levelling stuff
  cliExecute('mcd 10');
  ensureEffect($effect`Lapdog`);
  ensureEffect($effect`You Learned Something Maybe!`);
  create($item`peppermint twist`);
  ensureEffect($effect`Peppermint Twisted`);
  ensureEffect($effect`Carol of the Thrills`);
  ensureEffect($effect`Drescher's Annoying Noise`);

  // Survivability
  ensureEffect($effect`Carol of the Hells`);
  ensureEffect($effect`Blood Bubble`);

  // We want this to last until the item test
  create(1, $item`battery (lantern)`);
  ensureEffect($effect`Lantern-Charged`);

  if (haveSkill($skill`Love Mixology`)) {
    const lovePotion = $item`Love Potion #0`;
    const loveEffect = $effect`Tainted Love Potion`;
    if (haveEffect(loveEffect) === 0) {
      if (availableAmount(lovePotion) === 0) {
        useSkill(1, $skill`Love Mixology`);
      }
      visitUrl(`desc_effect.php?whicheffect=${loveEffect.descid}`);
      if (
        numericModifier(loveEffect, 'mysticality') > 10 &&
        numericModifier(loveEffect, 'muscle') > -30 &&
        numericModifier(loveEffect, 'moxie') > -30 &&
        numericModifier(loveEffect, 'maximum hp percent') > -0.001
      ) {
        use(1, lovePotion);
      }
    }
  }

  if (!haveEffect($effect`On the Trolley`)) {
    if (myMeat() < 500) abort("Don't have money for Bee's Knees.");
    useSkill($skill`The Ode to Booze`);
    cliExecute("drink Bee's Knees");
  }
}

function doLatteRunaways() {
  useFamiliar($familiar`Pocket Professor`);

  equip($item`latte lovers member's mug`);

  while (runawayAvailable() && !get('latteUnlocks').includes('chili')) {
    adventureMacro(
      getLatteLocation(),
      Macro.externalIf(myMp() < 0.5 * myMaxmp(), Macro.trySkill($skill`Gulp Latte`))
        .trySkill($skill`Throw Latte on Opponent`)
        .trySkill($skill`Feel Hatred`)
        .trySkill($skill`Snokebomb`)
    );

    if (get('latteUnlocks').includes('sandalwood') && get('_latteRefillsUsed') < 1) {
      cliExecute('latte refill sandalwood pumpkin vanilla');
    }
  }
}

function doFreeFights() {
  equip($item`fresh coat of paint`);
  equip($item`unwrapped knock-off retro superhero cape`);
  equip($item`weeping willow wand`);
  equip($item`familiar scrapbook`);
  equip($item`Cargo Cultist Shorts`);
  equip($slot`acc1`, $item`Retrospecs`);
  equip($slot`acc2`, $item`hewn moon-rune spoon`);
  equip($slot`acc3`, $item`backup camera`);

  useFamiliar($familiar`Hovering Sombrero`);
  equip($slot`familiar`, $item`miniature crystal ball`);

  cliExecute('retrocape mysticality');

  equip($item`familiar scrapbook`);

  // kill the mushroom and chew mushroom tea
  if (!get('_mushroomGardenVisited')) {
    Macro.skill($skill`Barrage of Tears`)
      .skill($skill`Spittoon Monsoon`)
      .skill($skill`Saucestorm`)
      .repeat()
      .setAutoAttack();
    adv1($location`Your Mushroom Garden`);
    setAutoAttack(0);
    setChoice(1410, 2);
    adv1($location`Your Mushroom Garden`);
    use($item`free-range mushroom`);
  }

  if (!haveEffect($effect`Mush-Maw`)) {
    ensureCreateItem(1, $item`mushroom tea`);
    chew($item`mushroom tea`); // get Mush-Maw (+20 ML), 1 spleen
  }

  // kill a Kramco to prep the back-up camera
  if (sausageFightGuaranteed()) {
    equip($item`Kramco Sausage-o-Matic™`);
    adventureMacro(
      $location`Noob Cave`,
      Macro.if_('!monstername "sausage goblin"', new Macro().step('abort'))
        .skill($skill`Barrage of Tears`)
        .skill($skill`Spittoon Monsoon`)
        .skill($skill`Saucestorm`)
    );
  } else if (get('lastCopyableMonster') !== $monster`sausage goblin`) {
    abort('Kramco not ready to start back-up chain');
  }

  // 10x back-up sausage fight @ The Dire Warren with Sombrero
  equip($item`familiar scrapbook`);

  while (get('_backUpUses') < 10) {
    upkeepHpAndMp();

    adventureMacroAuto(
      $location`The Dire Warren`,
      Macro.skill($skill`Back-Up to your Last Enemy`)
        .if_('!monstername "sausage goblin"', new Macro().step('abort'))
        .trySkill($skill`Feel Pride`)
        .skill($skill`Barrage of Tears`)
        .skill($skill`Spittoon Monsoon`)
        .skill($skill`Saucestorm`)
    );
  }

  setAutoAttack(0);
  restoreHp(myMaxhp());

  // Professor chain off the last back-up
  equip($item`Fourth of May Cosplay Saber`);
  useFamiliar($familiar`Pocket Professor`);
  equip($slot`familiar`, $item`Pocket Professor memory chip`);

  if (myFamiliarWeight() < 65) abort('not maxing fam weight');

  Macro.trySkill($skill`Back-Up to your Last Enemy`)
    .skill($skill`Curse of Weaksauce`)
    .skill($skill`Entangling Noodles`)
    .trySkill(Skill.get('Lecture on Relativity'))
    .skill($skill`Spittoon Monsoon`)
    .skill($skill`Saucegeyser`)
    .setAutoAttack();
  adv1($location`The Dire Warren`);
  while (inMultiFight()) runCombat();

  setAutoAttack(0);
  cliExecute('mood apathetic');
}

function postGoblins() {
  // cast needed things
  useSkill(1, $skill`Pastamastery`);
  useSkill(1, $skill`Acquire Rhinestones`);
  useSkill(1, $skill`Prevent Scurvy and Sobriety`);
  haveSkill($skill`Perfect Freeze`) && useSkill(1, $skill`Perfect Freeze`);
  useSkill(1, $skill`Summon Crimbo Candy`);
}

function doWireTest() {
  // Burn love potion if it's terrible
  if (myMp() >= 50) {
    const lovePotion = $item`Love Potion #0`;
    const loveEffect = $effect`Tainted Love Potion`;
    useSkill($skill`Love Mixology`);
    visitUrl(`desc_effect.php?whicheffect=${loveEffect.descid}`);
    if (
      !(
        numericModifier(loveEffect, 'mysticality') > 10 &&
        numericModifier(loveEffect, 'muscle') > -30 &&
        numericModifier(loveEffect, 'moxie') > -30 &&
        numericModifier(loveEffect, 'maximum hp percent') > -0.001
      )
    ) {
      use(1, lovePotion);
    }
  }

  // maximize max MP before doing the test
  useFamiliar($familiar`Left-Hand Man`);
  equip($item`wad of used tape`);
  equip($item`Catherine Wheel`);
  equip($item`Fourth of May Cosplay Saber`);
  equip($slot`off-hand`, $item`Kramco Sausage-o-Matic™`);
  equip($item`pantogram pants`);
  equip($slot`acc1`, $item`backup camera`);
  equip($slot`acc2`, $item`Beach Comb`);
  equip($slot`familiar`, $item`Abracandalabra`);
  doTest(Test.COIL_WIRE);

  // Unequip LHM ASAP
  useSkill($skill`Lock Picking`);
  equip($slot`familiar`, $item`none`);
}

function doHpTest() {
  ensurePotionEffect($effect`Expert Oiliness`, $item`oil of expertise`);

  if (haveEffect($effect`Carlweather's Cantata of Confrontation`) > 0) {
    cliExecute("shrug Carlweather's Cantata of Confrontation");
  }

  maximize('hp', false);

  // QUEST - Donate Blood (HP)
  doTest(Test.HP);
}

function doMoxTest() {
  if (myClass() === $class`Pastamancer`) useSkill(1, $skill`Bind Penne Dreadful`);
  else ensurePotionEffect($effect`Expert Oiliness`, $item`oil of expertise`);

  // Sauceror has 75% moxie bird
  use(1, $item`Bird-a-Day calendar`);
  ensureEffect($effect`Blessing of the Bird`);

  ensureEffect($effect`Big`);
  // ensureEffect($effect`Song of Bravado`);
  // ensureSong($effect`Stevedave's Shanty of Superiority`);
  ensureSong($effect`The Moxious Madrigal`);
  // ensureEffect($effect`Quiet Desperation`);
  // ensureEffect($effect`Disco Fever`);
  // ensureEffect($effect`Blubbered Up`);
  // ensureEffect($effect`Mariachi Mood`);
  ensureNpcEffect($effect`Butt-Rock Hair`, 5, $item`hair spray`);
  tryUse(1, $item`Crimbo candied pecan`);
  if (haveEffect($effect`Unrunnable Face`) === 0) {
    tryUse(1, $item`runproof mascara`);
  }
  cliExecute('retrocape moxie');

  maximize('moxie', false);

  if (myBuffedstat($stat`moxie`) - myBasestat($stat`moxie`) < 1770) {
    use(availableAmount($item`rhinestone`), $item`rhinestone`);
  }
  doTest(Test.MOX);
}

function doMusTest() {
  if (myClass() === $class`Pastamancer`) useSkill(1, $skill`Bind Undead Elbow Macaroni`);
  else ensurePotionEffect($effect`Expert Oiliness`, $item`oil of expertise`);

  ensureEffect($effect`Big`);
  // ensureEffect($effect`Song of Bravado`);
  // ensureSong($effect`Stevedave's Shanty of Superiority`);
  // ensureSong($effect`Power Ballad of the Arrowsmith`);
  // ensureEffect($effect`Rage of the Reindeer`);
  // ensureEffect($effect`Quiet Determination`);
  // ensureEffect($effect`Disdain of the War Snapper`);
  ensureNpcEffect($effect`Go Get 'Em, Tiger!`, 5, $item`Ben-Gal™ Balm`);
  cliExecute('retrocape muscle');

  haveFamiliar($familiar`Left-Hand Man`) && useFamiliar($familiar`Left-Hand Man`);
  maximize('muscle', false);

  tryUse(1, $item`Crimbo peppermint bark`);

  // for (const increaser of [
  //   () => ensureEffect($effect`Ham-Fisted`),
  // ]) {
  //   if (myBuffedstat($stat`muscle`) - myBasestat($stat`mysticality`) < 1770) increaser();
  // }

  if (myBuffedstat($stat`muscle`) - myBasestat($stat`muscle`) < 1770) {
    throw 'Not enough muscle to cap.';
  }

  doTest(Test.MUS);
}

function doItemTest() {
  visitUrl('shop.php?whichshop=fwshop&action=buyitem&quantity=1&whichrow=1257&pwd'); // get oversized sparkler
  useFamiliar($familiar`none`);

  // cyclops eyedrops
  if (!haveEffect($effect`One Very Clear Eye`)) {
    cliExecute('pillkeeper semirare');
    adv1($location`The Limerick Dungeon`);
    use($item`cyclops eyedrops`);
  }

  // Create CER pizza
  if (!haveEffect($effect`Certainty`)) {
    equip($slot`hat`, $item`none`);
    ensureSewerItem(1, $item`ravioli hat`);
    useFamiliar($familiar`Exotic Parrot`); // get that cracker
    eatPizza(
      $item`coconut shell`,
      $item`eggbeater`,
      $item`ravioli hat`,
      $item`Pocket Professor memory chip` // get that cracker
    );

    ensureItem(1, $item`cracker`);
    equip($slot`familiar`, $item`cracker`);
  }

  !get('_clanFortuneBuffUsed') && cliExecute('fortune buff item');
  !haveEffect($effect`Infernal Thirst`) && cliExecute('genie effect Infernal Thirst');
  !haveEffect($effect`Lantern-Charged`) && use($item`battery (lantern)`);
  ensureEffect($effect`Feeling Lost`);
  ensureEffect($effect`Singer's Faithful Ocelot`);
  ensureEffect($effect`Fat Leon's Phat Loot Lyric`);
  ensureEffect($effect`Steely-Eyed Squint`);
  ensureEffect($effect`Nearly All-Natural`); // bag of grain
  ensureEffect($effect`Blessing of the Bird`);

  equip($item`oversized sparkler`);
  equip($item`Kramco Sausage-o-Matic™`);

  // maximize(
  //   'item, 2 booze drop, -equip broken champagne bottle, -equip surprisingly capacious handbag',
  //   false
  // );

  doTest(Test.ITEM);
}

function doFamiliarTest() {
  if (myHp() < 30) useSkill(1, $skill`Cannelloni Cocoon`);
  ensureEffect($effect`Leash of Linguini`);
  ensureEffect($effect`Billiards Belligerence`);
  ensureEffect($effect`Do I Know You From Somewhere?`);
  ensureEffect($effect`Shortly Stacked`);
  if (availableAmount($item`body spradium`) > 0) ensureEffect($effect`Boxing Day Glow`);

  tryMeatGoblin();

  useFamiliar($familiar`Pocket Professor`);
  equip($slot`weapon`, $item`Fourth of May Cosplay Saber`);
  equip($slot`offhand`, $item`fish hatchet`);
  equip($slot`acc1`, $item`Brutal brogues`);
  equip($slot`acc2`, $item`Beach Comb`);

  doTest(Test.FAMILIAR);
}

function doWeaponTest() {
  if (!haveEffect($effect`Cowrruption`)) {
    wishEffect($effect`Cowrruption`);
  }

  // OU pizza (pulverize saucepan for useless powder)
  if (!haveEffect($effect`Outer Wolf™`)) {
    ensureItem(1, $item`tenderizing hammer`);
    ensureItem(1, $item`cool whip`);
    availableAmount($item`useless powder`) === 0 && cliExecute('pulverize cool whip');
    eatPizza(
      $item`oil of expertise`,
      $item`useless powder`,
      $item`scrumptious reagent`,
      $item`scrumptious reagent`
    );
  }

  if (haveEffect($effect`Do You Crush What I Crush?`) === 0) {
    adventureWithCarolGhost($effect`Do You Crush What I Crush?`);
  }

  if (!haveEffect($effect`In a Lather`)) {
    useSkill($skill`The Ode to Booze`);
    cliExecute('drink Sockdollager');
  }

  if (availableAmount($item`twinkly nuggets`) > 0) {
    ensureEffect($effect`Twinkly Weapon`);
  }

  if (availableAmount($item`vial of hamethyst juice`) > 0) {
    ensureEffect($effect`Ham-Fisted`);
  }

  if (availableAmount($item`LOV Elixir #3`) > 0) ensureEffect($effect`The Power of LOV`);

  ensureEffect($effect`Carol of the Bulls`);
  ensureEffect($effect`Song of the North`);
  // ensureEffect($effect`Rage of the Reindeer`);
  // ensureEffect($effect`Frenzied, Bloody`);
  // ensureEffect($effect`Scowl of the Auk`);
  // ensureEffect($effect`Disdain of the War Snapper`);
  // ensureEffect($effect`Tenacity of the Snapper`);
  // ensureSong($effect`Jackasses' Symphony of Destruction`);
  ensureEffect($effect`Billiards Belligerence`);
  // ensureNpcEffect($effect`Engorged Weapon`, 1, $item`Meleegra&trade; pills`); Gnome camp
  ensureEffect($effect`Cowrruption`); // Corrupted marrow
  ensureEffect($effect`Lack of Body-Building`);
  ensureEffect($effect`Bow-Legged Swagger`);

  cliExecute('boombox fists');
  if (!haveEffect($effect`Rictus of Yeg`)) {
    cliExecute('cargo pick 284');
    use($item`Yeg's Motel toothbrush`);
  }

  eat(1, $item`glass of raw eggs`);

  equip($item`fish hatchet`);
  equip($item`astral trousers`);
  equip($slot`acc1`, $item`Powerful Glove`);

  // maximize('weapon damage, weapon damage percent', false);

  doTest(Test.WEAPON);
}

function doSpellTest() {
  ensureEffect($effect`Simmering`);

  ensureEffect($effect`Song of Sauce`);
  ensureEffect($effect`AAA-Charged`);
  ensureEffect($effect`Carol of the Hells`);
  // ensureEffect($effect`Arched Eyebrow of the Archmage`);
  // ensureSong($effect`Jackasses' Symphony of Destruction`);

  // Pool buff
  if (get('_poolGames') < 3) {
    ensureEffect($effect`Mental A-cue-ity`);
  }

  // Tea party
  if (!getPropertyBoolean('_madTeaParty')) {
    ensureSewerItem(1, $item`mariachi hat`);
    ensureEffect($effect`Full Bottle in front of Me`);
  }

  if (haveEffect($effect`Do You Crush What I Crush?`) === 0) {
    adventureWithCarolGhost($effect`Do You Crush What I Crush?`);
  }

  useSkill(1, $skill`Spirit of Cayenne`);

  if (availableAmount($item`LOV Elixir #6`) > 0) ensureEffect($effect`The Magic of LOV`);

  ensureEffect($effect`Elemental Saucesphere`);
  ensureEffect($effect`Astral Shell`);
  ensureEffect($effect`We're All Made of Starfish`);
  if (haveEffect($effect`Feeling Peaceful`) === 0) useSkill($skill`Feel Peaceful`);

  // Deep Dark Visions
  useFamiliar($familiar`Exotic Parrot`);

  cliExecute('retrocape vampire hold');

  // Mafia sometimes can't figure out that multiple +weight things would get us to next tier.
  maximize('hot res, 0.01 familiar weight', false);
  if (haveEffect($effect`Visions of the Deep Dark Deeps`) < 50) {
    if (myMp() < 20) {
      ensureCreateItem(1, $item`magical sausage`);
      eat(1, $item`magical sausage`);
    }
    while (myHp() < myMaxhp()) {
      useSkill(1, $skill`Cannelloni Cocoon`);
    }
    if (myMp() < 100) {
      ensureCreateItem(1, $item`magical sausage`);
      eat(1, $item`magical sausage`);
    }
    if (Math.round(numericModifier('spooky resistance')) < 10) {
      ensureEffect($effect`Does It Have a Skull In There??`);
      if (Math.round(numericModifier('spooky resistance')) < 10) {
        throw 'Not enough spooky res for Deep Dark Visions.';
      }
    }
    useSkill(1, $skill`Deep Dark Visions`);
  }

  equip($item`weeping willow wand`);
  equip($slot`acc1`, $item`Powerful Glove`);
  equip($slot`acc2`, $item`hewn moon-rune spoon`);
  availableAmount($item`psychic's amulet`) > 0 && equip($slot`acc3`, $item`psychic's amulet`);
  // maximize('spell damage', false);

  // if (Math.round(numericModifier('spell damage percent')) % 50 >= 40) {
  //   ensureItem(1, $item`soda water`);
  //   ensurePotionEffect($effect`Concentration`, $item`cordial of concentration`);
  // }

  doTest(Test.SPELL);
}

function doHotResTest() {
  // fax and lick factory worker
  if (availableAmount($item`photocopied monster`) === 0 && !get('_photocopyUsed')) {
    chatPrivate('cheesefax', 'factory worker');
    for (let i = 0; i < 2; i++) {
      wait(10);
      cliExecute('fax receive');
      if (getProperty('photocopyMonster') === 'factory worker') break;
      // otherwise got the wrong monster, put it back.
      cliExecute('fax send');
    }
    if (availableAmount($item`photocopied monster`) === 0) throw 'Failed to fax in factory worker.';

    cliExecute('mood apathetic');
    Macro.skill($skill`Shocking Lick`).setAutoAttack();
    use(1, $item`photocopied monster`);
    setAutoAttack(0);
  }

  // Make sure no moon spoon.
  equip($slot`acc1`, $item`Eight Days a Week Pill Keeper`);
  equip($slot`acc2`, $item`Powerful Glove`);
  equip($slot`acc3`, $item`Lil' Doctor™ bag`);

  ensureItem(1, $item`tenderizing hammer`);
  cliExecute('smash * ratty knitted cap');
  cliExecute('smash * red-hot sausage fork');
  autosell(10, $item`hot nuggets`);
  autosell(10, $item`twinkly powder`);

  // if (haveEffect($effect`Let It Snow/Boil/Stink/Frighten/Grease`) === 0) {
  //   adventureWithCarolGhost($location`The Haunted Kitchen`);
  // }

  if (availableAmount($item`hot powder`) > 0) {
    ensureEffect($effect`Flame-Retardant Trousers`);
  }

  if (
    availableAmount($item`sleaze powder`) > 0 ||
    availableAmount($item`lotion of sleaziness`) > 0
  ) {
    ensurePotionEffect($effect`Sleazy Hands`, $item`lotion of sleaziness`);
  }

  ensureEffect($effect`Rainbowolin`);
  ensureEffect($effect`Elemental Saucesphere`);
  ensureEffect($effect`Astral Shell`);
  ensureEffect($effect`Blood Bond`);
  ensureEffect($effect`Leash of Linguini`);
  ensureEffect($effect`Empathy`);
  ensureEffect($effect`Feeling Peaceful`);
  ensureEffect($effect`Hot-Headed`);
  ensurePotionEffect($effect`Amazing`, $item`pocket maze`);

  ensurePullEffect($effect`Fireproof Lips`, $item`SPF 451 lip balm`);

  if (!haveEffect($effect`Feeling No Pain`)) {
    useSkill($skill`The Ode to Booze`);
    cliExecute('drink Ish Kabibble');
  }

  useFamiliar($familiar`Exotic Parrot`);

  cliExecute('retrocape vampire hold');
  equip($item`Fourth of May Cosplay Saber`);
  equip($item`unwrapped knock-off retro superhero cape`);
  equip($item`lava-proof pants`);
  equip($slot`acc3`, $item`heat-resistant gloves`);
  availableAmount($item`psychic's amulet`) > 0 && equip($item`psychic's amulet`);
  equip($slot`familiar`, $item`cracker`);

  // Mafia sometimes can't figure out that multiple +weight things would get us to next tier.
  // maximize('hot res, 0.01 familiar weight', false);

  doTest(Test.HOT_RES);
}

function doNonCombatTest() {
  useFamiliar($familiar`Disgeist`);

  if (myHp() < 30) useSkill(1, $skill`Cannelloni Cocoon`);
  ensureEffect($effect`Blood Bond`);
  ensureEffect($effect`Leash of Linguini`);
  ensureEffect($effect`Empathy`);

  ensureEffect($effect`The Sonata of Sneakiness`);
  ensureEffect($effect`Smooth Movements`);
  ensureEffect($effect`Invisible Avatar`);
  ensureEffect($effect`Feeling Lonely`);
  ensureEffect($effect`A Rose by Any Other Material`);
  ensureEffect($effect`Throwing Some Shade`);

  wishEffect($effect`Disquiet Riot`);

  // cliExecute('acquire porkpie-mounted popper');
  // equip($item`porkpie-mounted popper`);
  equip($item`fish hatchet`);
  equip($slot`acc2`, $item`hewn moon-rune spoon`);

  doTest(Test.NONCOMBAT);
}

export function main() {
  setAutoAttack(0);

  if (myTurncount() < 60) {
    setup();
    getIngredients();
    doGuaranteedGoblin();
    doWireTest();
  }

  if (myTurncount() < 60) throw 'Something went wrong coiling wire.';

  if (myLevel() < 8) {
    useStatGains();
    preLatteBuffs(); // Because I gulp during latte runaways, I want to maximize mp as much as possible
    doLatteRunaways();
    buffBeforeGoblins();
  }

  if (myLevel() < 13) {
    doFreeFights();
    postGoblins();
  }

  if (!testDone(Test.MYS)) {
    maximize('mysticality', false);
    doTest(Test.MYS);
  }

  if (!testDone(Test.HP)) {
    doHpTest();
  }

  if (!testDone(Test.MUS)) {
    doMusTest();
  }

  if (!testDone(Test.MOX)) {
    doMoxTest();
  }

  if (
    availableAmount($item`astral six-pack`) === 1 ||
    availableAmount($item`astral pilsner`) >= 5
  ) {
    tryUse(1, $item`astral six-pack`);
    useSkill(2, $skill`The Ode to Booze`);
    drink(6, $item`astral pilsner`);
  }

  if (!testDone(Test.ITEM)) {
    doItemTest();
  }

  if (!testDone(Test.FAMILIAR)) {
    doFamiliarTest();
  }

  if (!testDone(Test.HOT_RES)) {
    doHotResTest();
  }

  if (!testDone(Test.WEAPON)) {
    doWeaponTest();
  }

  if (!testDone(Test.SPELL)) {
    doSpellTest();
  }

  if (!testDone(Test.NONCOMBAT)) {
    doNonCombatTest();
  }

  const totalSeconds = (gametimeToInt() - getPropertyInt('bb_ScriptStartCS')) / 1000;
  const min = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;

  print(`Total seconds for sanity check: ${totalSeconds}`);
  print(`That only took ${min}:${sec.toFixed(2)} and ${myTurncount()} turns!`, 'green');
  print(`Organ use: ${myFullness()}/${myInebriety()}/${mySpleenUse()}`, 'green');
  for (let i = 1; i <= 10; i++) {
    print(
      `Test ${Test[i]} estimated turns: ${get(`_hccsTestExpected${i}`)} actual turns:${get(
        `_hccsTestActual${i}`
      )} gated hardcoded value: ${desiredTurns[i]}`,
      'blue'
    );
  }

  if (userConfirm('Tests done. Stop before donating? (To check maximize outfits)', 15000, false)) {
    return;
  }

  if (!testDone(Test.DONATE)) {
    doTest(Test.DONATE);
  }

  setProperty('autoSatisfyWithNPCs', getProperty('_saved_autoSatisfyWithNPCs'));
  setProperty('autoSatisfyWithCoinmasters', getProperty('_saved_autoSatisfyWithCoinmasters'));
  setProperty('hpAutoRecovery', '0.8');

  cliExecute('mood default');
  cliExecute('ccs default');
  cliExecute('boombox food');
  cliExecute('refresh all');

  // Tune moon sign to Wombat (for meat farming).
  if (!get('moonTuned')) {
    // Unequip spoon.
    equip($slot`acc1`, $item`Retrospecs`);
    equip($slot`acc2`, $item`Powerful Glove`);
    equip($slot`acc3`, $item`Lil' Doctor™ bag`);

    // Actually tune the moon.
    visitUrl('inv_use.php?whichitem=10254&doit=96&whichsign=7');
  }
}
