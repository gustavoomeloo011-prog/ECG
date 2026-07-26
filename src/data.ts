import type { Lesson, Question, ReferenceItem, SkillId } from "./types";
import { academyLessons, type AcademyLesson } from "./academy";

export const skillNames: Record<SkillId, string> = {
  onda_p: "Onda P", intervalo_pr: "Intervalo PR", complexo_qrs: "Complexo QRS",
  segmento_st: "Segmento ST", onda_t: "Onda T", frequencia: "Frequência",
  regularidade: "Regularidade", ritmo_sinusal: "Ritmo sinusal",
  qrs_alargado: "Duração do QRS", morfologia_v1: "Morfologia em V1",
  morfologia_lateral: "Morfologia lateral", diferenciar_brd_bre: "BRD × BRE",
  fundamentos_eletricos: "Fundamentos elétricos", leitura_sistematica: "Leitura sistemática",
  sobrecargas: "Sobrecargas", conducao_av: "Condução AV", arritmias: "Arritmias",
  repolarizacao: "Repolarização", marcapasso: "Marcapasso",
  metodos_complementares: "Métodos complementares", emergencias: "Emergências",
};

export const moduleInfo = {
  ondas: { number: "01", title: "Ondas e intervalos", subtitle: "Aprenda a linguagem do traçado", color: "#58d6b5" },
  ritmo: { number: "02", title: "Frequência e ritmo", subtitle: "Transforme repetição em raciocínio", color: "#ffbd70" },
  bloqueios: { number: "03", title: "Bloqueios de ramo", subtitle: "Leia a ativação ventricular tardia", color: "#ee7b72" },
} as const;

export interface FeedbackProfile {
  reasoning: string;
  examples: {label:string; text:string}[];
  measurements?: {label:string; value:string; note:string}[];
  spectrum: {label:string; tone:"common"|"attention"|"urgent"; text:string}[];
}

