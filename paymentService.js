/* 간편결제 서비스(mock). 실제 결제는 하지 않으며, 실제 PG 연동 시 이 파일만 교체하면 됩니다.
   카드번호·계좌번호 같은 민감정보는 받지도 저장하지도 않습니다.
   결제수단 목록과 기본 결제수단은 앱 전체에서 이 파일 한 곳이 관리하고(티켓 결제와 식음료 결제가 함께 사용),
   이 브라우저의 localStorage에 보관해 새로고침 뒤에도 유지합니다.
   type PayMethod = { id, provider, label, isDefault, registeredAt } */
(function(){
  // 결제사 설정. 로고 파일(logoUrl)이 없으면 화면에서 브랜드명 텍스트 배지로 대신 표시합니다.
  const providers=[
    {id:'naverpay',name:'네이버페이',color:'#03c75a',text:'#ffffff',logoUrl:'assets/pay/naverpay.svg'},
    {id:'tosspay',name:'토스페이',color:'#0064ff',text:'#ffffff',logoUrl:'assets/pay/tosspay.svg'},
    {id:'kakaopay',name:'카카오페이',color:'#fee500',text:'#191919',logoUrl:'assets/pay/kakaopay.svg'},
    {id:'payco',name:'페이코',color:'#fa2828',text:'#ffffff',logoUrl:'assets/pay/payco.svg'}
  ];
  const KEY='manru.payMethods',config={registerDelay:1000,paymentDelay:700};
  const fail=code=>Object.assign(new Error(code),{code});
  const later=(ms,run)=>new Promise((resolve,reject)=>setTimeout(()=>{try{resolve(run());}catch(error){reject(error);}},ms));
  const known=id=>providers.some(p=>p.id===id);
  // 기본 결제수단은 항상 정확히 하나만 둡니다. (하나도 없거나 여러 개면 첫 번째를 기본으로)
  const normalize=list=>list.length&&list.filter(m=>m.isDefault).length!==1?list.map((m,i)=>({...m,isDefault:i===0})):list;
  // 읽기·쓰기에 실패하면 빈 목록으로 시작합니다.
  function load(){
    try{const list=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(list)?normalize(list.filter(m=>m&&typeof m.id==='string'&&known(m.provider))):[];}
    catch(error){return [];}
  }
  let methods=load();
  const listeners=[];
  function commit(next){
    methods=normalize(next);
    try{localStorage.setItem(KEY,JSON.stringify(methods));}catch(error){}
    listeners.forEach(listener=>listener());
    return methods.map(m=>({...m}));
  }
  // 다른 탭에서 목록이 바뀌면 다시 읽어 알려 줍니다.
  window.addEventListener('storage',event=>{if(event.key===KEY){methods=load();listeners.forEach(listener=>listener());}});
  // 해당 id만 isDefault: true, 나머지는 모두 false인 새 배열을 만듭니다.
  const withDefault=(list,id)=>list.map(m=>({...m,isDefault:m.id===id}));
  window.PaymentService={
    providers,config,
    listPayMethods:()=>methods.map(m=>({...m})),
    getDefaultPayMethod:()=>{const method=methods.find(m=>m.isDefault);return method?{...method}:null;},
    // 목록이 바뀔 때마다(등록·삭제·기본 변경·다른 탭의 변경) 호출됩니다.
    subscribe(listener){listeners.push(listener);},
    // 결제수단 등록(mock): 잠시 "연결 중" 시간을 둔 뒤 목록에 추가합니다. 처음 등록한 수단이 기본 결제수단이 됩니다.
    registerPayMethod:provider=>later(config.registerDelay,()=>{
      if(!known(provider))throw fail('pay/unknown-provider');
      if(methods.some(m=>m.provider===provider))throw fail('pay/already-registered');
      const method={id:`pm-${provider}-${Date.now()}`,provider,label:providers.find(p=>p.id===provider).name,isDefault:!methods.length,registeredAt:new Date().toISOString()};
      commit([...methods,method]);
      return {...method};
    }),
    // 삭제. 기본 결제수단을 지우면 남은 목록의 첫 번째가 기본이 되고, 그 수단을 newDefault로 알려 줍니다.
    removePayMethod:id=>later(150,()=>{
      const removed=methods.find(m=>m.id===id);
      if(!removed)return {removed:null,newDefault:null};
      const next=commit(methods.filter(m=>m.id!==id));
      return {removed:{...removed},newDefault:removed.isDefault&&next.length?next.find(m=>m.isDefault):null};
    }),
    // 기본 결제수단 지정. 바뀐 새 목록을 돌려줍니다.
    setDefault:id=>methods.some(m=>m.id===id)?commit(withDefault(methods,id)):methods.map(m=>({...m})),
    // 결제 요청(mock): 실제 금액은 청구되지 않습니다. 실제 연동 시 PG사의 결제 승인 요청으로 바꿉니다.
    // 어떤 수단으로 결제해도 기본 결제수단 설정은 바뀌지 않습니다.
    requestPayment:({methodId,amount,orderName})=>later(config.paymentDelay,()=>{
      if(!methods.some(m=>m.id===methodId))throw fail('pay/method-not-found');
      return {paymentId:'PAY-'+Date.now(),methodId,amount,orderName,approvedAt:new Date().toISOString()};
    })
  };
})();
