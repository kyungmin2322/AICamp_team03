/* 티켓 전달 서비스(mock). 실제 연동 시 이 파일만 교체하면 됩니다.
   전달 내역은 이 브라우저의 localStorage에만 저장합니다. 그래서 전달 링크는 같은 브라우저에서 열 때만 동작하고,
   다른 기기로는 전달되지 않습니다. 실제 문자 발송도 하지 않습니다.
   type TicketTransfer = { id, reservationId, seatId, toName?, toPhone?, token, status, createdAt, acceptedAt? }
   status: pending(전달 대기) → accepted(수락 완료) / declined(거절) / canceled(전달 취소)
   mock용 추가 필드: snapshot(링크 페이지에 보여 줄 경기·좌석·보낸 사람 정보), acceptedBy(받은 사람 uid), acceptedName */
(function(){
  const KEY='manru.transfers';
  const fail=code=>Object.assign(new Error(code),{code});
  // 읽기·쓰기에 실패하면 빈 목록으로 시작합니다. 다른 탭의 변경도 보이도록 매번 다시 읽습니다.
  function load(){try{const list=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(list)?list:[];}catch(error){return [];}}
  function save(list){try{localStorage.setItem(KEY,JSON.stringify(list));}catch(error){}}
  const copy=transfer=>transfer?{...transfer,snapshot:{...transfer.snapshot}}:null;
  const isActive=transfer=>transfer.status==='pending'||transfer.status==='accepted';
  // 추측할 수 없는 고유 토큰(링크용).
  function newToken(){const bytes=new Uint8Array(12);crypto.getRandomValues(bytes);return [...bytes].map(b=>b.toString(16).padStart(2,'0')).join('');}
  // 조건에 맞는 전달 하나를 고쳐 저장하고 돌려줍니다. 조건에 맞지 않으면 거절합니다.
  function change(match,allowed,patch,code){
    return new Promise((resolve,reject)=>{
      const list=load(),target=list.find(match);
      if(!target)return reject(fail('transfer/not-found'));
      if(!allowed(target))return reject(fail(code));
      const next={...target,...patch(target)};
      save(list.map(t=>t===target?next:t));
      resolve(copy(next));
    });
  }
  window.TransferService={
    listByReservation:reservationId=>load().filter(t=>t.reservationId===reservationId).map(copy),
    getByToken:token=>copy(load().find(t=>t.token===token)),
    // 내가 받은(수락 완료한) 티켓 목록.
    listReceived:uid=>load().filter(t=>t.status==='accepted'&&t.acceptedBy===uid).map(copy),
    linkFor:transfer=>location.href.split('#')[0]+'#transfer='+transfer.token,
    // 전달 만들기: 상태는 "전달 대기". 한 좌석에는 진행 중인 전달이 하나만 있을 수 있습니다.
    createTransfer:({reservationId,seatId,toName,toPhone,snapshot})=>new Promise((resolve,reject)=>{
      const list=load();
      if(list.some(t=>t.reservationId===reservationId&&t.seatId===seatId&&isActive(t)))return reject(fail('transfer/already-active'));
      const transfer={id:`tr-${Date.now()}-${Math.floor(Math.random()*1000)}`,reservationId,seatId,toName:toName||undefined,toPhone:toPhone||undefined,token:newToken(),status:'pending',createdAt:new Date().toISOString(),snapshot:{...snapshot}};
      save([...list,transfer]);
      resolve(copy(transfer));
    }),
    // 전달 취소는 "전달 대기"일 때만 됩니다. 수락 이후에는 보낸 사람이 회수할 수 없습니다.
    cancelTransfer:id=>change(t=>t.id===id,t=>t.status==='pending',()=>({status:'canceled'}),'transfer/not-pending'),
    // 받는 사람이 [티켓 받기]를 누르면 수락 처리합니다. 보낸 사람 본인은 받을 수 없습니다.
    acceptTransfer:(token,{uid,name})=>change(t=>t.token===token,t=>t.status==='pending'&&t.snapshot.fromUid!==uid,()=>({status:'accepted',acceptedAt:new Date().toISOString(),acceptedBy:uid,acceptedName:name}),'transfer/cannot-accept'),
    declineTransfer:token=>change(t=>t.token===token,t=>t.status==='pending',()=>({status:'declined'}),'transfer/not-pending'),
    // 예매를 취소할 때: 그 예매의 "전달 대기" 건을 모두 취소합니다.
    cancelForReservation:reservationId=>new Promise(resolve=>{save(load().map(t=>t.reservationId===reservationId&&t.status==='pending'?{...t,status:'canceled'}:t));resolve();})
  };
})();