export const feedbackProfiles: Partial<Record<SkillId,FeedbackProfile>> = {
  fundamentos_eletricos:{
    reasoning:"O erro mais comum é tratar uma onda como um desenho fixo. A forma depende da direção e da magnitude do vetor naquele instante, projetadas sobre o eixo da derivação.",
    examples:[
      {label:"Aproximação",text:"Vetor dirigido ao polo positivo tende a produzir deflexão positiva."},
      {label:"Afastamento",text:"Vetor que se afasta do polo positivo tende a produzir deflexão negativa."},
      {label:"Perpendicular",text:"Uma força aproximadamente perpendicular pode gerar pequena deflexão ou complexo bifásico."},
      {label:"Alça vetorial",text:"Vários vetores instantâneos sucessivos formam uma trajetória; cada derivação mostra uma projeção diferente dessa alça."},
    ],
    measurements:[
      {label:"Calibração usual",value:"25 mm/s · 10 mm/mV",note:"Confirme sempre no registro antes de medir tempo ou voltagem."},
      {label:"1 quadrado pequeno",value:"40 ms · 0,1 mV",note:"Valores válidos quando velocidade e ganho são os usuais."},
      {label:"1 quadrado grande",value:"200 ms · 0,5 mV",note:"Cinco quadrados grandes correspondem a 1 segundo."},
    ],
    spectrum:[
      {label:"Variação comum",tone:"common",text:"Uma mesma ativação pode ser positiva em uma derivação e negativa em outra."},
      {label:"Exige atenção",tone:"attention",text:"Uma morfologia inesperada deve ser conferida em derivações vizinhas, calibração e posicionamento dos eletrodos."},
      {label:"Situação crítica",tone:"urgent",text:"Atividade elétrica no monitor não comprova pulso ou contração eficaz; em contexto real, avaliação clínica imediata é indispensável."},
    ],
  },
  leitura_sistematica:{
    reasoning:"Uma medida isolada perde valor quando o início, o fim, a calibração ou a derivação estão errados. O raciocínio correto começa validando o registro.",
    examples:[
      {label:"PR",text:"É medido do início da onda P ao início do QRS; não começa no fim da P."},
      {label:"QRS",text:"Meça do primeiro desvio do basal ao retorno final do complexo, conferindo mais de uma derivação."},
      {label:"ST",text:"Começa no ponto J, após o fim do QRS; sua interpretação depende das derivações contíguas e do contexto."},
    ],
    measurements:[
      {label:"Onda P",value:"geralmente <120 ms",note:"Amplitude e duração dependem da derivação e do contexto."},
      {label:"Intervalo PR",value:"120–200 ms em adultos",note:"Frequência, idade e situação clínica podem modificar a interpretação."},
      {label:"QRS",value:"<120 ms para não ser classificado como QRS largo",note:"Valores >110 ms já podem ser anormais; bloqueio completo exige também morfologia compatível."},
    ],
    spectrum:[
      {label:"Comum",tone:"common",text:"Pequenas diferenças entre derivações ou medição manual e automática podem ocorrer."},
      {label:"Limítrofe",tone:"attention",text:"Valor próximo do limite pede nova medição, outra derivação e conferência da calibração."},
      {label:"Importante",tone:"urgent",text:"Alteração nova associada a sintomas ou mudanças de ST/T exige avaliação clínica; o jogo não define conduta."},
    ],
  },
  sobrecargas:{
    reasoning:"Voltagem alta não equivale automaticamente a hipertrofia. Idade, sexo, biotipo, posicionamento dos eletrodos e bloqueios alteram a sensibilidade dos critérios.",
    examples:[
      {label:"Força atrial direita",text:"P mais alta nas derivações inferiores é uma pista; descreva amplitude e derivações antes do rótulo."},
      {label:"Força atrial esquerda",text:"P prolongada e componente terminal negativo em V1 são pistas que devem ser integradas."},
      {label:"Força ventricular",text:"Voltagem, eixo, progressão precordial e repolarização precisam formar um conjunto coerente."},
    ],
    measurements:[
      {label:"P em adultos",value:"duração ≥120 ms é uma pista de atraso atrial",note:"Não determina isoladamente aumento anatômico."},
      {label:"P inferior",value:">2,5 mm é uma pista de força atrial direita",note:"Exige morfologia e contexto compatíveis."},
      {label:"Sokolow–Lyon",value:"S em V1 + R em V5/V6 ≥35 mm",note:"É apenas um critério de voltagem para HVE, com limitações importantes."},
    ],
    spectrum:[
      {label:"Comum",tone:"common",text:"Voltagem alta isolada pode ocorrer em pessoas jovens ou magras."},
      {label:"Associado",tone:"attention",text:"Voltagem com eixo e alterações secundárias de ST/T aumenta a coerência do padrão."},
      {label:"Mais importante",tone:"urgent",text:"ECG não mede massa ou espessura diretamente; suspeita relevante deve ser integrada a imagem e contexto clínico."},
    ],
  },
  conducao_av:{
    reasoning:"Bloqueio AV é uma relação temporal entre P e QRS. Uma única pausa ou uma única medida de PR não descreve a dinâmica.",
    examples:[
      {label:"1º grau",text:"Todas as ondas P conduzem; o PR permanece prolongado."},
      {label:"Mobitz I",text:"O PR se modifica progressivamente antes de uma P não conduzida."},
      {label:"Mobitz II",text:"Uma P deixa de conduzir sem o prolongamento progressivo típico do tipo I."},
      {label:"Bloqueio total",text:"P e QRS mantêm ritmos independentes, sem relação fixa."},
    ],
    measurements:[
      {label:"PR prolongado",value:">200 ms em adultos",note:"Com condução 1:1, descreve atraso AV de primeiro grau."},
      {label:"Condução 2:1",value:"1 QRS para cada 2 ondas P",note:"O traçado isolado pode não permitir classificar como Mobitz I ou II."},
    ],
    spectrum:[
      {label:"Menor grau",tone:"common",text:"Atraso AV de primeiro grau mantém condução 1:1."},
      {label:"Intermediário",tone:"attention",text:"Segundo grau apresenta falha intermitente de condução e exige análise de vários ciclos."},
      {label:"Maior gravidade potencial",tone:"urgent",text:"Bloqueio avançado ou total pode ser emergência quando associado a sintomas ou instabilidade."},
    ],
  },
  arritmias:{
    reasoning:"O nome do ritmo deve vir depois de frequência, regularidade, largura do QRS, atividade atrial e relação P–QRS.",
    examples:[
      {label:"Regular e estreito",text:"Restringe hipóteses, mas não define sozinho o mecanismo supraventricular."},
      {label:"Irregularmente irregular",text:"Sugere fibrilação atrial quando não há P organizada, mas artefato e extrassístoles precisam ser excluídos."},
      {label:"Taquicardia larga",text:"Deve ser tratada como problema de alto risco na prática até avaliação especializada; no jogo, foque na descrição."},
    ],
    measurements:[
      {label:"QRS estreito",value:"<120 ms",note:"Favorece ativação ventricular pelo sistema normal, sem determinar sozinho a origem."},
      {label:"QRS largo",value:"≥120 ms",note:"Pode ocorrer em ritmo ventricular, aberrância, bloqueio prévio ou pré-excitação."},
    ],
    spectrum:[
      {label:"Comum",tone:"common",text:"Extrassístoles isoladas podem ocorrer, mas frequência, morfologia e contexto importam."},
      {label:"Requer avaliação",tone:"attention",text:"Taquicardia sustentada, sintomas ou QRS largo aumentam a preocupação."},
      {label:"Crítico",tone:"urgent",text:"FV e TV sem pulso são ritmos chocáveis; assistolia e AESP não são chocáveis. O reconhecimento real exige protocolo de emergência."},
    ],
  },
  emergencias:{
    reasoning:"O traçado é apenas uma parte da avaliação. A presença ou ausência de pulso muda completamente a classificação e a resposta.",
    examples:[
      {label:"FV",text:"Atividade caótica sem complexos organizados; ritmo chocável em parada."},
      {label:"TV sem pulso",text:"Ritmo ventricular rápido e organizado, mas sem pulso; chocável."},
      {label:"Assistolia",text:"Ausência de atividade ventricular detectável após excluir cabos, ganho e FV fina; não chocável."},
      {label:"AESP",text:"Atividade elétrica organizada sem pulso detectável; não chocável."},
    ],
    spectrum:[
      {label:"Não é parada",tone:"common",text:"Pessoa responsiva e com pulso exige outra abordagem, mesmo com traçado anormal."},
      {label:"Suspeita",tone:"attention",text:"Inconsciência, respiração ausente ou agônica exige ativação imediata do sistema de emergência."},
      {label:"Parada",tone:"urgent",text:"Sem pulso: iniciar RCP e usar DEA/desfibrilador conforme protocolo. Esta plataforma não substitui treinamento certificado."},
    ],
  },
};

