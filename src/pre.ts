import { abort, availableAmount, cliExecute, pvpAttacksLeft, use } from "kolmafia";
import { $item, get } from "libram";
import { ensureItem } from "./lib";

const season = get("currentPVPSeason");

const PVP_STANCE: { [key: string]: string } = {
  bear: "Maul Power",
  pirate: "Smellin' Like a Stinkin' Rose",
  glitch: "Installation Wizard",
  numeric: "A Nice Cold One",
  ice: "A Nice Cold One"
};

const getTarget = () => {
  switch (season) {
    case "bear":
      return "fame";
    default:
      return "loot";
  }
};

let noError = true;

if (pvpAttacksLeft() > 0) {
  noError = cliExecute("uberpvpoptimizer");
  noError = noError && cliExecute(`pvp ${getTarget()} ${PVP_STANCE[season]}`);
}

cliExecute("refresh inventory");
if (availableAmount($item`bran muffin`) < 1) {
  abort("No bran muffin");
}

!noError && abort();