import { containsText, visitUrl } from 'kolmafia';

if (!containsText(visitUrl('charpane.php'), 'Astral Spirit')) {
  visitUrl('ascend.php?action=ascend&confirm=on&confirm2=on');
}
if (!containsText(visitUrl('charpane.php'), 'Astral Spirit')) throw 'Failed to ascend.';
visitUrl('afterlife.php?action=pearlygates');

// abort('perm skills');

// Pilsners
visitUrl('afterlife.php?action=buydeli&whichitem=5046');
// Belt
visitUrl('afterlife.php?action=buyarmory&whichitem=5042');

// TODO: Find out which number Wallaby is
// Pastamancer, Blender, Male, CS
visitUrl(
  'afterlife.php?action=ascend&confirmascend=1&whichsign=8&gender=1&whichclass=3&whichpath=25&asctype=2&nopetok=1&noskillsok=1&pwd',
  true
);
