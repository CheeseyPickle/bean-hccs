import { OutfitSpec } from "grimoire-kolmafia";
import { cliExecute, Familiar, Item } from "kolmafia";
import {
    $effect,
    $familiar,
    $item,
    $items,
    CommunityService,
    DaylightShavings,
    get,
    have,
} from "libram";

const DEFAULT_UNIFORM = (): OutfitSpec => ({
    hat: DaylightShavings.helmet,
    shirt: $items`Jurassic Parka`,
    pants: $items`designer sweatpants, Cargo Cultist Shorts`,
    weapon: $item`Fourth of May Cosplay Saber`,
    offhand: $item`unbreakable umbrella`,
    back: $items`vampyric cloake`,
    modes: {
        umbrella: "broken",
    },
});

const FAMILIAR_PICKS = [
    {
        familiar: $familiar`Shorter-Order Cook`,
        condition: () =>
            ![$effect`Shortly Stacked`, $item`short stack of pancakes`].some((x) => have(x)) &&
            !CommunityService.FamiliarWeight.isDone(),
    },
];

export function chooseFamiliar(canAttack?: boolean): { familiar: Familiar; famequip: Item } {
    const pick = FAMILIAR_PICKS.find(
        ({ condition, familiar }) =>
            condition() &&
            have(familiar) &&
            (canAttack || !(familiar.elementalDamage || familiar.physicalDamage))
    );
    if (pick) {
        return { famequip: $item`tiny stillsuit`, familiar: pick.familiar };
    }
    return { famequip: $item`tiny stillsuit`, familiar: $familiar`Pocket Professor` };
}

type UniformOptions = { changes: OutfitSpec; canAttack: boolean };
const DEFAULT_OPTIONS = { changes: {} as OutfitSpec, canAttack: true };
export function uniform(options: Partial<UniformOptions> = {}): OutfitSpec {
    const { changes, canAttack } = { ...DEFAULT_OPTIONS, ...options };
    if ("familiar" in changes && !("famequip" in changes)) changes.famequip = $item`tiny stillsuit`;
    return { ...DEFAULT_UNIFORM(), ...chooseFamiliar(canAttack), ...changes };
}

export function levelUniform(options: Partial<{ changes: OutfitSpec }> = {}): OutfitSpec {
    cliExecute('fold garbage shirt');
    return {
        ...chooseFamiliar(true), ...{
            hat: $item`Daylight Shavings Helmet`,
            weapon: $item`Fourth of May Cosplay Saber`,
            offhand: $item`unbreakable umbrella`,
            shirt: $item`makeshift garbage shirt`,
            pants: $item`Cargo Cultist Shorts`,
            acc1: $item`astral belt`,
            acc2: $item`backup camera`,
            acc3: $item`Lil' Doctor™ bag`,
            modes: { umbrella: "broken", backupcamera: "ml" },
        }, ...options.changes
    };
}