for(const skill of ["onda_p","intervalo_pr","complexo_qrs","segmento_st","onda_t"] as SkillId[]) feedbackProfiles[skill]=feedbackProfiles.leitura_sistematica;
for(const skill of ["frequencia","regularidade","ritmo_sinusal"] as SkillId[]) feedbackProfiles[skill]=feedbackProfiles.arritmias;
for(const skill of ["qrs_alargado","morfologia_v1","morfologia_lateral","diferenciar_brd_bre"] as SkillId[]) feedbackProfiles[skill]=feedbackProfiles.arritmias;

export const lessons: Lesson[] = [
  {
    id: "ondas-01", module: "ondas", title: "Uma frase elétrica",
    shortConcept: "O ECG registra diferenças de potencial ao longo do tempo. Cada onda representa uma fase organizada da ativação ou recuperação cardíaca.",
    intuitive: "Leia o traçado como uma frase: P prepara, PR conduz, QRS ativa os ventrículos e T encerra o ciclo.",
    technical: "A deflexão depende da direção do vetor em relação ao polo positivo da derivação. Uma linha próxima do basal não significa ausência de atividade elétrica.",
    visual: "normal", reviewed: true,
  },
  {
    id: "ritmo-01", module: "ritmo", title: "Antes do nome, conte e compare",
    shortConcept: "Primeiro verifique a calibração, depois estime a frequência e avalie se os intervalos R–R se repetem.",
    intuitive: "Não adivinhe o ritmo pelo formato geral: conte, compare os espaços e procure a relação entre P e QRS.",
    technical: "Em papel a 25 mm/s, cinco quadrados grandes equivalem a um segundo. O método de frequência deve ser escolhido conforme a regularidade.",
    visual: "slow", reviewed: true,
  },
  {
    id: "bloqueios-01", module: "bloqueios", title: "Ativação ventricular tardia",
    shortConcept: "Nos bloqueios de ramo, a sequência de ativação ventricular muda. A duração e a direção das forças terminais ajudam a localizar o atraso.",
    intuitive: "Pergunte: o QRS está largo? Onde ele termina positivo? Onde sobra uma deflexão terminal afastando-se?",
    technical: "O beta treina a lógica QRS → V1 → derivações laterais. Critérios completos permanecem condicionados à validação com a aula específica e referências registradas.",
    visual: "rbbb", reviewed: true,
  },
];

