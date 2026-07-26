import React, { useEffect, useMemo, useState } from "react";
import "./questionVisuals.css";
import "./ecgVisual.css";
import { createRoot } from "react-dom/client";
import { EcgViewer } from "./EcgViewer";
import { HeartActivation } from "./HeartActivation";
import { BlackboardLesson } from "./BlackboardLesson";
import { academyLessons, academyTrackNames, type AcademyLesson } from "./academy";
import { feedbackProfiles, lessons, moduleInfo, questions, references, skillNames } from "./data";
import { classifyAttempt, emptyProgress, loadProgress, nextAdaptiveQuestion, recommendation, saveProgress, scheduleReview, skillMastery } from "./engine";
import type { ModuleId, Progress, Question } from "./types";
import "./styles.css";

type View = "home" | "academy" | "academyLesson" | "path" | "lesson" | "exercise" | "dashboard" | "errors" | "settings";
const moduleOrder: ModuleId[] = ["ondas","ritmo","bloqueios"];
const academyPracticeMap: Record<string,string> = Object.fromEntries(
  academyLessons.map(lesson=>[lesson.id,`academy-${lesson.id}-s01-q1`]),
);

function App(){
  const [view,setView]=useState<View>("home");
  const [progress,setProgress]=useState<Progress>(()=>loadProgress());
  const [module,setModule]=useState<ModuleId>("ondas");
  const [question,setQuestion]=useState<Question>(()=>questions[0]);
  const [academyLesson,setAcademyLesson]=useState<AcademyLesson>(()=>academyLessons[0]);
  const [selected,setSelected]=useState<number|null>(null);
  const [answered,setAnswered]=useState(false);
  const [hints,setHints]=useState(0);
  const [confidence,setConfidence]=useState(3);
  const [started,setStarted]=useState(Date.now());
  const mastery=useMemo(()=>skillMastery(progress),[progress]);
  const lesson=lessons.find(l=>l.module===module)!;
  const due=progress.reviews.filter(r=>!r.understood&&new Date(r.dueAt)<=new Date()).length;
  useEffect(()=>saveProgress(progress),[progress]);

  const level=Math.floor(progress.points/300)+1;
  const openModule=(id:ModuleId)=>{
    const idx=moduleOrder.indexOf(id); const unlocked=idx===0||progress.attempts.some(a=>a.module===moduleOrder[idx-1]&&a.correct);
    if(!unlocked)return; setModule(id); setView("lesson");
  };
  const begin=(qst?:Question)=>{
    const qn=qst||nextAdaptiveQuestion(progress,module);
    if(!qn){setView("dashboard");return;}
    setQuestion(qn);setSelected(null);setAnswered(false);setHints(0);setStarted(Date.now());setView("exercise");
  };
  const answer=()=>{
    if(selected===null)return;
    const prior=progress.attempts.filter(a=>a.questionId===question.id).length;
    const attempt=classifyAttempt(question,selected,Math.max(1,Math.round((Date.now()-started)/1000)),hints,confidence,prior);
    const old=progress.reviews.find(r=>r.questionId===question.id);
    const review=scheduleReview(old,attempt);
    const earned=attempt.correct?Math.round(question.points*(hints?0.85:1)):5;
    const nextAchievements=[...progress.achievements];
    if(progress.attempts.length===0&&!nextAchievements.includes("Primeiro traçado"))nextAchievements.push("Primeiro traçado");
    if(progress.streak+1>=5&&attempt.correct&&!nextAchievements.includes("Cinco com método"))nextAchievements.push("Cinco com método");
    setProgress(p=>({...p,points:p.points+earned,streak:attempt.correct?p.streak+1:0,
      attempts:[...p.attempts,attempt],reviews:[...p.reviews.filter(r=>r.questionId!==question.id),review],
      completedChallenges:attempt.correct?[...new Set([...p.completedChallenges,question.id])]:p.completedChallenges,
      achievements:nextAchievements}));
    setAnswered(true);
  };
  const nav=(v:View,label:string)=><button className={view===v?"active":""} onClick={()=>setView(v)}>{label}</button>;
  return <div className="app-shell">
    <header><button className="brand" onClick={()=>setView("home")}><span className="pulse">⌁</span><b>TRAÇADO</b><small>ECG TRAINER</small></button>
      <nav>{nav("academy","Aulas")}{nav("path","Desafios")}{nav("dashboard","Domínio")}{nav("errors",`Erros ${due?`· ${due}`:""}`)}</nav>
      <div className="score"><span>NÍVEL {level}</span><strong>{progress.points} XP</strong></div>
    </header>
    <main>
      {view==="home"&&<Home progress={progress} start={()=>openModule("ondas")} dashboard={()=>setView("dashboard")}/>}
      {view==="academy"&&<Academy progress={progress} open={(lesson)=>{setAcademyLesson(lesson);setView("academyLesson")}}/>}
      {view==="academyLesson"&&<AcademyLessonView lesson={academyLesson} completed={progress.completedAcademyLessons.includes(academyLesson.id)} complete={()=>setProgress(p=>({...p,completedAcademyLessons:[...new Set([...p.completedAcademyLessons,academyLesson.id])],points:p.completedAcademyLessons.includes(academyLesson.id)?p.points:p.points+30}))} back={()=>setView("academy")} practice={academyPracticeMap[academyLesson.id]?()=>begin(questions.find(q=>q.id===academyPracticeMap[academyLesson.id])):undefined}/>}
      {view==="path"&&<Path progress={progress} openModule={openModule} openLesson={(nextLesson)=>{setAcademyLesson(nextLesson);setView("academyLesson")}}/>}
      {view==="lesson"&&<LessonView lesson={lesson} complete={()=>{setProgress(p=>({...p,completedLessons:[...new Set([...p.completedLessons,lesson.id])]}));begin(questions.find(q=>q.module===module));}}/>}
      {view==="exercise"&&<Exercise question={question} selected={selected} setSelected={setSelected} answered={answered} answer={answer} hints={hints} setHints={setHints} confidence={confidence} setConfidence={setConfidence} next={()=>begin(nextAdaptiveQuestion(progress,module))}/>}
      {view==="dashboard"&&<Dashboard progress={progress} mastery={mastery} review={()=>begin(nextAdaptiveQuestion(progress))}/>}
      {view==="errors"&&<Errors progress={progress} retry={(q)=>begin(q)} mark={(id)=>setProgress(p=>({...p,reviews:p.reviews.map(r=>r.questionId===id?{...r,understood:true}:r)}))}/>}
      {view==="settings"&&<Settings progress={progress} importProgress={setProgress} reset={()=>setProgress({...emptyProgress})}/>}
    </main>
    <footer><span>Beta local · dados salvos neste dispositivo</span><button onClick={()=>setView("settings")}>Dados e referências</button></footer>
  </div>
}

