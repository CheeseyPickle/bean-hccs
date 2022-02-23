import {
  abort,
  adv1,
  autosell,
  availableAmount,
  cliExecute,
  drink,
  eat,
  equip,
  equippedItem,
  gametimeToInt,
  getProperty,
  handlingChoice,
  haveEffect,
  haveOutfit,
  haveSkill,
  myAdventures,
  myBasestat,
  myBuffedstat,
  myClass,
  myHp,
  myLevel,
  myMaxhp,
  myMeat,
  myMp,
  numericModifier,
  outfit,
  print,
  restoreMp,
  runChoice,
  runCombat,
  setAutoAttack,
  toEffect,
  use,
  useFamiliar,
  useSkill,
  visitUrl,
} from 'kolmafia';
import {
  $class,
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $skill,
  $slot,
  $stat,
  adventureMacro,
  adventureMacroAuto,
  BeachComb,
  get,
  have,
  Macro,
  Requirement,
  set
} from 'libram';
import { BoozeDrop, CoilWire, donate, FamiliarWeight, HotRes, HP, Moxie, Muscle, Mysticality, Noncombat, printLog, SpellDamage, Test, WeaponDamage } from 'libram/dist/challengePaths/2015/CommunityService';
import {
  adventureWithCarolGhost,
  ensureEffect,
  ensureItem,
  ensurePotionEffect,
  ensurePullEffect,
  ensureSewerItem,
  ensureSong,
  mapMacro,
  multiFightAutoAttack,
  pullIfPossible,
  sausageFightGuaranteed,
  setChoice,
  setClan,
  synthExp,
  synthItem,
  tryUse,
  useBestFamiliar,
} from './lib';

enum TestEnum {
  HitPoints = HP.id,
  MUS = Muscle.id,
  MYS = Mysticality.id,
  MOX = Moxie.id,
  FAMILIAR = FamiliarWeight.id,
  WEAPON = WeaponDamage.id,
  SPELL = SpellDamage.id,
  NONCOMBAT = Noncombat.id,
  ITEM = BoozeDrop.id,
  HOT_RES = HotRes.id,
  COIL_WIRE = CoilWire.id,
  DONATE = 30,
}

interface TestObject {
  id: TestEnum;
  spreadsheetTurns: number;
  test: Test
  doTestPrep: { (): void };
}

const STAT_GAIN_OUTFIT = 'hccs_freefights';

const CONTEXT: { updateOutfits: boolean } = { updateOutfits: false };
const GOD_LOB_MACRO = Macro.trySkill($skill`Curse of Weaksauce`)
  .trySkill($skill`Barrage of Tears`)
  .trySkill($skill`Beach Combo`)
  .trySkill($skill`Spittoon Monsoon`)
  .skill($skill`Saucestorm`)
  .repeat();

function handleOutfit(test: TestObject | undefined) {
  if (!test) return;
  if (CONTEXT.updateOutfits) {
    test.test.maximize();
    cliExecute(`outfit save hccs_${TestEnum[test.id]}`);
  } else if (haveOutfit(`hccs_${TestEnum[test.id]}`)) {
    outfit(`hccs_${TestEnum[test.id]}`);
  }
}

function ensureMeteorShowerAndCarolGhostEffect() {
  equip($item`Fourth of May Cosplay Saber`);
  if (!haveEffect($effect`Meteor Showered`)) {
    if (!haveEffect($effect`Do You Crush What I Crush?`)) {
      adventureWithCarolGhost(
        $effect`Do You Crush What I Crush?`,
        Macro.skill($skill`Meteor Shower`).skill($skill`Use the Force`)
      );
    } else {
      adventureMacro(
        $location`The Dire Warren`,
        Macro.skill($skill`Meteor Shower`).skill($skill`Use the Force`)
      );
    }
    if (handlingChoice()) runChoice(3);
    if (!have($effect`Meteor Showered`)) {
      throw 'Did not get Meteor Showered';
    }
  }
}

function upkeepHp() {
  if (myHp() < 0.8 * myMaxhp()) {
    cliExecute('hottub');
  }
}

function upkeepHpAndMp() {
  upkeepHp();
  if (myMp() < 500) {
    eat($item`magical sausage`);
  }
}

function doGuaranteedGoblin() {
  // kill a kramco for the sausage before coiling wire
  if (!haveEffect($effect`Feeling Lost`) && sausageFightGuaranteed()) {
    if (myMp() < 12) {
      restoreMp(20);
    }
    const offHand = equippedItem($slot`off-hand`);
    equip($item`Kramco Sausage-o-Matic™`);
    adventureMacro($location`Noob Cave`,
      Macro.if_('!monstername "sausage goblin"', new Macro().step('abort'))
        .step(Macro.trySkill($skill`Barrage of Tears`)
          .trySkill($skill`Spittoon Monsoon`)
          .trySkill($skill`Beach Combo`)
          .skill($skill`Saucestorm`)
          .repeat()));
    equip(offHand);
  }
}