const q = (
  id: string, module: Question["module"], prompt: string, options: string[], answer: number,
  skills: SkillId[], explanation: string, extra: Partial<Question> = {},
): Question => ({
  id, module, topic: skills[0], prompt, options, answer, skills,
  explanation, alternativeExplanation: explanation, difficulty: 1, points: 20,
  errorType: "conceitual", trace: module === "ondas" ? "normal" : module === "ritmo" ? "slow" : "rbbb",
  visualFocus: skills[0]==="onda_p"?"p":skills[0]==="intervalo_pr"?"pr":skills[0]==="complexo_qrs"?"qrs":
    skills[0]==="segmento_st"?"st":skills[0]==="onda_t"?"t":skills[0]==="frequencia"||skills[0]==="regularidade"?"rr":
    skills[0]==="qrs_alargado"?"qrs":skills[0]==="morfologia_v1"||skills[0]==="morfologia_lateral"?"terminal":undefined,
  reviewed: module !== "bloqueios", sourceIds: module === "bloqueios" ? ["incor-bloqueios-reviewed", "aha-ecg-part-iii"] : ["incor-modulo-interpretacao", "aha-ecg-part-i"],
  type: "choice", ...extra,
});

const coreQuestions: Question[] = [
  q("ond-001","ondas","Qual elemento representa habitualmente a despolarização atrial?",["Onda P","Complexo QRS","Onda T","Segmento ST"],0,["onda_p"],"A onda P corresponde à ativação elétrica dos átrios.",{type:"visual"}),
  q("ond-002","ondas","O intervalo PR começa e termina, respectivamente, em:",["Início de P e início do QRS","Fim de P e fim do QRS","Início do QRS e fim de T","Fim do QRS e início de T"],0,["intervalo_pr"],"O PR inclui a onda P e o tempo de condução até o início da ativação ventricular."),
  q("ond-003","ondas","O complexo QRS está mais diretamente relacionado a:",["Repolarização atrial isolada","Despolarização ventricular","Repolarização ventricular","Pausa elétrica completa"],1,["complexo_qrs"],"O QRS registra a ativação ventricular.",{type:"boolean"}),
  q("ond-004","ondas","Qual trecho fica entre o fim do QRS e o início da onda T?",["Intervalo PR","Segmento ST","Intervalo RR","Onda U"],1,["segmento_st"],"O segmento ST liga o fim da despolarização ventricular ao início visível da repolarização."),
  q("ond-005","ondas","Qual onda representa principalmente a repolarização ventricular?",["P","Q","T","R"],2,["onda_t"],"A onda T expressa a repolarização ventricular."),
  q("ond-006","ondas","Organize mentalmente a sequência normal:",["P → PR → QRS → ST → T","QRS → P → T → PR → ST","T → P → ST → QRS → PR","PR → T → P → ST → QRS"],0,["onda_p","intervalo_pr","complexo_qrs","segmento_st","onda_t"],"A leitura acompanha o tempo: ativação atrial, condução AV, ativação ventricular e repolarização.",{type:"order",difficulty:2,points:35}),
  q("ond-007","ondas","Um trecho próximo da linha de base significa obrigatoriamente ausência de atividade elétrica?",["Sim","Não"],1,["segmento_st"],"Não. Vetores simultâneos podem se cancelar ou projetar pouca diferença de potencial.",{type:"boolean",difficulty:2}),
  q("ond-exam","ondas","Laudo: “A onda T representa a despolarização ventricular”. Qual é o erro?",["Nenhum","A T representa repolarização ventricular","A T representa ativação atrial","A T mede a condução AV"],1,["onda_t","complexo_qrs"],"A despolarização ventricular é representada pelo QRS; a T relaciona-se à repolarização.",{type:"report",difficulty:2,points:60,exam:true}),

  q("rit-001","ritmo","Em papel a 25 mm/s, um quadrado grande corresponde a:",["0,04 s","0,10 s","0,20 s","1,00 s"],2,["frequencia"],"Cada quadrado pequeno vale 0,04 s; cinco pequenos formam 0,20 s.",{visualInstruction:"Use a grade: um quadrado grande reúne cinco quadrados pequenos."}),
  q("rit-002","ritmo","Para um ritmo regular, 300 dividido pelo número de quadrados grandes entre dois R fornece:",["Duração do QRS","Frequência aproximada","Eixo elétrico","QT corrigido"],1,["frequencia"],"A regra dos 300 é uma estimativa rápida para ritmos regulares."),
  q("rit-003","ritmo","Há 5 quadrados grandes entre ondas R regulares. Frequência aproximada:",["30 bpm","60 bpm","100 bpm","150 bpm"],1,["frequencia"],"300 ÷ 5 = 60 bpm.",{errorType:"calculo"}),
  q("rit-004","ritmo","Qual observação deve vir antes de nomear um ritmo?",["Cor do papel","Regularidade dos R–R","Idade do aparelho","Amplitude da onda U"],1,["regularidade"],"A regularidade orienta o método de cálculo e restringe hipóteses."),
  q("rit-005","ritmo","Ritmo sinusal exige apenas frequência entre 60 e 100 bpm.",["Verdadeiro","Falso"],1,["ritmo_sinusal"],"Falso. A origem e a relação organizada entre atividade atrial e ventricular também importam.",{type:"boolean"}),
  q("rit-006","ritmo","Qual sequência é mais sistemática?",["Diagnóstico → eixo → calibração","Calibração → frequência → regularidade → P/QRS","T → ST → sintomas → calibração","Frequência → diagnóstico → conferir depois"],1,["frequencia","regularidade","ritmo_sinusal"],"Começar pela qualidade/calibração evita cálculos e conclusões construídos sobre premissas erradas.",{type:"order",difficulty:2,points:40}),
  q("rit-007","ritmo","O traçado mostra R–R semelhantes e uma P antes de cada QRS. O melhor próximo passo é:",["Encerrar o laudo","Medir PR e QRS","Diagnosticar FA","Ignorar a calibração"],1,["ritmo_sinusal","intervalo_pr","complexo_qrs"],"Depois de reconhecer organização atrioventricular, confirme os intervalos e a morfologia.",{type:"compare",difficulty:2}),
  q("rit-exam","ritmo","Um aluno respondeu 100 bpm com 5 quadrados grandes entre R. Qual erro ocorreu?",["Visual","Cálculo: deveria ser 60 bpm","Sequência","Nenhum"],1,["frequencia"],"A regra dos 300 leva a 60 bpm. O erro deve ser registrado como cálculo, não como desconhecimento global de ritmo.",{type:"report",difficulty:2,points:60,errorType:"calculo",exam:true}),

  q("blo-001","bloqueios","Qual pergunta deve abrir a análise de um possível bloqueio de ramo?",["O QRS está alargado?","Existe onda U?","Qual a amplitude de P?","Há artefato muscular?"],0,["qrs_alargado"],"A duração do QRS é a porta de entrada; a morfologia define o padrão.",{reviewed:true}),
  q("blo-002","bloqueios","Em um padrão compatível com BRD, qual derivação precordial é central para examinar a força terminal direita/anterior?",["V1","V6","aVL","DII"],0,["morfologia_v1"],"V1 é essencial para observar a morfologia terminal do bloqueio de ramo direito.",{reviewed:true}),
  q("blo-003","bloqueios","QRS alargado + deflexão terminal positiva em V1 + S terminal lateral sugere:",["BRD","BRE","Ritmo sinusal normal","Apenas artefato"],0,["qrs_alargado","morfologia_v1","morfologia_lateral","diferenciar_brd_bre"],"O conjunto é compatível com BRD. Não conclua por um critério isolado.",{difficulty:2,points:45,reviewed:true,type:"report"}),
  q("blo-004","bloqueios","O aluno reconheceu QRS largo, mas ignorou V1 e marcou BRD. Como classificar?",["Domínio completo","Acerto por tentativa","Erro de cálculo","Erro de calibração"],1,["morfologia_v1","diferenciar_brd_bre"],"O diagnóstico sem critérios compatíveis não demonstra domínio.",{difficulty:2,errorType:"acerto_por_tentativa",reviewed:true}),
  q("blo-005","bloqueios","Para diferenciar BRD e BRE, é suficiente olhar apenas a duração do QRS.",["Verdadeiro","Falso"],1,["diferenciar_brd_bre"],"Falso. A duração indica atraso; a morfologia e a distribuição das forças ajudam a localizar o ramo.",{type:"boolean",reviewed:true,secondaryTrace:"lbbb",visualFocus:"terminal"}),
  q("blo-006","bloqueios","Compare os padrões de forças terminais antes de concluir porque:",["A conclusão deve integrar as morfologias observadas","O primeiro traçado sempre mostra a frequência","O segundo traçado mede o PR","É apenas uma regra de memorização"],0,["morfologia_v1","morfologia_lateral"],"A comparação reduz conclusões por um único achado e reforça o raciocínio vetorial.",{type:"compare",difficulty:2,reviewed:true,secondaryTrace:"lbbb",visualFocus:"terminal"}),
  q("blo-007","bloqueios","Qual justificativa é mais forte?",["Parece BRD","QRS largo e padrão terminal coerente em V1 e lateral","O computador escreveu BRD","A frequência é 70"],1,["qrs_alargado","morfologia_v1","morfologia_lateral"],"A justificativa deve explicitar os achados usados.",{difficulty:2,points:40,reviewed:true}),
  q("blo-exam","bloqueios","Monte a conclusão: QRS alargado, terminal positivo em V1, S terminal lateral.",["Padrão compatível com BRD","Padrão compatível com BRE","Ritmo de parada","Sem alteração de condução"],0,["qrs_alargado","morfologia_v1","morfologia_lateral","diferenciar_brd_bre"],"O conjunto sustenta padrão compatível com BRD. Este beta não substitui avaliação clínica.",{type:"report",difficulty:3,points:100,exam:true,reviewed:true}),
];