function Home({progress,start,dashboard}:{progress:Progress;start:()=>void;dashboard:()=>void}){
  const completed=new Set(progress.attempts.filter(a=>a.correct).map(a=>a.questionId)).size;
  return <section className="hero">
    <div className="hero-copy"><p className="eyebrow">INTERPRETAÇÃO, NÃO ADIVINHAÇÃO</p><h1>Sua plataforma de<br/><em>estudo de ECG.</em></h1>
      <p className="lead">Um treino progressivo que transforma ondas, intervalos e morfologias em raciocínio sistemático — com revisão feita a partir dos seus erros.</p>
      <div className="hero-actions"><button className="primary" onClick={start}>{progress.attempts.length?"Continuar treino":"Começar pelo básico"} <span>→</span></button><button className="secondary" onClick={dashboard}>Ver meu domínio</button></div>
      <div className="warning">Finalidade exclusivamente educacional. Não use isoladamente para diagnóstico, tratamento ou decisão clínica.</div>
    </div>
    <div className="hero-card"><div className="card-top"><span>PROGRESSO DO BETA</span><b>{progress.completedAcademyLessons.length}/{academyLessons.length} aulas · {completed}/{questions.length} desafios</b></div><EcgViewer trace="normal"/><div className="quick-stats"><div><strong>{progress.completedAcademyLessons.length}</strong><span>aulas concluídas</span></div><div><strong>{progress.completedChallenges.length}</strong><span>desafios concluídos</span></div><div><strong>{progress.reviews.filter(r=>!r.understood).length}</strong><span>revisões</span></div></div></div>
  </section>
}