function runTest(testId: TestEnum) {
  const test = tests.find((test) => test.id === testId);
  if (test && !test.test.isDone()) {
    doGuaranteedGoblin();

    if (!test.test.run(test.doTestPrep, false, test.spreadsheetTurns)) {
      abort(`Didn't complete ${TestEnum[testId]} test. Expected ${test.spreadsheetTurns} turns, predicted ${test.test.prediction} turns`);
    }
  }
}

const getBatteries = () => {
  // use the power plant
  cliExecute('inv_use.php?pwd&whichitem=10738');

  for (let i = 1; i < 8; i++) {
    cliExecute(`choice.php?pwd&whichchoice=1448&option=1&pp=${i}`);
  }
};

const ensureDeepDarkVisions = () => {
  if (have($effect`Visions of the Deep Dark Deeps`)) return;
  // Deep Dark Visions
  useFamiliar($familiar`Exotic Parrot`);
  ensureEffect($effect`Feeling Peaceful`);
  cliExecute('retrocape vampire hold');

  upkeepHpAndMp();
  if (Math.round(numericModifier('spooky resistance')) < 10) {
    ensureEffect($effect`Does It Have a Skull In There??`);
    if (Math.round(numericModifier('spooky resistance')) < 10) {
      throw 'Not enough spooky res for Deep Dark Visions.';
    }
  }
  useSkill(1, $skill`Deep Dark Visions`);
};

function vote() {
  if (!get('_voteToday')) {
    visitUrl('place.php?whichplace=town_right&action=townright_vote');
    visitUrl('choice.php?option=1&whichchoice=1331&g=2&local%5B%5D=2&local%5B%5D=3');
    visitUrl('place.php?whichplace=town_right&action=townright_vote'); // Let mafia see the voted values
  }
}

function equipStatOutfit() {
  if (CONTEXT.updateOutfits) {
    new Requirement(['100 mysticality experience percent, mysticality experience'], {
      forceEquip: $items`makeshift garbage shirt`
    }).maximize();
    cliExecute(`outfit save ${STAT_GAIN_OUTFIT}`);
  }
  outfit(`${STAT_GAIN_OUTFIT}`);
}

function setup() {
  if (availableAmount($item`cracker`) > 0 || myLevel() > 1) return;

  set('bb_ScriptStartCS', gametimeToInt());
  set('autoSatisfyWithNPCs', true);
  set('autoSatisfyWithCoinmasters', true);
  set('hpAutoRecovery', 0.8);

  // reset actual counts for validation
  for (const i of Object.keys(Test)) {
    set(`_hccsTestActual${i}`, -1);
  }

  setClan('Bonus Adventures from Hell');

  use($item`Bird-a-Day calendar`);

  // Sell pork gems + tent
  visitUrl('tutorial.php?action=toot');
  tryUse(1, $item`letter from King Ralph XI`);
  tryUse(1, $item`pork elf goodies sack`);
  autosell(5, $item`baconstone`);
  autosell(5, $item`porquoise`);
  autosell(5, $item`hamethyst`);

  visitUrl('council.php'); // Initialize council.
  visitUrl('clan_viplounge.php?action=fwshop'); // manual visit to fireworks shop to allow purchases
  visitUrl('clan_viplounge.php?action=lookingglass&whichfloor=2'); // get DRINK ME potion
  visitUrl('shop.php?whichshop=lathe&action=buyitem&quantity=1&whichrow=1162&pwd'); // lathe wand

  vote();

  ensureItem(1, $item`toy accordion`);
  ensureSewerItem(1, $item`saucepan`);

  cliExecute('mood apathetic');
  cliExecute('ccs bb-hccs');
  cliExecute('backupcamera reverser on');
  cliExecute('backupcamera ml');
  cliExecute('mcd 10');
  cliExecute('retrocape mysticality hold');
  cliExecute('fold makeshift garbage shirt');
  cliExecute('boombox meat');
  cliExecute('pantogram mysticality|hot|drops of blood|some self-respect|your hopes|silent');

  setChoice(1340, 3); // Turn off Lil' Doctor quests.
  setChoice(1387, 3); // set saber to drop items
  setChoice(1410, 2); // pick mushroom

  // Upgrade saber for fam wt
  visitUrl('main.php?action=may4');
  runChoice(4);

  // pull and use borrowed time
  if (availableAmount($item`borrowed time`) === 0 && !get('_borrowedTimeUsed')) {
    if (pullIfPossible(1, $item`borrowed time`, 20000)) {
      use($item`borrowed time`);
    } else {
      abort("Couldn't get borrowed time");
    }
  }

  if (!get('_floundryItemCreated')) {
    cliExecute('acquire fish hatchet');
  }

  getBatteries();

  useSkill($skill`Summon Crimbo Candy`);
  useSkill($skill`Summon Sugar Sheets`, 3);

  pullIfPossible(1, $item`cracker`, 2000);
  pullIfPossible(1, $item`dromedary drinking helmet`, 2000);
}