const trackSkill: Record<AcademyLesson["track"], SkillId> = {
  "comece-aqui":"fundamentos_eletricos",
  interpretacao:"leitura_sistematica",
  conducao:"conducao_av",
  arritmias:"arritmias",
  repolarizacao:"repolarizacao",
  metodos:"metodos_complementares",
  marcapasso:"marcapasso",
  emergencias:"emergencias",
};

const trackModule: Record<AcademyLesson["track"], Question["module"]> = {
  "comece-aqui":"ondas", interpretacao:"ondas", repolarizacao:"ondas", metodos:"ondas",
  arritmias:"ritmo", emergencias:"ritmo", conducao:"bloqueios", marcapasso:"bloqueios",
};

function traceForChallenge(lesson:AcademyLesson,title:string): Lesson["visual"] {
  const text=title.toLocaleLowerCase("pt-BR");
  if(lesson.id==="cond-04"){
    if(text.includes("primeiro grau"))return "av1";
    if(text.includes("tipo i")||text.includes("wenckebach"))return "mobitz1";
    if(text.includes("tipo ii")||text.includes("2:1")||text.includes("avançado"))return "mobitz2";
    if(text.includes("terceiro")||text.includes("dissociação"))return "avcomplete";
  }
  if(lesson.id==="arr-06"&&(text.includes("extrass")||text.includes("prematur")||text.includes("batimento")))return "pvc";
  if(lesson.id==="repo-02"&&text.includes("qt"))return "qtlong";
  if(lesson.id==="repo-02"&&text.includes("brugada"))return "brugada";
  if(lesson.id==="emer-02"){
    if(text.includes("fibrilação ventricular")||text.includes("fv"))return "vf";
    if(text.includes("tv")||text.includes("taquicardia ventricular"))return "pvt";
    if(text.includes("assistolia"))return "asystole";
    if(text.includes("aesp"))return "pea";
  }
  return lesson.visual;
}

