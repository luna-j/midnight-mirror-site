import {cardNumber} from './core.mjs';
import {MEANINGS} from './meanings.mjs';
const colors={bg:'#29232e',paper:'#f0e7d8',gold:'#c6aa78',muted:'#c4b9c8',ink:'#332b38'};
export function validShare(value){return Boolean(value&&Array.isArray(value.keywords)&&value.keywords.length>=3&&value.keywords.length<=5&&new Set(value.keywords).size===value.keywords.length&&value.keywords.every(x=>typeof x==='string'&&x.trim().length>0&&x.length<=10)&&typeof value.summary==='string'&&value.summary.trim().length>0&&value.summary.length<=100);}
export function shareCopy(result,cards){
 if(validShare(result?.share))return {...result.share,kind:'本次解读概括',generated:true};
 const words=[...new Set(cards.flatMap(c=>(MEANINGS[c.id]?.[c.isReversed?'reversed':'upright']||'').split(/[、，,；;]/)).map(x=>x.trim()).filter(x=>x&&x.length<=10))].slice(0,5);
 const first=String(result?.action||result?.summary||'').split(/[。！？\n]/).find(x=>x.trim())||'以牌面为线索，留意此刻值得重新看待的事';
 return {keywords:words,summary:first.length>95?first.slice(0,94)+'…':first+'。',kind:'牌义关键词',generated:false};
}
export function splitLines(ctx,value,width){const lines=[];for(const paragraph of String(value).split('\n')){let line='';for(const char of paragraph){if(line&&ctx.measureText(line+char).width>width){lines.push(line);line=char;}else line+=char;}lines.push(line);}return lines;}
function font(ctx,size,serif=false){ctx.font=`${size}px ${serif?'"Songti SC", "STSong", serif':'"PingFang SC", "Microsoft YaHei", sans-serif'}`;}
function drawLines(ctx,lines,x,y,lineHeight){for(const line of lines){ctx.fillText(line,x,y);y+=lineHeight;}return y;}
async function loadImage(src){return new Promise((resolve,reject)=>{const im=new Image(),timer=setTimeout(()=>{im.src='';reject(new Error('牌图载入较慢，请重试生成图片。'));},15000);im.onload=()=>{clearTimeout(timer);resolve(im);};im.onerror=()=>{clearTimeout(timer);reject(new Error('有一张牌图未能载入，请重试。'));};im.src=src;});}
export async function renderShare(snapshot,{showQuestion=false,keywords,summary}={}){
 const copy=shareCopy(snapshot.result,snapshot.cards),words=keywords||copy.keywords,short=summary??copy.summary;
 if(!words.length||words.length>5||words.some(x=>!x||x.length>10)||!short.trim()||short.length>100)throw new Error('请填写1—5个概括词（每个不超过10字）及100字以内的短总结。');
 const images=await Promise.all(snapshot.cards.map(c=>loadImage(c.image)));await document.fonts.ready;
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=2400;let ctx=canvas.getContext('2d');if(!ctx)throw new Error('此浏览器暂不支持生成图片。');
 const title=snapshot.result.title||snapshot.spread.name;const margin=72,width=936;let y=155;
 font(ctx,46,true);const titleLines=splitLines(ctx,title,width);y+=titleLines.length*62+24;
 const q=showQuestion&&snapshot.question?`所问：${snapshot.question}`:'';font(ctx,28);const qLines=q?splitLines(ctx,q,width):[];y+=qLines.length*43+(q?26:0);
 const count=images.length,cardW=count===1?330:count===5?258:288,cardH=cardW*5/3,rows=count===5?2:1,rowH=cardH+112,cardsY=y;
 y+=rows*rowH+35;const textY=y;
 // Tags wrap as text rather than squeezing every word onto one line.
 font(ctx,43,true);const tagLines=splitLines(ctx,words.join('  ·  '),width-80);y+=58+tagLines.length*64+25;
 font(ctx,34,true);const summaryLines=splitLines(ctx,short,width-80);y+=summaryLines.length*57+68;
 const paperH=y-textY,footerY=y+58;canvas.height=Math.ceil(footerY+132);ctx=canvas.getContext('2d');ctx.textBaseline='top';
 ctx.fillStyle=colors.bg;ctx.fillRect(0,0,1080,canvas.height);ctx.strokeStyle='#c6aa7855';ctx.lineWidth=1;ctx.strokeRect(32,32,1016,canvas.height-64);
 ctx.fillStyle=colors.gold;font(ctx,30);ctx.fillText(snapshot.brand||'MIDNIGHT MIRROR',margin,62);ctx.textAlign='right';font(ctx,25);ctx.fillText(snapshot.brandZh||'午夜之镜',1008,66);ctx.textAlign='left';font(ctx,24);ctx.fillStyle=colors.muted;ctx.fillText(`${snapshot.spread.name} · ${snapshot.cards.length}张牌`,margin,111);
 ctx.fillStyle=colors.paper;font(ctx,46,true);let top=drawLines(ctx,titleLines,margin,155,62)+24;
 if(q){ctx.fillStyle=colors.muted;font(ctx,28);drawLines(ctx,qLines,margin,top,43);}
 for(let i=0;i<count;i++){const row=count===5&&i>=3?1:0,cols=count===5?(row?2:3):count,col=row?i-3:i,gap=28,rowWidth=cols*cardW+(cols-1)*gap,x=(1080-rowWidth)/2+col*(cardW+gap),cy=cardsY+row*rowH,c=snapshot.cards[i];
  ctx.save();ctx.translate(x+cardW/2,cy+cardH/2);if(c.isReversed)ctx.rotate(Math.PI);ctx.drawImage(images[i],-cardW/2,-cardH/2,cardW,cardH);ctx.restore();
  // Only the illustration rotates. Printed name and number remain readable.
  const name=[cardNumber(c),c.name].filter(Boolean).join(' ');ctx.textAlign='center';ctx.fillStyle='#efdeb2';let size=18;font(ctx,size,true);while(ctx.measureText(name).width>cardW*.62&&size>10){font(ctx,--size,true);}ctx.fillText(name,x+cardW/2,cy+cardH*(c.isReversed?.045:.91));
  font(ctx,27,true);ctx.fillStyle=colors.paper;ctx.fillText(c.name,x+cardW/2,cy+cardH+16);font(ctx,22);ctx.fillStyle=colors.gold;ctx.fillText(`${snapshot.spread.positions[i]} · ${c.isReversed?'逆位':'正位'}`,x+cardW/2,cy+cardH+58);ctx.textAlign='left';
 }
 ctx.fillStyle=colors.paper;ctx.fillRect(margin,textY,width,paperH);ctx.fillStyle='#866478';font(ctx,23);ctx.fillText(copy.kind,margin+40,textY+28);ctx.fillStyle=colors.ink;font(ctx,43,true);let ty=drawLines(ctx,tagLines,margin+40,textY+58,64)+25;font(ctx,34,true);drawLines(ctx,summaryLines,margin+40,ty,57);
 ctx.fillStyle=colors.muted;font(ctx,22);ctx.fillText(snapshot.result.source==='deepseek'?'解读由人工智能生成，内容供反思参考。':'基础牌义／本地示例，未生成个人解读。',margin,footerY);font(ctx,23);ctx.fillText('luna-j.github.io/midnight-mirror-site/',margin,footerY+40);
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('图片未能生成，请重试。');return blob;
}