function getPizzaIngredients() {
  if (have($item`cherry`) || CoilWire.isDone()) return;

  new Requirement(['100 mysticality experience percent, mysticality experience'], {
    forceEquip: $items`Daylight Shavings Helmet`, // Setup PM to get 2nd buff after coiling wire
    preventEquip: $items`makeshift garbage shirt` // Save exp boosts for scalers
  }).maximize();
  useBestFamiliar();

  if (myHp() < myMaxhp()) {
    useSkill($skill`Cannelloni Cocoon`);
  }

  // tomato and li'l ninja outfit (Nostalgia + Envy + X-Ray)
  equip($slot`acc3`, $item`Lil' Doctor™ bag`);
  if (!have($item`tomato`)) {
    mapMacro($location`The Haunted Pantry`, $monster`possessed can of tomatoes`,
      Macro.if_(
        `monsterid ${$monster`possessed can of tomatoes`.id}`,
        Macro.skill($skill`Feel Hatred`)
      ));

    mapMacro(
      $location`The Haiku Dungeon`, $monster`amateur ninja`, Macro.if_(
        `monsterid ${$monster`amateur ninja`.id}`,
        Macro.skill($skill`Feel Nostalgic`).skill($skill`Feel Envy`).skill($skill`Chest X-Ray`)
      ).step("abort")
    );
  }

  // Cherry and grapefruit in skeleton store (Envy + X-Ray)
  if (getProperty('questM23Meatsmith') === 'unstarted') {
    visitUrl('shop.php?whichshop=meatsmith&action=talk');
    runChoice(1);
  }

  mapMacro(
    $location`The Skeleton Store`, $monster`novelty tropical skeleton`, Macro.if_(
      `monsterid ${$monster`novelty tropical skeleton`.id}`,
      Macro.skill($skill`Feel Envy`).skill($skill`Chest X-Ray`)
    ).step("abort")
  );
}

function useStatGains() {
  if (!have($item`a ten-percent bonus`)) return;

  equipStatOutfit();

  if (get('getawayCampsiteUnlocked') && haveEffect($effect`That's Just Cloud-Talk, Man`) === 0) {
    visitUrl('place.php?whichplace=campaway&action=campaway_sky');
  }

  ensureEffect($effect`Inscrutable Gaze`);
  ensureEffect($effect`Thaumodynamic`);
  synthExp();
  ensurePullEffect($effect`Different Way of Seeing Things`, $item`non-Euclidean angle`);

  if (Math.round(numericModifier('mysticality experience percent')) < 125) {
    throw 'Insufficient +stat%.';
  }

  // Use ten-percent bonus
  tryUse(1, $item`a ten-percent bonus`);

  cliExecute('bastille myst brutalist');

  eat(1, $item`magical sausage`);
}

function buffBeforeGoblins() {
  if (have($effect`You Learned Something Maybe!`) || myLevel() >= 13) return;
  equip($slot`acc3`, $item`Powerful Glove`);

  // craft potions after eating to ensure we have adventures
  if (!get('hasRange')) {
    if (myMeat() < 950) {
      useSkill($skill`Prevent Scurvy and Sobriety`);
      autosell($item`bottle of rum`, 3);
      autosell($item`grapefruit`, availableAmount($item`grapefruit`) - 1);
    }
    ensureItem(1, $item`Dramatic™ range`);
    use(1, $item`Dramatic™ range`);
  }

  if (haveSkill($skill`Advanced Saucecrafting`)) useSkill(1, $skill`Advanced Saucecrafting`);
  ensurePotionEffect($effect`Tomato Power`, $item`tomato juice of powerful power`);
  ensurePotionEffect($effect`Mystically Oiled`, $item`ointment of the occult`);

  ensureEffect($effect`Favored by Lyle`);
  ensureEffect($effect`Starry-Eyed`);
  ensureEffect($effect`Triple-Sized`);
  ensureEffect($effect`Feeling Excited`);
  ensureEffect($effect`Uncucumbered`); // boxing daycare
  BeachComb.tryHead($effect`We're All Made of Starfish`);

  // Plan is for these buffs to fall all the way through to hot res -> fam weight.
  ensureEffect($effect`Fidoxene`);
  ensureEffect($effect`Billiards Belligerence`);
  BeachComb.tryHead($effect`Do I Know You From Somewhere?`);
  BeachComb.tryHead($effect`You Learned Something Maybe!`);

  if (!haveEffect($effect`Holiday Yoked`)) {
    adventureWithCarolGhost($effect`Holiday Yoked`);
  }
}