function Academy({progress,open}:{progress:Progress;open:(lesson:AcademyLesson)=>void}){
  const done=progress.completedAcademyLessons.length;
  const learningOrder=[...academyLessons].sort((a,b)=>a.order-b.order);
  return <section><div className="section-head"><p className="eyebrow">AULAS · DO ZERO AO RACIOCÍNIO CLÍNICO</p><h2>Entenda antes de treinar</h2><p>Sequência autoral baseada no eixo pedagógico do curso estudado. Material apenas mapeado não é tratado como critério revisado.</p></div>
    <div className="completion-summary"><div><span>AULAS CONCLUÍDAS</span><b>{done}/{academyLessons.length}</b></div><div className="completion-bar"><i style={{width:`${done/academyLessons.length*100}%`}}/></div><p>{done===academyLessons.length?"Trilha atual concluída. Continue pelas revisões.":"Cada aula é marcada somente após chegar ao final da lousa guiada."}</p></div>
    <div className="academy-flow">{Object.entries(academyTrackNames).map(([track,label])=><section key={track} className="academy-track">
      <div className="track-label"><span>{label}</span><i/></div>
      <div className="academy-list">{academyLessons.filter(l=>l.track===track).map(l=>{
        const completed=progress.completedAcademyLessons.includes(l.id);
        const index=learningOrder.findIndex(item=>item.id===l.id);
        const prerequisite=index>0?learningOrder[index-1]:undefined;
        const available=completed||!prerequisite||progress.completedAcademyLessons.includes(prerequisite.id);
        return <button key={l.id} disabled={!available} onClick={()=>available&&open(l)} className={`academy-card ${completed?"completed":""} ${available?"":"prerequisite-locked"}`}>
          <span className="academy-order">{completed?"✓":available?String(l.order).padStart(2,"0"):"⌾"}</span>
          <div><small>{l.duration} · {l.steps.length} ETAPAS · {completed?"CONCLUÍDA":available?"DISPONÍVEL":"BLOQUEADA"}</small><h3>{l.title}</h3><p>{l.subtitle}</p>
            {!available&&prerequisite&&<div className="prerequisite-message">É necessário fazer a aula “{prerequisite.title}” para participar desta.</div>}
            <div className={`status ${l.status}`}>{l.status==="reviewed"?"conteúdo revisado":l.status==="mapped"?"aula mapeada · revisão em andamento":"validação pendente"}</div>
          </div><b>{available?"→":"⌾"}</b>
        </button>
      })}</div>
    </section>)}</div>
    <div className="warning">A trilha crescerá com a revisão das videoaulas, apresentações e discussões de casos. Nenhum critério pendente será apresentado como regra definitiva.</div>
  </section>
}

