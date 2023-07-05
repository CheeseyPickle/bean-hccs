import { CSStrategy, Macro } from "./combatMacros";
import { beachTask, potionTask, skillTask, monkeyWishTask } from "./commons";
import { CSQuest } from "./engine";
import { levelUniform, uniform } from "./outfit";
import { OutfitSpec } from "grimoire-kolmafia";
import {
  buy,
  chew,
  cliExecute,
  create,
  eat,
  haveEffect,
  mpCost,
  myAdventures,
  myBasestat,
  myHp,
  myMaxhp,
  myMaxmp,
  myMp,
  numericModifier,
  runChoice,
  toEffect,
  totalFreeRests,
  use,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $item,
  $items,
  $location,
  $monster,
  $skill,
  $skills,
  $stat,
  AutumnAton,
  ensureEffect,
  get,
  have,
  TrainSet,
} from "libram";

const levellingComplete =
  myBasestat($stat`Mysticality`) >= 210 &&
  get("_neverendingPartyFreeTurns") >= 10;
let lovePotionConsidered = false;

const foldshirt = (): void => {
  if (!have($item`makeshift garbage shirt`))
    cliExecute("fold makeshift garbage shirt");
};

const CastSkills =
  // Ordered +myst buffs, survivability buffs, then +ml/stats
  $skills`Advanced Saucecrafting, Get Big, Stevedave's Shanty of Superiority, Feel Excitement, The Magical Mojomuscular Melody, Blessing of She-Who-Was, Manicotti Meditation, Blood Bubble, Carol of the Hells, Sauce Monocle, Feel Peaceful, Elemental Saucesphere, Astral Shell, Ghostly Shell, Singer's Faithful Ocelot, Blood Bond, Leash of Linguini, Empathy of the Newt, Ur-Kel's Aria of Annoyance, Drescher's Annoying Noise, Pride of the Puffin, Carol of the Thrills`
    .map((s) => ({
      name: s.name,
      ready: () => myMp() > mpCost(s),
      do: (): void => {
        useSkill(s);
      },
      completed: () => (s.buff ? have(toEffect(s)) : s.timescast > 0),
    }))
    .map((task) => ({
      ...task,
      outfit: () =>
        uniform({
          changes: {
            offhand: $item`Abracandalabra`,
            pants: $item`Cargo Cultist Shorts`,
          },
        }),
    }));

