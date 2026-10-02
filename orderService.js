/* 구장 식음료 주문 서비스(mock). 실제 주문 API 연동 시 이 파일만 교체하면 됩니다.
   주문은 메모리에만 두므로 새로고침하면 사라집니다.
   type Order = { id, reservationId, storeId, items: [{menuId, qty, option?}], pickupTime, status, totalPrice }
   status: received(주문접수) → cooking(조리중) → ready(픽업대기) → done(픽업완료) */
(function(){
  const steps=['received','cooking','ready','done'];
  // 각 상태에 머무는 시간(ms). 실제 연동 시에는 서버가 알려 주는 상태 변화를 그대로 전달하면 됩니다.
  const config={createDelay:600,stepDelay:{received:7000,cooking:7000,ready:14000}};
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
    steps,config,
    createOrder:data=>new Promise(resolve=>setTimeout(()=>{
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
