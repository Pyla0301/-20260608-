// --- 輔助偵測函數 ---
function dist(p1, p2) { return Math.hypot(p1.x - p2.x, p1.y - p2.y); }
function getHandState(lm) {
  if (!lm) return "OTHER";
  const isExtended = (tip, mcp) => dist(lm[tip], lm[0]) > dist(lm[mcp], lm[0]);
  const index = isExtended(8, 5), middle = isExtended(12, 9), ring = isExtended(16, 13), pinky = isExtended(20, 17);
  if (index && middle && ring && pinky) return "PALM";
  if (!index && !middle && !ring && !pinky) return "FIST";
  if (!index && !middle) return "FIST"; 
  if (index && middle && !pinky) return "V"; 
  if (index && !middle && !ring && !pinky) return "POINT";
  return "OTHER";
}
const isTilt = (rF) => rF && Math.abs(rF[33].y - rF[263].y) > 0.05;
const isMoved = (st, rF) => {
  if (!rF) return false;
  if (!st.bF) { st.bF = {x: rF[1].x, y: rF[1].y}; return false; }
  return dist(rF[1], st.bF) > 0.04;
};
const resetMoved = (st, rF) => { if(rF) st.bF = {x: rF[1].x, y: rF[1].y}; };
const hasHand = (h, s) => h.some(x => getHandState(x) === s);
const allHands = (h, s) => h.length > 0 && h.every(x => getHandState(x) === s);

// --- 共通事件 ---
const COMMON_EVENTS = [
  { title: "【深夜的「恐怖惡作劇」電話】", desc: "凌晨兩點，手機突然瘋狂響起，電話那頭傳來一陣陰森的冷笑聲與磨刀聲！", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 80, task: "右手臉頰旁「比出☝️」，面部保持絕對冷靜不眨眼 3秒", ticksReq: 60, condFn: (st,h,f,rF)=>{ if(isMoved(st,rF)||f.eyesClosed) resetMoved(st,rF); return !isMoved(st,rF) && !f.eyesClosed && !f.isSmile && !f.isFrown && hasHand(h,'POINT') && rF && dist(h[0][8], rF[152])<0.4; }, success: {msg:"神邏輯反駁對方，反向定位詐騙基地！", effects:{wisdom:25}} },
      { name: "勇氣", reqType: "courage", reqVal: 75, task: "「雙手抱胸」並且「憤怒皺眉」維持 3 秒", ticksReq: 60, condFn: (st,h,f)=>!f.isSmile && f.isFrown, success: {msg:"狂暴怒罵，嚇得對方當場哭著道歉！", effects:{courage:30}} }
    ], fail: {msg:"被嚇到手忙腳亂掉手機，整晚失眠。", effects:{health:-15, courage:-5}} },
  { title: "【捷運上的「讓座情理法」博弈】", desc: "一位提著重物、滿臉怒氣的大媽氣勢洶洶地站到你面前死死瞪著你。", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 80, task: "展現「露齒微笑」，雙手「合十」維持 3 秒", ticksReq: 60, condFn: (st,h,f)=>f.isSmile && f.mouthOpen && h.length>=1, success: {msg:"大媽被逗得開懷大笑，塞給你香蕉當謝禮！", effects:{charm:25, health:5}} },
      { name: "智慧", reqType: "wisdom", reqVal: 75, task: "瞬間「閉上眼睛」4秒，並微幅規律點頭", ticksReq: 80, condFn: (st,h,f,rF)=>{ if(!rF)return false; if(st.lastY===undefined)st.lastY=rF[1].y; if(Math.abs(rF[1].y-st.lastY)>0.03){st.nods=(st.nods||0)+1;st.lastY=rF[1].y;} return f.eyesClosed; }, success: {msg:"戰術性假睡成功，大媽轉去逼別人讓座！", effects:{wisdom:20, health:10}} }
    ], fail: {msg:"呆坐原地不知所措，被拍上網公審沒禮貌。", effects:{charm:-20}} },
  { title: "【週末夜的「狂熱KTV」飆高音】", desc: "包廂氣氛嗨到最高點，麥克風塞到你手上，全場等你飆出《死了都要愛》！", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 85, task: "「歪頭」展現「大笑」，單手比小愛心 3秒", ticksReq: 60, condFn: (st,h,f,rF)=>isTilt(rF) && f.isSmile && f.mouthOpen && h.length>=1, success: {msg:"死黨們為你瘋狂尖叫，丟下無數沙鈴伴奏！", effects:{charm:30}} },
      { name: "勇氣", reqType: "courage", reqVal: 80, task: "4秒內「大張嘴巴」並「瘋狂擺動雙手」", ticksReq: 80, condFn: (st,h,f,rF,vel)=>f.mouthOpen && h.length>=2 && vel>0.03, success: {msg:"完美吼上神級高音，獲得【KTV歌王/歌后】！", effects:{courage:30}} }
    ], fail: {msg:"害羞不敢唱或大破音，尷尬地坐回角落。", effects:{charm:-10}} },
  { title: "【廚房火災！地獄廚神的誕生危機】", desc: "法式油封鴨火候沒控好，平底鍋冒出熊熊烈火觸發警報器！", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 80, task: "2秒內在鏡頭前「大範圍來回揮手(撲滅火勢)」", ticksReq: 40, condFn: (st,h,f,rF,vel)=>h.length>=1 && vel>0.025, success: {msg:"火勢瞬間被撲滅，危機完美化解！", effects:{wisdom:25}} },
      { name: "勇氣", reqType: "courage", reqVal: 85, task: "右手向前「比出✋」，面部極度嚴肅 3秒", ticksReq: 60, condFn: (st,h,f)=>hasHand(h,'PALM') && !f.isSmile && !f.isFrown && !f.mouthOpen, success: {msg:"抄起滅火器正面迎戰，成功保護房子！", effects:{courage:35}} }
    ], fail: {msg:"慌亂亂跑潑水，廚房一團亂還差點燒掉眉毛。", effects:{health:-25, wealth:-150}} },
  { title: "【深夜巧遇「流浪貓貓」的誘惑】", desc: "圓滾滾的橘貓從紙箱探出頭來「喵～」，主動走過來蹭你的腳踝。", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 75, task: "「蹲下(頭往下移)」並展現「極度溫柔微笑」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>{ if(!rF)return false; if(st.startY===undefined)st.startY=rF[1].y; return (rF[1].y-st.startY > 0.1) && f.isSmile; }, success: {msg:"被貓貓徹底治癒，社畜疲勞一掃而空！", effects:{charm:20, health:15}} },
      { name: "智慧", reqType: "wisdom", reqVal: 80, task: "對著鏡頭「比出✌️(模擬拿肉泥)」3秒", ticksReq: 60, condFn: (st,h)=>hasHand(h,'V'), success: {msg:"成功把貓貓收編，解鎖結局【幸福的貓奴人生】！", effects:{wisdom:20}} }
    ], fail: {msg:"動作太大嚇到貓貓，被貓貓哈氣抓傷。", effects:{health:-5, charm:-5}} }
  ,
  { title: "【與傲嬌同期的「加班深夜電影院」】", desc: "深夜 11 點，辦公室只剩你們兩人。同期布雷克臉有點紅地問：「我這有兩張週末的威秀電影票。你要是求我的話，我就勉強分你一張，去嗎？」", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 80, task: "「歪頭」並展現「超級燦爛的笑容」，雙手比出小愛心 3秒", ticksReq: 60, condFn: (st,h,f,rF)=>isTilt(rF) && f.isSmile && f.mouthOpen && h.length>=1, success: {msg:"使出頂級順毛大法，反向撩得對方滿臉通紅！約會成功！", effects:{charm:25}, bonds:"布雷克"} },
      { name: "智慧", reqType: "wisdom", reqVal: 75, task: "右手放在臉頰旁「比出☝️」，保持憋笑冷靜 3秒", ticksReq: 60, condFn: (st,h,f,rF)=>!f.isSmile && rF && h.some(hand => getHandState(hand) === 'POINT' && (dist(hand[8], rF[152])<0.4 || dist(hand[8], rF[234])<0.4 || dist(hand[8], rF[454])<0.4)), success: {msg:"你笑說「這票是你特地去排隊買的吧？」，布雷克高興地答應了！", effects:{wisdom:20}, bonds:"布雷克"} }
    ], fail: {msg:"反應太冷淡，布雷克覺得丟臉把票揉掉：「算了，當我沒說！」", effects:{charm:-10}} },
  { title: "【溫柔特助的「專屬手作愛心便當」】", desc: "中午你餓得發昏，特助伊安娜悄悄拿出精緻的雙層便當，溫柔地說：「我看你沒吃飯……不嫌棄的話，一起吃吧？」", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 85, task: "胸前「雙手合十」，展現「真誠溫柔的微笑」維持 3 秒", ticksReq: 60, condFn: (st,h,f)=>h.length>=1 && f.isSmile, success: {msg:"伊安娜看你吃得開心，露出了幸福的紅暈。", effects:{charm:30, health:20}, bonds:"伊安娜"} },
      { name: "勇氣", reqType: "courage", reqVal: 75, task: "對著鏡頭「比出✋(模擬牽手)」，且死死盯著螢幕不眨眼 3秒", ticksReq: 60, condFn: (st,h,f)=>hasHand(h,'PALM') && !f.eyesClosed, success: {msg:"你牽起她的手說「只要是你做的，我一輩子都想吃」，伊安娜大腦當機！", effects:{courage:25}, bonds:"伊安娜"} }
    ], fail: {msg:"你表現得像個木頭人，伊安娜失落地放下便當離開。", effects:{charm:-10}} },
  { title: "【霸道總裁的「電梯壁咚死線」】", desc: "電梯故障卡住！在黑暗中，總裁菲利克斯一把將你護在懷裡壁咚在牆上，聲音低沉：「別怕，有我在。這時候，你還要推開我嗎？」", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 85, task: "「雙手抱胸」，並且「面部保持冷靜不笑」維持 3 秒", ticksReq: 60, condFn: (st,h,f)=>!f.isSmile, success: {msg:"總裁嘴角上揚：「很有膽量，我就喜歡你這點。」", effects:{courage:35}, bonds:"菲利克斯"} },
      { name: "魅力", reqType: "charm", reqVal: 80, task: "雙手揉眼睛(靠近眼)，並且「嘴角向下、眉毛緊皺」 3秒", ticksReq: 60, condFn: (st,h,f,rF)=>h.length>=1 && !f.isSmile && rF && h.some(hand => dist(hand[8], rF[159])<0.35 || dist(hand[8], rF[386])<0.35), success: {msg:"總裁的心被你融化，將你抱得更緊，允諾出去後幫你加薪！", effects:{charm:25, wealth:100}, bonds:"菲利克斯"} }
    ], fail: {msg:"你嚇到尖叫亂揮，一巴掌打飛總裁眼鏡，變成職場性騷擾事件。", effects:{wealth:-50, charm:-20}} },
  { title: "【跨國神祕客戶的「化裝舞會微醺邀約」】", desc: "神祕跨國大客戶奧妮摘下面具低語：「要不要跟我喝完這杯酒，然後跟我一起去巴黎看塞納河的夜景？」", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 85, task: "右手放嘴前「比出✋(遮半臉)」，維持「嚴肅專注」 3秒", ticksReq: 60, condFn: (st,h,f,rF)=>hasHand(h,'PALM') && !f.isSmile && rF && h.some(hand => dist(hand[9], rF[13])<0.4), success: {msg:"對方被你的神秘感吸引，簽下千萬合約並約了私人晚餐！", effects:{wisdom:30, wealth:200}, bonds:"奧妮"} },
      { name: "魅力", reqType: "charm", reqVal: 85, task: "保持「露齒微笑」，並「單手托腮（指尖碰觸下巴）」 3秒", ticksReq: 60, condFn: (st,h,f,rF)=>f.isSmile && f.mouthOpen && h.length>=1 && rF && h.some(hand => dist(hand[8], rF[152])<0.4), success: {msg:"對方當場被你迷倒，親吻了你的手背！解鎖【跨國豪門世紀之戀】！", effects:{charm:35}, bonds:"奧妮"} }
    ], fail: {msg:"你像個土包子般驚慌失措，對方禮貌性笑了一下轉身離開。", effects:{charm:-15}} }
];

