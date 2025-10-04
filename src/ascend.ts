import { abort, getPermedSkills, print, pvpAttacksLeft, Skill } from "kolmafia";
import { ascend, $path, $class, Lifestyle, $item, have, KolGender } from "libram";

function createPermOptions(): {
  permSkills: Map<Skill, Lifestyle>;
  neverAbort: boolean;
} {
  return {
    permSkills: new Map(
      Skill.all()
        .filter(
          (skill) =>
            have(skill) &&
            skill.permable &&
            getPermedSkills()[skill.name] === undefined
        )
        .map((skill) => [skill, Lifestyle.hardcore])
    ),
    neverAbort: false,
  };
}

if (pvpAttacksLeft() > 0) {
  print("Run hccs_pre first, dingus.", "red");
  abort();
} else {
  ascend({
    path: $path`Community Service`,
    playerClass: $class`Pastamancer`,
    lifestyle: Lifestyle.normal,
    kolGender: KolGender.male,
    moon: "wallaby",
    consumable: $item`astral six-pack`,
    pet: $item`astral belt`,
    permOptions: {
      permSkills: new Map<Skill, Lifestyle>(), // Figure out what skills I want to perm later
      neverAbort: false,
    }}
  );
}
