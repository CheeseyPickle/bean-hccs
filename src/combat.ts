import { $skill, Macro } from 'libram';

const COMBAT_MACROS = {
  nostEnvyFreeKill: function (monsterName: string, useNostalgia = true): Macro {
    return Macro.step('mark start')
      .if_(
        `monstername ${monsterName}`,
        Macro.externalIf(useNostalgia, Macro.skill($skill`Feel Nostalgic`))
          .skill($skill`Feel Envy`)
          .skill($skill`Chest X-Ray`)
      )
      .skill('CHEAT CODE: Replace Enemy')
      .step('goto start');
  },
  envyFreeKill: function (monsterName: string): Macro {
    return this.nostEnvyFreeKill(monsterName, false);
  },

  // FIXME: This works for skeleton store purposes, but in general this is terrible
  banishAndSaber: function (monsterName: string): Macro {
    return Macro.if_(
      `!monstername ${monsterName}`,
      Macro.trySkill($skill`Throw Latte on Opponent`)
        .trySkill($skill`Feel Hatred`)
        .trySkill($skill`Snokebomb`)
    ).trySkill($skill`Use the Force`);
  },
};

function main(): void {
  Macro.load().submit();
}

export { COMBAT_MACROS, main };
