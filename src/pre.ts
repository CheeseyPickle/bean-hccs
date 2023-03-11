import {
  abort,
  availableAmount,
  cliExecute,
  getWorkshed,
  pvpAttacksLeft,
  visitUrl,
} from "kolmafia";
import { $item, get, TrainSet } from "libram";

const season = get("currentPVPSeason");

const PVP_STANCE: { [key: string]: string } = {
  bear: "Maul Power",
  pirate: "Karmic Battle",
  glitch: "Installation Wizard",
  numeric: "A Nice Cold One",
  ice: "A Nice Cold One",
};

const getTarget = () => {
  return "loot";
};

let noError = true;

if (pvpAttacksLeft() > 0) {
  visitUrl('peevpee.php?action=smashstone&confirm=on');
  noError = cliExecute("uberpvpoptimizer");
  noError = noError && cliExecute(`pvp ${getTarget()} ${PVP_STANCE[season]}`);
}

cliExecute("refresh inventory");

// Acquire muffins
if (availableAmount($item`bran muffin`) < 1) {
  cliExecute("muffin collect");

  if (availableAmount($item`bran muffin`) < 1) {
    abort("No bran muffin");
  }
}

// TODO: Check ice house for remaindered skeleton
if (
  getWorkshed() == $item`model train set` &&
  get("trainsetPosition") - get("lastTrainsetConfiguration") >= 40
) {
  TrainSet.setConfiguration([
    TrainSet.Station.GAIN_MEAT,
    TrainSet.Station.BRAIN_SILO,
    TrainSet.Station.VIEWING_PLATFORM,
    TrainSet.Station.CANDY_FACTORY,
    TrainSet.Station.GRAIN_SILO,
    TrainSet.Station.TRACKSIDE_DINER,
    TrainSet.Station.ORE_HOPPER,
    TrainSet.Station.COAL_HOPPER
  ]);
}

!noError && abort();
