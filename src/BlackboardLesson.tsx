import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { AcademyLesson } from "./academy";
import { EcgViewer } from "./EcgViewer";
import { HeartActivation } from "./HeartActivation";

export function BlackboardLesson({ lesson, completed, onComplete }: {
  lesson: AcademyLesson;
  completed: boolean;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0);
  const [written, setWritten] = useState(0);
  const [paused, setPaused] = useState(false);
  const current = lesson.steps[step];
  const sentences = useMemo(
    () => current.explanation.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [current.explanation],
    [current],
  );
  const stage = written < sentences.length ? "write" : written === sentences.length ? "show" : "practice";

  useEffect(() => {
    setWritten(0);
    setPaused(false);
  }, [step, lesson.id]);

  useEffect(() => {
    if (paused || written >= sentences.length + 1) return;
    const timer = window.setTimeout(() => setWritten(value => value + 1), written === 0 ? 450 : 1150);
    return () => window.clearTimeout(timer);
  }, [paused, written, sentences.length]);

  const advance = () => {
    if (written < sentences.length + 1) return setWritten(sentences.length + 1);
    if (step < lesson.steps.length - 1) return setStep(value => value + 1);
    onComplete();
  };

  return <div className="board-shell">
    <div className="board-toolbar">
      <div><span>LOUSA GUIADA</span><b>{step + 1} de {lesson.steps.length}</b></div>
      <div className="board-progress" aria-label={`Etapa ${step + 1} de ${lesson.steps.length}`}><i style={{width:`${(step + 1) / lesson.steps.length * 100}%`}}/></div>
      <button className="board-control" onClick={() => setPaused(value => !value)}>{paused ? "Continuar animação" : "Pausar"}</button>
    </div>
    <div className={`blackboard board-${stage}`}>
      <div className="chalk-dust"/>
      <div className="board-copy">
        <small>PASSO {String(step + 1).padStart(2,"0")}</small>
        <h3>{current.title}</h3>
        <div className="chalk-writing" aria-live="polite">
          {sentences.slice(0,written).map((sentence,index)=><p key={`${step}-${index}`} style={{"--line":index} as CSSProperties}>{sentence.trim()}</p>)}
          {written < sentences.length && <span className="chalk-cursor">|</span>}
        </div>
      </div>
      <div className="board-demo"><span>AGORA, NO TRAÇADO</span><EcgViewer trace={lesson.visual}/><HeartActivation mode={lesson.visual}/></div>
      <aside className="board-check"><small>PARE E EXPLIQUE</small><p>{current.checkpoint}</p></aside>
    </div>
    <div className="board-nav">
      <button className="secondary" disabled={step===0} onClick={()=>setStep(value=>value-1)}>← Voltar</button>
      <span>{stage==="write"?"A lousa está construindo o conceito…":stage==="show"?"Observe a aplicação visual.":"Explique com suas palavras antes de avançar."}</span>
      <button className="primary" onClick={advance}>{written < sentences.length + 1?"Mostrar tudo":step < lesson.steps.length-1?"Próxima etapa →":completed?"Aula já concluída ✓":"Concluir aula ✓"}</button>
    </div>
  </div>;
}
