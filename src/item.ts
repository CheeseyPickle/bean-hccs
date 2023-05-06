import { OutfitSpec } from "grimoire-kolmafia";
import {
  availableAmount,
  cliExecute,
  create,
  handlingChoice,
  runChoice,
  use,
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
import { skillTask, potionTask, songTask, monkeyWishTask } from "./commons";
import { CSQuest } from "./engine";
import { ensureItem } from "./lib";
import { uniform } from "./outfit";

const MODIFIERS = ["item drop", "booze drop"];

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
    monkeyWishTask($effect`Infernal Thirst`),
    {
      // TODO: Cut this once you get any additional item skills
      name: "Eyedrops of the Ermine",
      completed: () => have($effect`Ermine Eyes`),
      ready: () => have($item`strawberry`),
      do: (): void => {
        if (!have($item`eyedrops of the ermine`)) {
          create(1, $item`eyedrops of the ermine`);
        }
        if (have($item`eyedrops of the ermine`)) {
          use(1, $item`eyedrops of the ermine`);
        }
      },
      limit: { tries: 1 },
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
    skillTask($skill`Feel Lost`),
    skillTask($skill`Steely-Eyed Squint`),
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
