import {
  abort,
  availableAmount,
  buy,
  cliExecute,
  getWorkshed,
  mallPrice,
  pvpAttacksLeft,
  visitUrl,
} from "kolmafia";
import { $coinmaster, $item, get, TrainSet } from "libram";

cliExecute("refresh inventory");

// Acquire muffins
if (availableAmount($item`bran muffin`) < 1) {
  cliExecute("muffin collect");

  if (availableAmount($item`bran muffin`) < 1) {
    abort("No bran muffin");
  }
}

// Get Wasabi soda
if (availableAmount($item`wasabi marble soda`) < 1) {
  if (
    mallPrice($item`Ye Wizard's Shack snack voucher`) <
    mallPrice($item`wasabi marble soda`)
  ) {
    const success = buy(1, $item`Ye Wizard's Shack snack voucher`, 10000);
    success <= 0 && abort("Failed to get snack voucher");
    buy($coinmaster`Game Shoppe Snacks`, 1, $item`wasabi marble soda`);
  } else {
    const success = buy(1, $item`wasabi marble soda`, 10000);
    success <= 0 && abort("Failed to get wasabi soda");
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
    TrainSet.Station.COAL_HOPPER,
  ]);
}

const season = get("currentPVPSeason");

const PVP_STANCE: { [key: string]: string } = {
  bear: "Maul Power",
  pirate: "Karmic Battle",
  average: "Letter of the Moment",
  glitch: "Installation Wizard",
  numeric: "Back to Square One",
  ice: "A Nice Cold One",
};

const getTarget = () => {
  return "loot";
};

let noError = true;

if (pvpAttacksLeft() > 0) {
  visitUrl("peevpee.php?action=smashstone&confirm=on");
  noError = cliExecute("uberpvpoptimizer");
  noError = noError && cliExecute(`pvp ${getTarget()} ${PVP_STANCE[season]}`);
}

cliExecute("refresh inventory");

!noError && abort();