// --- 48 個專屬職業事件 ---
const PROFESSION_EVENTS = {
  "AI 科技巨擘": [
    { title: "【世紀新技術發佈會】", desc: "你站在全球科技大會中央發表最新的「全意識 AI」，突然簡報筆故障了！", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 90, task: "雙手「比出✌️」並「眉毛緊皺」3秒", ticksReq: 60, condFn: (st,h,f)=>allHands(h,'V') && f.isFrown, success: {msg:"展現深思，化解危機！", effects:{wealth:300, wisdom:15}} },
      { name: "魅力", reqType: "charm", reqVal: 85, task: "展現「完美笑容」維持 3 秒，並雙手合十", ticksReq: 60, condFn: (st,h,f)=>h.length>=1 && f.isSmile, success: {msg:"融資金額大暴漲！", effects:{charm:20}} }
    ], fail: {msg:"發表會冷場，股價暴跌。", effects:{wealth:-150}} },
    { title: "【董事會逼宮危機】", desc: "大股東們聯合起來質疑你的管理風格，試圖投票罷免你的執行長職位！", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 85, task: "完全靜止不動，右手「比出☝️」維持 3 秒", ticksReq: 60, condFn: (st,h,f,rF)=>{ if(isMoved(st,rF)) resetMoved(st,rF); return !isMoved(st,rF) && hasHand(h,'POINT'); }, success: {msg:"拿出秘密協議反制！", effects:{wisdom:25}} },
      { name: "魅力", reqType: "charm", reqVal: 85, task: "「歪頭」並展現「燦爛微笑」維持 3 秒", ticksReq: 60, condFn: (st,h,f,rF)=>isTilt(rF) && f.isSmile, success: {msg:"成功說服散戶股東！", effects:{charm:25}} }
    ], fail: {msg:"罷免成功，被踢出公司。", effects:{wealth:-200}} },
    { title: "【反壟斷聽證會】", desc: "你的 AI 公司被政府盯上，你必須出席國會聽證會面對尖銳質問。", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 92, task: "睜大眼睛、頭部完全靜止、4 秒內不眨眼", ticksReq: 80, condFn: (st,h,f,rF)=>{ if(isMoved(st,rF)||f.eyesClosed) resetMoved(st,rF); return !isMoved(st,rF) && !f.eyesClosed; }, success: {msg:"用無懈可擊的法理全身而退！", effects:{wisdom:30}} },
      { name: "魅力", reqType: "charm", reqVal: 80, task: "雙手合十並維持「微笑」3秒", ticksReq: 60, condFn: (st,h,f)=>h.length>=1 && f.isSmile, success: {msg:"博取全網輿論同情！", effects:{charm:20}} }
    ], fail: {msg:"被判處巨額罰款，面臨拆分。", effects:{wealth:-300}} }
  ],
  "創新企業家": [
    { title: "【跨國集團的併購談判】", desc: "對方開出極低價格，試圖用資金優勢逼你屈服。", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 85, task: "右手「比出☝️」，且「面部嚴肅」維持 3 秒", ticksReq: 60, condFn: (st,h,f)=>hasHand(h,'POINT') && !f.isSmile, success: {msg:"看穿底牌，反手提高售價！", effects:{wealth:250, wisdom:15}} },
      { name: "魅力", reqType: "charm", reqVal: 85, task: "「露齒微笑」，雙手做「比出大愛心」3秒", ticksReq: 60, condFn: (st,h,f)=>f.isSmile && f.mouthOpen && h.length>=2, success: {msg:"用極佳的私交談到雙贏合約！", effects:{wealth:150, charm:20}} }
    ], fail: {msg:"談判破裂，資金鍊斷裂。", effects:{wealth:-100}} },
    { title: "【遭遇金融海嘯突襲】", desc: "全球市場崩盤，員工與店面面臨恐慌危機。", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 90, task: "雙手「比出✌️」，且「4 秒內不能眨眼」", ticksReq: 80, condFn: (st,h,f)=>allHands(h,'V') && !f.eyesClosed, success: {msg:"精準求生，成功轉型數位電商！", effects:{wisdom:30}} },
      { name: "魅力", reqType: "charm", reqVal: 80, task: "雙手合十，並展現「真誠微笑」3秒", ticksReq: 60, condFn: (st,h,f)=>h.length>=1 && f.isSmile, success: {msg:"發表感人演說，員工降薪共體時艱！", effects:{charm:25}} }
    ], fail: {msg:"公司宣告破產重組。", effects:{wealth:-200}} },
    { title: "【投資神祕的新創黑馬】", desc: "年輕人拿著沒人懂的「可燃冰新能源」計畫找你投資。", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 80, task: "「單手托腮（手靠近下巴）」維持 3 秒", ticksReq: 60, condFn: (st,h,f,rF)=>h.length>=1 && rF && dist(h[0][8], rF[152])<0.3, success: {msg:"投資後大翻倍！", effects:{wisdom:20, wealth:400}} },
      { name: "魅力", reqType: "charm", reqVal: 80, task: "「歪頭」並展現「完美笑容」維持 3 秒", ticksReq: 60, condFn: (st,h,f,rF)=>isTilt(rF) && f.isSmile, success: {msg:"成功把這天才挖角到自己公司！", effects:{charm:20}} }
    ], fail: {msg:"投資失敗，大筆資金打了水漂。", effects:{wealth:-120}} }
  ],
  "頂尖外科醫生": [
    { title: "【路邊突發的心肌梗塞】", desc: "路人痛苦倒地、心跳停止！你必須挺身而出。", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 85, task: "3 秒內「瘋狂擺動雙手(CPR)」", ticksReq: 60, condFn: (st,h,f,rF,vel)=>h.length>=2 && vel>0.02, success: {msg:"救活路人！", effects:{courage:30, charm:15}} },
      { name: "智慧", reqType: "wisdom", reqVal: 85, task: "右手伸向前方，做出「規律左右揮動」3秒", ticksReq: 60, condFn: (st,h,f,rF,vel)=>h.length>=1 && vel>0.015, success: {msg:"利用吸管做出應急通道救活路人！", effects:{wisdom:25}} }
    ], fail: {msg:"錯失黃金救援時間，遺憾收場。", effects:{courage:-15}} },
    { title: "【馬拉松式手術的限界】", desc: "來到最關鍵的微細血管縫合階段，體力達到極限。", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 90, task: "睜大眼睛、不亂動、4 秒內不能眨眼", ticksReq: 80, condFn: (st,h,f,rF)=>{ if(isMoved(st,rF)||f.eyesClosed) resetMoved(st,rF); return !isMoved(st,rF) && !f.eyesClosed; }, success: {msg:"手術大成功，獲頒名醫勳章！", effects:{wisdom:30, wealth:100}} },
      { name: "勇氣", reqType: "courage", reqVal: 80, task: "雙手高舉過頭，維持「面部嚴肅」 3 秒", ticksReq: 60, condFn: (st,h,f)=>h.length>=2 && h.every(x=>x[0].y<0.3) && !f.isSmile, success: {msg:"用意志力克服肉體極限！", effects:{courage:25, health:10}} }
    ], fail: {msg:"手滑導致手術出包，引發醫療糾紛。", effects:{wealth:-150}} },
    { title: "【醫學權威的公開質疑】", desc: "大會上，老權威教授站起來冷冷質疑你的新手術。", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 85, task: "雙手「比出✌️」並維持「面部專注」3秒", ticksReq: 60, condFn: (st,h,f)=>allHands(h,'V') && !f.isSmile, success: {msg:"拿出上千例數據當場打臉權威！", effects:{wisdom:25}} },
      { name: "勇氣", reqType: "courage", reqVal: 85, task: "「雙手抱胸」並「憤怒皺眉」3秒", ticksReq: 60, condFn: (st,h,f)=>f.isFrown && !f.isSmile, success: {msg:"用強大霸氣捍衛學術尊嚴！", effects:{courage:30}} }
    ], fail: {msg:"學術地位崩塌，被醫學會邊緣化。", effects:{charm:-20}} }
  ],
  "傳奇白帽駭客": [
    { title: "【國家級骨幹網路遭侵入】", desc: "神祕黑客組織攻擊國家電網，你被緊急聯絡進行防禦。", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 90, task: "雙手在中央快速變換手勢(快速揮動) 3秒", ticksReq: 60, condFn: (st,h,f,rF,vel)=>h.length>=2 && vel>0.02, success: {msg:"編寫出反制防火牆，攔截攻擊！", effects:{wisdom:30, wealth:100}} },
      { name: "勇氣", reqType: "courage", reqVal: 80, task: "「雙手抱胸」並維持「面部嚴肅」 3 秒", ticksReq: 60, condFn: (st,h,f)=>!f.isSmile && f.isFrown, success: {msg:"反向追蹤駭客，癱瘓對方伺服器！", effects:{courage:25}} }
    ], fail: {msg:"防禦崩潰，遭到安全部門調查。", effects:{courage:-20}} },
    { title: "【暗網的暗殺封口令】", desc: "你揭發洗錢線索，暗網對你發出高額懸賞，門口出現可疑黑影！", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 85, task: "身體靜止不動，右手「比出☝️」維持 3 秒", ticksReq: 60, condFn: (st,h,f,rF)=>{ if(isMoved(st,rF)) resetMoved(st,rF); return !isMoved(st,rF) && hasHand(h,'POINT'); }, success: {msg:"利用智慧家居反向入侵殺手手機！", effects:{wisdom:25}} },
      { name: "勇氣", reqType: "courage", reqVal: 85, task: "右手「比出✋」並快速左右揮動 2秒", ticksReq: 40, condFn: (st,h,f,rF,vel)=>hasHand(h,'PALM') && vel>0.03, success: {msg:"正面威嚇，黑影被嚇退！", effects:{courage:30}} }
    ], fail: {msg:"驚慌失措導致電腦被竊取，數據外洩。", effects:{health:-30}} },
    { title: "【解密神秘的古代硬碟】", desc: "考古挖出 21 世紀末留下來的量子加密硬碟，請你破解。", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 85, task: "雙手「比出✌️」維持 3 秒", ticksReq: 60, condFn: (st,h)=>allHands(h,'V'), success: {msg:"成功解開密碼，獲得歷史真相！", effects:{wisdom:30}} },
      { name: "勇氣", reqType: "courage", reqVal: 75, task: "「雙手高舉過頭」並維持「面部專注」3秒", ticksReq: 60, condFn: (st,h,f)=>h.length>=2 && h.every(x=>x[0].y<0.3) && !f.isSmile, success: {msg:"暴力窮舉強行燒毀加密模組，拿到殘存數據！", effects:{courage:20}} }
    ], fail: {msg:"硬碟觸發自毀程序化為青煙。", effects:{wisdom:-10}} }
  ],
  "百萬極客網紅": [
    { title: "【直播開箱重大翻車】", desc: "10 萬人在線直播開箱，手機卻在你手上冒煙自燃！", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 80, task: "單手「比出☝️」，面部保持絕對冷靜 3秒", ticksReq: 60, condFn: (st,h,f)=>hasHand(h,'POINT') && !f.isSmile && !f.isFrown, success: {msg:"轉化為幽默防身側評，因神危機處理爆紅！", effects:{wisdom:25}} },
      { name: "魅力", reqType: "charm", reqVal: 85, task: "「歪頭」燦爛微笑，雙手比出小愛心 3秒", ticksReq: 60, condFn: (st,h,f,rF)=>isTilt(rF) && f.isSmile && h.length>=1, success: {msg:"用超可愛反應融化觀眾，翻車變福利！", effects:{charm:30}} }
    ], fail: {msg:"嚇到大哭，被剪成迷因出征。", effects:{charm:-30}} },
    { title: "【遭黑粉水軍大規模抹黑】", desc: "黑粉挖出多年前留言，買了水軍試圖在網路上「炎上」你。", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 85, task: "雙手「比出✌️」維持 3 秒", ticksReq: 60, condFn: (st,h)=>allHands(h,'V'), success: {msg:"發佈一條邏輯清晰的澄清影片，打臉黑粉！", effects:{wisdom:25}} },
      { name: "魅力", reqType: "charm", reqVal: 90, task: "雙手合十，並「眉毛緊皺、嘴角向下」3秒", ticksReq: 60, condFn: (st,h,f)=>h.length>=1 && f.isFrown && !f.isSmile, success: {msg:"粉絲心疼力挺，成功化解危機！", effects:{charm:35}} }
    ], fail: {msg:"跟酸民隔空對罵，頻道遭到封殺。", effects:{wealth:-200}} },
    { title: "【跨國大廠的百萬代言】", desc: "知名品牌要求在鏡頭前做出熱情挑戰。", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 80, task: "雙手瘋狂上下揮舞，臉部展現「大笑」3秒", ticksReq: 60, condFn: (st,h,f,rF,vel)=>h.length>=2 && vel>0.03 && f.isSmile && f.mouthOpen, success: {msg:"超熱情表現拿下百萬代言！", effects:{wealth:400, charm:20}} },
      { name: "智慧", reqType: "wisdom", reqVal: 80, task: "單手「比出✋」遮嘴，並保持「微笑」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>hasHand(h,'PALM') && rF && dist(h[0][9], rF[13])<0.3 && f.isSmile, success: {msg:"用智商談判拿到更高分潤！", effects:{wisdom:20, wealth:200}} }
    ], fail: {msg:"表現僵硬，合約給了競爭對手。", effects:{wealth:-50}} }
  ],
  "頂級王牌律師": [
    { title: "【世紀懸案的法庭終辯】", desc: "所有證據都對你方不利，你必須翻轉陪審團輿論！", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 90, task: "「歪頭」真誠微笑，雙手合十維持 3 秒", ticksReq: 60, condFn: (st,h,f,rF)=>isTilt(rF) && f.isSmile && h.length>=1, success: {msg:"極具感染力的演說打動陪審團落淚！", effects:{charm:35}} },
      { name: "智慧", reqType: "wisdom", reqVal: 85, task: "雙手「比出✌️」並維持「面部嚴肅」3秒", ticksReq: 60, condFn: (st,h,f)=>allHands(h,'V') && !f.isSmile, success: {msg:"當場抓出證詞邏輯漏洞，逆轉勝訴！", effects:{wisdom:25}} }
    ], fail: {msg:"辯護失敗，被告判處無期徒刑。", effects:{charm:-20}} },
    { title: "【對手律師的下作威脅】", desc: "對方拿偽造照片威脅你明天開庭主動認輸。", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 80, task: "右手放在臉頰旁「比出☝️」維持 3 秒", ticksReq: 60, condFn: (st,h,f,rF)=>hasHand(h,'POINT') && rF && dist(h[0][8], rF[234])<0.4, success: {msg:"指出偽造痕跡，錄音反控對方恐嚇！", effects:{wisdom:20}} },
      { name: "魅力", reqType: "charm", reqVal: 85, task: "展現「露齒微笑」，並雙手比出小愛心 3秒", ticksReq: 60, condFn: (st,h,f)=>f.isSmile && f.mouthOpen && h.length>=1, success: {msg:"強大自信反將一軍，對手心虛撤訴！", effects:{charm:25}} }
    ], fail: {msg:"被嚇到答應條件，身敗名裂。", effects:{wealth:-150}} },
    { title: "【跨國財團的法律顧問爭奪】", desc: "你必須現場回答財團總裁的終極商業難題。", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 90, task: "睜大眼睛、頭部完全靜止、4 秒內不眨眼", ticksReq: 80, condFn: (st,h,f,rF)=>{ if(isMoved(st,rF)||f.eyesClosed) resetMoved(st,rF); return !isMoved(st,rF) && !f.eyesClosed; }, success: {msg:"提出完美方案，拿下年薪千萬合約！", effects:{wisdom:30, wealth:300}} },
      { name: "魅力", reqType: "charm", reqVal: 80, task: "「雙手合十」並維持「完美笑容」3秒", ticksReq: 60, condFn: (st,h,f)=>h.length>=1 && f.isSmile, success: {msg:"深得總裁信任，成為私人法律密友！", effects:{charm:20}} }
    ], fail: {msg:"回答錯誤，合約被對手奪走。", effects:{wealth:-50}} }
  ],
  "傳奇搖滾巨星": [
    { title: "【萬人體育館斷弦危機】", desc: "最燃的 Solo 階段，吉他弦突然「啪」一聲斷了！", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 85, task: "左手比 1，右手瘋狂上下快速揮動 3秒", ticksReq: 60, condFn: (st,h,f,rF,vel)=>h.length>=2 && vel>0.03 && hasHand(h, 'POINT'), success: {msg:"砸吉他被封為歷史級搖滾名場面！", effects:{courage:30, charm:15}} },
      { name: "魅力", reqType: "charm", reqVal: 90, task: "雙手高舉過頭比大愛心，真誠微笑 3秒", ticksReq: 60, condFn: (st,h,f)=>h.length>=2 && h.every(x=>x[0].y<0.3) && f.isSmile, success: {msg:"現場引發萬人大合唱！", effects:{charm:35}} }
    ], fail: {msg:"尷尬下不了台，演唱會慘淡收場。", effects:{charm:-20}} },
    { title: "【狗仔隊的深夜偷拍圍攻】", desc: "狗仔把麥克風塞到你臉上瘋狂問隱私問題。", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 80, task: "「雙手抱胸」並「憤怒皺眉」3秒", ticksReq: 60, condFn: (st,h,f)=>!f.isSmile && f.isFrown, success: {msg:"超強巨星氣場嚇退狗仔！", effects:{courage:25}} },
      { name: "魅力", reqType: "charm", reqVal: 85, task: "「比出✌️」，並展現「露齒微笑」3秒", ticksReq: 60, condFn: (st,h,f)=>hasHand(h,'V') && f.isSmile && f.mouthOpen, success: {msg:"媒體大讚天王優雅風範！", effects:{charm:25}} }
    ], fail: {msg:"動手推搡狗仔，被抹黑成暴躁歌星。", effects:{wealth:-100}} },
    { title: "【終極世界巡迴演唱會】", desc: "體力透支，需要觀眾給你最高級別的應援能量。", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 75, task: "瘋狂擺動雙手（帶動跳姿態）4秒", ticksReq: 80, condFn: (st,h,f,rF,vel)=>h.length>=2 && vel>0.03, success: {msg:"完成神級演出，成為不朽傳奇！", effects:{courage:30, wealth:500}} },
      { name: "魅力", reqType: "charm", reqVal: 85, task: "雙手高舉比心，對著鏡頭「露齒大笑」3秒", ticksReq: 60, condFn: (st,h,f)=>h.length>=2 && h.every(x=>x[0].y<0.4) && f.isSmile && f.mouthOpen, success: {msg:"歌迷感動落淚！", effects:{charm:30}} }
    ], fail: {msg:"體力不支暈倒在舞台上，巡演中斷。", effects:{health:-30}} }
  ],
  "奧斯卡影帝/影后": [
    { title: "【開拍前一秒的劇本大改】", desc: "導演要求你在一鏡到底中展現極致的情緒！", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 85, task: "雙手「握拳靠近眼睛」，並來回轉動(模擬大哭) 4秒", ticksReq: 80, condFn: (st,h,f,rF,vel)=>h.length>=2 && vel>0.005 && rF && h.every(hand=>dist(hand[9], rF[159])<0.5 || dist(hand[9], rF[386])<0.5 || dist(hand[9], rF[234])<0.5 || dist(hand[9], rF[454])<0.5), success: {msg:"神級演技，直接預定奧斯卡提名！", effects:{charm:30}} },
      { name: "勇氣", reqType: "courage", reqVal: 80, task: "「雙手抱胸」並「憤怒皺眉」3秒", ticksReq: 60, condFn: (st,h,f)=>f.isFrown && !f.isSmile, success: {msg:"演活了霸氣復仇的反派，全場鼓掌！", effects:{courage:25}} }
    ], fail: {msg:"笑場或僵硬，被導演痛罵過氣。", effects:{charm:-15}} },
    { title: "【高空威亞吊鋼絲意外】", desc: "一條鋼絲突然斷裂，你整個人懸在半空搖晃！", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 85, task: "2秒內瘋狂擺動雙手(核心調整)", ticksReq: 40, condFn: (st,h,f,rF,vel)=>h.length>=2 && vel>0.03, success: {msg:"完美落地，完成超帥空中受身！", effects:{courage:30, health:10}} },
      { name: "魅力", reqType: "charm", reqVal: 80, task: "保持「露齒微笑」，雙手高举過頭 3秒", ticksReq: 60, condFn: (st,h,f)=>f.isSmile && f.mouthOpen && h.length>=2 && h.every(x=>x[0].y<0.3), success: {msg:"驚恐中保持巨星表情，心理素質強大！", effects:{charm:25}} }
    ], fail: {msg:"慘叫著摔在安全墊邊緣，扭傷腳踝。", effects:{health:-30}} },
    { title: "【全球直播頒獎典禮】", desc: "主持人開了一個極度冒犯你家人的玩笑，全場看你反應。", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 90, task: "優雅得體微笑，並「單手托腮」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>f.isSmile && h.length>=1 && rF && dist(h[0][9], rF[152]) < 0.4, success: {msg:"極高EQ幽默回擊，全網封你為優雅之神！", effects:{charm:35}} },
      { name: "勇氣", reqType: "courage", reqVal: 85, task: "大喊(手掌張開在臉側)，且「面部嚴肅」3秒", ticksReq: 60, condFn: (st,h,f)=>f.mouthOpen && !f.isSmile && allHands(h,'PALM'), success: {msg:"當場霸氣怒斥主持人，贏得全球尊重！", effects:{courage:30}} }
    ], fail: {msg:"在台上不知所措，被媒體解讀為懦弱。", effects:{courage:-15}} }
  ],
  "極限探險家": [
    { title: "【聖母峰遭遇暴風雪】", desc: "能見度歸零，氧氣瓶耗盡，體溫急速下降！", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 90, task: "雙手向上攀爬（快速揮動），維持 3 秒", ticksReq: 60, condFn: (st,h,f,rF,vel)=>h.length>=2 && vel>0.02, success: {msg:"突破極限，成功生還！", effects:{courage:35, health:10}} },
      { name: "智慧", reqType: "wisdom", reqVal: 80, task: "身體靜止不動，右手「比出☝️」維持 3 秒", ticksReq: 60, condFn: (st,h,f,rF)=>{ if(isMoved(st,rF)) resetMoved(st,rF); return !isMoved(st,rF) && hasHand(h,'POINT'); }, success: {msg:"精準判斷地形躲進隱密冰洞！", effects:{wisdom:25}} }
    ], fail: {msg:"凍傷嚴重，被直升機緊急送醫。", effects:{health:-40}} },
    { title: "【雨林遇見美洲豹】", desc: "草叢竄出巨大美洲豹，雙眼死死盯著你準備撲來！", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 85, task: "「雙手張開✋」並且「憤怒皺眉」維持 3 秒", ticksReq: 60, condFn: (st,h,f)=>allHands(h,'PALM') && f.isFrown, success: {msg:"頂級掠食者氣場嚇跑美洲豹！", effects:{courage:30}} },
      { name: "智慧", reqType: "wisdom", reqVal: 85, task: "睜大眼睛、全身完全靜止、4 秒內不眨眼", ticksReq: 80, condFn: (st,h,f,rF)=>{ if(isMoved(st,rF)||f.eyesClosed) resetMoved(st,rF); return !isMoved(st,rF) && !f.eyesClosed; }, success: {msg:"與環境融為一體，美洲豹失去興趣離開！", effects:{wisdom:25}} }
    ], fail: {msg:"驚慌逃跑引發獵殺本能，大腿被咬傷。", effects:{health:-30}} },
    { title: "【神祕海底古文明發現】", desc: "發現亞特蘭提斯神廟。氧氣剩5分鐘，冒險還是返航？", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 80, task: "「比出✋」維持 3 秒", ticksReq: 60, condFn: (st,h)=>hasHand(h,'PALM'), success: {msg:"拍下照片震驚考古界！", effects:{courage:30, wealth:600}} },
      { name: "智慧", reqType: "wisdom", reqVal: 85, task: "雙手「比出✌️」維持 3 秒", ticksReq: 60, condFn: (st,h)=>allHands(h,'V'), success: {msg:"避開水下機關拿到古老黃金文物！", effects:{wisdom:30}} }
    ], fail: {msg:"被困在神廟中險些溺水。", effects:{health:-20}} }
  ],
  "太空飛行員": [
    { title: "【空間站對接的儀器失效】", desc: "雷達黑屏！手動對接失敗將被反彈進無垠的太空。", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 90, task: "雙手「比出✌️」并死死盯著螢幕不眨眼 4秒", ticksReq: 80, condFn: (st,h,f)=>allHands(h,'V') && !f.eyesClosed, success: {msg:"靠心算軌道公式，盲對接完美成功！", effects:{wisdom:35, wealth:150}} },
      { name: "勇氣", reqType: "courage", reqVal: 85, task: "右手在前「比出☝️」，絕對冷靜不笑 3秒", ticksReq: 60, condFn: (st,h,f)=>hasHand(h,'POINT') && !f.isSmile && !f.isFrown, success: {msg:"穩如泰山的心臟，手動微調成功對接！", effects:{courage:30}} }
    ], fail: {msg:"對接失敗擦撞空間站，太空艙漏氣。", effects:{health:-30}} },
    { title: "【未知星球的致命病毒】", desc: "太空衣被劃破！警報器響起，未知大氣正在滲入！", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 80, task: "右手放在臉頰旁「比出☝️」維持 3 秒", ticksReq: 60, condFn: (st,h,f,rF)=>hasHand(h,'POINT') && rF && dist(h[0][8], rF[152])<0.4, success: {msg:"急中生智，利用膠布封鎖缺口！", effects:{wisdom:25}} },
      { name: "勇氣", reqType: "courage", reqVal: 85, task: "2秒內右手「比出✋」快速大範圍揮動", ticksReq: 40, condFn: (st,h,f,rF,vel)=>hasHand(h,'PALM') && vel>0.03, success: {msg:"強行抵抗氣體，狂奔回氣閘艙！", effects:{courage:30, health:10}} }
    ], fail: {msg:"外星病毒感染，進入隔離艙躺了一個月。", effects:{health:-40}} },
    { title: "【遭遇微隕石群風暴】", desc: "防護罩碎裂，必須手動操控飛船避開密集彈幕。", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 80, task: "4秒內，左右劇烈晃動身體", ticksReq: 80, condFn: (st,h,f,rF)=>{ if(!rF) return false; if(!st.bF) st.bF = {x: rF[1].x, y: rF[1].y}; return Math.abs(rF[1].x - st.bF.x) > 0.05; }, success: {msg:"成功穿越隕石帶，飛船完好無損！", effects:{courage:35}} },
      { name: "智慧", reqType: "wisdom", reqVal: 85, task: "保持「完全靜止不動」 4 秒鐘", ticksReq: 80, condFn: (st,h,f,rF)=>{ if(isMoved(st,rF)) resetMoved(st,rF); return !isMoved(st,rF); }, success: {msg:"精準算出盲區，動都不動就擦身而過！", effects:{wisdom:30}} }
    ], fail: {msg:"飛船多處被隕石擊穿，資產受損。", effects:{wealth:-200}} }
  ],
  "跨國特種特工": [
    { title: "【核彈密碼最後解密】", desc: "發射剩5秒。必須在紅藍線路中切斷正確的一條！", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 90, task: "2秒內右手「比出✋」並快速左右揮動", ticksReq: 40, condFn: (st,h,f,rF,vel)=>hasHand(h,'PALM') && vel>0.03, success: {msg:"暴力破解核彈成功！", effects:{courage:35}} },
      { name: "智慧", reqType: "wisdom", reqVal: 80, task: "雙眼睁大、全身完全靜止、4 秒內不眨眼", ticksReq: 80, condFn: (st,h,f,rF)=>{ if(isMoved(st,rF)||f.eyesClosed) resetMoved(st,rF); return !isMoved(st,rF) && !f.eyesClosed; }, success: {msg:"最後一秒精準切斷正確線路！", effects:{wisdom:25}} }
    ], fail: {msg:"核彈引爆，極限翻滾逃離受重傷。", effects:{health:-35}} },
    { title: "【皇家賭場生死間諜戰】", desc: "與敵方情報頭子一億美金對決。對方死死盯著你的微表情。", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 85, task: "展現「完美的招牌高冷微笑」維持 3 秒", ticksReq: 60, condFn: (st,h,f)=>f.isSmile && !f.mouthOpen, success: {msg:"完美撲克臉贏得賭局與情報！", effects:{charm:30, wealth:300}} },
      { name: "勇氣", reqType: "courage", reqVal: 80, task: "「雙手抱胸」並「憤怒皺眉」3秒", ticksReq: 60, condFn: (st,h,f)=>!f.isSmile && f.isFrown, success: {msg:"特工煞氣直接在心理上壓垮對手！", effects:{courage:25}} }
    ], fail: {msg:"眼神閃爍被看穿，賭輸巨資遭圍攻。", effects:{wealth:-200}} },
    { title: "【萬米高空無傘跳傘】", desc: "被推下高空沒傘！必須調整姿態撞向下方敵人奪傘！", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 85, task: "雙手高舉，身體(或雙手)快速擺動 3秒", ticksReq: 60, condFn: (st,h,f,rF,vel)=>{ if(!rF) return false; if(!st.bF) st.bF = {x: rF[1].x, y: rF[1].y}; return h.length>=2 && h.every(x=>x[0].y<0.5) && (Math.abs(rF[1].x - st.bF.x) > 0.04 || vel>0.02); }, success: {msg:"空中極限奪傘解鎖結局！", effects:{courage:40}} },
      { name: "魅力", reqType: "charm", reqVal: 80, task: "「歪頭」並展現「完美笑容」維持 3 秒", ticksReq: 60, condFn: (st,h,f,rF)=>isTilt(rF) && f.isSmile, success: {msg:"說服旁邊的友方特工拉你一把！", effects:{charm:20}} }
    ], fail: {msg:"搶傘失敗摔在稻草堆。", effects:{health:-50}} }
  ],
  "頂級體育巨星": [
    { title: "【總決賽最後 0.1 秒的絕殺】", desc: "世界盃總決賽最後一擊，三名防守球員朝你飛撲！", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 90, task: "2秒內瘋狂擺動雙手(跳投/抽射)", ticksReq: 40, condFn: (st,h,f,rF,vel)=>h.length>=2 && vel>0.03, success: {msg:"球進！壓哨絕殺！贏得世界冠軍！", effects:{courage:35, wealth:200}} },
      { name: "魅力", reqType: "charm", reqVal: 80, task: "「歪頭」並展現「自信大笑」，維持 3 秒", ticksReq: 60, condFn: (st,h,f,rF)=>isTilt(rF) && f.isSmile && f.mouthOpen, success: {msg:"超帥眼神假動作晃飛所有人，輕鬆得分！", effects:{charm:30}} }
    ], fail: {msg:"球打在籃框上彈出，痛失冠軍。", effects:{courage:-25}} },
    { title: "【遭遇嚴重的職業傷病】", desc: "十字韌帶舊傷復發，但下一場就是宿敵之戰！", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 85, task: "「雙手抱胸」並且「憤怒皺眉」維持 3 秒", ticksReq: 60, condFn: (st,h,f)=>!f.isSmile && f.isFrown, success: {msg:"打碎痛針強行上場，被封為鐵血硬漢！", effects:{courage:35, health:-20}} },
      { name: "魅力", reqType: "charm", reqVal: 85, task: "雙手合十並維持「真誠微笑」3秒", ticksReq: 60, condFn: (st,h,f)=>h.length>=1 && f.isSmile, success: {msg:"理智選擇手術轉戰解說台，圈粉無數！", effects:{charm:25}} }
    ], fail: {msg:"強行上場卻毫無表現又二次受傷。", effects:{health:-40}} },
    { title: "【天價的球鞋終身合約】", desc: "體育品牌總裁給你一億美金合約，要你展現巨星感染力。", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 90, task: "露齒微笑，並「雙手在頭頂比出大愛心」3秒", ticksReq: 60, condFn: (st,h,f)=>f.isSmile && f.mouthOpen && h.length>=2 && h.every(x=>x[0].y<0.3), success: {msg:"合約當場簽下，解鎖【體壇傳奇】！", effects:{wealth:600, charm:30}} },
      { name: "勇氣", reqType: "courage", reqVal: 80, task: "「雙手高舉過頭(火柴人姿勢)」維持 3 秒", ticksReq: 60, condFn: (st,h,f)=>h.length>=2 && h.every(x=>x[0].y<0.3), success: {msg:"用霸氣拒絕條款，反而讓廠商主動加碼！", effects:{courage:20, wealth:400}} }
    ], fail: {msg:"發佈會表現生硬，廠商決定縮減合約金額。", effects:{wealth:-100}} }
  ],
  "命運幕後掌控者": [
    { title: "【世界經濟危機調控】", desc: "工業次元首紛紛打秘密電話給你，請求調度神秘資金稳定秩序。", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 85, task: "右手太陽穴旁「比出☝️」+「微笑」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>hasHand(h,'POINT') && rF && dist(h[0][8], rF[234])<0.4 && f.isSmile, success: {msg:"操控全球金融走向！", effects:{wisdom:30, wealth:500}} },
      { name: "勇氣", reqType: "courage", reqVal: 85, task: "雙手「比出✌️」+「面部極度嚴肅」3秒", ticksReq: 60, condFn: (st,h,f)=>allHands(h,'V') && !f.isSmile && !f.isFrown, success: {msg:"強行合併跨國銀行化解危機！", effects:{courage:30}} }
    ], fail: {msg:"全球經濟衰退，神秘資產縮水。", effects:{wealth:-200}} },
    { title: "【模擬器原始碼的混亂修復】", desc: "模擬器源碼突然出 Bug，過去、現在、未來時間線在鏡頭前崩塌重疊！", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 90, task: "睜大眼睛、全身靜止、5 秒內絕對不能眨眼", ticksReq: 100, condFn: (st,h,f,rF)=>{ if(isMoved(st,rF)||f.eyesClosed) resetMoved(st,rF); return !isMoved(st,rF) && !f.eyesClosed; }, success: {msg:"徒手在畫面上重構時間軸！", effects:{wisdom:40}} },
      { name: "勇氣", reqType: "courage", reqVal: 85, task: "3 秒內「瘋狂擺動雙手(像素極致變動)」", ticksReq: 60, condFn: (st,h,f,rF,vel)=>h.length>=2 && vel>0.04, success: {msg:"用肉體狂暴能量強行重置模擬器！", effects:{courage:35}} }
    ], fail: {msg:"陷入時空循環，屬性扣除。", effects:{wisdom:-20, courage:-20, charm:-20}} },
    { title: "【創世神的最終抉擇】", desc: "命運之鏡向你發問：你決定抹去這個模擬器，還是讓它永遠運轉下去？", time: 7, branches: [
      { name: "全能", reqType: "wisdom", reqVal: 85, task: "雙手在胸前「比出雙手合十」維持 3 秒", ticksReq: 60, condFn: (st,h)=>h.length>=1, success: {msg:"解鎖隱藏結局【永恆的命運主宰】！", effects:{wisdom:50, courage:50, charm:50, wealth:50, health:50}} }
    ], fail: {msg:"沒能維持動作，保留一半屬性開啟轉生二周目。", effects:{wisdom:-40}} }
  ],
  "魔法學院院長": [
    { title: "【黑魔法結界封印】", desc: "遠古黑魔法生物瘋狂衝向大門，你必須帶領全校教授設下終極防禦結界！", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 85, task: "雙手「比出✌️」并「緊皺眉頭」維持 3 秒", ticksReq: 60, condFn: (st,h,f)=>allHands(h,'V') && f.isFrown, success: {msg:"算出防禦咒語的幾何方位，結界堅不可摧！", effects:{wisdom:30}} },
      { name: "勇氣", reqType: "courage", reqVal: 85, task: "右手在前「比出✋」並快速大範圍揮動 3秒", ticksReq: 60, condFn: (st,h,f,rF,vel)=>hasHand(h,'PALM') && vel>0.03, success: {msg:"爆發出極致魔法純量，一擊轟散魔物群！", effects:{courage:30}} }
    ], fail: {msg:"大門被衝破，學院建築部分毀損。", effects:{health:-20}} },
    { title: "【賢者之石的鍊金術暴走】", desc: "學生私自鍊金，高能量核心共振暴走，眼看就要化為灰燼！", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 90, task: "完全身體靜止，右手臉頰旁「比出☝️」4秒", ticksReq: 80, condFn: (st,h,f,rF)=>{ if(isMoved(st,rF)) resetMoved(st,rF); return !isMoved(st,rF) && hasHand(h,'POINT'); }, success: {msg:"精準切斷逆向鍊金陣，暴走平息！", effects:{wisdom:35}} },
      { name: "魅力", reqType: "charm", reqVal: 80, task: "展現「溫柔微笑」，雙手合十維持 3 秒", ticksReq: 60, condFn: (st,h,f)=>f.isSmile && h.length>=1, success: {msg:"用至純的精神力安撫魔法核心！", effects:{charm:25}} }
    ], fail: {msg:"實驗室大爆炸，城堡塔樓被炸飛一座。", effects:{wealth:-150}} },
    { title: "【國際巫師法庭的審判】", desc: "魔法部指控你私自收留危險幻獸，必須在聽證會上為自己辯護。", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 85, task: "「歪頭」並展現「招牌微笑」維持 3 秒", ticksReq: 60, condFn: (st,h,f,rF)=>isTilt(rF) && f.isSmile, success: {msg:"風趣優雅的談吐讓所有大法官當場撤訴！", effects:{charm:30}} },
      { name: "勇氣", reqType: "courage", reqVal: 80, task: "「雙手抱胸」並「憤怒皺眉」3秒", ticksReq: 60, condFn: (st,h,f)=>!f.isSmile && f.isFrown, success: {msg:"強大魔法威壓讓魔法部長當場不敢說話！", effects:{courage:30}} }
    ], fail: {msg:"學院遭到魔法部接管，你被暫時停職。", effects:{courage:-20}} }
  ],
  "無憂無慮的躺平大師": [
    { title: "【公園長椅搶位大戰】", desc: "公園最舒服適合睡午覺的長椅被流浪漢盯上了！", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 30, task: "單手「比出✋(打哈欠)」並「閉上眼睛」3秒", ticksReq: 60, condFn: (st,h,f)=>hasHand(h,'PALM') && f.eyesClosed, success: {msg:"瘋狂打呼流浪漢嫌吵把位子讓給你！", effects:{health:20}} },
      { name: "魅力", reqType: "charm", reqVal: 30, task: "對著鏡頭展現「無辜的傻笑」3秒", ticksReq: 60, condFn: (st,h,f)=>f.isSmile && f.mouthOpen, success: {msg:"流浪漢覺得你有眼緣分你半塊麵包！", effects:{charm:15}} }
    ], fail: {msg:"位子被搶走只能躺地板。", effects:{health:-15}} },
    { title: "【路邊發放的愛心便當】", desc: "排隊領便當的人排了一整圈，你肚子餓得發昏。", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 35, task: "限時 2 秒內「瘋狂擺動雙手(大步衝刺)」", ticksReq: 40, condFn: (st,h,f,rF,vel)=>h.length>=2 && vel>0.03, success: {msg:"搶到最後一個便當裡面有兩顆滷蛋！", effects:{health:30}} },
      { name: "智慧", reqType: "wisdom", reqVal: 25, task: "雙手「比出✌️」維持 3 秒", ticksReq: 60, condFn: (st,h)=>allHands(h,'V'), success: {msg:"假裝自己是志工，優雅給自己留一個！", effects:{wisdom:15}} }
    ], fail: {msg:"便當全部發完，晚上只能喝自來水度日。", effects:{health:-20}} },
    { title: "【彩券行地上的驚天大發現】", desc: "發現地上的垃圾堆裡躺著一張隨手丟掉的刮刮樂……", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 35, task: "比出「愛心手勢」並「大笑」3秒", ticksReq: 60, condFn: (st,h,f)=>h.length>=2 && f.isSmile && f.mouthOpen, success: {msg:"廢紙居然中了1000元！直接財富自由！", effects:{wealth:100}} },
      { name: "智慧", reqType: "wisdom", reqVal: 30, task: "右手放在太陽穴旁「比出☝️」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>hasHand(h,'POINT') && rF && dist(h[0][8], rF[234])<0.4, success: {msg:"發現只是過期發票拿到垃圾桶回收。", effects:{wisdom:10}} }
    ], fail: {msg:"彎腰撿時放了個大響屁被路人嘲笑。", effects:{charm:-20}} }
  ],
  "公園長椅哲學家": [
    { title: "【點評路過的情侶】", desc: "看到一對穿著浮誇的情侶吵架，毒舌靈魂蠢蠢欲動，決定終結爭吵。", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 35, task: "右手臉頰旁「比出☝️」且面無表情 3秒", ticksReq: 60, condFn: (st,h,f,rF)=>hasHand(h,'POINT') && !f.isSmile && !f.isFrown && rF && dist(h[0][8], rF[152])<0.4, success: {msg:"大實話拆穿虛偽，情侶羞愧分手！", effects:{wisdom:20}} },
      { name: "魅力", reqType: "charm", reqVal: 30, task: "對著鏡頭展現「邪惡的微笑(露齒笑)」3秒", ticksReq: 60, condFn: (st,h,f)=>f.isSmile && f.mouthOpen, success: {msg:"路人紛紛駐足圍觀你點評！", effects:{charm:15}} }
    ], fail: {msg:"說話太大聲被情侶推了一把。", effects:{health:-10}} },
    { title: "【城管驅趕危機】", desc: "城管走了過來：「這裡不能躺人，把你的破爛行李帶走！」", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 35, task: "「雙手抱胸」並且「憤怒皺眉」維持 3 秒", ticksReq: 60, condFn: (st,h,f)=>!f.isSmile && f.isFrown, success: {msg:"犀利的哲學反問，城管當場懵逼離開！", effects:{courage:20}} },
      { name: "智慧", reqType: "wisdom", reqVal: 30, task: "雙手「比出✌️」並維持「完全靜止不動」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>{ if(isMoved(st,rF)) resetMoved(st,rF); return !isMoved(st,rF) && allHands(h,'V'); }, success: {msg:"假裝自己是裝置藝術雕像，城管摸摸頭走開了。", effects:{wisdom:15}} }
    ], fail: {msg:"被強制驅離，流落到更冷的橋洞底下。", effects:{health:-20}} },
    { title: "【神祕富豪的靈魂拷問】", desc: "空虛富豪問你：「我有這麼多錢卻不快樂，什麼是人生？」", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 35, task: "「單手托腮」，眼神死死盯著螢幕不眨眼 4秒", ticksReq: 80, condFn: (st,h,f,rF)=>h.length>=1 && !f.eyesClosed && rF && dist(h[0][8], rF[152])<0.4, success: {msg:"震撼靈魂的哲學名言，解鎖結局【隱世先知】！", effects:{wealth:150}} },
      { name: "魅力", reqType: "charm", reqVal: 30, task: "比出一個「小愛心」並「大笑」3秒", ticksReq: 60, condFn: (st,h,f)=>h.length>=1 && f.isSmile && f.mouthOpen, success: {msg:"富豪覺得你太豁達了，請你吃頂級牛排！", effects:{health:20}} }
    ], fail: {msg:"富豪覺得你只是個普通瘋子，失望離開。", effects:{wisdom:-5}} }
  ]
};