function fightGodLob() {
  upkeepHp();
  visitUrl('main.php?fightgodlobster=1');
  runCombat(GOD_LOB_MACRO.toString());
  multiFightAutoAttack();
  runChoice(-1);
}

function godLob() {
  if (get('_godLobsterFights') === 0) {
    equip($item`familiar scrapbook`); // don't try to find kramco here

    useFamiliar($familiar`God Lobster`);
    setChoice(1310, 1);
    fightGodLob();
    equip($slot`familiar`, $item`God Lobster's Scepter`);
    fightGodLob();
    equip($slot`familiar`, $item`God Lobster's Ring`);
  }
}

function doFreeFights() {
  if (have($item`Desert Bus pass`)) return;

  equipStatOutfit();

  upkeepHp();

  ensureEffect($effect`Blessing of your favorite Bird`); // 75% myst
  ensureEffect($effect`Confidence of the Votive`); // PM candle
  ensureEffect($effect`Song of Bravado`);
  ensureSong($effect`Polka of Plenty`);
  ensureEffect($effect`Big`);
  ensureEffect($effect`Blood Bond`);
  ensureEffect($effect`Blood Bubble`);
  ensureEffect($effect`Drescher's Annoying Noise`);
  ensureEffect($effect`Elemental Saucesphere`);
  ensureEffect($effect`Inscrutable Gaze`);
  ensureEffect($effect`Leash of Linguini`);
  ensureEffect($effect`Pride of the Puffin`);
  ensureEffect($effect`Singer's Faithful Ocelot`);
  ensureEffect($effect`Stevedave's Shanty of Superiority`);
  ensureEffect($effect`Ur-Kel's Aria of Annoyance`);
  ensureEffect($effect`Feeling Excited`);

  godLob();
  useBestFamiliar();

  // kill the mushroom
  if (!get('_mushroomGardenVisited')) {
    adventureMacro($location`Your Mushroom Garden`,
      Macro.skill($skill`Barrage of Tears`)
        .skill($skill`Spittoon Monsoon`)
        .skill($skill`Saucestorm`)
        .repeat());
  }

  cliExecute('reminisce government agent');
  runCombat(Macro.skill($skill`Feel Envy`).skill($skill`Gingerbread Mob Hit`).toString());

  // Neverending Party
  if (get('_questPartyFair') === 'unstarted') {
    setChoice(1322, 0);
    visitUrl('adventure.php?snarfblat=528');
    if (get('_questPartyFairQuest') === 'food') {
      runChoice(1);
      setChoice(1324, 2);
      setChoice(1326, 3);
    } else if (get('_questPartyFairQuest') === 'booze') {
      runChoice(1);
      setChoice(1324, 3);
      setChoice(1327, 3);
    } else {
      runChoice(2);
      setChoice(1324, 5);
    }
  }

  while (get('_neverendingPartyFreeTurns') < 10) {
    upkeepHp();
    useBestFamiliar();
    adventureMacro(
      $location`The Neverending Party`,
      Macro.trySkill($skill`Feel Pride`)
        .skill($skill`Barrage of Tears`)
        .skill($skill`Sing Along`)
        .externalIf(
          get('_neverendingPartyFreeTurns') === 0 || get('_neverendingPartyFreeTurns') === 5,
          Macro.skill($skill`Bowl Sideways`)
        )
        .skill($skill`Spittoon Monsoon`)
        .skill($skill`Saucestorm`)
    );
    if (
      get('lastEncounter').includes('Gone Kitchin') ||
      get('lastEncounter').includes('Forward to the Back')
    ) {
      setChoice(1324, 5);
    }
  }

  // Free kills in NEP
  equip($slot`acc2`, $item`Lil' Doctor™ bag`);
  while (
    get('_shatteringPunchUsed') < 3 ||
    get('_chestXRayUsed') < 3
  ) {
    useBestFamiliar();
    upkeepHpAndMp();
    adventureMacroAuto(
      $location`The Neverending Party`,
      Macro.if_('monstername "sausage goblin"', new Macro().skill($skill`Saucegeyser`).repeat())
        .if_('monstername black crayon*', new Macro().skill($skill`Saucegeyser`).repeat())
        .trySkill($skill`Bowl Sideways`)
        .trySkill($skill`Shattering Punch`)
        .trySkill($skill`Chest X-Ray`)
    );
  }

  if (get('_backUpUses') < 10) {
    equip($slot`acc2`, $item`hewn moon-rune spoon`);
    if (!sausageFightGuaranteed() && get('lastCopyableMonster') !== $monster`sausage goblin`) {
      throw 'Sausage not ready for back-ups and kramco chain';
    }

    if (sausageFightGuaranteed()) {
      upkeepHp();
      equip($item`Kramco Sausage-o-Matic™`);

      adventureMacro($location`Noob Cave`, Macro.if_('!monstername "sausage goblin"', new Macro().step('abort'))
        .skill($skill`Barrage of Tears`)
        .skill($skill`Spittoon Monsoon`)
        .skill($skill`Sing Along`)
        .skill($skill`Saucestorm`)
      );
    }

    if (get('lastCopyableMonster') !== $monster`sausage goblin`) {
      throw 'Sausage not setup for back-ups and kramco';
    }

    // back-up sausages in Noob Cave
    equip($slot`acc3`, $item`backup camera`);
    while (get('_backUpUses') < 10) {
      upkeepHp();
      useBestFamiliar();
      adventureMacro($location`Noob Cave`, Macro.if_(
        'monstername "crate"',
        new Macro().skill($skill`Back-Up to your Last Enemy`)
      )
        .if_('!monstername "sausage goblin"', new Macro().if_("!monstername black crayon*", new Macro().step('abort')))
        .trySkill($skill`Barrage of Tears`)
        .trySkill($skill`Sing Along`)
        .trySkill($skill`Spittoon Monsoon`)
        .skill($skill`Saucestorm`));
    }

    upkeepHp();
  }

  // Professor chain off the last back-up
  if (get('_pocketProfessorLectures') === 0) {
    useFamiliar($familiar`Pocket Professor`);
    ensureEffect($effect`Empathy`);

    if (CONTEXT.updateOutfits) {
      new Requirement(['familiar weight'], {
        forceEquip: $items`backup camera, makeshift garbage shirt`
      }).maximize();
      cliExecute('outfit save hccs_profchain');
    } else {
      outfit('hccs_profchain');
    }

    // need 2 adventures to lecture on relativity
    if (myAdventures() < 2) eat(1, $item`magical sausage`);

    adventureMacroAuto($location`The Dire Warren`, Macro.trySkill($skill`Back-Up to your Last Enemy`)
      .skill($skill`Curse of Weaksauce`)
      .skill($skill`Entangling Noodles`)
      .skill($skill`Micrometeorite`)
      .trySkill($skill`lecture on relativity`)
      .skill($skill`Spittoon Monsoon`)
      .skill($skill`Saucegeyser`));

    upkeepHpAndMp();
  }

  ensureItem(1, $item`Desert Bus pass`);
  cliExecute('fold wad of used tape'); // for stat and item tests
}

