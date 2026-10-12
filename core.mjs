export const SPREADS = {
  single: {name:'一叶知秋',count:1,purpose:'聚焦一事，辨认此刻的核心。',positions:['此刻的提示'],descriptions:['此事值得留意的核心线索。']},
  three: {name:'三重镜',count:3,purpose:'梳理当下，照见牵动与可行之路。',positions:['此刻','牵动','可行之路'],descriptions:['此刻呈现的状态。','影响此事的力量。','可以探索的行动方向。']},
  five: {name:'星之径',count:5,purpose:'展开复杂局面，辨认助力与取舍。',positions:['核心','助力','张力','行动','另一种可能'],descriptions:['问题的中心。','可借助的资源。','需要面对的牵动。','可以尝试的行动。','值得考虑的另一种视角。']},
  story: {name:'故事之镜',count:3,purpose:'以三张牌，铺陈一个故事的开端与转折。',positions:['开端','转折','余韵'],descriptions:['故事的起点。','推动叙事的变化。','尚未闭合的回声。']},
};
export function shuffleDeck(cards, mode, random=Math.random) {
  if(cards.length!==78 || new Set(cards.map(c=>c.id)).size!==78) throw new Error('牌组须含78张唯一牌。');
  const deck=cards.map(c=>({...c,isReversed: mode==='reflection' && random()<.35}));
  for(let i=deck.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
  return deck;
}
export function placeCard(slots, deck, deckIndex, slotIndex) {
  if(!Number.isInteger(deckIndex)||!Number.isInteger(slotIndex)||!deck[deckIndex]||slotIndex<0||slotIndex>=slots.length||slots[slotIndex]||slots.some(c=>c?.id===deck[deckIndex].id)) return false;
  slots[slotIndex]=deck[deckIndex]; return true;
}
export const isComplete=slots=>slots.length>0&&slots.every(Boolean);
export const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function roman(number){if(!Number.isInteger(number)||number<0||number>21)return '';if(number===0)return '0';let n=number,result='';for(const [value,glyph] of [[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']])while(n>=value){result+=glyph;n-=value;}return result;}
export function cardNumber(card){if(card.suit==='major')return roman(Number(card.id.slice(0,2)));const rank=card.id.split('-')[1];const n=['ace','two','three','four','five','six','seven','eight','nine','ten'].indexOf(rank);return n===-1?'':roman(n+1);}
export function fanEntries(deck,center,radius=5){return Array.from({length:Math.min(radius*2+1,deck.length)},(_,i)=>{const offset=i-radius,index=((center+offset)%deck.length+deck.length)%deck.length;return {card:deck[index],index,offset};});}
