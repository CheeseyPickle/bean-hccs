import { abort, getPermedSkills, print, pvpAttacksLeft, Skill } from "kolmafia";
import { ascend, $path, $class, Lifestyle, $item, have } from "libram";

function createPermOptions(): { permSkills: Map<Skill, Lifestyle>; neverAbort: boolean } {
  return {
    permSkills: new Map(
      Skill.all()
        .filter(
          (skill) => have(skill) && skill.permable && getPermedSkills()[skill.name] === undefined
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
  ascend($path`Community Service`, $class`Pastamancer`, Lifestyle.normal, 'wallaby', $item`astral six-pack`, $item`astral belt`, {
    permSkills: new Map<Skill, Lifestyle> (), // Figure out what skills I want to perm later
    neverAbort: false
  });
}
