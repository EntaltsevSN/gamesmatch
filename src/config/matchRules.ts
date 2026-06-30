export type StageRule = {
  key: string;
  title: string;
  description: string;
};

export type ChampionshipRule = {
  gamesCount: 32 | 64 | 128;
  stages: StageRule[];
};

const stageRules32: StageRule[] = [
  {
    key: "stage1",
    title: "Этап 1",
    description:
      "32 участника играют 16 матча. Победители идут в виннеры, проигравшие в лузеры.",
  },
  {
    key: "stage2w",
    title: "Этап 2 — Виннеры",
    description: "8 пар виннеров дают 4 пары новых виннеров и 4 пары новых лузеров.",
  },
  {
    key: "stage2l",
    title: "Этап 2 — Лузеры",
    description: "8 пар лузеров оставляют 4 пары. Потом к ним добавятся лузеры из виннеров.",
  },
  {
    key: "stage3w",
    title: "Этап 3 — Виннеры",
    description: "4 пары виннеров дают 2 пары новых виннеров и 2 пары новых лузеров.",
  },
  {
    key: "stage3l",
    title: "Этап 3 — Лузеры",
    description: "8 пар лузеров оставляют 4 пары, к ним прибавятся 2 пары новых лузеров.",
  },
  {
    key: "stage4w",
    title: "Этап 4 — Виннеры",
    description: "2 пары виннеров делятся на 1 пару новых виннеров и 1 пару новых лузеров.",
  },
  {
    key: "stage4l",
    title: "Этап 4 — Лузеры",
    description: "6 пар лузеров оставляют 3 пары, затем добавляется 1 пара из виннеров.",
  },
  {
    key: "stage5l",
    title: "Этап 5 — Лузеры",
    description: "1 пара виннеров без изменений. В лузерах 4 пары отбирают 2 пары.",
  },
  {
    key: "stage6w",
    title: "Этап 6 — Виннеры",
    description: "1 пара виннеров дает 1 победителя виннеров и 1 участника в лузеры.",
  },
  {
    key: "stage6l",
    title: "Этап 6 — Лузеры",
    description: "2 пары лузеров оставляют 1 пару, затем добавляется участник из виннеров.",
  },
  {
    key: "stage7",
    title: "Этап 7",
    description: "Победитель виннеров и 3 участника лузеров играют на вылет до 2 пар.",
  },
  {
    key: "stage8",
    title: "Этап 8",
    description: "2 пары играют на вылет до одной пары.",
  },
  {
    key: "stage9",
    title: "Финал",
    description: "Последний матч определяет чемпиона.",
  },
];

const stageRules64: StageRule[] = [
  {
    key: "stage1",
    title: "Этап 1",
    description:
      "64 участника играют 32 матча. Победители идут в виннеры, проигравшие в лузеры.",
  },
  {
    key: "stage2w",
    title: "Этап 2 — Виннеры",
    description: "16 пар виннеров дают 8 пар новых виннеров и 8 пар новых лузеров.",
  },
  {
    key: "stage2l",
    title: "Этап 2 — Лузеры",
    description: "16 пар лузеров оставляют 8 пар. Потом к ним добавятся лузеры из виннеров.",
  },
  {
    key: "stage3w",
    title: "Этап 3 — Виннеры",
    description: "8 пар виннеров дают 4 пары новых виннеров и 4 пары новых лузеров.",
  },
  {
    key: "stage3l",
    title: "Этап 3 — Лузеры",
    description: "16 пар лузеров оставляют 8 пар, к ним прибавятся 4 пары новых лузеров.",
  },
  {
    key: "stage4w",
    title: "Этап 4 — Виннеры",
    description: "4 пары виннеров делятся на 2 пары новых виннеров и 2 пары новых лузеров.",
  },
  {
    key: "stage4l",
    title: "Этап 4 — Лузеры",
    description: "12 пар лузеров оставляют 6 пар, затем добавляются 2 пары из виннеров.",
  },
  {
    key: "stage5l",
    title: "Этап 5 — Лузеры",
    description: "2 пары виннеров без изменений. В лузерах 8 пар отбирают 4 пары.",
  },
  {
    key: "stage6w",
    title: "Этап 6 — Виннеры",
    description: "2 пары виннеров дают пару виннеров и пару лузеров.",
  },
  {
    key: "stage6l",
    title: "Этап 6 — Лузеры",
    description: "4 пары лузеров оставляют 2 пары, затем добавляется пара из виннеров.",
  },
  {
    key: "stage7",
    title: "Этап 7",
    description: "Пара виннеров и 3 пары лузеров играют на вылет до 2 пар.",
  },
  {
    key: "stage8",
    title: "Этап 8",
    description: "2 пары играют на вылет до одной пары.",
  },
  {
    key: "stage9",
    title: "Финал",
    description: "Последний матч определяет чемпиона.",
  },
];

const stageRules128: StageRule[] = [
  {
    key: "stage1",
    title: "Этап 1",
    description:
      "128 участника играют 64 матча. Победители идут в виннеры, проигравшие в лузеры.",
  },
  {
    key: "stage2w",
    title: "Этап 2 — Виннеры",
    description: "32 пар виннеров дают 16 пар новых виннеров и 16 пар новых лузеров.",
  },
  {
    key: "stage2l",
    title: "Этап 2 — Лузеры",
    description:
      "32 пар лузеров оставляют 16 пар. Потом к ним добавятся лузеры из виннеров.",
  },
  {
    key: "stage3w",
    title: "Этап 3 — Виннеры",
    description: "16 пар виннеров дают 8 пар новых виннеров и 8 пар новых лузеров.",
  },
  {
    key: "stage3l",
    title: "Этап 3 — Лузеры",
    description: "32 пар лузеров оставляют 16 пар, к ним прибавятся 8 пар новых лузеров.",
  },
  {
    key: "stage4w",
    title: "Этап 4 — Виннеры",
    description: "8 пар виннеров делятся на 4 пары новых виннеров и 4 пары новых лузеров.",
  },
  {
    key: "stage4l",
    title: "Этап 4 — Лузеры",
    description: "24 пар лузеров оставляют 12 пар, затем добавляются 4 пары из виннеров.",
  },
  {
    key: "stage5l",
    title: "Этап 5 — Лузеры",
    description: "4 пары виннеров без изменений. В лузерах 16 пар отбирают 8 пар.",
  },
  {
    key: "stage6w",
    title: "Этап 6 — Виннеры",
    description: "4 пары виннеров дают 2 пары виннеров и 2 пары лузеров.",
  },
  {
    key: "stage6l",
    title: "Этап 6 — Лузеры",
    description: "8 пары лузеров оставляют 4 пары, затем добавляются 2 пары из виннеров.",
  },
  {
    key: "stage7",
    title: "Этап 7",
    description: "2 пары виннеров и 6 пары лузеров играют на вылет до 4 пар.",
  },
  {
    key: "stage8",
    title: "Этап 8",
    description: "4 пары играют на вылет до двух пар.",
  },
  {
    key: "stage9",
    title: "Финал",
    description: "2 пары финалистов играют до определения чемпиона.",
  },
];

export const matchRules: Record<ChampionshipRule["gamesCount"], ChampionshipRule> = {
  32: {
    gamesCount: 32,
    stages: stageRules32,
  },
  64: {
    gamesCount: 64,
    stages: stageRules64,
  },
  128: {
    gamesCount: 128,
    stages: stageRules128,
  },
};

export function getMatchRules(gamesCount: ChampionshipRule["gamesCount"]): ChampionshipRule {
  return matchRules[gamesCount];
}