function AcademyLessonView({lesson,completed,complete,back,practice}:{lesson:AcademyLesson;completed:boolean;complete:()=>void;back:()=>void;practice?:()=>void}){
  return <section><button className="back" onClick={back}>← Todas as aulas</button><div className="academy-lesson-head"><div><p className="eyebrow">AULA {String(lesson.order).padStart(2,"0")} · {academyTrackNames[lesson.track]}</p><h2>{lesson.title}</h2><p className="lesson-lead">{lesson.subtitle}</p><div className={`status ${lesson.status}`}>{lesson.status==="reviewed"?"revisada para o beta":lesson.status==="mapped"?"material localizado · revisão em andamento":"conteúdo ainda não liberado como critério"}</div></div><div><EcgViewer trace={lesson.visual}/><HeartActivation mode={lesson.visual}/></div></div>
    <div className="objectives"><span>AO FINAL, VOCÊ DEVE CONSEGUIR</span>{lesson.objectives.map(o=><p key={o}>✓ {o}</p>)}</div>
    {lesson.id==="emer-02"&&<div className="rhythm-gallery">{([["vf","Fibrilação ventricular","chocável"],["pvt","TV sem pulso","chocável"],["asystole","Assistolia","não chocável"],["pea","AESP","não chocável"]] as const).map(([trace,label,kind])=><article key={trace}><EcgViewer trace={trace} compact/><div><b>{label}</b><span className={kind==="chocável"?"shockable":"nonshockable"}>{kind}</span></div></article>)}</div>}
    {lesson.id==="cond-04"&&<div className="rhythm-gallery conduction-gallery">{([["av1","BAV de 1º grau","PR prolongado"],["mobitz1","BAV 2º · Mobitz I","PR aumenta"],["mobitz2","BAV 2º · Mobitz II","falha súbita"],["avcomplete","BAV de 3º grau","dissociação AV"]] as const).map(([trace,label,kind])=><article key={trace}><EcgViewer trace={trace} compact/><div><b>{label}</b><span>{kind}</span></div></article>)}</div>}
    <BlackboardLesson lesson={lesson} completed={completed} onComplete={complete}/>
    <div className="lesson-finish"><div><b>{completed?"Aula concluída e registrada.":"Conclua todas as etapas da lousa."}</b><p>Explique o conceito com suas palavras e só então aplique em um desafio.</p></div>{practice?<button className="primary" disabled={!completed} onClick={practice}>Praticar esta habilidade →</button>:<button className="secondary" disabled>Desafio validado em preparação</button>}</div>
  </section>
}

function Path({progress,openModule,openLesson}:{progress:Progress;openModule:(m:ModuleId)=>void;openLesson:(lesson:AcademyLesson)=>void}){
  const learningOrder=[...academyLessons].sort((a,b)=>a.order-b.order);
  return <section><div className="section-head"><p className="eyebrow">TRILHA INICIAL</p><h2>Do sinal ao raciocínio</h2><p>Os módulos abrem conforme você demonstra os passos anteriores.</p></div>
    <div className="completion-summary"><div><span>DESAFIOS CONCLUÍDOS</span><b>{progress.completedChallenges.length}/{questions.length}</b></div><div className="completion-bar"><i style={{width:`${progress.completedChallenges.length/questions.length*100}%`}}/></div><p>Um desafio conta como concluído depois de uma resposta correta; tentativas e erros continuam registrados.</p></div>
    <div className="module-grid">{moduleOrder.map((id,i)=>{const info=moduleInfo[id];const unlocked=i===0||progress.attempts.some(a=>a.module===moduleOrder[i-1]&&a.correct);const total=questions.filter(q=>q.module===id).length;const correct=new Set(progress.attempts.filter(a=>a.module===id&&a.correct).map(a=>a.questionId)).size;return <button key={id} className={`module-card ${unlocked?"":"locked"}`} onClick={()=>openModule(id)} style={{"--accent":info.color} as React.CSSProperties}><span className="module-no">{correct===total?"✓":info.number}</span><div><small>{unlocked?`${correct}/${total} DESAFIOS · ${correct===total?"CONCLUÍDO":"EM ANDAMENTO"}`:"BLOQUEADO"}</small><h3>{info.title}</h3><p>{info.subtitle}</p><div className="mini-progress"><i style={{width:`${correct/total*100}%`}}/></div></div><b>{unlocked?"→":"⌾"}</b></button>})}</div>
    <div className="phase-head"><div><p className="eyebrow">26 FASES GUIADAS</p><h2>O repertório completo</h2></div><p>Cada fase combina lousa, demonstração visual e desafios próprios. Depois de um acerto, a questão só volta automaticamente se houver erro ou revisão programada.</p></div>
    <div className="phase-grid">{learningOrder.map((lesson,index)=>{
      const prerequisite=index>0?learningOrder[index-1]:undefined;
      const completedLesson=progress.completedAcademyLessons.includes(lesson.id);
      const available=completedLesson||!prerequisite||progress.completedAcademyLessons.includes(prerequisite.id);
      const lessonQuestions=questions.filter(item=>item.topic===lesson.id);
      const completedQuestions=lessonQuestions.filter(item=>progress.completedChallenges.includes(item.id)).length;
      return <article key={lesson.id} className={`phase-card ${available?"":"locked"}`}>
        <div className="phase-title"><span>{String(lesson.order).padStart(2,"0")}</span><div><small>{academyTrackNames[lesson.track]}</small><h3>{lesson.title}</h3></div></div>
        <p>{lesson.subtitle}</p>
        <div className="phase-count"><b>{completedQuestions}/{lessonQuestions.length}</b><span>desafios concluídos</span></div>
        <div className="mini-progress"><i style={{width:`${lessonQuestions.length?completedQuestions/lessonQuestions.length*100:0}%`}}/></div>
        {!available&&prerequisite&&<div className="prerequisite-message">É necessário fazer a aula “{prerequisite.title}” para participar desta.</div>}
        <button className={available?"primary":"secondary"} disabled={!available} onClick={()=>available&&openLesson(lesson)}>{completedLesson?"Rever aula":"Fazer aula"} {available?"→":"⌾"}</button>
      </article>
    })}</div>
  </section>
}