function academyChallenge(lesson: AcademyLesson, stepIndex: number, variant: 0|1|2): Question {
  const target=lesson.steps[stepIndex];
  const trace=traceForChallenge(lesson,target.title);
  const otherSteps=lesson.steps.filter((_,index)=>index!==stepIndex);
  const correct=variant===1?target.checkpoint:target.explanation;
  const sourcePool=variant===1?otherSteps.map(step=>step.checkpoint):otherSteps.map(step=>step.explanation);
  const distractors=[
    ...sourcePool,
    ...lesson.objectives.map(objective=>`Basta ${objective.toLowerCase()}; os demais elementos da sequência podem ser ignorados.`),
    "O aspecto geral do traçado permite concluir sem conferir o mecanismo, a técnica ou a relação temporal.",
  ].filter(text=>text!==correct).slice(0,3);
  while(distractors.length<3)distractors.push("Uma única aparência visual encerra o raciocínio e dispensa a análise sistemática.");
  const answer=(lesson.order+stepIndex+variant)%4;
  const options=[...distractors]; options.splice(answer,0,correct);
  const optionFeedback=options.map((_,index)=>index===answer
    ?`Esta alternativa responde diretamente a “${target.title}” e preserva a sequência ensinada na aula.`
    :`A alternativa escolhida desloca o foco para outro conceito ou encerra o raciocínio cedo demais. Em “${target.title}”, era necessário manter mecanismo, sequência e contexto ligados.`);
  const prompts=[
    `Qual explicação constrói corretamente o conceito “${target.title}”?`,
    `Ao revisar “${target.title}”, qual frase deve funcionar como checagem de segurança?`,
    `Um aluno tentou concluir “${target.title}” apenas pela aparência geral. Qual correção recupera o raciocínio adequado?`,
  ];
  return {
    id:`academy-${lesson.id}-s${String(stepIndex+1).padStart(2,"0")}-q${variant+1}`,
    module:trackModule[lesson.track],
    topic:lesson.id,
    prompt:`${lesson.title}: ${prompts[variant]}`,
    type:variant===0?"choice":variant===1?"compare":"report",
    options,
    optionFeedback,
    answer,
    explanation:variant===1?target.checkpoint:target.explanation,
    alternativeExplanation:variant===1?target.explanation:target.checkpoint,
    skills:[trackSkill[lesson.track]],
    difficulty:variant===0?1:variant===1?2:3,
    points:variant===0?20:variant===1?30:45,
    errorType:variant===0?"conceitual":variant===1?"sequencia":"aplicacao",
    trace,
    visualFocus:trace==="qtlong"?"t":trace==="brugada"||trace==="ischemia"?"st":
      trace==="af"||trace==="flutter"||trace==="svt"?"rr":trace==="pvc"||trace==="vt"||trace==="pvt"?"qrs":
      trace==="av1"||trace==="mobitz1"||trace==="mobitz2"||trace==="avcomplete"?"pr":
      trace==="rbbb"||trace==="lbbb"||trace==="lafb"?"terminal":trace==="lvh"?"qrs":undefined,
    visualInstruction:`Use o traçado como apoio e relacione-o ao conceito central da aula ${lesson.order}.`,
    reviewed:lesson.status==="reviewed",
    sourceIds:[`incor-aula-${lesson.sourceCourseId}`,lesson.track==="emergencias"?"aha-2025-cardiac-arrest":"aha-ecg-part-i"],
  };
}

