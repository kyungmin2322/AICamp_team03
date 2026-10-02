/* 구장 식음료 주문 서비스(mock). 실제 주문 API 연동 시 이 파일만 교체하면 됩니다.
   주문은 메모리에만 두므로 새로고침하면 사라집니다.
   type Order = { id, reservationId, storeId, items: [{menuId, qty, option?}], pickupTime, status, totalPrice }
   status: received(주문접수) → cooking(조리중) → ready(픽업대기) → done(픽업완료)
   식음료 주문은 경기 당일(한국 시간 기준)에만 받습니다. 화면에서도 검사하지만, 주문 요청 직전에 여기서 한 번 더 검사합니다. */
(function(){
  const steps=['received','cooking','ready','done'];
  // 주문 가능 시간: 경기 당일 이 시각(한국 시간)부터 경기 종료 시각까지.
  const ORDER_OPEN_TIME='00:00';
  // stepDelay: 각 상태에 머무는 시간(ms). 실제 연동 시에는 서버가 알려 주는 상태 변화를 그대로 전달하면 됩니다.
  // gameHours: 경기 시작 후 이 시간이 지나면 경기가 끝난 것으로 봅니다. now: 현재 시각(시험할 때 바꿔 끼울 수 있게 함수로 둡니다).
  const config={createDelay:600,stepDelay:{received:7000,cooking:7000,ready:14000},gameHours:4,now:()=>new Date()};
  const fail=code=>Object.assign(new Error(code),{code});
  // 날짜·시각은 반드시 한국 시간(Asia/Seoul)으로 바꿔 비교합니다. UTC 기준 문자열(toISOString)로 비교하면
  // 한국 시간 오전 0~9시에 날짜가 하루 어긋납니다.
  const seoulDate=date=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(date); // YYYY-MM-DD
  const seoulTime=date=>new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(date); // HH:MM
  // 오늘(한국 시간)이 경기 날짜인지.
  function isGameDay(gameDateTime,now=config.now()){return seoulDate(new Date(gameDateTime))===seoulDate(now);}
  // 'before'(아직 주문할 수 없음) · 'open'(주문 가능) · 'ended'(경기 종료)
  function orderWindow(gameDateTime,now=config.now()){
    const start=new Date(gameDateTime).getTime(),time=now.getTime();
    if(time>start+config.gameHours*3600000)return 'ended';
    if(time>=start)return 'open'; // 경기가 자정을 넘겨 이어지는 경우에도 종료 전까지는 주문할 수 있습니다.
    return isGameDay(gameDateTime,now)&&seoulTime(now)>=ORDER_OPEN_TIME?'open':'before';
  }
  // 안내 문구에 쓰는 경기 날짜(한국 시간). 예: "10월 3일"
  const gameDayLabel=gameDateTime=>new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'long',day:'numeric'}).format(new Date(gameDateTime));

  const orders=[],listeners=[];
  let sequence=100+Math.floor(Math.random()*800);
  const copy=order=>order?{...order,items:order.items.map(item=>({...item}))}:null;
  const notify=order=>listeners.forEach(listener=>listener(copy(order)));
  function advance(order){
    const next=steps[steps.indexOf(order.status)+1];
    if(!next)return;
    setTimeout(()=>{order.status=next;notify(order);advance(order);},config.stepDelay[order.status]);
  }
  window.OrderService={
    steps,config,ORDER_OPEN_TIME,isGameDay,orderWindow,gameDayLabel,
    // data.gameDateTime: 그 예매의 경기 시작 시각. 실제 연동 시에는 서버가 예매 정보에서 직접 확인해야 합니다.
    createOrder:data=>new Promise((resolve,reject)=>setTimeout(()=>{
      // 주문 직전 재검사: 경기 당일이 아니면 주문을 거절합니다.
      if(data.gameDateTime===undefined||orderWindow(data.gameDateTime)!=='open')return reject(fail('order/not-game-day'));
      const order={id:'F-'+(++sequence),reservationId:data.reservationId,storeId:data.storeId,items:data.items.map(item=>({...item})),pickupTime:data.pickupTime,status:'received',totalPrice:data.totalPrice,createdAt:new Date().toISOString()};
      orders.push(order);notify(order);advance(order);
      resolve(copy(order));
    },config.createDelay)),
    getOrder:id=>copy(orders.find(order=>order.id===id)),
    // 한 예매에서 아직 픽업이 끝나지 않은 가장 최근 주문.
    getActiveOrder:reservationId=>copy(orders.filter(order=>order.reservationId===reservationId&&order.status!=='done').pop()),
    // 주문이 생기거나 상태가 바뀔 때마다 호출됩니다.
    onChange(listener){listeners.push(listener);}
  };
})();
