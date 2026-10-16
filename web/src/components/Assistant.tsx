import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, ApiError, date, valueText } from "../lib/api";
import type { Mode, Sensor } from "../lib/types";
import { Button, Icon } from "./ui";
type Config = { enabled: boolean; provider: string; model: string | null };
type Reply = {
  answer: string;
  model: string;
  source: string;
  context: Sensor[];
};
type Turn = { question: string; reply: Reply };
export default function Assistant({ mode }: { mode: Mode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const controller = useRef<AbortController | null>(null);
  const [config, setConfig] = useState<Config | null>(null);
  const [configError, setConfigError] = useState("");
  const [question, setQuestion] = useState("");
  const [share, setShare] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [error, setError] = useState("");
  const [login, setLogin] = useState(false);
  const [pending, setPending] = useState(false);
  const output = useRef<HTMLDivElement>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    output.current?.scrollTo({
      top: output.current.scrollHeight,
      behavior: "instant",
    });
  }, [turns, pending]);
  async function loadConfig() {
    setConfigError("");
    try {
      setConfig(await api<Config>("/api/assistant/config"));
    } catch {
      setConfigError("Impossible de vérifier la disponibilité de l’assistant.");
    }
  }
  function open() {
    dialog.current?.showModal();
    void loadConfig();
  }
  function close() {
    controller.current?.abort();
    dialog.current?.close();
    trigger.current?.focus();
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending || !question.trim() || !config?.enabled) return;
    const current = new AbortController();
    controller.current = current;
    const timer = window.setTimeout(() => current.abort(), 35000);
    setPending(true);
    setError("");
    setLogin(false);
    const text = question.trim();
    try {
      const reply = await api<Reply>("/api/assistant/messages", {
        method: "POST",
        signal: current.signal,
        body: JSON.stringify({
          question: text,
          mode,
          share_observations: share,
          history: turns
            .filter((turn) => share || !turn.reply.context.length)
            .slice(-3)
            .flatMap((turn) => [
              { role: "user", content: turn.question },
              { role: "assistant", content: turn.reply.answer.slice(0, 2000) },
            ]),
        }),
      });
      setTurns((previous) =>
        [...previous, { question: text, reply }].slice(-10),
      );
      setQuestion("");
    } catch (e) {
      setLogin(e instanceof ApiError && e.status === 401);
      setError(
        e instanceof Error && e.name === "AbortError"
          ? "La demande a été interrompue. Vous pouvez réessayer."
          : e instanceof Error
            ? e.message
            : "Envoi impossible.",
      );
    } finally {
      window.clearTimeout(timer);
      setPending(false);
    }
  }
  return (
    <>
      <button
        type="button"
        aria-label="Assistant IA"
        className="assistant-launch"
        ref={trigger}
        onClick={open}
      >
        <Icon name="spark" />
        <span>Assistant IA</span>
      </button>
      <dialog
        ref={dialog}
        className="assistant-dialog"
        aria-labelledby="assistant-title"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
      >
        <div className="assistant-surface">
          <header>
            <div>
              <p className="eyebrow">ECOTWIN ASSISTANT</p>
              <h2 id="assistant-title">Une question sur votre bâtiment ?</h2>
            </div>
            <Button
              className="button ghost"
              onClick={close}
              aria-label="Fermer l’assistant"
            >
              Fermer
            </Button>
          </header>
          <div className="assistant-messages" ref={output}>
            <p className="notice">
              {mode === "demo"
                ? "Vous explorez des données de démonstration."
                : "Vous consultez les données du site pilote partagé."}{" "}
              Les réponses IA peuvent contenir des erreurs. Vérifiez toute
              recommandation avant d’agir.
            </p>
            {!config && !configError && (
              <p role="status">Vérification de la disponibilité…</p>
            )}
            {configError && (
              <>
                <p role="alert">{configError}</p>
                <Button
                  className="button secondary"
                  onClick={() => void loadConfig()}
                >
                  Réessayer
                </Button>
              </>
            )}
            {config && !config.enabled && (
              <p role="status">
                L’assistant n’est pas encore activé. Les mesures et les analyses
                par seuils restent accessibles dans le dashboard.
              </p>
            )}
            {config?.enabled && !turns.length && (
              <p>
                Demandez une explication, comparez les mesures ou préparez une
                vérification sur site. L’assistant ne pilote aucun équipement.
              </p>
            )}
            {turns.map((turn, index) => (
              <article className="chat-turn" key={index}>
                <h3>Vous</h3>
                <p>{turn.question}</p>
                <h3>EcoTwin · {turn.reply.model}</h3>
                <p className="chat-answer">{turn.reply.answer}</p>
                {turn.reply.context.length > 0 ? (
                  <details>
                    <summary>
                      Observations transmises ·{" "}
                      {turn.reply.source === "demo" ? "démo" : "source réelle"}
                    </summary>
                    <ul>
                      {turn.reply.context.map((sensor) => (
                        <li key={sensor.id}>
                          {sensor.name} : {valueText(sensor.value)}{" "}
                          {sensor.unit} ·{" "}
                          {sensor.time
                            ? date.format(new Date(sensor.time))
                            : "date absente"}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <small>
                    Aucune observation transmise pour cette réponse.
                  </small>
                )}
              </article>
            ))}
            <div role="status" aria-live="polite">
              {pending && "L’assistant prépare sa réponse…"}
            </div>
          </div>
          <form onSubmit={submit}>
            <label className="share-observations">
              <input
                type="checkbox"
                checked={share}
                onChange={(e) => setShare(e.target.checked)}
              />
              J’autorise l’envoi des 8 dernières mesures{" "}
              {mode === "demo" ? "de démonstration" : "du site"} à OpenAI avec
              mes questions.
            </label>
            <p className="quiet">
              Les questions et les réponses restent en mémoire dans cet onglet.
              Les 3 derniers échanges sont transmis pour garder le contexte.
              OpenAI applique sa politique de conservation. N’envoyez aucune
              donnée confidentielle sans autorisation.
            </p>
            <label htmlFor="assistant-question">Votre question</label>
            <textarea
              id="assistant-question"
              autoFocus
              rows={3}
              maxLength={2000}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={!config?.enabled}
              required
            />
            <p role="alert" className="form-error">
              {error}
            </p>
            {login && (
              <Link to="/login">Se connecter pour utiliser l’assistant</Link>
            )}
            <div className="assistant-form-actions">
              <span className="quiet">10 questions / heure / compte</span>
              <Button
                type="submit"
                disabled={pending || !config?.enabled || !question.trim()}
              >
                {pending ? "Envoi…" : "Envoyer"}
              </Button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
