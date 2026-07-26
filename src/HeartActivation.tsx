import type { Lesson } from "./types";

export function HeartActivation({ mode="normal" }: { mode?: Lesson["visual"] }) {
  const arrest = mode==="vf"||mode==="pvt"||mode==="asystole"||mode==="pea";
  const descriptions: Record<Lesson["visual"], { title: string; detail: string; steps: string[] }> = {
    normal: { title:"Condução organizada", detail:"Átrios → nó AV → dois ventrículos", steps:["Átrios","Nó AV","VD + VE"] },
    slow: { title:"Mesma rota, ciclo mais lento", detail:"Os eventos ficam mais espaçados", steps:["Átrios","Pausa AV","VD + VE"] },
    fast: { title:"Mesma rota, ciclo acelerado", detail:"Os eventos se repetem mais depressa", steps:["Átrios","Nó AV","VD + VE"] },
    rbbb: { title:"Atraso terminal à direita", detail:"O VE ativa antes; o VD termina depois", steps:["Átrios","VE primeiro","VD atrasado"] },
    lbbb: { title:"Atraso terminal à esquerda", detail:"O VD ativa antes; o VE termina depois", steps:["Átrios","VD primeiro","VE atrasado"] },
    av1: { title:"Condução AV atrasada", detail:"Cada P conduz, mas a viagem até o QRS demora", steps:["Onda P","PR longo","QRS"] },
    mobitz1: { title:"Condução progressivamente mais lenta", detail:"O PR aumenta até uma P não conduzir", steps:["PR aumenta","P bloqueada","Reinício"] },
    mobitz2: { title:"Falha súbita da condução", detail:"O PR conduzido é estável antes da P bloqueada", steps:["PR estável","P bloqueada","Novo ciclo"] },
    avcomplete: { title:"Átrios e ventrículos independentes", detail:"As ondas P não mantêm relação fixa com o QRS", steps:["Ritmo atrial","Dissociação","Escape ventricular"] },
    flutter: { title:"Atividade atrial em circuito", detail:"Ondas atriais repetem-se com condução AV variável", steps:["Circuito atrial","Ondas F","Resposta AV"] },
    af: { title:"Atividade atrial desorganizada", detail:"Sem P organizada e resposta ventricular irregular", steps:["Caos atrial","Nó AV filtra","RR irregular"] },
    svt: { title:"Taquicardia de QRS estreito", detail:"Ativação ventricular rápida pelo sistema de condução", steps:["Circuito rápido","Nó AV","QRS estreito"] },
    pvc: { title:"Batimento ventricular prematuro", detail:"Um foco ventricular antecipa um QRS largo", steps:["Foco ectópico","QRS precoce","Pausa"] },
    paced: { title:"Estimulação artificial", detail:"Espícula seguida de ativação quando há captura", steps:["Espícula","Captura","QRS estimulado"] },
    qtlong: { title:"Repolarização prolongada", detail:"O fim da onda T ocorre mais tarde no ciclo", steps:["QRS","ST + T","Fim do QT"] },
    brugada: { title:"Padrão de repolarização em V1–V2", detail:"Morfologia do ST deve ser analisada nas derivações corretas", steps:["V1–V2","Ponto J/ST","Onda T"] },
    ischemia: { title:"Alteração de ST/T", detail:"Distribuição em derivações contíguas define coerência", steps:["Ponto J","Derivações vizinhas","Reciprocidade"] },
    lvh: { title:"Forças ventriculares aumentadas", detail:"Voltagem é pista e deve ser integrada a eixo e ST/T", steps:["Voltagem","Eixo","Repolarização"] },
    lafb: { title:"Forças desviadas no plano frontal", detail:"Eixo e morfologia precisam ser analisados em conjunto", steps:["Ativação inicial","Eixo esquerdo","Morfologia"] },
    vt: { title:"Ativação ventricular rápida", detail:"Complexos largos repetem-se a partir dos ventrículos", steps:["Origem ventricular","Ativação lenta","QRS largo"] },
    vf: { title:"Atividade ventricular caótica", detail:"Não há uma sequência de ativação útil", steps:["Sem P útil","Caos elétrico","Sem pulso eficaz"] },
    pvt: { title:"Ativação ventricular muito rápida", detail:"Complexos ventriculares repetem-se sem pulso", steps:["Ventrículos","Muito rápido","Sem pulso"] },
    asystole: { title:"Sem atividade discernível", detail:"O modelo permanece eletricamente inativo", steps:["Sem onda","Sem condução","Sem pulso"] },
    pea: { title:"Eletricidade sem ação mecânica", detail:"Há sequência elétrica, mas não há pulso", steps:["Eletricidade","Condução","Pulso ausente"] }
  };
  const copy = descriptions[mode];
  return <div className={`heart-stage mode-${mode}`} aria-label={`Esquema animado da ativação cardíaca: ${mode}`}>
    <div className="heart-depth heart-back"/>
    <div className="heart-depth heart-body">
      <span className="chamber ra">AD</span><span className="chamber la">AE</span>
      <span className="chamber rv">VD</span><span className="chamber lv">VE</span>
      <i className="node sinus"/><i className="node av"/><i className="conduction"/>
      <i className="activation atrial-activation"/><i className="activation rv-activation"/><i className="activation lv-activation"/>
    </div>
    <div className="activation-sequence">
      {copy.steps.map((step,index)=><span key={step}><b>{index+1}</b>{step}</span>)}
    </div>
    <div className="heart-copy"><b>{arrest?"Ritmo de parada — modelo didático":copy.title}</b><span>{copy.detail}</span></div>
  </div>;
}