function LessonView({lesson,complete}:{lesson:typeof lessons[number];complete:()=>void}){
  return <section className="lesson-layout"><div><button className="back" onClick={()=>history.back()}>← Aula curta</button><p className="eyebrow">ETAPA 1 · CONCEITO</p><h2>{lesson.title}</h2><p className="lesson-lead">{lesson.shortConcept}</p>
    <div className="explain-tabs"><article><small>EXPLICAÇÃO INTUITIVA</small><p>{lesson.intuitive}</p></article><article><small>EXPLICAÇÃO TÉCNICA</small><p>{lesson.technical}</p></article></div>
    {!lesson.reviewed&&<div className="pending">CONTEÚDO PENDENTE DE VALIDAÇÃO DETALHADA COM O CURSO ESTUDADO</div>}
    <button className="primary" onClick={complete}>Ir ao exercício guiado →</button></div>
    <div className="visual-panel"><span>ETAPA 2 · DEMONSTRAÇÃO VISUAL</span><EcgViewer trace={lesson.visual}/><div className="legend-row"><b>P</b><span>ativação atrial</span><b>QRS</b><span>ativação ventricular</span><b>T</b><span>repolarização ventricular</span></div></div>
  </section>
}

function Exercise({question,selected,setSelected,answered,answer,hints,setHints,confidence,setConfidence,next}:{question:Question;selected:number|null;setSelected:(n:number)=>void;answered:boolean;answer:()=>void;hints:number;setHints:(n:number)=>void;confidence:number;setConfidence:(n:number)=>void;next:()=>void}){
  const correct=selected===question.answer;
  const profile=feedbackProfiles[question.skills[0]];
  return <section className="exercise-layout"><div className="question-panel"><div className="question-meta"><span>{moduleInfo[question.module].title}</span><b>{question.exam?"PROVA DO MÓDULO":question.type.toUpperCase()}</b><i>Dificuldade {question.difficulty}</i></div><h2>{question.prompt}</h2><div className={question.secondaryTrace?"trace-comparison":""}><div>{question.secondaryTrace&&<small>PADRÃO A</small>}<EcgViewer trace={question.trace} focus={question.visualFocus} instruction={question.visualInstruction}/></div>{question.secondaryTrace&&<div><small>PADRÃO B</small><EcgViewer trace={question.secondaryTrace} focus={question.visualFocus} instruction={question.visualInstruction}/></div>}</div>
    <div className="options">{question.options.map((o,i)=><button key={o} disabled={answered} className={`${selected===i?"selected":""} ${answered&&i===question.answer?"correct":""} ${answered&&selected===i&&i!==question.answer?"wrong":""}`} onClick={()=>setSelected(i)}><span>{String.fromCharCode(65+i)}</span>{o}</button>)}</div>
    {!answered&&<div className="answer-bar"><label>Confiança <select value={confidence} onChange={e=>setConfidence(+e.target.value)}><option value="1">1 — chute</option><option value="2">2 — baixa</option><option value="3">3 — média</option><option value="4">4 — alta</option><option value="5">5 — certeza</option></select></label><button className="hint" onClick={()=>setHints(hints+1)}>Dica {hints?`(${hints})`:""}</button><button className="primary" disabled={selected===null} onClick={answer}>Responder</button></div>}
  </div><aside className={`feedback ${answered?"visible":""}`}>{answered?<><p className="eyebrow">{correct?"RACIOCÍNIO CONSISTENTE":"PONTO DE REVISÃO"}</p><h3>{correct?"Boa leitura.":"Vamos localizar o erro."}</h3>
    {!correct&&selected!==null&&<div className="error-diagnosis"><small>VOCÊ MARCOU</small><b>{question.options[selected]}</b><p>{question.optionFeedback?.[selected]||`Essa alternativa não explica o elemento central pedido. Compare-a com “${question.options[question.answer]}” e identifique qual etapa do raciocínio foi trocada.`}</p></div>}
    <p>{question.explanation}</p><div className="feedback-note"><b>Outra forma de pensar</b><p>{question.alternativeExplanation}</p></div>
    {profile&&<div className="deep-feedback">
      <details open={!correct}><summary>Por que esse erro acontece?</summary><p>{profile.reasoning}</p></details>
      <details><summary>Comparar outros exemplos e vetores</summary><div className="feedback-examples">{profile.examples.map(example=><article key={example.label}><b>{example.label}</b><p>{example.text}</p></article>)}</div></details>
      {profile.measurements&&<details><summary>Medidas e valores de referência</summary><div className="measure-table">{profile.measurements.map(item=><div key={item.label}><b>{item.label}</b><strong>{item.value}</strong><span>{item.note}</span></div>)}</div></details>}
      <details><summary>Do comum ao potencialmente grave</summary><div className="spectrum">{profile.spectrum.map(item=><article className={item.tone} key={item.label}><b>{item.label}</b><p>{item.text}</p></article>)}</div></details>
    </div>}
    {!question.reviewed&&<div className="pending">CRITÉRIO AINDA NÃO APROVADO PARA USO CLÍNICO</div>}<button className="primary" onClick={next}>Próximo treino →</button></>:<><p className="eyebrow">ETAPA 3 · EXERCÍCIO</p><h3>Responda pelo critério</h3><p>Não marque apenas o diagnóstico. Observe o traçado, escolha uma alternativa e informe sua confiança.</p>{hints>0&&<div className="feedback-note"><b>Dica</b><p>Use a ordem: duração → morfologia → conclusão. Procure o elemento principal pedido.</p></div>}</>}</aside></section>
}

