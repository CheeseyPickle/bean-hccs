import { OutfitSpec } from "grimoire-kolmafia";
import {
  availableAmount,
  cliExecute,
  handlingChoice,
  runChoice,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $items,
  $monster,
  $skill,
  CombatLoversLocket,
  CommunityService,
  get,
  have,
} from "libram";
import { CSStrategy, Macro } from "./combatMacros";
import { skillTask, potionTask, songTask, aprilShieldTask } from "./commons";
import { CSQuest } from "./engine";
import { ensureItem, hasLoathingIdolCharge } from "./lib";
import { uniform } from "./outfit";

const MODIFIERS = ["item drop", "2booze drop"];

const ItemDrop: CSQuest = {
  name: "Booze Drop",
  type: "SERVICE",
  test: CommunityService.BoozeDrop,
  turnsSpent: 0,
  maxTurns: 1,
  modifiers: MODIFIERS,
  tasks: [
    {
      name: "Batform + Pirate Locket",
      ready: () =>
        !get("_locketMonstersFought").includes("Black Crayon Pirate"),
      completed: () => have($effect`Bat-Adjacent Form`),
      do: (): void => {
        CombatLoversLocket.reminisce($monster`Black Crayon Pirate`);
        if (handlingChoice()) runChoice(-1);
      },
      outfit: () =>
        uniform({
          changes: {
            back: $item`vampyric cloake`,
          },
        }),
      combat: new CSStrategy(() => Macro.skill($skill`Become a Bat`).kill()),
    },
    skillTask($skill`Singer's Faithful Ocelot`),
    ...$items`lavender candy heart, bag of grain`.map(potionTask),
    // monkeyWishTask($effect`Infernal Thirst`),
    {
      name: "Loathing Idol Item",
      ready: () => hasLoathingIdolCharge(),
      completed: () => have($effect`Spitting Rhymes`),
      do: () => cliExecute("loathingidol item"),
    },
    {
      name: "Get Sparkler",
      ready: () => !get("_fireworksShopEquipmentBought"),
      completed: () => availableAmount($item`oversized sparkler`) > 0,
      do: () => ensureItem(1, $item`oversized sparkler`),
    },
    {
      name: "Fortune Buff",
      completed: () => get("_clanFortuneBuffUsed"),
      do: () => cliExecute("fortune buff item"),
    },
    songTask(
      $effect`Fat Leon's Phat Loot Lyric`,
      $effect`The Magical Mojomuscular Melody`
    ),
    skillTask($skill`The Spirit of Taking`),
    skillTask($skill`Who's Going to Pay This Drunken Sailor?`),
    skillTask($skill`Feel Lost`),
    skillTask($skill`Steely-Eyed Squint`),
    aprilShieldTask($skill`Sauce Contemplation`),
  ],
  outfit: (): OutfitSpec => {
    if (!have($item`wad of used tape`)) cliExecute("fold wad of used tape");
    return {
      modifier: MODIFIERS.join(","),
      familiar: $familiar`Left-Hand Man`,
      avoid: $items`broken champagne bottle`,
    };
  },
};

export default ItemDrop;
