import { OutfitSpec } from "grimoire-kolmafia";
import { cliExecute, equip, Familiar, Item, useFamiliar } from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $items,
  $slot,
  CommunityService,
  have,
} from "libram";

const DEFAULT_UNIFORM = (): OutfitSpec => ({
  hat: $item`Daylight Shavings Helmet`,
  shirt: $items`Jurassic Parka`,
  pants: $items`designer sweatpants, Cargo Cultist Shorts`,
  weapon: $item`Fourth of May Cosplay Saber`,
  offhand: $item`unbreakable umbrella`,
  back: $items`vampyric cloake`,
  modes: {
    umbrella: "broken",
  },
});

export function getBestFamiliar(canAttack: boolean): Familiar {
  if (
    canAttack &&
    !have($item`overloaded Yule battery`) &&
    !CommunityService.FamiliarWeight.isDone()
  ) {
    return $familiar`Mini-Trainbot`;
  } else if (
    canAttack &&
    ![$effect`Shortly Stacked`, $item`short stack of pancakes`].some((x) =>
      have(x),
    ) &&
    !CommunityService.FamiliarWeight.isDone()
  ) {
    return $familiar`Shorter-Order Cook`;
  } else {
    return $familiar`Cookbookbat`;
  }
}

export function useBestFamiliar(canAttack: boolean): void {
  useFamiliar(getBestFamiliar(canAttack));
  if (getBestFamiliar(canAttack) === $familiar`Mini-Trainbot`) {
    equip($item`toy Cupid bow`, $slot`familiar`);
  } else {
    equip($item`tiny stillsuit`, $slot`familiar`);
  }
}

export function chooseBestFamiliar(canAttack: boolean): {
  familiar: Familiar;
  famequip: Item;
} {
  if (getBestFamiliar(canAttack) === $familiar`Mini-Trainbot`) {
    return {
      famequip: $item`toy Cupid bow`,
      familiar: getBestFamiliar(canAttack),
    };
  } else {
    return {
      famequip: $item`tiny stillsuit`,
      familiar: getBestFamiliar(canAttack),
    };
  }
}

type UniformOptions = { changes: OutfitSpec; canAttack: boolean };
const DEFAULT_OPTIONS = { changes: {} as OutfitSpec, canAttack: true };
export function uniform(options: Partial<UniformOptions> = {}): OutfitSpec {
  const { changes, canAttack } = { ...DEFAULT_OPTIONS, ...options };
  if ("familiar" in changes && !("famequip" in changes))
    changes.famequip = $item`tiny stillsuit`;
  return { ...DEFAULT_UNIFORM(), ...chooseBestFamiliar(canAttack), ...changes };
}

export function levelUniform(
  options: Partial<{ changes: OutfitSpec }> = {},
): OutfitSpec {
  cliExecute("fold garbage shirt");
  return {
    ...chooseBestFamiliar(true),
    ...{
      hat: $item`Daylight Shavings Helmet`,
      weapon: $item`Fourth of May Cosplay Saber`,
      offhand: $item`unbreakable umbrella`,
      shirt: $item`makeshift garbage shirt`,
      pants: $item`Cargo Cultist Shorts`,
      acc1: $item`astral belt`,
      acc2: $item`backup camera`,
      acc3: $item`Lil' Doctor™ bag`,
      modes: { umbrella: "broken", backupcamera: "ml" },
    },
    ...options.changes,
  };
}
