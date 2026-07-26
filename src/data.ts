import type { Lesson, Question, ReferenceItem, SkillId } from "./types";

export const skillNames: Record<SkillId, string> = {
  onda_p: "Onda P", intervalo_pr: "Intervalo PR", complexo_qrs: "Complexo QRS",
  segmento_st: "Segmento ST", onda_t: "Onda T", frequencia: "Frequência",
  regularidade: "Regularidade", ritmo_sinusal: "Ritmo sinusal",
  qrs_alargado: "Duração do QRS", morfologia_v1: "Morfologia em V1",
  morfologia_lateral: "Morfologia lateral", diferenciar_brd_bre: "BRD × BRE",
};

export const moduleInfo = {
  ondas: { number: "01", title: "Ondas e intervalos", subtitle: "Aprenda a linguagem do traçado", color: "#58d6b5" },
  ritmo: { number: "02", title: "Frequência e ritmo", subtitle: "Transforme repetição em raciocínio", color: "#ffbd70" },
  bloqueios: { number: "03", title: "Bloqueios de ramo", subtitle: "Leia a ativação ventricular tardia", color: "#ee7b72" },
} as const;

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

export const questions: Question[] = [
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
