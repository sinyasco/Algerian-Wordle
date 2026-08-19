"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Brand, Button, useI18n } from "./AppShell";

type Mark = "correct" | "present" | "absent";

type Row = {
  guess: string;
  result: Mark[];
};

type EndState = {
  status: "won" | "lost";
  word: string;
};

const LATIN = [
  "QWERTYUIOP",
  "ASDFGHJKL",
  "↵ZXCVBNM⌫",
];

const ARABIC = [
  "ضصثقفغعهخحج",
  "شسيبلاتنمكط",
  "↵ئءؤرىةوزظد⌫",
];

export default function Game() {
  return (
    <AppShell>
      <GameInner />
    </AppShell>
  );
}

function GameInner() {
  const { t } = useI18n();
  const router = useRouter();

  const [lang, setLang] =
    useState<"arabic" | "arabizi">("arabizi");

  const [sessionId, setSessionId] = useState("");
  const [wordLength, setWordLength] = useState<number | null>(null);

  const [rows, setRows] = useState<Row[]>([]);
  const [input, setInput] = useState("");
  const [keys, setKeys] = useState<Record<string, Mark>>({});

  const [end, setEnd] = useState<EndState | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const start = useCallback(async () => {
    setLoading(true);
    setError("");
    setSessionId("");
    setWordLength(null);
    setRows([]);
    setInput("");
    setKeys({});
    setEnd(null);

    const language = (
      sessionStorage.getItem("gameLanguage") || "arabizi"
    ) as "arabic" | "arabizi";

    setLang(language);

    try {
      const response = await fetch("/api/game/start", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to start the game");
        return;
      }

      setSessionId(data.sessionId);
      setWordLength(data.wordLength);
    } catch {
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    start();
  }, [start]);

  function handleKey(key: string) {
    if (
      end ||
      loading ||
      submitting ||
      wordLength === null
    ) {
      return;
    }

    if (key === "⌫") {
      setInput((current) =>
        Array.from(current).slice(0, -1).join("")
      );

      return;
    }

    if (key === "↵") {
      submit();
      return;
    }

    setInput((current) => {
      if (Array.from(current).length >= wordLength) {
        return current;
      }

      return current + key;
    });
  }

  async function submit() {
    if (
      submitting ||
      !sessionId ||
      wordLength === null ||
      end
    ) {
      return;
    }

    if (Array.from(input).length !== wordLength) {
      setError("Complete the word first");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/game/guess", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          guess: input,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to submit the word");
        return;
      }

      const result = data.result as Mark[];

      setRows((currentRows) => [
        ...currentRows,
        {
          guess: input,
          result,
        },
      ]);

      setKeys((currentKeys) => {
        const updatedKeys = { ...currentKeys };

        const rank: Record<Mark, number> = {
          absent: 0,
          present: 1,
          correct: 2,
        };

        Array.from(input).forEach((character, index) => {
          const newMark = result[index];
          const currentMark = updatedKeys[character];

          if (
            !currentMark ||
            rank[newMark] > rank[currentMark]
          ) {
            updatedKeys[character] = newMark;
          }
        });

        return updatedKeys;
      });

      setInput("");

      if (data.status !== "in_progress") {
        setTimeout(() => {
          setEnd({
            status: data.status,
            word: data.word,
          });
        }, 550);
      }
    } catch {
      setError("Unable to connect to the server");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || wordLength === null) {
    return (
      <main className="game">
        <Brand compact />

        <div className="game-loading">
          <p>{t.loading}</p>
        </div>
      </main>
    );
  }

  const blankRows = Array.from(
    { length: 6 },
    (_, index) => index
  );

  const displayedRows = [
    ...rows,
    {
      guess: input,
      result: [] as Mark[],
    },
  ];

  const keyboardRows =
    lang === "arabic" ? ARABIC : LATIN;

  return (
    <main className="game">
      <Brand compact />

      <div className="chips">
        <span>
          {t.language}:{" "}
          <b>
            {lang === "arabic" ? "العربية" : "Arabizi"}
          </b>
        </span>
      </div>

      <div
        className="board"
        dir={lang === "arabic" ? "rtl" : "ltr"}
      >
        {blankRows.map((rowIndex) => (
          <div className="board-row" key={rowIndex}>
            {Array.from(
              { length: wordLength },
              (_, columnIndex) => {
                const row = displayedRows[rowIndex];

                const character = row
                  ? Array.from(row.guess)[columnIndex] || ""
                  : "";

                const mark = row?.result[columnIndex];

                return (
                  <div
                    key={columnIndex}
                    className={`tile ${
                      character ? "filled" : ""
                    } ${mark || ""}`}
                  >
                    {character}
                  </div>
                );
              }
            )}
          </div>
        ))}
      </div>

      {error && (
        <p className="game-error" role="alert">
          {error}
        </p>
      )}

      <div
        className="keyboard"
        dir={lang === "arabic" ? "rtl" : "ltr"}
      >
        {keyboardRows.map((keyboardRow, rowIndex) => (
          <div key={rowIndex}>
            {Array.from(keyboardRow).map((key) => (
              <button
                key={key}
                type="button"
                disabled={submitting}
                onClick={() => handleKey(key)}
                className={`${
                  key === "↵" || key === "⌫"
                    ? "wide"
                    : ""
                } ${keys[key] || ""}`}
              >
                {key === "↵" ? "ENTER" : key}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="game-actions">
        <button type="button" onClick={start}>
          {t.restart}
        </button>

        <button
          type="button"
          onClick={() => router.push("/menu")}
        >
          {t.menu}
        </button>
      </div>

      {end && (
        <div className="overlay">
          <div className="overlay-card">
            <div className="emoji">
              {end.status === "won" ? "🎉" : "😢"}
            </div>

            <h2 className={end.status}>
              {end.status === "won"
                ? t.won
                : t.lost}
            </h2>

            <p>
              {t.word}: <b>{end.word}</b>
            </p>

            <div>
              <Button kind="teal" onClick={start}>
                {t.restart}
              </Button>

              <Button
                kind="secondary"
                onClick={() => router.push("/menu")}
              >
                {t.menu}
              </Button>
            </div>

            {end.status === "won" && (
              <div className="confetti">
                {Array.from(
                  { length: 24 },
                  (_, index) => (
                    <i key={index} />
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}