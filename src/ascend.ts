import { containsText, print, pvpAttacksLeft, visitUrl } from "kolmafia";

if (pvpAttacksLeft() > 0) {
  print("Run hccs_pre first, dingus.", "red");
} else {
  // use once there is a check for not perming skills that are available
  // ascend(
  //   Paths.CommunityService,
  //   $class`Pastamancer`,
  //   Lifestyle.softcore,
  //   "blender",
  //   $item`astral six-pack`,
  //   $item`astral trousers`
  // );

  if (!containsText(visitUrl("charpane.php"), "Astral Spirit")) {
    visitUrl("ascend.php?action=ascend&confirm=on&confirm2=on");
  }
  if (!containsText(visitUrl("charpane.php"), "Astral Spirit"))
    throw "Failed to ascend.";
  visitUrl("afterlife.php?action=pearlygates");

  if (
    !visitUrl("afterlife.php?place=permery").includes(
      "There's nothing we can do for you here"
    )
  ) {
    print(
      "It seems like there are some unclaimed skills. Deal with that.",
      "red"
    );
  } else {
    // Pilsners
    visitUrl("afterlife.php?action=buydeli&whichitem=5046");
    // Trousers
    visitUrl("afterlife.php?action=buyarmory&whichitem=5035");

    // Blender, Male, Pastamancer, CS, Normal
    visitUrl(
      "afterlife.php?action=ascend&confirmascend=1&whichsign=8&gender=1&whichclass=3&whichpath=25&asctype=2&nopetok=1&noskillsok=1&pwd",
      true
    );
  }
}
