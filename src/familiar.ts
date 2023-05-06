import { commonFamiliarWeightBuffs, famPool, potionTask } from "./commons";
import { CSQuest } from "./engine";
import { cliExecute } from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  CommunityService,
  ensureEffect,
  get,
  have,
} from "libram";

const MODIFIERS = ["Familiar Weight"];

const FamiliarWeight: CSQuest = {
  name: "Familiar Weight",
  type: "SERVICE",
  modifiers: MODIFIERS,
  test: CommunityService.FamiliarWeight,
  outfit: () => ({
    modifier: MODIFIERS.join(","),
    familiar: $familiar`Pocket Professor`,
  }),
  turnsSpent: 0,
  maxTurns: 50,
  tasks: [
    ...commonFamiliarWeightBuffs(),
    potionTask($item`short stack of pancakes`),
    potionTask($item`silver face paint`),
    potionTask($item`lump of loyal latite`),
    {
      name: "Drink Hot Socks",
      ready: () => get("_speakeasyDrinksDrunk") < 3,
      completed: () => have($effect`[1701]Hip to the Jive`),
      do: (): void => {
        ensureEffect($effect`Ode to Booze`);
        cliExecute("drink 1 Hot Socks");
      },
    },
    famPool(),
  ],
};

export default FamiliarWeight;
