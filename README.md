# bb-hccs

This is a Kingdom of Loathing script taken from `BurningBman (#1729599)`'s bb-hccs, which was originally taken from `worthawholebean (#1972588)`'s bean-hccs, to do 1-day Softcore Community Service runs as a Pastamancer. I'm developing it for ~1/170 softcore CS runs (yes, the name is a misnomer). Expect to need to make some changes, unless your set of IotMs is a strict superset of mine, and even then you should probably optimize it to be better. For most folks, this will be an outline that can get you to daycount with some customization work.

You'll have to build this yourself to make modifications. This use a typical node.js / babel / webpack setup. To install:
- Install node.js.
- Checkout the repository somewhere outside your mafia folder.
- Run `npm install` and `npm run-script build`
- Symbolic link the build folder (`KoLmafia/scripts/bb-hccs`) into your mafia directory. Or make a copy every time you update.
- Run `npm run watch` as you make changes and the build folder will automatically update.

The script is intended to be in the public domain. Please feel free to modify and distribute how you wish.