// --- 專屬伴侶婚姻事件 ---
const MARRIAGE_EVENTS = {
  "莉莉安": [
    { title: "【世紀聯絡簿簽名大戰】", desc: "孩子考砸了，莉莉安在客廳大發雷霆，要你跟孩子一起罚站！", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 80, task: "「比出✌️」+「緊皺眉頭」3秒", ticksReq: 60, condFn: (st,h,f)=>hasHand(h,'V') && f.isFrown, success: {msg:"拿出超理性讀書計畫，莉莉安傲嬌地哼一聲去煮宵夜。", effects:{wisdom:30}} },
      { name: "魅力", reqType: "charm", reqVal: 75, task: "「歪頭」+「壞壞的微笑」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>isTilt(rF) && f.isSmile, success: {msg:"直接抱上去，莉莉安滿臉通紅怒氣全消。", effects:{charm:25}} }
    ], fail: {msg:"跟她頂嘴，被趕去陽台罰站。", effects:{health:-15}} },
    { title: "【黑暗料理的愛心便當】", desc: "莉莉安破天荒為你做了愛心便當，但裡面的炒飯黑得像碳，她緊張又傲嬌地瞪著你：「不准剩下來！」", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 75, task: "右手「比出☝️(頂住太陽穴)」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>hasHand(h,'POINT') && rF && dist(h[0][8], rF[234])<0.4, success: {msg:"稱讚這叫「法式黑松露風味」，莉莉安得意地揚起下巴。", effects:{wisdom:20}} },
      { name: "魅力", reqType: "charm", reqVal: 80, task: "「大笑 + 雙手合十」3秒", ticksReq: 60, condFn: (st,h,f)=>f.isSmile && f.mouthOpen && h.length>=1, success: {msg:"大口吞下並大喊超好吃，莉莉安感動到幫你準備胃藥。", effects:{charm:30}} }
    ], fail: {msg:"面露難色，莉莉安哭著把便當砸向你。", effects:{health:-20}} },
    { title: "【驚喜的結婚紀念日禮物】", desc: "莉莉安嘴上說忘記了紀念日，卻在你外套口袋裡偷偷放了一支你夢寐以求的鋼筆。", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 85, task: "「雙手在頭頂比大愛心 + 露齒微笑」3秒", ticksReq: 60, condFn: (st,h,f)=>h.length>=2 && h.every(x=>x[0].y<0.3) && f.isSmile && f.mouthOpen, success: {msg:"莉莉安傲嬌地扭過頭：「只是剛好看到順手買的啦！」", effects:{charm:35}} },
      { name: "智慧", reqType: "wisdom", reqVal: 80, task: "「單手托腮 + 眼神死死盯著螢幕」4秒", ticksReq: 80, condFn: (st,h,f,rF)=>h.length>=1 && !f.eyesClosed && rF && dist(h[0][8], rF[152])<0.4, success: {msg:"用當年的微積分公式算出她買禮物的位置，戳破她的傲嬌。", effects:{wisdom:25}} }
    ], fail: {msg:"完全沒發現口袋的東西，莉莉安一星期不跟你說話。", effects:{charm:-15}} },
    { title: "【家庭財務報表的嚴格審查】", desc: "莉莉安拿著記帳本，開始一條一條審查你上個月的開銷，眼神銳利得像法官。", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 85, task: "雙手「比出✌️ + 身體完全靜止」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>{ if(isMoved(st,rF)) resetMoved(st,rF); return !isMoved(st,rF) && allHands(h,'V'); }, success: {msg:"用精準的 Excel 圖表證明每筆錢都是家用，莉莉安滿意點頭。", effects:{wisdom:30}} },
      { name: "魅力", reqType: "charm", reqVal: 75, task: "「歪頭 + 完美笑容」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>isTilt(rF) && f.isSmile, success: {msg:"使出摸頭殺，莉莉安羞到忘記算帳。", effects:{charm:20}} }
    ], fail: {msg:"支支吾吾，零用錢當場被砍半。", effects:{wealth:-100}} },
    { title: "【深夜的真心話大告白】", desc: "夜深人靜，莉莉安看著熟睡的孩子，突然靠在你的肩膀上，聲音變得很溫柔：「謝謝你，一直忍受我的壞脾氣……」", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 80, task: "「雙手合十 + 真誠溫柔的微笑」3秒", ticksReq: 60, condFn: (st,h,f)=>h.length>=1 && f.isSmile && !f.mouthOpen, success: {msg:"反手握住她的手，此生無憾。", effects:{charm:35}} },
      { name: "動漫哭哭", reqType: "charm", reqVal: 75, task: "「雙手(或單手)握拳在眼側旋轉」3秒", ticksReq: 60, condFn: (st,h,f,rF,vel)=>h.length>=1 && vel>0.005 && rF && h.some(hand=>dist(hand[9], rF[159])<0.5 || dist(hand[9], rF[386])<0.5 || dist(hand[9], rF[234])<0.5 || dist(hand[9], rF[454])<0.5), success: {msg:"假裝感動到大哭，莉莉安笑出來打你：「笨蛋，破壞氣氛！」", effects:{health:15}} }
    ], fail: {msg:"你竟然睡著了還打了個大響屁，莉莉安一腳把你踹下床。", effects:{health:-20}} }
  ],
  "萊利": [
    { title: "【搬家翻出「童年黑歷史」】", desc: "萊利翻出你中二時期寫的「賺十億娶萊利」承諾書，哈哈大笑要你大聲朗讀。", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 80, task: "「大笑 + 雙手高舉過頭」3秒", ticksReq: 60, condFn: (st,h,f)=>h.length>=2 && h.every(x=>x[0].y<0.3) && f.isSmile && f.mouthOpen, success: {msg:"大方承認「我現在真的娶到你這無價之寶了」，萊利當場臉紅。", effects:{charm:30}} },
      { name: "智慧", reqType: "wisdom", reqVal: 75, task: "「比出☝️ + 挑眉(不笑)」3秒", ticksReq: 60, condFn: (st,h,f)=>hasHand(h,'POINT') && !f.isSmile, success: {msg:"反過來笑他「是誰當年因為這張紙感動到哭的？」，萊利當場結巴。", effects:{wisdom:25}} }
    ], fail: {msg:"面子掛不住去搶鐵盒，不小心砸到萊利的腳。", effects:{health:-10}} },
    { title: "【深夜的沙發電玩大對決】", desc: "週末夜，萊利拿著兩個搖桿，興奮地對你挑釁：「今晚賭誰洗一星期的碗，不准放水！」", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 80, task: "「雙手抱胸 + 憤怒皺眉」3秒", ticksReq: 60, condFn: (st,h,f)=>!f.isSmile && f.isFrown, success: {msg:"展現極致手速，絕殺萊利，萊利心服口服去洗碗。", effects:{courage:25}} },
      { name: "動漫哭哭", reqType: "charm", reqVal: 75, task: "「雙手(或單手)握拳在眼側旋轉」3秒", ticksReq: 60, condFn: (st,h,f,rF,vel)=>h.length>=1 && vel>0.005 && rF && h.some(hand=>dist(hand[9], rF[159])<0.5 || dist(hand[9], rF[386])<0.5 || dist(hand[9], rF[234])<0.5 || dist(hand[9], rF[454])<0.5), success: {msg:"打輸了當場耍賴哭哭，萊利大笑搖頭幫你洗碗！", effects:{charm:20}} }
    ], fail: {msg:"你慘敗給萊利，被他瘋狂嘲笑，並且真的要去洗一個月的碗", effects:{health:-10}} },
    { title: "【半夜發生的「抓蟑螂大作戰」】", desc: "凌晨三點廚房傳來慘叫，熱血硬漢萊利竟然站在餐椅上，指著冰箱底下發抖：「有會飛的巨型小強！你快點上啊！」", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 85, task: "「雙手抱胸」並且「憤怒皺眉」3秒", ticksReq: 60, condFn: (st,h,f)=>!f.isSmile && f.isFrown, success: {msg:"面無懼色一擊必殺，萊利用看英雄的眼神緊緊抱住你！", effects:{courage:35}} },
      { name: "智慧", reqType: "wisdom", reqVal: 75, task: "右手放在臉頰旁「比出☝️」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>hasHand(h,'POINT') && rF && dist(h[0][8], rF[152])<0.4, success: {msg:"冷靜調配肥皂水噴霧讓蟑螂窒息，萊利直呼你是天才！", effects:{wisdom:25}} }
    ], fail: {msg:"你也跟著大叫逃跑，蟑螂飛到頭上，夫妻倆在客廳崩潰睡沙發。", effects:{health:-15}} },
    { title: "【三十歲的「熱血重回校園常規」】", desc: "萊利突然感嘆歲月不饒人，熱血大喊：「我們不能變成無聊的大人！走，穿高中制服翻牆進母校操場跑步！」", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 80, task: "4秒內「雙手瘋狂上下揮舞(奮力奔跑)」", ticksReq: 80, condFn: (st,h,f,rF,vel)=>h.length>=2 && vel>0.03, success: {msg:"翻牆成功，在夕陽下的操場牽手奔跑，彷彿回到17歲！", effects:{courage:30, health:15}} },
      { name: "魅力", reqType: "charm", reqVal: 75, task: "展現「露齒微笑」並「歪頭」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>isTilt(rF) && f.isSmile && f.mouthOpen, success: {msg:"不翻牆，直接用美色說服警衛大叔，萊利大讚你太有魅力！", effects:{charm:25}} }
    ], fail: {msg:"翻牆時卡在圍牆被主任當場抓到，三十歲了還要被訓導處開導。", effects:{charm:-20}} },
    { title: "【紀念日的「手作驚喜卡片」】", desc: "直男萊利臉漲得通紅，遞給你一本貼滿從小到大照片的笨拙剪貼簿：「謝謝你從小陪著我，以後也請多指教啦！」", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 85, task: "雙手在頭頂「比出大愛心」，並「露齒大笑」3秒", ticksReq: 60, condFn: (st,h,f)=>h.length>=2 && h.every(x=>x[0].y<0.3) && f.isSmile && f.mouthOpen, success: {msg:"撲上去親他，他把你抱起來轉圈圈，解鎖史詩結局【執子之手，與子偕老】！", effects:{charm:35}} },
      { name: "動漫哭哭", reqType: "charm", reqVal: 75, task: "「雙手(或單手)握拳在眼側旋轉」3秒", ticksReq: 60, condFn: (st,h,f,rF,vel)=>h.length>=1 && vel>0.005 && rF && h.some(hand=>dist(hand[9], rF[159])<0.5 || dist(hand[9], rF[386])<0.5 || dist(hand[9], rF[234])<0.5 || dist(hand[9], rF[454])<0.5), success: {msg:"感動噴淚，萊利慌亂幫你擦眼淚，笑你還是跟小時候一樣愛哭。", effects:{charm:25, health:10}} }
    ], fail: {msg:"表現平淡還開玩笑說他美感差，萊利內心受打擊躲去陽台抽悶煙。", effects:{charm:-15}} }
  ],
  "艾斯": [
    { title: "【家庭日的「瘋狂健身大特訓」】", desc: "艾斯大清早把你拖起來：「打起精神！今天的家庭日是核心肌群地獄燃脂大挑戰！不做完100個波比跳不准吃早餐！」", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 85, task: "連續做 3 次「雙手由下往上高舉、再放下」", ticksReq: 3, condFn: (st,h)=>{ 
          let raised = h.length>=2 && h.every(x=>x[0].y<0.3);
          let lowered = h.length>=2 && h.every(x=>x[0].y>0.7);
          if(raised && !st.isUp) { st.isUp = true; st.t++; }
          if(lowered) { st.isUp = false; }
          return false;
        }, success: {msg:"體能引爆跟隊長硬碰硬，艾斯大讚你是他最完美的靈魂伴侶！", effects:{courage:35, health:30}} },
      { name: "魅力", reqType: "charm", reqVal: 80, task: "「雙手合十」，展現「委屈的哭哭臉(皺眉不笑)」3秒", ticksReq: 60, condFn: (st,h,f)=>h.length>=1 && !f.isSmile && f.isFrown, success: {msg:"撒嬌打滾，艾斯瞬間垮下耳朵：「做10個就好，我背你去做早餐。」", effects:{charm:25}} }
    ], fail: {msg:"試圖裝死被強行拖走，毫無防備下肌肉拉傷。", effects:{health:-30}} },
    { title: "【社區籃球賽的「神隊友救援」】", desc: "最後一節隊友集體抽筋。艾斯對觀眾席的你大喊：「親愛的！快換衣服！我需要你上場跟我組成最強夫妻檔拿下獎盃！」", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 80, task: "2秒內「瘋狂擺動雙手(全力跳投)」", ticksReq: 40, condFn: (st,h,f,rF,vel)=>h.length>=2 && vel>0.03, success: {msg:"一記絕殺三分球逆轉奪冠，夫妻倆在場中央瘋狂熱吻！", effects:{courage:35, wealth:100}} },
      { name: "魅力", reqType: "charm", reqVal: 85, task: "3秒內「雙手瘋狂上下揮舞」+「大笑」", ticksReq: 60, condFn: (st,h,f,rF,vel)=>h.length>=2 && vel>0.03 && f.isSmile && f.mouthOpen, success: {msg:"化身頂級啦啦隊隊長，艾斯聽大Buff一個人狂砍20分奪冠！", effects:{charm:30}} }
    ], fail: {msg:"害羞拒絕上場，球隊慘敗，艾斯落寞地抱著球回家。", effects:{courage:-15}} },
    { title: "【孩子學校的「熱血運動會」爆發】", desc: "家長三人四腳接力賽，艾斯綁好繩子燃燒烈火：「聽口令！今天我們一定要幫兒子拿下第一名，把對面家長全鏟翻！」", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 80, task: "「雙手高舉過頭」維持 3 秒", ticksReq: 60, condFn: (st,h)=>h.length>=2 && h.every(x=>x[0].y<0.3), success: {msg:"夫妻配合無間、馬力全開，大破大會紀錄奪金！", effects:{courage:30, health:10}} },
      { name: "智慧", reqType: "智慧", reqVal: 75, task: "右手臉頰旁「比出☝️」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>hasHand(h,'POINT') && rF && dist(h[0][8], rF[152])<0.4, success: {msg:"靠槓桿原理與步伐節奏公式，優雅帶領艾斯與孩子奪冠！", effects:{wisdom:25}} }
    ], fail: {msg:"步伐不一致摔成滾地葫蘆，成為全校笑柄。", effects:{health:-15}} },
    { title: "【家務分配的「桌球大賭博」】", desc: "艾斯拿出桌球拍壞笑：「輸的洗衣服擦地板，贏的躺沙發喝可樂！」", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 85, task: "右手「比出✋」快速左右大範圍揮動(極速抽球) 3秒", ticksReq: 60, condFn: (st,h,f,rF,vel)=>hasHand(h,'PALM') && vel>0.03, success: {msg:"使出殺球大招，把艾斯打到吃土乖乖去幹活！", effects:{courage:35}} },
      { name: "魅力", reqType: "charm", reqVal: 80, task: "「露齒微笑」並「歪頭」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>isTilt(rF) && f.isSmile && f.mouthOpen, success: {msg:"拋了個超萌媚眼，艾斯當場手滑漏接傻笑認輸！", effects:{charm:25}} }
    ], fail: {msg:"被體育班隊長用實力血洗，承包一整週家務。", effects:{health:-20}} },
    { title: "【球賽現場的「世紀大求婚大螢幕照」】", desc: "中場休息時，球場的導播大螢幕突然死死鎖定你們，全場一萬人瘋狂起哄親一個！", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 85, task: "「完美露齒大笑」，單手「比出小愛心」3秒", ticksReq: 60, condFn: (st,h,f)=>f.isSmile && f.mouthOpen && h.length>=1, success: {msg:"大方配合，全場爆發雷鳴掌聲，艾斯感動當場抱起你轉圈！", effects:{charm:35}} },
      { name: "勇氣", reqType: "courage", reqVal: 80, task: "「雙手高舉過頭」3秒", ticksReq: 60, condFn: (st,h)=>h.length>=2 && h.every(x=>x[0].y<0.3), success: {msg:"直接霸氣摟過艾斯的脖子親下去，全場嗨翻！", effects:{courage:30}} }
    ], fail: {msg:"害羞到用衣服遮臉逃跑，隔天被當作不合迷因流傳。", effects:{charm:-20}} }
  ],
  "卡加莎": [
    { title: "【天台的惡鄰居投訴風波】", desc: "隔壁深夜唱歌噪音不斷，卡加莎冷笑一聲，抄起拖把木棍就要出門開戰：「老娘以前混天台的，走！」", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 85, task: "「雙手抱胸」並且「憤怒皺眉」3秒", ticksReq: 60, condFn: (st,h,f)=>!f.isSmile && f.isFrown, success: {msg:"夫妻雙煞往門口一站，鄰居當場下跪道歉！", effects:{courage:40}} },
      { name: "動漫哭哭", reqType: "charm", reqVal: 80, task: "「雙手(或單手)握拳在眼側旋轉」3秒", ticksReq: 60, condFn: (st,h,f,rF,vel)=>h.length>=1 && vel>0.005 && rF && h.some(hand=>dist(hand[9], rF[159])<0.5 || dist(hand[9], rF[386])<0.5 || dist(hand[9], rF[234])<0.5 || dist(hand[9], rF[454])<0.5), success: {msg:"噴眼淚特效，卡加莎殺氣全消慌忙丟掉木棍安慰你！", effects:{charm:35}} }
    ], fail: {msg:"唯唯諾諾不敢動，卡加莎一個人把人揍了，驚動警察拿到傳票。", effects:{wealth:-150}} },
    { title: "【老婆的「前小弟」登門拜訪】", desc: "門外站著三個滿身刺青的黑道大漢，一見到卡加莎立刻鞠躬大喊：「大姐頭好！姐夫/大嫂好！我們來送中秋禮盒了！」", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 80, task: "展現「淡定的笑容」，並「雙手合十」3秒", ticksReq: 60, condFn: (st,h,f)=>f.isSmile && h.length>=1, success: {msg:"優雅大方請喝茶，小弟大讚你有大將之風，卡加莎面子十足！", effects:{charm:25}} },
      { name: "勇氣", reqType: "courage", reqVal: 80, task: "「雙手抱胸(或拍桌)」且面部嚴肅 3秒", ticksReq: 60, condFn: (st,h,f)=>!f.isSmile && !f.isFrown && h.length>=2, success: {msg:"散發出比大姐頭更強的家主煞氣，小弟戰戰兢兢放下禮盒告退！", effects:{courage:30}} }
    ], fail: {msg:"嚇得當場把門摔上，卡加莎覺得你太沒膽量，當晚碎碎念。", effects:{courage:-15}} },
    { title: "【廚房裡的「剁刀驚魂記」】", desc: "卡加莎切菜想起主管刁難，氣得把菜刀揮得密不透風狂剁。你進去倒水感到一陣涼意。", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 85, task: "「歪頭」展現「完美笑容」，雙手比小愛心 3秒", ticksReq: 60, condFn: (st,h,f,rF)=>isTilt(rF) && f.isSmile && h.length>=2, success: {msg:"卡加莎刀速慢了下來，臉紅嘟嘴：「幹嘛啦……我在切洋蔥啦！」", effects:{charm:30}} },
      { name: "智慧", reqType: "wisdom", reqVal: 80, task: "右手放在太陽穴旁「比出☝️」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>hasHand(h,'POINT') && rF && dist(h[0][8], rF[234])<0.4, success: {msg:"從背後抱住她拿過刀「我來吧，你手會酸」，瞬間融化太妹！", effects:{wisdom:25}} }
    ], fail: {msg:"嚇到大喊你想謀殺嗎，卡加莎氣得摔刀，今晚全家沒飯吃。", effects:{health:-15}} },
    { title: "【家長會上的「太妹氣場全開」】", desc: "孩子被霸凌，對方家長態度極囂張。卡加莎默默摘下墨鏡，冷笑站起來逼近對方……", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 85, task: "右手「比出✋」快速左右大範圍揮動(拍桌) 2秒", ticksReq: 40, condFn: (st,h,f,rF,vel)=>hasHand(h,'PALM') && vel>0.03, success: {msg:"同步怒拍桌子展現恐怖威壓，對方嚇到尿褲子下跪道歉！", effects:{courage:35}} },
      { name: "魅力", reqType: "charm", reqVal: 80, task: "展現「完美高冷微笑(不露齒)」3秒", ticksReq: 60, condFn: (st,h,f)=>f.isSmile && !f.mouthOpen, success: {msg:"優雅拿出對方違法前科紀錄，對方崩潰道歉，卡加莎愛死你的腹黑！", effects:{charm:30}} }
    ], fail: {msg:"唯唯諾諾不敢說話，卡加莎當場動手拆了校長室，面臨巨額賠償。", effects:{wealth:-200}} },
    { title: "【卡加莎的家事「溫柔」大破壞】", desc: "卡加莎想展現人妻溫柔主動洗碗，結果力道太大接連摔碎了三個高檔瓷盤。", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 85, task: "「歪頭」展現「溫柔微笑」，雙手抱住螢幕 3秒", ticksReq: 60, condFn: (st,h,f,rF)=>isTilt(rF) && f.isSmile && h.length>=2, success: {msg:"從背後抱住她說沒受傷就好，卡加莎臉紅嬌嗔！", effects:{charm:30}} },
      { name: "智慧", reqType: "wisdom", reqVal: 80, task: "完全「靜止不動」保持撲克臉 3秒", ticksReq: 60, condFn: (st,h,f,rF)=>{ if(isMoved(st,rF)) resetMoved(st,rF); return !isMoved(st,rF) && !f.isSmile && !f.isFrown; }, success: {msg:"默默拿出膠水，把碎盤子改造成後現代風藝術品貼在牆上！", effects:{wisdom:25}} }
    ], fail: {msg:"大喊你別動了讓我來，卡加莎自尊受創甩門飆車。", effects:{health:-10}} }
  ],
  "布雷克": [
    { title: "【深夜搶奪「冷氣遙控器」】", desc: "夏夜布雷克悄悄把遙控器藏進枕頭底：「看什麼看？我是為了你身體著想！不准調低！」", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 80, task: "「靜止不動」，右手在臉頰旁「比出☝️」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>{ if(isMoved(st,rF)) resetMoved(st,rF); return !isMoved(st,rF) && hasHand(h,'POINT'); }, success: {msg:"用手機紅外線調到24度，他氣得直搖頭還是分半邊被子給你！", effects:{wisdom:25}} },
      { name: "魅力", reqType: "charm", reqVal: 80, task: "「完美大笑」，雙手做出環抱動作 3秒", ticksReq: 60, condFn: (st,h,f)=>f.isSmile && f.mouthOpen && h.length>=2, success: {msg:"把它當大型冰棒抱緊，布雷克滿臉通紅妥協！", effects:{charm:30}} }
    ], fail: {msg:"動手搶遙控器摔碎，兩人在30度房間熱到失眠。", effects:{health:-15, wealth:-20}} },
    { title: "【茶水間的「被燙到的指尖與真心」】", desc: "熱水差點潑到你，布雷克一把奪過馬克杯自己被燙到，憤怒低吼：「做事能不能專心一點？受傷怎麼辦？笨蛋……」", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 75, task: "雙手「比出✋」且死死盯著螢幕不眨眼 3秒", ticksReq: 60, condFn: (st,h,f)=>allHands(h,'PALM') && !f.eyesClosed, success: {msg:"反手握住他心疼地說「你比較痛吧？」，布雷克氣消慌亂移開視線！", effects:{courage:30}} },
      { name: "魅力", reqType: "charm", reqVal: 80, task: "「嘴角向下、眉毛緊皺(委屈想哭)」3秒", ticksReq: 60, condFn: (st,h,f)=>f.isFrown && !f.isSmile, success: {msg:"布雷克瞬間手忙腳亂溫柔帶你去沖冷水：「對不起我太兇了。」", effects:{charm:25}} }
    ], fail: {msg:"嚇到一把推開他，咖啡潑了一地尷尬退場。", effects:{health:-10}} },
    { title: "【人頭鑽動的「結婚紀念日快閃驚喜」】", desc: "廣場大螢幕播放你們交往的照片，布雷克提著花臉紅傲嬌：「咳……這是我特地安排的福利，不准嫌丟臉！」", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 90, task: "「燦爛露齒大笑」，頭頂「比出大愛心」4秒", ticksReq: 80, condFn: (st,h,f)=>f.isSmile && f.mouthOpen && h.length>=2 && h.every(x=>x[0].y<0.3), success: {msg:"熱烈擁抱回吻！引發全場瘋狂尖叫鼓掌，好感度升到宇宙最高！", effects:{charm:40}} },
      { name: "動漫哭哭", reqType: "charm", reqVal: 75, task: "「雙手握拳在眼側左右擺動」3秒", ticksReq: 60, condFn: (st,h,f,rF,vel)=>h.length>=2 && vel>0.005 && rF && h.some(hand=>dist(hand[9], rF[159])<0.5 || dist(hand[9], rF[386])<0.5 || dist(hand[9], rF[234])<0.5 || dist(hand[9], rF[454])<0.5), success: {msg:"感動噴淚，布雷克慌得手忙腳亂用西裝幫你擦眼淚！", effects:{charm:30}} }
    ], fail: {msg:"覺得羞恥轉身想逃，精心準備的驚喜慘淡收場。", effects:{charm:-20}} },
    { title: "【天台跨年夜的「外套與心跳」】", desc: "跨年夜寒風中，布雷克把大衣披在你肩上，傲嬌轉頭：「只是怕你感冒拖累進度！給我披好不准脫！」", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 85, task: "「頭部微幅傾斜」並「極度甜美露齒微笑」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>isTilt(rF) && f.isSmile && f.mouthOpen, success: {msg:"靠過去，布雷克悄悄在口袋牽住你耳語「新年快樂」！", effects:{charm:35}} },
      { name: "勇氣", reqType: "courage", reqVal: 80, task: "「雙手抱胸」並「憤怒皺眉(調侃)」3秒", ticksReq: 60, condFn: (st,h,f)=>!f.isSmile && f.isFrown, success: {msg:"拉開大衣笑說「一起穿啊」，布雷克滿臉通紅跟你擠在一起！", effects:{courage:30}} }
    ], fail: {msg:"把衣服還他說不冷，布雷克覺得被拒絕臉色鐵青離去。", effects:{charm:-20}} },
    { title: "【辦公室新人的「小崇拜」吃醋風波】", desc: "漂亮新人貼著布雷克請教，布雷克一見你立刻大聲說「我配偶來了離我遠點」，傲嬌挑眉：「吃醋了？我可是很守男德的！」", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 80, task: "「頭部微幅傾斜」並「自信壞壞微笑」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>isTilt(rF) && f.isSmile, success: {msg:"幫他整理領帶親一下宣示主權，新人尷尬退場！", effects:{charm:30}} },
      { name: "勇氣", reqType: "courage", reqVal: 75, task: "「雙手抱胸」並「死不眨眼(皺眉)」3秒", ticksReq: 60, condFn: (st,h,f)=>!f.isSmile && !f.eyesClosed, success: {msg:"大方承認吃醋，布雷克大腦當機心裡爽到不行！", effects:{courage:25}} }
    ], fail: {msg:"轉身就走冷戰，布雷克覺得委屈也跟著冷戰。", effects:{charm:-15}} }
  ],
  "伊安娜": [
    { title: "【結婚紀念日的「地獄大下廚」】", desc: "伊安娜挑戰做惠靈頓牛排，結果把麵皮烤成黑炭，委屈得快哭了：「對不起……不小心烤焦了……」", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 85, task: "「真誠溫柔微笑」，胸前「雙手合十」3秒", ticksReq: 60, condFn: (st,h,f)=>h.length>=1 && f.isSmile && !f.mouthOpen, success: {msg:"大口吞下大讚好吃，伊安娜感動抱緊你！", effects:{charm:35, health:10}} },
      { name: "智慧", reqType: "wisdom", reqVal: 80, task: "雙手「比出✌️」3秒", ticksReq: 60, condFn: (st,h)=>allHands(h,'V'), success: {msg:"大廚上身，5分鐘內改造成法式牛肉燉飯拯救晚餐！", effects:{wisdom:25, wealth:50}} }
    ], fail: {msg:"脫口而出怎麼烤成這樣，伊安娜大受打擊哭了一晚。", effects:{charm:-20}} },
    { title: "【伊安娜的「深夜驚喜愛心雞湯」】", desc: "凌晨一點，伊安娜端著燉了六小時的雞湯從背後環抱你：「辛苦了喝口湯休息一下，我會心疼的……」", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 80, task: "「歪頭」展現「幸福微笑」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>isTilt(rF) && f.isSmile, success: {msg:"轉身把她抱進懷裡，伊安娜幸福到滿臉通紅！", effects:{charm:30, health:25}} },
      { name: "智慧", reqType: "wisdom", reqVal: 85, task: "右手臉頰旁「比出☝️」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>hasHand(h,'POINT') && rF && dist(h[0][8], rF[152])<0.4, success: {msg:"算出最優化排程拉著她去睡覺，伊安娜大讚體貼！", effects:{wisdom:25}} }
    ], fail: {msg:"冷冷說放著我很忙，伊安娜失落低頭離開。", effects:{health:-10, charm:-15}} },
    { title: "【伊安娜的「心情低落期」陪伴】", desc: "伊安娜陷入重度低潮，半夜看著鏡子默默擦眼淚：「我是不是變醜了……我是不是什麼都做不好……」", time: 7, branches: [
      { name: "動漫哭哭", reqType: "charm", reqVal: 80, task: "「雙手握拳在眼側左右擺動」3秒", ticksReq: 60, condFn: (st,h,f,rF,vel)=>h.length>=2 && vel>0.005 && rF && h.some(hand=>dist(hand[9], rF[159])<0.5 || dist(hand[9], rF[386])<0.5 || dist(hand[9], rF[234])<0.5 || dist(hand[9], rF[454])<0.5), success: {msg:"陪著她哭並緊抱她，伊安娜破涕為笑陰霾散去！", effects:{charm:40, health:15}} },
      { name: "智慧", reqType: "wisdom", reqVal: 85, task: "睜大眼睛死死盯螢幕「4秒不眨眼」", ticksReq: 80, condFn: (st,h,f)=>!f.eyesClosed, success: {msg:"溫柔開導並拿出海島度假行程，伊安娜感動崩潰抱緊你！", effects:{wisdom:30}} }
    ], fail: {msg:"用鋼鐵直男邏輯叫她別想太多，伊安娜陷入重度冷戰。", effects:{health:-20}} },
    { title: "【商務宴會上的「突發高跟鞋危機」】", desc: "散場時伊安娜鞋跟斷裂，整個人失去平衡朝你倒來！周圍全是媒體！", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 80, task: "2秒內「左右劇烈晃動身體(新娘抱)」", ticksReq: 40, condFn: (st,h,f,rF)=>{ if(!rF) return false; if(!st.bF) st.bF = {x: rF[1].x, y: rF[1].y}; return Math.abs(rF[1].x - st.bF.x) > 0.05; }, success: {msg:"完美新娘抱一路抱回車上，伊安娜心跳爆表！", effects:{courage:35}} },
      { name: "魅力", reqType: "charm", reqVal: 80, task: "「完美溫柔微笑」+「雙手合十」3秒", ticksReq: 60, condFn: (st,h,f)=>h.length>=1 && f.isSmile, success: {msg:"單膝跪地摘皮鞋讓她踩，化尷尬為浪漫全場大讚紳士！", effects:{charm:30}} }
    ], fail: {msg:"反應太慢沒接住，伊安娜扭傷腳宴會也搞砸了。", effects:{health:-10, charm:-15}} },
    { title: "【深夜的「全能特助病倒了」】", desc: "平日全能的伊安娜重感冒病倒了，她抓著你衣角委屈沙啞地說：「對不起沒法煮晚餐了……你可以陪我嗎？」", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 85, task: "「極度真誠溫柔微笑」+「雙手合十」3秒", ticksReq: 60, condFn: (st,h,f)=>h.length>=1 && f.isSmile, success: {msg:"親吻額頭餵粥，解鎖隱藏羈絆【終身溫柔守護者】！", effects:{charm:40, health:10}} },
      { name: "動漫哭哭", reqType: "charm", reqVal: 75, task: "「雙手握拳在眼側左右擺動」3秒", ticksReq: 60, condFn: (st,h,f,rF,vel)=>h.length>=2 && vel>0.005 && rF && h.some(hand=>dist(hand[9], rF[159])<0.5 || dist(hand[9], rF[386])<0.5 || dist(hand[9], rF[234])<0.5 || dist(hand[9], rF[454])<0.5), success: {msg:"你一哭她反而慌了摸摸你的頭：「傻瓜生病的是我哭什麼？」", effects:{charm:30}} }
    ], fail: {msg:"把藥放著就去打電動，伊安娜內心一片冰冷對婚姻失望。", effects:{health:-20}} }
  ],
  "菲利克斯": [
    { title: "【總裁買下「整座兒童樂園」】", desc: "樂園排隊太久，菲利克斯直接包下整座園區：「我不喜歡家人排隊。現在樂園都是你們的了。」", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 85, task: "「雙手抱胸」並且「憤怒皺眉」3秒", ticksReq: 60, condFn: (st,h,f)=>!f.isSmile && f.isFrown, success: {msg:"嚴厲教育，菲利克斯無奈失笑：「好，下次我改排隊。」解鎖【總裁馴獸師】！", effects:{courage:35}} },
      { name: "魅力", reqType: "charm", reqVal: 85, task: "「燦爛露齒微笑」，單手「比出小愛心」3秒", ticksReq: 60, condFn: (st,h,f)=>f.isSmile && f.mouthOpen && h.length>=1, success: {msg:"享受鈔能力，菲利克斯心情大好反手送你一棟別墅！", effects:{wealth:500, charm:20}} }
    ], fail: {msg:"覺得丟臉想回家，菲利克斯冷下臉家庭氣氛降至冰點。", effects:{courage:-15}} },
    { title: "【總裁廚房的「跨國財閥大火災」】", desc: "菲利克斯親自下廚，結果廚房轟一聲冒大火觸發灑水，億萬總裁瞬間變落湯雞風中凌亂。", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 80, task: "3秒內雙手「由右往左蓋下(規律位移)」", ticksReq: 60, condFn: (st,h,f,rF,vel)=>h.length>=1 && vel>0.025, success: {msg:"冷靜斷電滅火，菲利克斯第一次用看神的眼神崇拜你！", effects:{wisdom:35}} },
      { name: "勇氣", reqType: "courage", reqVal: 85, task: "右手向前「比出✋」面部嚴肅(不笑) 3秒", ticksReq: 60, condFn: (st,h,f)=>hasHand(h,'PALM') && !f.isSmile, success: {msg:"抄起滅火器狂噴，菲利克斯一把將你揉進懷裡：「不愧是我看上的人！」", effects:{courage:30, health:10}} }
    ], fail: {msg:"兩人在廚房瘋狂慘叫，半棟豪宅被燒毀。", effects:{wealth:-500}} },
    { title: "【總裁家庭的「平民夜市生存大挑戰」】", desc: "硬拉霸總去夜市，他眉頭深鎖懷疑人生：「空氣超標缺乏社交距離，真要在這吃碳水化合物？」", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 85, task: "「雙手抱胸」並且「憤怒皺眉」3秒", ticksReq: 60, condFn: (st,h,f)=>!f.isSmile && f.isFrown, success: {msg:"塞臭豆腐進他嘴裡霸氣宣布「張嘴！」解鎖【霸總的夜市覺醒】！", effects:{courage:35}} },
      { name: "魅力", reqType: "charm", reqVal: 85, task: "「燦爛露齒微笑」，單手「比小愛心」3秒", ticksReq: 60, condFn: (st,h,f)=>f.isSmile && f.mouthOpen && h.length>=1, success: {msg:"笑著拉緊他的手，菲利克斯眼神溫柔叫保鏢撤離享受約會。", effects:{charm:30}} }
    ], fail: {msg:"覺得他太高傲跟他吵架，夜市之旅尷尬收場。", effects:{courage:-15}} },
    { title: "【霸總的「一千萬珠寶展舞伴邀請」】", desc: "菲利克斯遞來千萬鑽石項鍊：「今晚陪我出席晚宴。拒絕的話明天起天天當我貼身助理。」", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 85, task: "「完美高冷微笑」死盯鏡頭不眨眼 3秒", ticksReq: 60, condFn: (st,h,f)=>!f.isSmile && !f.eyesClosed, success: {msg:"換上禮服氣場全開驚艷全場，菲利克斯破天荒溫柔一笑！", effects:{charm:35, wealth:200}} },
      { name: "智慧", reqType: "wisdom", reqVal: 80, task: "右手太陽穴旁「比出☝️」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>hasHand(h,'POINT') && rF && dist(h[0][8], rF[234])<0.4, success: {msg:"指出商務聯名機會展現超高智商，菲利克斯激賞分你一半利潤！", effects:{wisdom:30}} }
    ], fail: {msg:"嚇到拒絕退回盒子，總裁自尊受損整週挑你毛病。", effects:{wealth:-100}} },
    { title: "【總裁家庭的「世紀商戰應酬」】", desc: "對手執行長在晚宴上刻薄挑釁你們，全場商業巨頭都在看著你們夫妻。", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 90, task: "「完美高冷微笑」+「單手托腮」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>!f.isSmile && h.length>=1 && rF && dist(h[0][8], rF[152])<0.4, success: {msg:"超強氣場反諷回去，菲利克斯在桌下緊握你的手！", effects:{charm:40, wealth:300}} },
      { name: "智慧", reqType: "wisdom", reqVal: 85, task: "「比出✌️」且「4秒不眨眼」", ticksReq: 80, condFn: (st,h,f)=>allHands(h,'V') && !f.eyesClosed, success: {msg:"點出財報致命漏洞當眾一槍斃命，菲利克斯激賞不已！", effects:{wisdom:35}} }
    ], fail: {msg:"怯場說錯話導致財團形象受損股價暴跌。", effects:{wealth:-300}} },
    { title: "【結婚三十週年「買下整座海島」的執生大結局】", desc: "他單膝跪地：「我用三十年買下帝國，現在只想買妳終身特休單。跟我隱居吧？」", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 92, task: "「最燦爛露齒大笑」，頭頂「比大愛心」4秒", ticksReq: 80, condFn: (st,h,f)=>h.length>=2 && h.every(x=>x[0].y<0.3) && f.isSmile && f.mouthOpen, success: {msg:"解鎖最奢華結局【財閥帝國的傳奇永恆主宰】！", effects:{health:50, wealth:999, wisdom:50, charm:50, courage:50}} }
    ], fail: {msg:"未能回應總裁的浪漫。", effects:{}} }
  ],
  "奧妮": [
    { title: "【地下賽車場的「生死時速副駕駛座」】", desc: "奧妮開超跑狂飆300公里媚眼笑說：「拿不到第一我就把你綁架去法國莊園當私人司機！」", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 85, task: "「左右劇烈晃動身體(承受G力)」且「大笑」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>{ if(!rF) return false; if(!st.bF) st.bF = {x: rF[1].x, y: rF[1].y}; return Math.abs(rF[1].x - st.bF.x) > 0.05 && f.isSmile && f.mouthOpen; }, success: {msg:"興奮大笑，奧妮激賞：「唯一敢在我車上大笑的人！」奪冠後狂抱你！", effects:{courage:40, health:10}} },
      { name: "智慧", reqType: "wisdom", reqVal: 80, task: "「雙眼睁大、全身靜止不動、4秒不眨眼」", ticksReq: 80, condFn: (st,h,f,rF)=>{ if(isMoved(st,rF)||f.eyesClosed) resetMoved(st,rF); return !isMoved(st,rF) && !f.eyesClosed; }, success: {msg:"利用動態視力報出完美切線數據，奧妮大讚「天才領航員」！", effects:{wisdom:35}} }
    ], fail: {msg:"嚇到口吐白沫暈過去，奧妮無奈減速棄賽送醫。", effects:{health:-30, courage:-20}} },
    { title: "【異國文化差異的「世紀婆媳修羅場」】", desc: "歐洲頂級貴族的岳母用宮廷禮儀挑剔你。奧妮換上高訂禮服挽著你的手挑眉看著她母親。", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 90, task: "「完美高冷微笑」+「單手托腮(不眨眼)」4秒", ticksReq: 80, condFn: (st,h,f,rF)=>!f.isSmile && !f.eyesClosed && h.length>=1 && rF && dist(h[0][9], rF[152]) < 0.4, success: {msg:"流利法文與優雅茶道征服皇室，岳母承認你是最優雅成員！", effects:{charm:45, wealth:200}} },
      { name: "智慧", reqType: "wisdom", reqVal: 85, task: "雙手「比出✌️」3秒", ticksReq: 60, condFn: (st,h)=>allHands(h,'V'), success: {msg:"侃侃而談歐洲歷史藝術，岳母聽得目瞪口呆徹底被才華收服！", effects:{wisdom:35}} }
    ], fail: {msg:"表現怯場土包子，岳母冷哼離去，感情滿意度受損。", effects:{charm:-25}} },
    { title: "【私人遊艇遭遇「北大西洋風暴」】", desc: "海面颳起10級大風浪，船員恐慌。奧妮緊抓扶手微笑看向無畏的你。", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 90, task: "「雙手抱胸」並且「憤怒皺眉」3秒", ticksReq: 60, condFn: (st,h,f)=>!f.isSmile && f.isFrown, success: {msg:"宛如老練船長霸氣指揮衝出風暴，奧妮迷戀死你！", effects:{courage:40, health:10}} },
      { name: "智慧", reqType: "wisdom", reqVal: 85, task: "右手太陽穴旁「比出☝️」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>hasHand(h,'POINT') && rF && dist(h[0][8], rF[234])<0.4, success: {msg:"精準找出暴風圈盲區裂縫安全回港，解鎖【風暴主宰者】！", effects:{wisdom:35}} }
    ], fail: {msg:"嚇到滾落海中，遊艇受損且受重傷。", effects:{health:-35, wealth:-200}} },
    { title: "【歐洲賭局上的「以婚姻為賭注」】", desc: "中東大亨挑釁若你輸了就把奧妮讓給他。奧妮晃著紅酒杯：「親愛的，你會讓我被贏走嗎？」", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 90, task: "「睜大眼睛、全身靜止、4秒內絕不眨眼」", ticksReq: 80, condFn: (st,h,f,rF)=>{ if(isMoved(st,rF)||f.eyesClosed) resetMoved(st,rF); return !isMoved(st,rF) && !f.eyesClosed; }, success: {msg:"丟出同花順狂贏鑽石礦！奧妮嘲諷對手智商被完虐。", effects:{wisdom:40, wealth:600}} },
      { name: "魅力", reqType: "charm", reqVal: 85, task: "「完美高冷微笑」+「單手托腮」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>!f.isSmile && h.length>=1 && rF && dist(h[0][9], rF[152]) < 0.4, success: {msg:"連牌都不看直接梭哈，超狂氣場嚇得大亨手抖棄牌！", effects:{charm:35, wealth:600}} }
    ], fail: {msg:"心理防線崩潰輸掉賭局。奧妮雖擺平大亨但對你的軟弱非常失望。", effects:{wealth:-300}} },
    { title: "【神秘地下拍賣會的「世紀千金一擲」】", desc: "暴發戶嘲笑你窮。奧妮把黑金拍賣牌塞你手裡：「按下去，不管出多少我都幫你翻倍砸死他！」", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 90, task: "右手高舉「比出✋」連續大範圍揮動(狂舉牌) 3秒", ticksReq: 60, condFn: (st,h,f,rF,vel)=>hasHand(h,'PALM') && vel>0.03, success: {msg:"十億天價絕殺對手！奧妮瘋狂吻你：「就喜歡你花我錢不眨眼的狂妄！」", effects:{courage:40, wealth:800}} },
      { name: "智慧", reqType: "wisdom", reqVal: 85, task: "完全「靜止不動」，右手臉頰旁「比出☝️」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>{ if(isMoved(st,rF)) resetMoved(st,rF); return !isMoved(st,rF) && hasHand(h,'POINT'); }, success: {msg:"誘敵深入在最高點收手，讓對手用10倍冤枉錢買下贗品！奧妮激賞起立鼓掌！", effects:{wisdom:35}} }
    ], fail: {msg:"嚇到手抖把牌子掉在地上不敢舉，被全場嘲笑奧妮失望離去。", effects:{charm:-25, wealth:-50}} },
    { title: "【跨國世紀晚宴的「愛至世界盡頭」終結線】", desc: "奧妮在羅浮宮包場世紀晚宴，舉起香檳：「謝謝你願意陪我走到了世界的盡頭。」", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 92, task: "「露齒微笑」，頭頂「比大愛心」4秒", ticksReq: 80, condFn: (st,h,f)=>h.length>=2 && h.every(x=>x[0].y<0.3) && f.isSmile && f.mouthOpen, success: {msg:"一吻定情，解鎖唯美結局【巴黎夜空下永不落幕的世紀愛戀】！", effects:{charm:50, wealth:600}} }
    ], fail: {msg:"未作出回應，留下無限遺憾。", effects:{}} }
  ],
  "相親對象": [
    { title: "【七大姑八大姨的「過年大拷問」】", desc: "過年老家客廳擠滿親戚機關槍發問。這時伴侶突然站出來誠懇地說：「他/她每天工作已經很辛苦了...他/她就是世界上最好、最可靠的伴侶。」親戚當場被堵到不知所措。", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 75, task: "右手太陽穴旁「比出☝️」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>hasHand(h,'POINT') && rF && dist(h[0][8], rF[234])<0.4, success: {msg:"順著伴侶的真誠話術，優雅地轉移話題，化解現場的尷尬！", effects:{wisdom:25}} },
      { name: "勇氣", reqType: "courage", reqVal: 80, task: "2秒內右手「比出✋」大範圍揮動，且「憤怒皺眉」", ticksReq: 40, condFn: (st,h,f,rF,vel)=>hasHand(h,'PALM') && vel>0.03 && !f.isSmile && f.isFrown, success: {msg:"霸氣牽起伴侶的手站起來：「我們回去煮飯了。」拉著他直接開車離開，兩人羈絆加深！", effects:{courage:30}} }
    ], fail: {msg:"你坐在原地任由親戚宰割，兩個人摸摸鼻子低頭聽訓，心情低落。", effects:{health:-20}} },
    { title: "【婚後柴米油鹽的「百元大爭吵」】", desc: "看到電費帳單又漲了，兩人在客廳陷入沉默。平日溫和的伴侶突然紅了眼眶：「我是不是太沒用了……沒能給你過上更好的日子，對不起……」", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 75, task: "「真誠溫柔微笑」+ 胸前「雙手合十」3秒", ticksReq: 60, condFn: (st,h,f)=>f.isSmile && !f.mouthOpen && h.length>=1, success: {msg:"從背後緊緊抱住安慰：「這是我住過最溫暖的家。」兩人第一次有了相依為命的宿命感！", effects:{charm:25}} },
      { name: "智慧", reqType: "wisdom", reqVal: 80, task: "右手臉頰旁「比出☝️」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>hasHand(h,'POINT') && rF && dist(h[0][8], rF[152])<0.4, success: {msg:"冷靜拿出記帳本，用理性的數據證明家裡財務非常健康，伴侶這才破涕為笑！", effects:{wisdom:25}} }
    ], fail: {msg:"用鋼鐵口氣說電費漲就漲你哭什麼，伴侶受傷躲進書房冷戰。", effects:{health:-15}} },
    { title: "【突發的「小雞排店」創業大危機】", desc: "在巷口開小雞排店，結果開業第一天收銀機當機！排隊顧客大吼，伴侶急得滿頭大汗。", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 80, task: "2秒內「瘋狂左右擺動雙手(極速打包)」", ticksReq: 40, condFn: (st,h,f,rF,vel)=>h.length>=2 && vel>0.03, success: {msg:"展現驚人手速人工收銀發完雞排。伴侶看著你可靠的背影，眼裡全是心動！", effects:{courage:30, wealth:80}} },
      { name: "智慧", reqType: "wisdom", reqVal: 75, task: "「睜大眼睛、4秒內不能眨眼」", ticksReq: 80, condFn: (st,h,f,rF)=>{ if(isMoved(st,rF)||f.eyesClosed) resetMoved(st,rF); return !isMoved(st,rF) && !f.eyesClosed; }, success: {msg:"用超高智商3秒抓出線路短路，徒手修好機器！伴侶忍不住大讚你太聰明！", effects:{wisdom:25}} }
    ], fail: {msg:"店裡一團亂導致顧客全跑光，第一天營業慘淡收場。", effects:{wealth:-100}} },
    { title: "【十週年的「先婚後愛」土味情話突破】", desc: "結婚十週年，不善言辭的伴侶扭扭捏捏遞給你一個盒子。可能是親手雕刻的首飾盒，也可能是那件十年前相親穿的舊洋裝：「謝謝你包容我……我好像真的愛上你了……」", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 80, task: "「頭部微幅傾斜」並「超級燦爛露齒大笑」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>isTilt(rF) && f.isSmile && f.mouthOpen, success: {msg:"溫柔戴上戒指並抱緊他，兩人終於突破心防，成為彼此生命中的唯一！", effects:{charm:35}} },
      { name: "動漫哭哭", reqType: "charm", reqVal: 75, task: "「雙手(或單手)握拳在眼側左右擺動」3秒", ticksReq: 60, condFn: (st,h,f,rF,vel)=>h.length>=1 && vel>0.005 && rF && h.some(hand=>dist(hand[9], rF[159])<0.5 || dist(hand[9], rF[386])<0.5 || dist(hand[9], rF[234])<0.5 || dist(hand[9], rF[454])<0.5), success: {msg:"感動到當場大哭大喊這是我收過最棒的禮物！伴侶破涕為笑把你抱緊！", effects:{charm:25}} }
    ], fail: {msg:"冷淡地說喔謝謝，伴侶神色一暗，默默去廚房洗碗。", effects:{charm:-20}} },
    { title: "【漢克與露絲的「隱藏驚喜大開箱」】", desc: "結婚紀念日，伴侶神秘兮兮準備了隱藏大禮。可能是親手打造的原木手工搖椅，也可能是你最喜歡的樂團搖滾區門票！", time: 7, branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 80, task: "雙手「比出✌️」并「緊皺眉頭」3秒", ticksReq: 60, condFn: (st,h,f)=>allHands(h,'V') && f.isFrown, success: {msg:"完美看穿這份禮物背後的巨大心意與時間成本，並大讚用心！伴侶高興得像個小孩！", effects:{wisdom:30}} },
      { name: "魅力", reqType: "charm", reqVal: 80, task: "「完美招牌大笑」，雙手做出環抱動作 3秒", ticksReq: 60, condFn: (st,h,f)=>f.isSmile && f.mouthOpen && h.length>=2, success: {msg:"笑著抱上去：「有你在身邊，天天都是紀念日。」伴侶瞬間耳根全紅！", effects:{charm:35}} }
    ], fail: {msg:"嫌棄木頭有味道或演唱會太吵，伴侶落寞低下頭覺得自己又做錯事了。", effects:{charm:-15}} },
    { title: "【菜市場的「傳統大殺價」大捷】", desc: "黑心菜販把普通蔬菜開價300元！平日溫柔退讓的老實伴侶，這次竟然為了不讓你多花一毛冤枉錢，本性大爆發跟老闆講道理！", time: 7, branches: [
      { name: "勇氣", reqType: "courage", reqVal: 80, task: "「雙手抱胸」並且「憤怒皺眉」3秒", ticksReq: 60, condFn: (st,h,f)=>!f.isSmile && f.isFrown, success: {msg:"配合伴侶為家人省錢的氣場，黑心老闆被逼到半價賣還送配菜！", effects:{courage:35, wealth:50}} },
      { name: "智慧", reqType: "wisdom", reqVal: 85, task: "右手太陽穴旁「比出☝️」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>hasHand(h,'POINT') && rF && dist(h[0][8], rF[234])<0.4, success: {msg:"冷靜點出對方的秤有問題，老闆當場嚇到臉綠退款。伴侶眼裡全是崇拜！", effects:{wisdom:35}} }
    ], fail: {msg:"在菜市場吵輸了還被趕出來，兩個人摸摸鼻子去吃平價便當。", effects:{charm:-10}} },
    { title: "【晚年的「平凡卻最幸福的相手」大結局】", desc: "白髮蒼蒼的你們在黃昏公園長椅上，伴侶靠在你的肩膀：「謝謝你給了我最踏實安穩的家。如果能重來，我不要相親了，我要在17歲就提早遇見你。」", time: 7, branches: [
      { name: "魅力", reqType: "charm", reqVal: 80, task: "「極度真誠溫柔微笑」4秒", ticksReq: 80, condFn: (st,h,f)=>f.isSmile && !f.mouthOpen, success: {msg:"解鎖感人結局【先婚後愛的歲月靜好神話】！下一代獲得穩定可靠的初始遺傳！", effects:{wisdom:20, charm:20, courage:20, health:20, wealth:20}} }
    ], fail: {msg:"未能回應伴侶的浪漫。", effects:{}} }
  ]
};

