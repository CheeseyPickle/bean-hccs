import { songTask } from "./commons";
import { CSQuest } from "./engine";
import { drink, monkeyPaw, use } from "kolmafia";
import { $effect, $item, get, have } from "libram";

// Tests after are fam weight, hot res, weapon and spell
const RESERVED_WISHES = 0;

const Drink: CSQuest = {
  name: "Drink Pilsners",
  type: "MISC",
  completed: () =>
    !have($item`astral pilsner`) && !have($item`astral six-pack`),
  tasks: [
    {
      name: "Open Pilsners",
      completed: () => !have($item`astral six-pack`),
      do: () => use($item`astral six-pack`),
    },
    songTask($effect`Ode to Booze`, $effect`The Magical Mojomuscular Melody`),
    {
      name: "Wish for Salty Mouth",
      ready: () =>
        get("_monkeyPawWishesUsed") + RESERVED_WISHES < 5 &&
        have($item`astral pilsner`),
      completed: () => have($effect`Salty Mouth`),
      do: () => monkeyPaw($effect`Salty Mouth`),
    },
    {
      name: "Drink Pilsners",
      ready: () => have($item`astral pilsner`),
      completed: () => !have($item`astral pilsner`),
      do: () => drink($item`astral pilsner`),
    },
  ],
};

export default Drink;