const lovePotion = $item`Love Potion #XYZ`;
const loveEffect = $effect`Tainted Love Potion`;
const Level: CSQuest = {
  type: "MISC",
  name: "Level",
  completed: () => levellingComplete,
  tasks: [
    {
      name: "Maintain HP",
      ready: () => myHp() < 0.8 * myMaxhp(),
      completed: () => myHp() > 0.8 * myMaxhp(),
      do: (): void => {
        if (get("_hotTubSoaks") < 5) cliExecute("hottub");
        else useSkill($skill`Cannelloni Cocoon`);
      },
    },
    {
      name: "Set up trainset",
      ready: () => get("lastTrainsetConfiguration") < 0,
      completed: () => get("lastTrainsetConfiguration") >= 0,
      do: (): void => {
        // Base configuration of trainset
        const baseTrainConfig = [
          TrainSet.Station.COAL_HOPPER,
          TrainSet.Station.BRAIN_SILO,
          TrainSet.Station.WATER_BRIDGE,
          TrainSet.Station.VIEWING_PLATFORM,
          TrainSet.Station.GAIN_MEAT,
          TrainSet.Station.GRAIN_SILO,
          TrainSet.Station.CANDY_FACTORY,
          TrainSet.Station.ORE_HOPPER,
        ];

        // Rotate configuration due to turns spent before
        const offset = get("trainsetPosition") % 8;
        const realTrainConfig: TrainSet.Station[] = [];
        for (let i = 0; i < 8; i++) {
          const newPos = (i + offset) % 8;
          realTrainConfig[newPos] = baseTrainConfig[i];
        }

        TrainSet.setConfiguration(realTrainConfig as TrainSet.Cycle);
      },
    },
    {
      name: "That's Just Cloud Talk, Man",
      completed: () => !!get("_campAwayCloudBuffs"),
      do: () => visitUrl("place.php?whichplace=campaway&action=campaway_sky"),
    },
    monkeyWishTask($effect`Different Way of Seeing Things`),
    {
      name: "abstraction: category",
      completed: () => have($effect`Category`),
      do: () => chew(1, $item`abstraction: category`),
    },
    skillTask($skill`Inscrutable Gaze`),
    {
      name: "Go to Nellyville",
      ready: () => have($item`Charter: Nellyville`),
      completed: () => have($effect`Hot in Herre`),
      do: () => use(1, $item`Charter: Nellyville`)
    },
    {
      name: "April Shower",
      completed: () => get("_aprilShower"),
      do: () => cliExecute("shower lukewarm"),
    },
    {
      name: "Daycare Scavenge",
      completed: () => get("_daycareGymScavenges") > 0,
      do: () => cliExecute("daycare scavenge free"),
    },
    monkeyWishTask($effect`A Contender`),
    {
      name: "Boxing Daybuff",
      completed: () => get("_daycareSpa"),
      do: () => cliExecute("daycare mysticality"),
    },
    {
      name: "Smile of Lyle",
      completed: () => get("_lyleFavored"),
      do: () => cliExecute("monorail buff"),
    },
    {
      name: "Telescope",
      completed: () => get("telescopeLookedHigh"),
      do: () => cliExecute("telescope look high"),
    },
    {
      name: "Glittering Eyelashes",
      completed: () => have($effect`Glittering Eyelashes`),
      do: (): void => {
        const mascara = $item`glittery mascara`;
        if (!have(mascara)) buy(1, mascara);
        use(1, mascara);
      },
    },
    ...$items`votive of confidence, natural magick candle, gummi snake`.map(
      potionTask
    ),
    {
      name: "Lantern Battery",
      ready: () => myMaxmp() - myMp() >= 70,
      completed: () => have($effect`Lantern-Charged`),
      do: (): void => {
        cliExecute("acquire 1 battery (lantern)");
        use(1, $item`battery (lantern)`);
      },
    },
    {
      name: "Rest Free Restore MP!",
      ready: () => get("timesRested") < totalFreeRests() && myMp() < 80,
      completed: () => myMp() >= 80,
      do: () => cliExecute("rest free"),
    },
    ...CastSkills,
    // This doesn't seem to work out of CastSkills, for some reason
    skillTask($effect`Feeling Excited`),
    {
      name: "Eat sausage",
      ready: () => have($item`magical sausage casing`),
      do: () => eat($item`magical sausage`),
      completed: () => myAdventures() > 0,
      limit: { tries: 1 },
      outfit: () =>
        uniform({
          changes: {
            modifier: "Maximum MP",
          },
        }),
    },
    beachTask($effect`You Learned Something Maybe!`),
    beachTask($effect`We're All Made of Starfish`),
    {
      name: "Make & Use Ointment",
      completed: () => have($effect`Mystically Oiled`),
      ready: () => have($item`grapefruit`) && have($item`scrumptious reagent`),
      do: (): void => {
        if (!have($item`ointment of the occult`)) {
          create(1, $item`ointment of the occult`);
        }
        if (have($item`ointment of the occult`)) {
          use(1, $item`ointment of the occult`);
        }
      },
      limit: { tries: 1 },
    },
    {
      name: "NEP Quest",
      completed: () => get("_questPartyFair") !== "unstarted",
      do: (): void => {
        visitUrl("adventure.php?snarfblat=528");
        const choice = ["food", "booze"].includes(get("_questPartyFairQuest"))
          ? 1
          : 2;
        runChoice(choice);
      },
    },
    {
      name: "Oliver's Place: First free fight",
      completed: () => get("_speakeasyFreeFights") > 0,
      ready: () => get("_speakeasyFreeFights") === 0,
      do: $location`An Unusually Quiet Barroom Brawl`,
      combat: new CSStrategy(() =>
        Macro.skill($skill`Launch spikolodon spikes`)
          .easyFight()
          .skill($skill`Stuffed Mortar Shell`)
          .trySkillRepeat($skill`Saucestorm`)
          .attack()
          .repeat()
      ),
      outfit: () =>
        levelUniform({
          changes: {
            shirt: $item`Jurassic Parka`,
            modes: {
              parka: "spikolodon",
            },
          },
        }),
    },
    {
      name: "NEP Myst boost",
      ready: () => get("_spikolodonSpikeUses") === 1,
      completed: () => have($effect`Tomes of Opportunity`),
      do: $location`The Neverending Party`,
      choices: { 1324: 1, 1325: 2 },
      limit: { tries: 1 },
    },
    {
      name: "Ten-Percent Bonus",
      completed: () => !have($item`a ten-percent bonus`),
      do: () => use(1, $item`a ten-percent bonus`),
    },
    {
      name: "Bastille",
      completed: () => get("_bastilleGames") > 0,
      do: () => cliExecute("bastille myst brutalist gesture"),
    },
    {
      name: "Bran Muffin",
      ready: () => have($effect`Ready to Eat`) && have($item`bran muffin`),
      completed: () => have($effect`All Branned Up`),
      do: () => eat(1, $item`bran muffin`),
    },
    {
      name: "Order Bran Muffin",
      ready: () => have($item`earthenware muffin tin`),
      completed: () => get("_muffinOrderedToday"),
      do: () => cliExecute("muffin order bran"),
    },
    {
      name: "Get Love Potion",
      completed: () => $skill`Love Mixology`.timescast > 0,
      do: () => useSkill(1, $skill`Love Mixology`),
    },
    {
      name: "Consider Love Potion",
      completed: () => lovePotionConsidered,
      do: (): void => {
        visitUrl(`desc_effect.php?whicheffect=${loveEffect.descid}`);
        lovePotionConsidered = true;

        if (
          numericModifier(loveEffect, "mysticality") >= 0 &&
          numericModifier(loveEffect, "muscle") >= 0 &&
          numericModifier(loveEffect, "moxie") >= -50 &&
          numericModifier(loveEffect, "maximum hp percent") > -5 &&
          numericModifier(loveEffect, "maximum mp percent") > -15
        ) {
          use(1, lovePotion);
        }
      },
    },
    {
      // not strictly necessary
      name: "Acquire Casting Items",
      completed: () => $items`saucepan`.every((i) => have(i)),
      do: () =>
        $items`saucepan`.forEach((i) => !have(i) && cliExecute(`acquire ${i}`)),
    },
    {
      name: "Lapdog",
      completed: () => get("_olympicSwimmingPool"),
      do: () => cliExecute("swim ml"),
    },
    {
      name: "Peppermint Twist",
      completed: () => have($effect`Peppermint Twisted`),
      do: (): void => {
        create(1, $item`peppermint twist`);
        use(1, $item`peppermint twist`);
      },
    },
    // {
    //   name: "Eat Fire Crackers",
    //   completed: () => have($effect`Fire cracked`),
    //   do: (): void => {
    //     ensureItem(1, $item`fire crackers`);
    //     eat(1, $item`fire crackers`);
    //   },
    // },
    {
      name: "Drink Bee's Knees",
      completed: () => have($effect`On the Trolley`),
      do: (): void => {
        ensureEffect($effect`Ode to Booze`);
        cliExecute("drink 1 Bee's Knees");
      },
    },
    {
      name: "Fold Shirt",
      do: foldshirt,
      completed: () => have($item`makeshift garbage shirt`),
    },
    {
      name: "Autumnaton NEP",
      ready: () =>
        AutumnAton.available() &&
        AutumnAton.availableLocations().includes(
          $location`The Neverending Party`
        ),
      completed: () => !AutumnAton.available(),
      do: () => AutumnAton.sendTo($location`The Neverending Party`, true),
    },
    {
      name: "Regular NEP",
      completed: () => get("_neverendingPartyFreeTurns") >= 10,
      do: $location`The Neverending Party`,
      outfit: (): OutfitSpec => {
        if (get("_neverendingPartyFreeTurns") > 1 && get("_feelPrideUsed") < 3)
          return levelUniform({
            changes: {
              back: $item`vampyric cloake`,
              acc3: $item`Cincho de Mayo`,
            },
          });
        else
          return levelUniform();
      },
      combat: new CSStrategy(() =>
        Macro.trySkill($skill`Entangling Noodles`)
          .externalIf(
            get("_neverendingPartyFreeTurns") > 1 && get("_feelPrideUsed") < 3, // make sure bowling sideways before feel pride
            Macro.trySkill($skill`Feel Pride`).trySkill(
              $skill`Cincho: Confetti Extravaganza`
            )
          )
          .externalIf(
            haveEffect($effect`Wolfish Form`) < 1,
            Macro.trySkill($skill`Become a Wolf`)
          )
          .default(true)
      ),
      choices: { [1324]: 5 },
    },
    {
      name: "Freekill NEP",
      completed: () =>
        get("_shatteringPunchUsed") >= 3 &&
        get("_gingerbreadMobHitUsed") &&
        get("_chestXRayUsed") >= 3,
      do: $location`The Neverending Party`,
      outfit: (): OutfitSpec => {
        foldshirt();
        const killSource =
          get("_chestXRayUsed") < 3 ? { acc3: $item`Lil' Doctor™ bag` } : {};
        const changes = {
          ...killSource,
        };
        return levelUniform({ changes });
      },
      combat: new CSStrategy(() =>
        Macro.if_($monster`sausage goblin`, Macro.default(true))
          .trySkill($skill`Bowl Sideways`)
          .skill($skill`Sing Along`)
          .trySkill($skill`Chest X-Ray`)
          .trySkill($skill`Shattering Punch`)
          .trySkill($skill`Gingerbread Mob Hit`)
          .abort()
      ),
      choices: { [1324]: 5 },
    },
  ],
};

export default Level;