function Dashboard({progress,mastery,review}:{progress:Progress;mastery:Record<string,number>;review:()=>void}){
  const avg=progress.attempts.length?Math.round(progress.attempts.reduce((s,a)=>s+a.timeSeconds,0)/progress.attempts.length):0;
  return <section><div className="section-head row"><div><p className="eyebrow">PERFIL DE DOMÍNIO</p><h2>O que seu raciocínio revela</h2></div><button className="primary" onClick={review}>Treino recomendado →</button></div>
    <div className="dashboard-grid"><div className="mastery-card">{Object.entries(skillNames).map(([id,name])=>{const assessed=mastery[id]!==undefined;const value=mastery[id]??0;return <div className={`skill ${assessed?"":"unassessed"}`} key={id}><div><span>{name}</span><b>{assessed?`${value}%`:"—"}</b></div><div className="skill-bar"><i style={{width:`${value}%`}}/></div><small>{!assessed?"não avaliado":value>=80?"dominado":value>=50?"em desenvolvimento":"precisa de revisão"}</small></div>})}</div>
    <div><div className="insight-card"><span>RECOMENDAÇÃO ADAPTATIVA</span><h3>{recommendation(progress)}</h3><p>O motor considera acertos, habilidade envolvida, confiança, dicas, tempo e recorrência.</p></div><div className="stat-grid"><div><b>{progress.attempts.length}</b><span>tentativas</span></div><div><b>{avg}s</b><span>tempo médio</span></div><div><b>{progress.attempts.filter(a=>a.hintsUsed).length}</b><span>com dicas</span></div><div><b>{progress.achievements.length}</b><span>conquistas</span></div></div></div></div>
  </section>
}