function doHpTest() {
  ensurePotionEffect($effect`Expert Oiliness`, $item`oil of expertise`);
  cliExecute('retrocape muscle');
  handleOutfit(tests.find((test) => test.id === TestEnum.HitPoints));
}

function doMoxTest() {
  if (myClass() === $class`Pastamancer`) useSkill(1, $skill`Bind Penne Dreadful`);
  else ensurePotionEffect($effect`Expert Oiliness`, $item`oil of expertise`);

  ensureEffect($effect`Blessing of the Bird`); // SA/PM have moxie bird
  ensureEffect($effect`Big`);
  ensureEffect($effect`Song of Bravado`);
  ensureSong($effect`Stevedave's Shanty of Superiority`);
  ensureSong($effect`The Moxious Madrigal`);
  BeachComb.tryHead($effect`Pomp & Circumsands`);
  if (have($item`runproof mascara`)) use($item`runproof mascara`);
  // ensureEffect($effect`Quiet Desperation`);
  // ensureEffect($effect`Disco Fever`);
  // ensureEffect($effect`Mariachi Mood`);
  cliExecute('retrocape moxie');

  if (myBuffedstat($stat`moxie`) - myBasestat($stat`moxie`) < 1770) {
    useSkill(1, $skill`Acquire Rhinestones`);
    use(availableAmount($item`rhinestone`), $item`rhinestone`);
  }
  handleOutfit(tests.find((test) => test.id === TestEnum.MOX));
}

