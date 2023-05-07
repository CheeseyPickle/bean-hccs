import { CSStrategy, Macro } from "./combatMacros";
import { beachTask, commonFamiliarWeightBuffs, skillTask } from "./commons";
import { CSQuest } from "./engine";
import { uniform } from "./outfit";
import { visitUrl } from "kolmafia";
import {
  $effect,
  $effects,
  $familiar,
  $item,
  $location,
  $skill,
  CommunityService,
  get,
  have,
} from "libram";

const buffs = $effects`Elemental Saucesphere, Feeling Peaceful, Astral Shell`;

const MODIFIERS = ["Hot Resistance"];

const HotRes: CSQuest = {
  name: "Hot Res",
  type: "SERVICE",
  test: CommunityService.HotRes,
  modifiers: MODIFIERS,
  outfit: () => ({
    modifiers: MODIFIERS.join(","),
    familiar: $familiar`Exotic Parrot`,
  }),
  turnsSpent: 0,
  maxTurns: 1,
  tasks: [
    ...buffs.map(skillTask),
    ...commonFamiliarWeightBuffs(),
    beachTask($effect`Hot-Headed`),
    {
      name: "Daylight Shavings Buff",
      completed: () => have($effect`Gull-Wing Moustache`),
      ready: () => get("_speakeasyFreeFights") < 3,
      do: $location`An Unusually Quiet Barroom Brawl`,
      combat: new CSStrategy(() => Macro.easyFight().attack().repeat()),
      outfit: () =>
        uniform({
          changes: {
            hat: $item`Daylight Shavings Helmet`,
          },
        }),
    },
    {
      name: "Extinguisher + Cloake + Fax",
      completed: () => have($effect`Fireproof Foam Suit`),
      ready: () => get("_saberForceUses") < 5 && !get("_photocopyUsed"),
      do: $location`The Dire Warren`,
      choices: { [1387]: 3 },
      outfit: () =>
        uniform({
          changes: {
            familiar: $familiar.none,
            famequip: $item.none,
            weapon: $item`Fourth of May Cosplay Saber`,
            offhand: $item`industrial fire extinguisher`,
            back: $item`vampyric cloake`,
          },
        }),
      combat: new CSStrategy(() =>
        Macro.skill($skill`Become a Cloud of Mist`)
          .skill($skill`Fire Extinguisher: Foam Yourself`)
          .skill($skill`Use the Force`)
      ),
      post: () =>
        visitUrl(
          `desc_item.php?whichitem=${
            $item`industrial fire extinguisher`.descid
          }`
        ),
    },
  ],
};

export default HotRes;