// --- 養娃事件 ---
const RAW_CHILD_EVENTS = [
  {
    title: "【崩潰的「牆壁巨幅塗鴉」】",
    baseDesc: "你一推開客廳大門，發現孩子拿著防水麥克筆，把剛裝潢好的白色牆壁畫得滿滿都是！",
    descDemon: "他/她把你們的結婚照畫上鬍子，還轉頭對你哈哈大笑：「看我畫的拆除大隊！」",
    descAngel: "他/她用歪歪扭扭的線條畫了你們一家人手牽手，寫著『我愛爸媽』，一臉無邪。",
    descGenius: "他/她默默在牆上推導出一整面複雜的科學公式，冷冷看著你：「沒地方做筆記。」",
    time: 7,
    branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 80, task: "右手放在太陽穴旁「比出☝️」，且維持「面部嚴肅」 3 秒", ticksReq: 60, condFn: (st,h,f)=>hasHand(h,'POINT') && !f.isSmile, success: {msg:"冷靜引導清理或紀錄，孩子也學到了！(孩子智慧+15)", effects:{wisdom:25}} },
      { name: "動漫哭哭", reqType: "charm", reqVal: 75, task: "「雙手握拳在眼側左右擺動(大哭)」 3秒", ticksReq: 60, condFn: (st,h,f,rF,vel)=>h.length>=1 && vel>0.005 && rF && h.some(hand=>dist(hand[9], rF[159])<0.5 || dist(hand[9], rF[386])<0.5 || dist(hand[9], rF[234])<0.5 || dist(hand[9], rF[454])<0.5), success: {msg:"你一哭孩子當場嚇傻，乖乖跪下認錯拿抹布擦牆壁！", effects:{charm:30}} }
    ],
    fail: {msg:"你當場氣到大吼大叫，血壓大飆高。", effects:{health:-20, wealth:-50}}
  },
  {
    title: "【通訊軟體群組的「深夜告狀死線」】",
    baseDesc: "深夜十一點，孩子的群組聯絡人突然傳了一張驚悚的照片，並且大肆投訴孩子的脫軌行為。",
    descDemon: "他/她把大樓管理室旁邊的腳踏車輪胎給全部放氣了。",
    descAngel: "他/她因為覺得打掃阿姨太辛苦，偷偷把公共垃圾桶的回收物全部打包回家想幫忙分類，結果在門口翻倒。",
    descGenius: "他/她用黑客技術把社區的智慧門禁系統給駭了，因為他覺得系統有嚴重漏洞，強行幫所有人開門。",
    time: 7,
    branches: [
      { name: "魅力", reqType: "charm", reqVal: 85, task: "展現「真誠委屈的微笑」，雙手「合十」 3秒", ticksReq: 60, condFn: (st,h,f)=>f.isSmile && h.length>=1, success: {msg:"使出超軟身段道歉擺平！(孩子魅力+10)", effects:{charm:35}} },
      { name: "智慧", reqType: "wisdom", reqVal: 80, task: "雙手「比出✌️」並維持「面部專注」3秒", ticksReq: 60, condFn: (st,h,f)=>allHands(h,'V') && !f.isSmile, success: {msg:"有理有據地解決問題，對方反而大讚孩子是天才！", effects:{wisdom:25, wealth:150}} }
    ],
    fail: {msg:"你跟對方直接在群組對嗆，事情鬧大。", effects:{charm:-20, wealth:-100}}
  },
  {
    title: "【節日送禮的「心意大開箱」】",
    baseDesc: "今天是感恩節日，孩子神秘兮兮地把雙手藏在背後走到你面前，遞給你他花了一整天準備的節日驚喜。",
    descDemon: "他/她送你一隻在公園抓的、還在瘋狂蠕動的「巨型肥美昆蟲幼蟲」。",
    descAngel: "他/她用黏土捏了一個形狀極其不可名狀、但其實是你的黏土雕像。",
    descGenius: "他/她送你一份長達 20 頁的「父母婚後資產回報與健康長壽大數據預測報告書」。",
    time: 7,
    branches: [
      { name: "魅力", reqType: "charm", reqVal: 80, task: "「燦爛露齒大笑」，頭頂「比出大愛心」3秒", ticksReq: 60, condFn: (st,h,f)=>h.length>=2 && h.every(x=>x[0].y<0.3) && f.isSmile && f.mouthOpen, success: {msg:"一秒大讚並露出最幸福的表情，孩子開心地撲進你懷裡！", effects:{charm:35, health:15}} },
      { name: "勇氣", reqType: "courage", reqVal: 85, task: "「雙手抱胸」並且「憤怒皺眉」 3秒", ticksReq: 60, condFn: (st,h,f)=>!f.isSmile && f.isFrown, success: {msg:"你面不改色接過禮物讚不絕口，孩子覺得你超級酷！(孩子勇氣+15)", effects:{courage:35}} }
    ],
    fail: {msg:"你當場尖叫把禮物直接甩飛，孩子內心受到毀滅性打擊大哭。", effects:{charm:-20}}
  },
  {
    title: "【孩子突發的「深夜高燒死線」】",
    baseDesc: "凌晨兩點，外面颳風下大雨，孩子突然發起重病，高燒到了 39.8 度，整個人已經開始說胡話了！",
    descDemon: "平時像頭牛，此時虛弱得像隻小貓，抓著你哭：「我以後不調皮了……」",
    descAngel: "即使燒到迷糊，還是懂事地微笑：「對不起……讓你們擔心了，我躺躺就好了……」",
    descGenius: "一邊發燒一邊還在夢囈，疯狂背誦圓周率公式，身體微微抽搐。",
    time: 7,
    branches: [
      { name: "勇氣", reqType: "courage", reqVal: 85, task: "4秒內「左右劇烈晃動身體(衝刺)」", ticksReq: 80, condFn: (st,h,f,rF)=>{ if(!rF) return false; if(!st.bF) st.bF = {x: rF[1].x, y: rF[1].y}; return Math.abs(rF[1].x - st.bF.x) > 0.05; }, success: {msg:"化身風之神抱起孩子衝向急診，及時救回！(孩子勇氣+10)", effects:{courage:40}} },
      { name: "智慧", reqType: "wisdom", reqVal: 80, task: "「靜止不動」，右手在臉頰旁「比出☝️」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>{ if(isMoved(st,rF)) resetMoved(st,rF); return !isMoved(st,rF) && hasHand(h,'POINT'); }, success: {msg:"冷靜進行居家物理退燒與藥物分配，安全壓回體溫！", effects:{wisdom:35}} }
    ],
    fail: {msg:"手忙腳亂耽誤黃金時間，孩子燒了很久。", effects:{health:-30}}
  },
  {
    title: "【神秘口袋裡的「第一封紙條」】",
    baseDesc: "你今天幫孩子整理衣服時，掉出一張畫滿愛心的神祕紙條：『最喜歡你了，放學一起去公園玩。』孩子剛好走進房間臉紅得像番茄！",
    descDemon: "這根本不是情書，是別人的「決鬥書」，約好放學去沙坑單挑。",
    descAngel: "情書居然有三封，孩子一臉困擾：「大家都送我，但我比較想在家陪你。」",
    descGenius: "紙條上面寫滿了加密代碼，是他/她跟隔壁同好會的遠端信息暗號。",
    time: 7,
    branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 75, task: "右手臉頰旁「比出☝️」，且「溫柔微笑」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>hasHand(h,'POINT') && f.isSmile && rF && dist(h[0][8], rF[152])<0.4, success: {msg:"溫柔開導，建立正確的社交觀！(孩子智慧+15)", effects:{wisdom:25}} },
      { name: "魅力", reqType: "charm", reqVal: 80, task: "「歪頭」並「自信壞壞微笑」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>isTilt(rF) && f.isSmile, success: {msg:"傳授社交秘訣，孩子大讚你是情聖！(孩子魅力+15)", effects:{charm:30}} }
    ],
    fail: {msg:"你古板地大罵並沒收紙條，孩子內心大受打擊關上心門。", effects:{charm:-10}}
  },
  {
    title: "【崩潰叛逆期的「世紀摔門大戰」】",
    baseDesc: "孩子今天要求沒被滿足，突然情緒大暴走，當著你的面「砰！」摔上房門鎖住，大喊：「我要離家出走！」",
    descDemon: "孩子不只鎖門，房間內還傳來翻箱倒櫃、劈裡啪啦的拆家巨響！",
    descAngel: "門內傳來極度壓抑的哭聲，他/她把自己塞在衣櫃裡拒絕與外界溝通。",
    descGenius: "孩子用複雜的電子防盜代碼把房門鎖改寫了，你連物理鑰匙都打不開。",
    time: 7,
    branches: [
      { name: "勇氣", reqType: "courage", reqVal: 85, task: "「雙手抱胸」並「憤怒皺眉(死不眨眼)」3秒", ticksReq: 60, condFn: (st,h,f)=>!f.isSmile && f.isFrown && !f.eyesClosed, success: {msg:"拿出雷霆威嚴，一聲怒吼嚇到孩子乖乖開門認錯！(孩子勇氣+10)", effects:{courage:35}} },
      { name: "動漫哭哭", reqType: "charm", reqVal: 75, task: "「雙手握拳在眼側左右擺動」4秒", ticksReq: 80, condFn: (st,h,f,rF,vel)=>h.length>=1 && vel>0.005 && rF && h.some(hand=>dist(hand[9], rF[159])<0.5 || dist(hand[9], rF[386])<0.5 || dist(hand[9], rF[234])<0.5 || dist(hand[9], rF[454])<0.5), success: {msg:"在門外大演悲情戲，孩子愧疚感爆棚主動開門抱著你痛哭！(孩子魅力+10)", effects:{charm:35}} }
    ],
    fail: {msg:"你在門外手忙腳亂結果砸到自己的手，孩子覺得你很滑稽。", effects:{health:-20}}
  },
  {
    title: "【人生方向抉擇的「家庭革命」】",
    baseDesc: "孩子今天把一份生涯規劃意願書拍在桌上，上面的選擇徹底超乎了你和伴侶的想像，家庭革命一觸即發！",
    descDemon: "他/她拒絕穩定升學，立志要去打地下格鬥賽，或者去當職業特技賽車手。",
    descAngel: "他/她想要休學三年，隻身前往世界邊境去拯救流浪動物。",
    descGenius: "他/她放著頂級名校不讀，堅持要去深山出家研究「佛學現代量子力學化」。",
    time: 7,
    branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 85, task: "「睜大眼睛、頭部完全靜止、4秒不眨眼」", ticksReq: 80, condFn: (st,h,f,rF)=>{ if(isMoved(st,rF)||f.eyesClosed) resetMoved(st,rF); return !isMoved(st,rF) && !f.eyesClosed; }, success: {msg:"用頂級的邏輯把他的理想與現實完美結合，孩子聽得心服口服！(孩子智慧+20)", effects:{wisdom:35}} },
      { name: "魅力", reqType: "charm", reqVal: 80, task: "「燦爛露齒大笑」，頭頂「比出大愛心」3秒", ticksReq: 60, condFn: (st,h,f)=>h.length>=2 && h.every(x=>x[0].y<0.3) && f.isSmile && f.mouthOpen, success: {msg:"選擇全力支持，當他最堅強的後盾，孩子眼神燃燒著自信！(孩子勇氣+20)", effects:{charm:30}} }
    ],
    fail: {msg:"你跟孩子大吵大鬧、強行撕毀規劃書，孩子斷絕與家裡往來。", effects:{health:-20}}
  },
  {
    title: "【孩子 20 歲的「成年禮世紀回饋」】",
    baseDesc: "這是養娃線的最終大結算！孩子今天滿 20 歲了，端著一杯茶走到你面前跪下敬茶。系統根據最終屬性跳出終極回報！",
    descDemon: "秀出胸前的最高榮譽勳章：「爸/媽，我沒丟你們的臉！」",
    descAngel: "緊緊抱住你：「我能有今天，全是因為我擁有世界上最棒的父母！」",
    descGenius: "遞給你一張黑卡：「爸/媽，這張卡你們拿去全球環遊旅行吧！」",
    time: 7,
    branches: [
      { name: "全能", reqType: "charm", reqVal: 80, task: "胸前「雙手合十」，「最真誠溫柔微笑」4秒", ticksReq: 80, condFn: (st,h,f)=>h.length>=1 && f.isSmile && !f.mouthOpen, success: {msg:"大成功！孩子全部最終數值額外提升，完美保存進入二周目的繼承資料庫！", effects:{wisdom:20, charm:20, courage:20, health:20, wealth:20}} }
    ],
    fail: {msg:"平平淡淡地喝了茶。", effects:{}}
  },
  {
    title: "【神祕節日的「手工變裝慘劇」】",
    baseDesc: "派對活動要到了，主辦方要求家長與孩子親手做一套變裝服。結果成品一穿上，卻發生了意想不到的崩潰狀況！",
    descDemon: "你幫他做了一套超帥的恐龍裝，結果他太興奮狂奔，當場把龍尾巴和恐龍頭撞斷撕碎，變成一隻「禿頭恐龍」。",
    descAngel: "材料不夠只做了一套簡陋的床單幽靈裝。她非但不生氣，還甜甜安慰你：「爸爸/媽媽做的我都喜歡！」",
    descGenius: "他嫌你做的衣服不符合科學原理，自己動手改裝，在衣服上接了高壓電線和LED燈，差點把自己電飛。",
    time: 7,
    branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 75, task: "右手臉頰旁「比出☝️」，且「極度專注的嚴肅表情」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>hasHand(h,'POINT') && !f.isSmile && !f.mouthOpen && rF && dist(h[0][8], rF[152])<0.4, success: {msg:"化腐朽為神奇改成廢土風，拿下最佳造型獎！(孩子魅力+15)", effects:{wisdom:25}} },
      { name: "魅力", reqType: "charm", reqVal: 80, task: "「超級陽光露齒大笑」，頭頂「比出大愛心」3秒", ticksReq: 60, condFn: (st,h,f)=>f.isSmile && f.mouthOpen && h.length>=2 && h.every(x=>x[0].y<0.3), success: {msg:"陪孩子穿破衣服大方走秀，用超強親和力征服全場！(孩子魅力+10)", effects:{charm:30}} }
    ],
    fail: {msg:"衣服徹底搞砸，孩子在派對上被笑。", effects:{charm:-15}}
  },
  {
    title: "【家裡的「神祕流浪小動物」風波】",
    baseDesc: "孩子放學回家，突然從背後拿出一隻在路邊撿到的「神祕流浪小動物」，雙眼閃閃發光、極度哀求地希望留下來養牠。",
    descDemon: "他撿回來的居然是一隻體型巨大的流浪大狼狗，對著你們家的沙發瘋狂流口水、蠢蠢欲動。",
    descAngel: "她撿回來一隻受傷的小麻雀，用雙手小心翼翼捧著，眼眶紅紅：「牠流血了……我們救救牠好不好？」",
    descGenius: "他撿回來一窩野蜂幼蟲，並當場拿出觀察日記本，宣布要研究「社會性昆蟲的階級群體力學」。",
    time: 7,
    branches: [
      { name: "魅力", reqType: "charm", reqVal: 80, task: "「極度真誠溫柔微笑」，胸前「雙手合十」3秒", ticksReq: 60, condFn: (st,h,f)=>f.isSmile && !f.mouthOpen && h.length>=1, success: {msg:"帶領孩子建立生命責任感，成功安頓小動物！(孩子魅力+20)", effects:{charm:35}} },
      { name: "勇氣", reqType: "courage", reqVal: 85, task: "「雙手抱胸」並且「憤怒皺眉」3秒", ticksReq: 60, condFn: (st,h,f)=>!f.isSmile && f.isFrown, success: {msg:"你一記威嚴眼神把動物嚇到乖乖聽話，孩子崇拜死你！(孩子勇氣+15)", effects:{courage:35}} }
    ],
    fail: {msg:"你嚇到尖叫把動物趕走，或者動物把家裡咬爛。", effects:{health:-15, wealth:-50}}
  },
  {
    title: "【秘密聯絡簿上的「老師驚悚大投訴」】",
    baseDesc: "孩子深夜才吞吞吐吐地把聯絡簿遞給你簽名。你翻開一看，上面密密麻麻寫滿了負責人對他這個禮拜表現的「驚悚投訴報告」！",
    descDemon: "投訴他用橡皮擦做成彈弓，把周圍人的屁股全部射了一遍，還把老師的辦公桌弄翻。",
    descAngel: "投訴她人緣太好，上課時周圍圍滿了給她送零食和禮物的同學，嚴重導致集體分心。",
    descGenius: "投訴他公然糾正老師的教學漏洞，還在黑板上寫了滿滿的嘲諷代碼，氣得老師差點請假。",
    time: 7,
    branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 80, task: "「睜大眼睛、頭部完全靜止、3秒不眨眼」", ticksReq: 60, condFn: (st,h,f,rF)=>{ if(isMoved(st,rF)||f.eyesClosed) resetMoved(st,rF); return !isMoved(st,rF) && !f.eyesClosed; }, success: {msg:"寫了一篇驚為天人的大師級回覆，讓老師心服口服！(孩子智慧+15)", effects:{wisdom:30}} },
      { name: "動漫哭哭", reqType: "charm", reqVal: 75, task: "「雙手握拳在眼側左右擺動」3秒", ticksReq: 60, condFn: (st,h,f,rF,vel)=>h.length>=1 && vel>0.005 && rF && h.some(hand=>dist(hand[9], rF[159])<0.5 || dist(hand[9], rF[386])<0.5 || dist(hand[9], rF[234])<0.5 || dist(hand[9], rF[454])<0.5), success: {msg:"大演心碎悲情戲，孩子當場嚇到跪下痛改前非！(孩子魅力+15)", effects:{charm:35}} }
    ],
    fail: {msg:"你當場撕毀聯絡簿或跟孩子大動干戈，隔天被叫去辦公室聽訓。", effects:{charm:-20}}
  },
  {
    title: "【突發大開銷的「金錢教育死線」】",
    baseDesc: "孩子今天扭扭捏捏地走到你面前，遞給你一張巨額的預算帳單，希望你能撥款支持他/她的「生涯大夢想」。",
    descDemon: "他要買一台極限越野單車去參加亞洲特技大賽。",
    descAngel: "她要籌集一筆資金去幫街頭的流浪動物蓋一棟高檔保溫屋。",
    descGenius: "他要買三張最新的頂級顯示卡（GPU）來自己組裝超級電腦研究人工智慧。",
    time: 7,
    branches: [
      { name: "智慧", reqType: "wisdom", reqVal: 85, task: "「靜止不動」，右手在臉頰旁「比出☝️」3秒", ticksReq: 60, condFn: (st,h,f,rF)=>{ if(isMoved(st,rF)) resetMoved(st,rF); return !isMoved(st,rF) && hasHand(h,'POINT'); }, success: {msg:"拒絕給錢，但教會他寫企劃案拿到企業贊助！(孩子智慧+25)", effects:{wisdom:35, wealth:100}} },
      { name: "勇氣", reqType: "courage", reqVal: 80, task: "2秒內，右手「比出✋」", ticksReq: 40, condFn: (st,h)=>hasHand(h,'PALM'), success: {msg:"大方出資，但要求他必須達到目標，孩子燃起勝負欲！(孩子勇氣+25)", effects:{courage:30, wealth:-100}} }
    ],
    fail: {msg:"你扣門地拒絕並大罵他浪費錢，孩子對你極度失望。", effects:{charm:-20}}
  }
];

const CHILD_EVENTS = {
  "👼 乖巧天使型": RAW_CHILD_EVENTS.map(e => ({
      ...e, desc: e.baseDesc + e.descAngel,
      branches: e.title.includes("成年禮") ? [ { ...e.branches[0], success: { msg: e.branches[0].success.msg, effects: { charm: 70, wisdom: 20, courage: 20, health: 20, wealth: 20 } } } ] : e.branches
  })),
  "😈 混世魔王型": RAW_CHILD_EVENTS.map(e => ({
      ...e, desc: e.baseDesc + e.descDemon,
      branches: e.title.includes("成年禮") ? [ { ...e.branches[0], success: { msg: e.branches[0].success.msg, effects: { courage: 70, health: 40, wisdom: 20, charm: 20, wealth: 20 } } } ] : e.branches
  })),
  "🤓 高智商奇葩型": RAW_CHILD_EVENTS.map(e => ({
      ...e, desc: e.baseDesc + e.descGenius,
      branches: e.title.includes("成年禮") ? [ { ...e.branches[0], success: { msg: e.branches[0].success.msg, effects: { wealth: 999, wisdom: 20, charm: 20, courage: 20, health: 20 } } } ] : e.branches
  }))
};