function doMusTest() {
  if (myClass() === $class`Pastamancer`) useSkill(1, $skill`Bind Undead Elbow Macaroni`);
  else ensurePotionEffect($effect`Expert Oiliness`, $item`oil of expertise`);

  ensureEffect($effect`Big`);
  ensureEffect($effect`Song of Bravado`);
  ensureEffect($effect`Rage of the Reindeer`);
  BeachComb.tryHead($effect`Lack of Body-Building`);
  ensureSong($effect`Stevedave's Shanty of Superiority`);
  // ensureSong($effect`Power Ballad of the Arrowsmith`);
  // ensureEffect($effect`Quiet Determination`);
  ensureEffect($effect`Disdain of the War Snapper`);
  cliExecute('retrocape muscle');
  handleOutfit(tests.find((test) => test.id === TestEnum.MUS));
}

function doItemTest() {
  ensureItem(1, $item`oversized sparkler`);

  // cyclops eyedrops
  if (!haveEffect($effect`One Very Clear Eye`)) {
    cliExecute('acquire hermit permit');
    visitUrl('hermit.php');
    use($item`11-leaf clover`);
    ensureEffect(toEffect('Lucky!'));
    adv1($location`The Limerick Dungeon`);
    use($item`cyclops eyedrops`);
  }

  // eslint-disable-next-line libram/verify-constants
  if (!have($effect`Cosmic Ball in the Air`)) {
    equip($slot`offhand`, $item`none`); // make sure no kramco
    adventureMacro(
      $location`The Dire Warren`,
      Macro.skill($skill`Bowl Straight Up`).skill($skill`Feel Hatred`)
    );
  }

  visitUrl("place.php?whichplace=desertbeach&action=db_nukehouse");

  !get('_clanFortuneBuffUsed') && cliExecute('fortune buff item');

  synthItem();
  ensureEffect($effect`Singer's Faithful Ocelot`);
  ensureEffect($effect`Fat Leon's Phat Loot Lyric`);
  ensureEffect($effect`The Spirit of Taking`);
  ensureEffect($effect`Steely-Eyed Squint`);
  ensureEffect($effect`Nearly All-Natural`); // bag of grain
  ensureEffect($effect`Feeling Lost`);
  ensureEffect($effect`I See Everything Thrice!`); // government

  useFamiliar($familiar`Trick-or-Treating Tot`);
  equip($item`li'l ninja costume`);
  cliExecute('fold wad of used tape');
  handleOutfit(tests.find((test) => test.id === TestEnum.ITEM));
}

function doFamiliarTest() {
  if (myHp() < 30) useSkill(1, $skill`Cannelloni Cocoon`);

  // These should have fallen through all the way from leveling.
  ensureEffect($effect`Fidoxene`);
  ensureEffect($effect`Billiards Belligerence`);
  ensureEffect($effect`Blood Bond`);
  ensureEffect($effect`Leash of Linguini`);
  ensureEffect($effect`Empathy`);

  if (have($item`short stack of pancakes`)) use($item`short stack of pancakes`);

  if (!have($effect`Meteor Showered`)) {
    equip($item`Fourth of May Cosplay Saber`);
    adventureMacro($location`The Dire Warren`, Macro.skill($skill`Meteor Shower`)
      .skill($skill`Use the Force`));
    if (handlingChoice()) runChoice(3);
  }
  handleOutfit(tests.find((test) => test.id === TestEnum.FAMILIAR));
}

function doWeaponTest() {
  ensureDeepDarkVisions(); // do this for spell test before getting cowrrupted

  if (!haveEffect($effect`Cowrruption`)) {
    equip($item`Fourth of May Cosplay Saber`);
    if (get('camelSpit') >= 100) useFamiliar($familiar`Melodramedary`);
    cliExecute('reminisce ungulith');
    runCombat(Macro.trySkill($skill`%fn, spit on me!`).skill($skill`Use the Force`).toString());

    if (handlingChoice()) runChoice(-1);
    use($item`corrupted marrow`);

    //TODO Change familiar
    cliExecute('reminisce black crayon pirate');
    runCombat(Macro.skill($skill`Saucegeyser`).repeat().toString());
  }

  ensureMeteorShowerAndCarolGhostEffect();

  if (availableAmount($item`twinkly nuggets`) > 0) {
    ensureEffect($effect`Twinkly Weapon`);
  }

  ensureEffect($effect`Carol of the Bulls`);
  ensureEffect($effect`Song of the North`);
  ensureEffect($effect`Rage of the Reindeer`);
  ensureEffect($effect`Frenzied, Bloody`);
  ensureEffect($effect`Scowl of the Auk`);
  ensureEffect($effect`Disdain of the War Snapper`);
  ensureEffect($effect`Tenacity of the Snapper`);
  ensureSong($effect`Jackasses' Symphony of Destruction`);
  ensureEffect($effect`Billiards Belligerence`);
  ensureEffect($effect`Lack of Body-Building`);
  ensureEffect($effect`Bow-Legged Swagger`);
  ensureEffect($effect`Blessing of the Bird`); // PM has 100% weapon damage
  ensurePullEffect($effect`Nigh-Invincible`, $item`pixel star`);
  have($item`true grit`) && use($item`true grit`);

  cliExecute('boombox fists');
  cliExecute('fold broken champagne bottle');
  handleOutfit(tests.find((test) => test.id === TestEnum.WEAPON));
}

