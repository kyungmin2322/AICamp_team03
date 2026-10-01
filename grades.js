/* 좌석 등급 mock 데이터. API 도입 시 동일한 필드로 교체합니다.
   color는 index.html :root의 구역 색 변수(--zone-*)를 가리킵니다. */
window.TicketGrades = Object.freeze([
  {id:'premium',name:'프리미엄석',color:'var(--zone-premium)',price:45000},
  {id:'exciting',name:'익사이팅존',color:'var(--zone-exciting)',price:28000},
  {id:'lower',name:'1층 내야석',color:'var(--zone-lower)',price:22000},
  {id:'middle',name:'2층 내야석',color:'var(--zone-middle)',price:18000},
  {id:'upper',name:'3층 내야석',color:'var(--zone-upper)',price:15000},
  {id:'outfield',name:'외야석',color:'var(--zone-outfield)',price:12000}
]);