function Errors({progress,retry,mark}:{progress:Progress;retry:(q:Question)=>void;mark:(id:string)=>void}){
  const entries=progress.reviews.filter(r=>!r.understood).map(r=>({review:r,q:questions.find(q=>q.id===r.questionId)!,attempts:progress.attempts.filter(a=>a.questionId===r.questionId)})).filter(x=>x.q&&x.attempts.some(a=>!a.correct));
  return <section><div className="section-head"><p className="eyebrow">CADERNO DE ERROS</p><h2>Erro útil é erro localizado</h2><p>Cada item registra a habilidade, o tipo de falha e quando deve reaparecer.</p></div>
    <div className="error-list">{entries.length?entries.map(({review,q,attempts})=>{const lastError=attempts.filter(a=>!a.correct).at(-1)!;return <article key={q.id}><div><span>{moduleInfo[q.module].title}</span><h3>{q.prompt}</h3><p>{lastError.errorType?.replaceAll("_"," ")||"erro registrado"} · ocorreu {attempts.filter(a=>!a.correct).length} vez(es)</p><small>Revisão: {new Date(review.dueAt).toLocaleDateString("pt-BR")}</small></div><div><button className="secondary" onClick={()=>mark(q.id)}>Marcar compreendido</button><button className="primary" onClick={()=>retry(q)}>Repetir</button></div></article>}):<div className="empty"><h3>Seu caderno está limpo.</h3><p>Questões respondidas incorretamente aparecerão aqui; acertos com baixa confiança permanecem apenas na revisão espaçada.</p></div>}</div>
  </section>
}

function Settings({progress,importProgress,reset}:{progress:Progress;importProgress:(p:Progress)=>void;reset:()=>void}){
  const exportData=()=>{const blob=new Blob([JSON.stringify(progress,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="progresso-ecg.json";a.click();URL.revokeObjectURL(a.href)};
  const importData=(e:React.ChangeEvent<HTMLInputElement>)=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{importProgress(JSON.parse(String(r.result)))}catch{alert("Arquivo inválido.")}};r.readAsText(f)};
  return <section><div className="section-head"><p className="eyebrow">DADOS E SEGURANÇA</p><h2>Seu progresso fica com você</h2><p>Nenhuma resposta sai do dispositivo neste beta.</p></div><div className="settings-grid"><article><h3>Progresso local</h3><p>Exporte uma cópia, importe em outro navegador ou reinicie a trilha.</p><button className="primary" onClick={exportData}>Exportar JSON</button><label className="secondary file">Importar JSON<input type="file" accept=".json" onChange={importData}/></label><button className="danger" onClick={()=>confirm("Apagar todo o progresso local?")&&reset()}>Apagar todos os dados</button></article><article><h3>Referências registradas</h3>{references.map(r=><div className="reference" key={r.id}><b>{r.title}</b><span>{r.role==="pedagogical"?"Base pedagógica":"Validação complementar"}</span><p>{r.note}</p>{r.url&&<a href={r.url} target="_blank">Abrir referência ↗</a>}</div>)}</article></div></section>
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App/></React.StrictMode>);