function doSpellTest() {
  ensureDeepDarkVisions(); // should already have this from weapon test

  if (get('_poolGames') < 3) {
    ensureEffect($effect`Mental A-cue-ity`);
  }

  // Tea party
  if (!get('_madTeaParty')) {
    ensureSewerItem(1, $item`mariachi hat`);
    ensureEffect($effect`Full Bottle in front of Me`);
  }

  useSkill(1, $skill`Spirit of Cayenne`);
  ensureEffect($effect`Elemental Saucesphere`);
  ensureEffect($effect`Astral Shell`);
  BeachComb.tryHead($effect`We're All Made of Starfish`);
  ensureEffect($effect`Simmering`);
  ensureEffect($effect`Song of Sauce`);
  ensureEffect($effect`Carol of the Hells`);
  ensureEffect($effect`Arched Eyebrow of the Archmage`);
  ensurePullEffect($effect`Nigh-Invincible`, $item`pixel star`);
  ensureSong($effect`Jackasses' Symphony of Destruction`);

  ensureMeteorShowerAndCarolGhostEffect();

  outfit('hccs_SPELL');
  if (Math.round(numericModifier('spell damage percent')) % 50 >= 40) {
    ensureItem(1, $item`soda water`);
    ensurePotionEffect($effect`Concentration`, $item`cordial of concentration`);
  }
  handleOutfit(tests.find((test) => test.id === TestEnum.SPELL));
}

function doHotResTest() {
  if (!have($effect`Fireproof Foam Suit`)) {
    equip($slot`weapon`, $item`industrial fire extinguisher`);
    equip($slot`off-hand`, $item`Fourth of May Cosplay Saber`);
    adventureMacro($location`Noob Cave`,
      Macro.skill($skill`Fire Extinguisher: Foam Yourself`).skill($skill`Use the Force`))
    if (!have($effect`Fireproof Foam Suit`)) throw `Error, not foamy enough`;
  }

  ensureEffect($effect`Elemental Saucesphere`);
  ensureEffect($effect`Astral Shell`);
  ensureEffect($effect`Blood Bond`);
  ensureEffect($effect`Leash of Linguini`);
  ensureEffect($effect`Empathy`);
  ensureEffect($effect`Feeling Peaceful`);
  BeachComb.tryHead($effect`Hot-Headed`);

  cliExecute('retrocape vampire hold');
  handleOutfit(tests.find((test) => test.id === TestEnum.HOT_RES));
}

function doNonCombatTest() {
  if (myHp() < 30) useSkill(1, $skill`Cannelloni Cocoon`);
  equip($slot`acc3`, $item`Powerful Glove`);

  ensureEffect($effect`Blood Bond`);
  ensureEffect($effect`Leash of Linguini`);
  ensureEffect($effect`Empathy`);
  ensureEffect($effect`The Sonata of Sneakiness`);
  ensureEffect($effect`Smooth Movements`);
  ensureEffect($effect`Invisible Avatar`);
  ensureEffect($effect`Feeling Lonely`);
  ensureEffect($effect`A Rose by Any Other Material`);
  ensureEffect($effect`Throwing Some Shade`);
  ensureEffect($effect`Silent Running`);
  ensureEffect($effect`Blessing of the Bird`); // PM has 7% NC bird

  if (get('_godLobsterFights') < 3 && have($item`God Lobster's Ring`)) {
    upkeepHpAndMp();
    useFamiliar($familiar`God Lobster`);
    equip($slot`familiar`, $item`God Lobster's Ring`);
    setChoice(1310, 2);
    visitUrl('main.php?fightgodlobster=1');
    runCombat(
      Macro.trySkill($skill`Curse of Weaksauce`)
        .trySkill($skill`Bowl Straight Up`)
        .trySkill($skill`Barrage of Tears`)
        .trySkill($skill`Beach Combo`)
        .trySkill($skill`Spittoon Monsoon`)
        .skill($skill`Saucestorm`)
        .repeat()
        .toString());
    visitUrl('choice.php');
    runChoice(-1);
  } else if (!have($effect`Silence of the God Lobster`)) {
    throw 'Not ready for god lob NC buff';
  }

  useFamiliar($familiar`Disgeist`);

  cliExecute('acquire porkpie-mounted popper');
  handleOutfit(tests.find((test) => test.id === TestEnum.NONCOMBAT));
}

