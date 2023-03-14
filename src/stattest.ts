import { beachTask, potionTask, restore, skillTask, songTask } from "./commons";
import { CSQuest } from "./engine";
import { create, use } from "kolmafia";
import {
    $effect,
    $effects,
    $familiar,
    $item,
    $items,
    CommunityService,
    have,
} from "libram";
import { Task } from "grimoire-kolmafia";

const SKILL_BUFFS = {
    MUSCLE: $effects`Feeling Excited, Big, Rage of the Reindeer`,
    MYSTICALITY: $effects`Feeling Excited, Big`,
    MOXIE: $effects`Feeling Excited, Big, Quiet Desperation, Disco Fever`,
    HP: $effects`Feeling Excited, Big`,
};

function skillBuffTasks(key: keyof typeof SKILL_BUFFS): Task[] {
    return [...SKILL_BUFFS[key].map(skillTask), restore(SKILL_BUFFS[key])];
}

const Muscle: CSQuest = {
    name: "Muscle",
    type: "SERVICE",
    test: CommunityService.Muscle,
    modifiers: ['Muscle', 'Muscle Percent'],
    turnsSpent: 0,
    maxTurns: 1,
    outfit: () => ({
        modifier: ['Muscle', 'Muscle Percent'].join(','),
        familiar: $familiar`Left-Hand Man`
    }),
    tasks: [
        {
            name: "Make & Use Oil",
            completed: () => have($effect`Expert Oiliness`),
            ready: () => have($item`cherry`),
            do: (): void => {
                if (!have($item`oil of expertise`)) {
                    create(1, $item`oil of expertise`);
                }
                if (have($item`oil of expertise`)) {
                    use(1, $item`oil of expertise`);
                }
            },
            limit: { tries: 1 }
        },
        {
            name: "Make & Use Philter",
            completed: () => have($effect`Phorcefullness`),
            ready: () => have($item`lemon`),
            do: (): void => {
                if (!have($item`philter of phorce`)) {
                    create(1, $item`philter of phorce`);
                }
                if (have($item`philter of phorce`)) {
                    use(1, $item`philter of phorce`);
                }
            },
            limit: { tries: 1 }
        },
        ...skillBuffTasks("MUSCLE"),
        { ...potionTask($item`Ben-Gal™ Balm`) },
    ],
};

const Mysticality: CSQuest = {
    name: "Mysticality",
    type: "SERVICE",
    test: CommunityService.Mysticality,
    modifiers: ['Mysticality', 'Mysticality Percent'],
    turnsSpent: 0,
    maxTurns: 1,
    tasks: [
        songTask($effect`The Magical Mojomuscular Melody`, $effect`Ur-Kel's Aria of Annoyance`),
        ...skillBuffTasks("MYSTICALITY")
    ],
    outfit: () => ({
        modifier: ['Mysticality', 'Mysticality Percent'].join(','),
        familiar: $familiar`Left-Hand Man`
    }),
};

const Moxie: CSQuest = {
    name: "Moxie",
    type: "SERVICE",
    test: CommunityService.Moxie,
    modifiers: ['Moxie', 'Moxie Percent'],
    turnsSpent: 0,
    maxTurns: 1,
    outfit: () => ({
        modifier: ['Moxie', 'Moxie Percent'].join(','),
        familiar: $familiar`Left-Hand Man`
    }),
    tasks: [
        ...skillBuffTasks("MOXIE"),
        ...$items`runproof mascara`.map(
            potionTask
        ),
        potionTask($item`pocket maze`),
        beachTask($effect`Pomp & Circumsands`),
        { ...potionTask($item`hair spray`) },
    ],
};

const Hitpoints: CSQuest = {
    name: "Hitpoints",
    type: "SERVICE",
    test: CommunityService.HP,
    turnsSpent: 0,
    maxTurns: 1,
    modifiers: ['Maximum HP', 'Maximum HP Percent'],
    outfit: () => ({
        modifier: ['Maximum HP', 'Maximum HP Percent'].join(','),
        familiar: $familiar`Left-Hand Man`
    }),
    tasks: [
        ...skillBuffTasks("HP"),
    ],
};

export { Muscle, Mysticality, Moxie, Hitpoints };