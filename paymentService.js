/* 간편결제 서비스(mock). 실제 결제는 하지 않으며, 실제 PG 연동 시 이 파일만 교체하면 됩니다.
   카드번호·계좌번호 같은 민감정보는 받지도 저장하지도 않습니다.
   등록한 결제수단 목록은 이 브라우저의 localStorage에만 보관합니다.
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
  function load(){
    try{const list=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(list)?list.filter(m=>m&&typeof m.id==='string'&&known(m.provider)):[];}
    catch(error){return [];}
  }
  let methods=load();
  function save(){
    // 기본 결제수단은 항상 정확히 하나만 둡니다.
    if(methods.length&&methods.filter(m=>m.isDefault).length!==1)methods.forEach((m,i)=>m.isDefault=i===0);
    try{localStorage.setItem(KEY,JSON.stringify(methods));}catch(error){}
  }
  window.PaymentService={
    providers,config,
    listPayMethods:()=>methods.map(m=>({...m})),
    // 결제수단 등록(mock): 잠시 "연결 중" 시간을 둔 뒤 목록에 추가합니다. 처음 등록한 수단이 기본 결제수단이 됩니다.
    registerPayMethod:provider=>later(config.registerDelay,()=>{
      if(!known(provider))throw fail('pay/unknown-provider');
      if(methods.some(m=>m.provider===provider))throw fail('pay/already-registered');
      const method={id:`pm-${provider}-${Date.now()}`,provider,label:providers.find(p=>p.id===provider).name,isDefault:!methods.length,registeredAt:new Date().toISOString()};
      methods.push(method);save();
      return {...method};
    }),
    removePayMethod:id=>later(150,()=>{methods=methods.filter(m=>m.id!==id);save();}),
    setDefaultPayMethod(id){if(!methods.some(m=>m.id===id))return;methods.forEach(m=>m.isDefault=m.id===id);save();},
    // 결제 요청(mock): 실제 금액은 청구되지 않습니다. 실제 연동 시 PG사의 결제 승인 요청으로 바꿉니다.
    requestPayment:({methodId,amount,orderName})=>later(config.paymentDelay,()=>{
      if(!methods.some(m=>m.id===methodId))throw fail('pay/method-not-found');
      return {paymentId:'PAY-'+Date.now(),methodId,amount,orderName,approvedAt:new Date().toISOString()};
    })
  };
})();
