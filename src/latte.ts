// Not sure if this really needs its own file,
// but I think it's annoying enough to warrant one
import { $location, get } from 'libram';

// Our target locations, and the ingredients we get from them, sorted by priority
const latteLocations: [Location, string][] = [
  [$location`Noob Cave`, 'sandalwood'],
  [$location`The Dire Warren`, 'carrot'],
  [$location`The Haunted Kitchen`, 'chili'], // This saves the most turns, but I burn free kills here anyway
];
const backupLocation: Location = $location`Noob Cave`;

export function getLatteLocation(): Location {
  for (let i = 0; i < latteLocations.length; i++) {
    if (!get('latteUnlocks').includes(latteLocations[i][1])) {
      return latteLocations[i][0];
    }
  }
  return backupLocation;
}
