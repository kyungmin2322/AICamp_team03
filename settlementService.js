/* 정산 서비스(mock). 실제 연동 시 이 파일만 교체하면 됩니다. 실제 송금 기능은 없습니다.
   정산 내역은 이 브라우저의 localStorage에만 저장하므로, 정산 링크도 같은 브라우저에서 열 때만 동작합니다.
   type Settlement = { id, reservationId, seatId, payeeName, amount, status, requestedAt?, completedAt? }
   status: draft(요청 전) → requested(요청됨) → awaitingConfirm(확인 대기) → done(정산 완료)
   mock용 추가 필드: token(정산 링크용), snapshot(링크 페이지에 보여 줄 경기·좌석 정보) */
(function(){
  const KEY='manru.settlements';
  const fail=code=>Object.assign(new Error(code),{code});
  function load(){try{const list=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(list)?list:[];}catch(error){return [];}}
  function save(list){try{localStorage.setItem(KEY,JSON.stringify(list));}catch(error){}}
  const copy=item=>item?{...item,snapshot:{...item.snapshot}}:null;
  function newToken(){const bytes=new Uint8Array(12);crypto.getRandomValues(bytes);return [...bytes].map(b=>b.toString(16).padStart(2,'0')).join('');}
  function change(match,allowed,patch,code){
    return new Promise((resolve,reject)=>{
      const list=load(),target=list.find(match);
      if(!target)return reject(fail('settlement/not-found'));
      if(!allowed(target))return reject(fail(code));
      const next={...target,...patch(target)};
      save(list.map(item=>item===target?next:item));
      resolve(copy(next));
    });
  }
  window.SettlementService={
    listByReservation:reservationId=>load().filter(item=>item.reservationId===reservationId).map(copy),
    getByToken:token=>copy(load().find(item=>item.token===token)),
    linkFor:item=>location.href.split('#')[0]+'#settle='+item.token,
    // 좌석 하나에 정산 건 하나. 없으면 "요청 전" 상태로 만들고, 요청 전이면 받는 사람 이름만 맞춥니다.
    ensureDraft:({reservationId,seatId,payeeName,amount,snapshot})=>new Promise(resolve=>{
      const list=load(),found=list.find(item=>item.reservationId===reservationId&&item.seatId===seatId);
      if(found){
        const next=found.status==='draft'?{...found,payeeName}:found;
        save(list.map(item=>item===found?next:item));
        return resolve(copy(next));
      }
      const created={id:`st-${Date.now()}-${Math.floor(Math.random()*1000)}`,reservationId,seatId,payeeName,amount,status:'draft',snapshot:{...snapshot}};
      save([...list,created]);
      resolve(copy(created));
    }),
    // 금액은 요청 전까지 좌석별로 직접 고칠 수 있습니다(0원 = 정산 없음).
    setAmount:(id,amount)=>change(item=>item.id===id,item=>item.status==='draft',()=>({amount:Math.max(0,Math.floor(Number(amount)||0))}),'settlement/not-draft'),
    // 정산 요청 보내기: 요청 전인 건에 정산 링크를 만들고 "요청됨"으로 바꿉니다. 0원인 건은 바로 "정산 완료"로 둡니다.
    requestAll:reservationId=>new Promise(resolve=>{
      const now=new Date().toISOString();
      const list=load().map(item=>item.reservationId!==reservationId||item.status!=='draft'?item:item.amount>0?{...item,status:'requested',token:newToken(),requestedAt:now}:{...item,status:'done',completedAt:now});
      save(list);
      resolve(list.filter(item=>item.reservationId===reservationId).map(copy));
    }),
    // 받는 사람이 [송금 완료했어요]를 누르면 "확인 대기".
    markSent:token=>change(item=>item.token===token,item=>item.status==='requested',()=>({status:'awaitingConfirm'}),'settlement/not-requested'),
    // 예매자가 [입금 확인]을 누르면 "정산 완료".
    confirm:id=>change(item=>item.id===id,item=>item.status==='awaitingConfirm',()=>({status:'done',completedAt:new Date().toISOString()}),'settlement/not-awaiting'),
    // 다시 알림(mock): 실제 발송은 하지 않습니다.
    remind:id=>change(item=>item.id===id,item=>item.status==='requested',()=>({remindedAt:new Date().toISOString()}),'settlement/not-requested'),
    // 전달을 취소하면 그 좌석의 정산 건을 지웁니다(이미 정산 완료된 건은 남깁니다).
    removeForSeat:(reservationId,seatId)=>new Promise(resolve=>{save(load().filter(item=>!(item.reservationId===reservationId&&item.seatId===seatId&&item.status!=='done')));resolve();}),
    removeForReservation:reservationId=>new Promise(resolve=>{save(load().filter(item=>item.reservationId!==reservationId));resolve();})
  };
})();