const academyQuestions=academyLessons.flatMap(lesson=>
  lesson.steps.flatMap((_,stepIndex)=>[
    academyChallenge(lesson,stepIndex,0),
    academyChallenge(lesson,stepIndex,1),
    academyChallenge(lesson,stepIndex,2),
  ]),
);

export const questions: Question[]=[...coreQuestions,...academyQuestions];

export const references: ReferenceItem[] = [
  { id:"incor-modulo-interpretacao", title:"Curso estudado pelo usuário — módulo de interpretação básica", role:"pedagogical", note:"Eixo de ordem e método. Texto do aplicativo é original e não reproduz material do curso." },
  { id:"incor-bloqueios-reviewed", title:"Aula e casos de bloqueios do curso estudado", role:"pedagogical", note:"Sequência de ativação, forças terminais e comparação BRD/BRE revisadas nos 47 slides da aula e nos seis slides de casos. Texto e traçados do aplicativo são autorais." },
  { id:"aha-ecg-part-i", title:"AHA/ACCF/HRS — ECG and its technology (Part I)", role:"validation", url:"https://www.ahajournals.org/doi/10.1161/CIRCULATIONAHA.106.180200", note:"Padronização técnica, apresentação e mensuração." },
  { id:"aha-ecg-part-iii", title:"AHA/ACCF/HRS — Intraventricular conduction disturbances (Part III)", role:"validation", url:"https://www.ahajournals.org/doi/10.1161/CIRCULATIONAHA.108.191095", note:"Validação complementar de distúrbios de condução." },
  { id:"aha-ecg-part-iv", title:"AHA/ACCF/HRS — ST, T, U e intervalo QT (Part IV)", role:"validation", url:"https://www.jacc.org/doi/10.1016/j.jacc.2008.12.014", note:"Validação complementar da nomenclatura e mensuração da repolarização; não autoriza copiar texto ou tabelas." },
  { id:"aha-ecg-part-v", title:"AHA/ACCF/HRS — Sobrecargas das câmaras cardíacas (Part V)", role:"validation", url:"https://www.jacc.org/doi/10.1016/j.jacc.2008.12.015", note:"Confirma que não há um único critério superior para HVE e que fórmulas validadas não devem ser modificadas. Critérios numéricos permanecem bloqueados até revisão individual." },
  { id:"aha-ecg-part-vi", title:"AHA/ACCF/HRS — Isquemia e infarto agudos (Part VI)", role:"validation", url:"https://www.jacc.org/doi/10.1016/j.jacc.2008.12.016", note:"Validação complementar da terminologia eletrocardiográfica. O conteúdo de emergência permanece educacional e depende do contexto clínico." },
  { id:"aha-2025-cardiac-arrest", title:"AHA 2025 — Adult Cardiac Arrest Algorithm", role:"validation", url:"https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Algorithms/Algorithm-ACLS-CA-250527.pdf", note:"Ritmos chocáveis (FV/TV sem pulso), não chocáveis (assistolia/AESP) e resposta inicial." },
];