const tests: TestObject[] = [
  {
    id: TestEnum.HitPoints,
    spreadsheetTurns: 1,
    test: HP,
    doTestPrep: doHpTest,
  },
  {
    id: TestEnum.MYS,
    spreadsheetTurns: 1,
    test: Mysticality,
    doTestPrep: () => {
      return;
    },
  },
  {
    id: TestEnum.MUS,
    spreadsheetTurns: 3,
    test: Muscle,
    doTestPrep: doMusTest,
  },
  {
    id: TestEnum.MOX,
    spreadsheetTurns: 1,
    test: Moxie,
    doTestPrep: doMoxTest,
  },
  {
    id: TestEnum.ITEM,
    spreadsheetTurns: 1,
    test: BoozeDrop,
    doTestPrep: doItemTest,
  },
  {
    id: TestEnum.HOT_RES,
    spreadsheetTurns: 2,
    test: HotRes,
    doTestPrep: doHotResTest,
  },
  {
    id: TestEnum.FAMILIAR,
    spreadsheetTurns: 37,
    test: FamiliarWeight,
    doTestPrep: doFamiliarTest,
  },
  {
    id: TestEnum.WEAPON,
    spreadsheetTurns: 1,
    test: WeaponDamage,
    doTestPrep: doWeaponTest,
  },
  {
    id: TestEnum.SPELL,
    spreadsheetTurns: 33,
    test: SpellDamage,
    doTestPrep: doSpellTest,
  },
  {
    id: TestEnum.NONCOMBAT,
    spreadsheetTurns: 1,
    test: Noncombat,
    doTestPrep: doNonCombatTest,
  },
  {
    id: TestEnum.COIL_WIRE,
    spreadsheetTurns: 60,
    test: CoilWire,
    doTestPrep: () => {
      return;
    },
  },
];

const parseInput = (input: string) => {
  print('Parsing options');
  if (input) {
    for (const option of input.split(' ')) {
      if (option.match(/outfit/i)) {
        CONTEXT.updateOutfits = true;
        print('Updating hccs outfits', 'blue');
      }
    }
  }
  print('Done parsing options');
};

export function main(input: string): void {
  setAutoAttack(0);

  parseInput(input);

  setup();
  getPizzaIngredients();

  runTest(TestEnum.COIL_WIRE);

  useStatGains();
  buffBeforeGoblins();
  doFreeFights();

  if (availableAmount($item`astral six-pack`) === 1) {
    tryUse(1, $item`astral six-pack`);
    useSkill(2, $skill`The Ode to Booze`);
    drink(6, $item`astral pilsner`);
  }

  runTest(TestEnum.MYS);
  runTest(TestEnum.HitPoints);
  runTest(TestEnum.MUS);
  runTest(TestEnum.MOX);

  useFamiliar($familiar`Exotic Parrot`);
  equip($slot`familiar`, $item`cracker`);

  runTest(TestEnum.HOT_RES);
  runTest(TestEnum.FAMILIAR);
  runTest(TestEnum.WEAPON);
  runTest(TestEnum.SPELL);
  runTest(TestEnum.NONCOMBAT);
  runTest(TestEnum.ITEM);

  // Mysticality.run(function () { }, false, 1); //eslint-disable-line
  // HP.run(doHpTest, false, 1);
  // Muscle.run(doMusTest, false, 1);
  // Moxie.run(doMoxTest, false, 1);

  // useFamiliar($familiar`Exotic Parrot`);
  // equip($slot`familiar`, $item`cracker`);

  // HotRes.run(doHotResTest, false, 1);
  // FamiliarWeight.run(doFamiliarTest, false, 37);
  // WeaponDamage.run(doWeaponTest, false, 1);
  // SpellDamage.run(doSpellTest, false, 33);
  // Noncombat.run(doNonCombatTest, false, 1);
  // BoozeDrop.run(doItemTest, false, 1);

  printLog("green");
  donate();
}
