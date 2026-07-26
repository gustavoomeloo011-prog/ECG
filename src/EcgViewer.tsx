import { useEffect, useRef } from "react";
import type { Lesson } from "./types";

type VisualFocus = "p" | "pr" | "qrs" | "st" | "t" | "rr" | "terminal";
export function EcgViewer({ trace = "normal", compact = false, focus, instruction }: { trace?: Lesson["visual"]; compact?: boolean; focus?: VisualFocus; instruction?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const focusHelp: Partial<Record<VisualFocus,string>> = {
    p:"Identifique a pequena deflexão destacada antes do QRS.",
    pr:"Observe onde a faixa destacada começa e onde termina antes do QRS.",
    qrs:"Observe o complexo rápido e de maior amplitude destacado.",
    st:"Observe o trecho destacado depois do fim do QRS e antes da onda T.",
    t:"Identifique a deflexão arredondada destacada depois do segmento ST.",
    rr:"Compare a distância entre dois picos R consecutivos.",
    terminal:"Observe especificamente a parte final destacada do QRS."
  };
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let frame=0;
    const draw=(time:number)=>{
      const dpr=window.devicePixelRatio||1,width=canvas.clientWidth,height=canvas.clientHeight;
      if(canvas.width!==width*dpr||canvas.height!==height*dpr){canvas.width=width*dpr;canvas.height=height*dpr}
      const ctx=canvas.getContext("2d");if(!ctx)return;ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.fillStyle="#fffdf8";ctx.fillRect(0,0,width,height);
      const shift=focus?0:(time*.018)%40;
      ctx.lineWidth=.6;ctx.strokeStyle="rgba(238,123,114,.2)";
      for(let x=-40+shift;x<width;x+=8){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke()}
      for(let y=0;y<height;y+=8){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke()}
      ctx.lineWidth=1;ctx.strokeStyle="rgba(238,123,114,.38)";
      for(let x=-40+shift;x<width;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke()}
      for(let y=0;y<height;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke()}
      const baseline=height*.58,beats=trace==="slow"||trace==="pea"?Math.max(2,width/200):trace==="fast"||trace==="svt"||trace==="flutter"||trace==="vt"||trace==="pvt"?7:4,beatW=trace==="slow"?200:width/beats,travel=focus&&focus!=="rr"?0:(time*.025)%beatW;
      if(focus&&trace!=="vf"&&trace!=="asystole"){
        const ranges:Record<VisualFocus,[number,number,string]>={
          p:[.10,.27,"TRECHO EM ANÁLISE"],pr:[.10,.39,"TRECHO EM ANÁLISE"],qrs:[.40,.61,"TRECHO EM ANÁLISE"],
          st:[.59,.78,"TRECHO EM ANÁLISE"],t:[.76,.94,"TRECHO EM ANÁLISE"],rr:[.48,1.48,"DISTÂNCIA EM ANÁLISE"],terminal:[.52,.70,"TRECHO TERMINAL"]
        };
        const [start,end,label]=ranges[focus];
        const center=Math.floor((width/2-travel)/beatW)*beatW+travel;
        const x=center+beatW*start,w=beatW*(end-start);
        ctx.fillStyle="rgba(88,214,181,.16)";ctx.fillRect(x,12,w,height-24);
        ctx.strokeStyle="rgba(24,126,105,.8)";ctx.lineWidth=1;ctx.strokeRect(x,12,w,height-24);
        ctx.beginPath();ctx.moveTo(x,32);ctx.lineTo(x,44);ctx.moveTo(x+w,32);ctx.lineTo(x+w,44);ctx.moveTo(x,38);ctx.lineTo(x+w,38);ctx.stroke();
        ctx.fillStyle="#0b6658";ctx.font="600 10px Manrope, sans-serif";ctx.fillText(label,Math.max(6,x+5),25);
      }
      ctx.strokeStyle="#102d32";ctx.lineWidth=2.2;ctx.beginPath();
      const pWave=(x:number)=>{ctx.moveTo(x-12,baseline);ctx.lineTo(x-6,baseline-9);ctx.lineTo(x,baseline);};
      const qrs=(x:number)=>{ctx.moveTo(x-5,baseline);ctx.lineTo(x,baseline+10);ctx.lineTo(x+5,baseline-46);ctx.lineTo(x+10,baseline+18);ctx.lineTo(x+17,baseline);ctx.lineTo(x+35,baseline);ctx.lineTo(x+47,baseline-16);ctx.lineTo(x+63,baseline);};
      if(trace==="av1"||trace==="mobitz1"||trace==="mobitz2"||trace==="avcomplete"){
        ctx.moveTo(0,baseline);
        const scroll=(time*.018)%270;
        if(trace==="av1"){
          for(let x=-200-scroll;x<width+200;x+=180){pWave(x);ctx.lineTo(x+58,baseline);qrs(x+58)}
        }else if(trace==="mobitz1"){
          for(let g=-300-scroll;g<width+300;g+=300){pWave(g);ctx.lineTo(g+35,baseline);qrs(g+35);pWave(g+95);ctx.lineTo(g+145,baseline);qrs(g+145);pWave(g+205);ctx.lineTo(g+295,baseline)}
        }else if(trace==="mobitz2"){
          for(let g=-300-scroll;g<width+300;g+=300){pWave(g);ctx.lineTo(g+42,baseline);qrs(g+42);pWave(g+105);ctx.lineTo(g+147,baseline);qrs(g+147);pWave(g+220);ctx.lineTo(g+300,baseline)}
        }else{
          for(let x=-100-(scroll%70);x<width+100;x+=70)pWave(x);
          for(let x=-170-(scroll%190);x<width+190;x+=190)qrs(x);
        }
      }else if(trace==="flutter"){
        ctx.moveTo(0,baseline);
        for(let x=-30;x<width+30;x+=18){ctx.lineTo(x+6,baseline-13);ctx.lineTo(x+12,baseline+2);ctx.lineTo(x+18,baseline)}
        for(let x=35-travel;x<width+60;x+=beatW*2){ctx.moveTo(x,baseline);ctx.lineTo(x+4,baseline-42);ctx.lineTo(x+9,baseline+17);ctx.lineTo(x+15,baseline)}
      }else if(trace==="af"){
        ctx.moveTo(0,baseline);
        const irregular=[.72,1.18,.86,1.34,.64];let x=-40-(travel%60),n=0;
        while(x<width+80){for(let f=x;f<x+34;f+=4)ctx.lineTo(f,baseline+Math.sin((f+time*.04)*.45)*3);x+=beatW*irregular[n++%irregular.length];ctx.lineTo(x,baseline);ctx.lineTo(x+5,baseline-48);ctx.lineTo(x+11,baseline+17);ctx.lineTo(x+18,baseline)}
      }else if(trace==="paced"){
        ctx.moveTo(0,baseline);
        for(let x=-beatW+travel;x<width+beatW;x+=beatW){ctx.lineTo(x+beatW*.34,baseline);ctx.lineTo(x+beatW*.36,baseline-62);ctx.lineTo(x+beatW*.38,baseline);ctx.lineTo(x+beatW*.48,baseline+14);ctx.lineTo(x+beatW*.57,baseline-36);ctx.lineTo(x+beatW*.68,baseline+20);ctx.lineTo(x+beatW*.78,baseline);ctx.lineTo(x+beatW*.92,baseline-12);ctx.lineTo(x+beatW,baseline)}
      }else if(trace==="vf"){
        for(let x=0;x<=width;x+=3){const y=baseline+Math.sin((x+time*.12)*.16)*22+Math.sin((x-time*.08)*.41)*13+Math.sin(x*.07)*9;x?ctx.lineTo(x,y):ctx.moveTo(x,y)}
      }else if(trace==="asystole"){
        ctx.moveTo(0,baseline);for(let x=0;x<=width;x+=4)ctx.lineTo(x,baseline+Math.sin((x+time*.03)*.05)*1.2);
      }else{
        ctx.moveTo(0,baseline);
        const point=(x:number,y:number)=>ctx.lineTo(x,y);
        for(let i=-1;i<beats+1;i++){const o=i*beatW+travel;
          if(trace==="vt"||trace==="pvt"){point(o+beatW*.08,baseline);point(o+beatW*.25,baseline-45);point(o+beatW*.47,baseline+35);point(o+beatW*.68,baseline-30);point(o+beatW*.9,baseline)}
          else{const ectopic=trace==="pvc"&&i%3===1;point(o+beatW*.10,baseline);if(trace!=="svt"&&!ectopic)point(o+beatW*.18,baseline-10);point(o+beatW*.26,baseline);point(o+beatW*.38,baseline);
            if(ectopic){point(o+beatW*.39,baseline+18);point(o+beatW*.47,baseline-54);point(o+beatW*.58,baseline+31);point(o+beatW*.70,baseline)}
            else if(trace==="rbbb"){point(o+beatW*.43,baseline+14);point(o+beatW*.48,baseline-45);point(o+beatW*.53,baseline+18);point(o+beatW*.61,baseline-32);point(o+beatW*.68,baseline)}
            else if(trace==="lbbb"){point(o+beatW*.43,baseline+15);point(o+beatW*.50,baseline-30);point(o+beatW*.59,baseline-42);point(o+beatW*.68,baseline)}
            else if(trace==="lvh"){point(o+beatW*.44,baseline+30);point(o+beatW*.48,baseline-72);point(o+beatW*.53,baseline+26);point(o+beatW*.59,baseline)}
            else if(trace==="lafb"){point(o+beatW*.43,baseline-34);point(o+beatW*.49,baseline+42);point(o+beatW*.56,baseline)}
            else{point(o+beatW*.44,baseline+12);point(o+beatW*.48,baseline-50);point(o+beatW*.52,baseline+20);point(o+beatW*.58,baseline)}
            if(trace==="brugada"){point(o+beatW*.64,baseline-21);point(o+beatW*.73,baseline-19);point(o+beatW*.84,baseline+4);point(o+beatW*.95,baseline)}
            else if(trace==="ischemia"){point(o+beatW*.66,baseline-19);point(o+beatW*.78,baseline-19);point(o+beatW*.87,baseline-31);point(o+beatW*.98,baseline)}
            else if(trace==="qtlong"){point(o+beatW*.72,baseline);point(o+beatW*.90,baseline-17);point(o+beatW*1.08,baseline)}
            else{point(o+beatW*.70,baseline);point(o+beatW*.80,baseline-18);point(o+beatW*.93,baseline)}}
        }
      }
      ctx.stroke();frame=requestAnimationFrame(draw);
    };
    frame=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(frame);
  },[trace,focus]);
  return <div className={`ecg-visual ${focus?"focused":""}`}><div className={`ecg-frame ${compact?"compact":""}`}><canvas ref={ref} aria-label={`Traçado esquemático ${trace}`} /></div>{focus&&!compact&&<p className="ecg-focus-help">{instruction||focusHelp[focus]}</p>}</div>;
}
