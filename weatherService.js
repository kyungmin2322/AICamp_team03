/* 구장 날씨 서비스. 기상청 단기예보(getVilageFcst) 응답 형식을 그대로 다룹니다.
   지금은 mock 응답을 쓰고, 실제 연동 시 config.useMock만 false로 바꾸면
   서버리스 함수(config.endpoint)를 거쳐 호출합니다. API 키는 이 파일에 두지 않습니다. */
(function(){
  const config={useMock:true,endpoint:'/api/weather',mockDelay:250,mockDays:3};
  const pad=n=>String(n).padStart(2,'0');
  const ymd=date=>`${date.getFullYear()}${pad(date.getMonth()+1)}${pad(date.getDate())}`;

  // 기상청 API 활용가이드의 위경도 → 격자(nx, ny) 변환. Lambert Conformal Conic 도법.
  function toGrid(lat,lng){
    const RE=6371.00877,GRID=5.0,SLAT1=30.0,SLAT2=60.0,OLON=126.0,OLAT=38.0,XO=43,YO=136;
    const DEGRAD=Math.PI/180.0;
    const re=RE/GRID,slat1=SLAT1*DEGRAD,slat2=SLAT2*DEGRAD,olon=OLON*DEGRAD,olat=OLAT*DEGRAD;
    let sn=Math.tan(Math.PI*.25+slat2*.5)/Math.tan(Math.PI*.25+slat1*.5);
    sn=Math.log(Math.cos(slat1)/Math.cos(slat2))/Math.log(sn);
    let sf=Math.tan(Math.PI*.25+slat1*.5);
    sf=Math.pow(sf,sn)*Math.cos(slat1)/sn;
    let ro=Math.tan(Math.PI*.25+olat*.5);
    ro=re*sf/Math.pow(ro,sn);
    let ra=Math.tan(Math.PI*.25+lat*DEGRAD*.5);
    ra=re*sf/Math.pow(ra,sn);
    let theta=lng*DEGRAD-olon;
    if(theta>Math.PI)theta-=2.0*Math.PI;
    if(theta<-Math.PI)theta+=2.0*Math.PI;
    theta*=sn;
    return {nx:Math.floor(ra*Math.sin(theta)+XO+.5),ny:Math.floor(ro-ra*Math.cos(theta)+YO+.5)};
  }

  // 단기예보는 02시부터 3시간 간격으로 발표되고, 발표 약 10분 뒤부터 조회할 수 있습니다.
  function latestBase(now=new Date()){
    const t=new Date(now.getTime()-10*60000);
    const hours=[23,20,17,14,11,8,5,2],hour=hours.find(h=>h<=t.getHours());
    if(hour===undefined){t.setDate(t.getDate()-1);return {base_date:ymd(t),base_time:'2300'};}
    return {base_date:ymd(t),base_time:pad(hour)+'00'};
  }

  // PTY(강수형태)가 0이 아니면 PTY 우선, 0이면 SKY(하늘상태)로 판정합니다.
  const ptyLabels={1:['🌧','비'],2:['🌨','비·눈'],3:['❄','눈'],4:['🌦','소나기']};
  const skyLabels={1:['☀','맑음'],3:['⛅','구름많음'],4:['☁','흐림']};
  function condition(pty,sky){
    const [icon,label]=(pty!==0&&ptyLabels[pty])||skyLabels[sky]||skyLabels[1];
    return {icon,label};
  }

  // 응답 item 목록에서 경기 날짜·시작 시각의 예보를 고릅니다.
  // 정확히 일치하는 시각이 없으면 같은 날짜의 가장 가까운 이후 시각을 씁니다.
  function pickForecast(items,date){
    const day=ymd(date),target=pad(date.getHours())+pad(date.getMinutes()),slots={};
    items.forEach(item=>{
      if(item.fcstDate!==day||!['TMP','SKY','PTY','POP'].includes(item.category))return;
      (slots[item.fcstTime]=slots[item.fcstTime]||{})[item.category]=Number(item.fcstValue);
    });
    const time=Object.keys(slots).filter(t=>t>=target&&['TMP','SKY','PTY','POP'].every(c=>c in slots[t])).sort()[0];
    if(!time)return {status:'none'};
    const slot=slots[time];
    return {status:'ok',...condition(slot.PTY,slot.SKY),temp:slot.TMP,pop:slot.POP,fcstTime:time};
  }

  // mock: 기상청과 같은 모양의 응답을 만듭니다. 오늘부터 mockDays일 뒤까지만 예보가 있는 것으로 둡니다.
  function mockResponse({nx,ny}){
    const item=[],start=new Date();start.setHours(0,0,0,0);
    for(let d=0;d<=config.mockDays;d++){
      const date=new Date(start);date.setDate(start.getDate()+d);
      const seed=(nx*31+ny*17+date.getDate()*7+date.getMonth()*13)%100;
      for(let hour=0;hour<24;hour++){
        const fcstDate=ymd(date),fcstTime=pad(hour)+'00';
        const sky=seed<45?1:seed<75?3:4,pty=seed>=88?1:seed>=82?4:0;
        const tmp=12+seed%8+(hour>=11&&hour<=17?4:hour>=18&&hour<=21?1:-2);
        const pop=pty?70+seed%3*10:sky===4?40:sky===3?20:seed%2*10;
        [['TMP',tmp],['SKY',sky],['PTY',pty],['POP',pop]].forEach(([category,fcstValue])=>item.push({category,fcstDate,fcstTime,fcstValue:String(fcstValue),nx,ny}));
      }
    }
    return new Promise(resolve=>setTimeout(()=>resolve({response:{header:{resultCode:'00',resultMsg:'NORMAL_SERVICE'},body:{dataType:'JSON',items:{item},totalCount:item.length}}}),config.mockDelay));
  }

  // 실제 호출: 서버리스 함수가 API 키(WEATHER_API_KEY)를 붙여 기상청에 대신 요청합니다.
  async function requestForecast(params){
    if(config.useMock)return mockResponse(params);
    const response=await fetch(`${config.endpoint}?${new URLSearchParams(params)}`);
    if(!response.ok)throw new Error('날씨 응답 오류 '+response.status);
    return response.json();
  }

  function readItems(json){
    const header=json&&json.response&&json.response.header;
    if(!header)throw new Error('날씨 응답 형식 오류');
    if(header.resultCode==='03')return []; // NO_DATA
    if(header.resultCode!=='00')throw new Error('기상청 오류 '+header.resultCode+' '+header.resultMsg);
    const item=json.response.body.items.item;
    return Array.isArray(item)?item:[];
  }

  // 같은 격자·같은 발표 시각의 예보는 한 번만 받아 여러 날짜가 함께 씁니다.
  const forecastCache=new Map();
  function loadForecast(grid){
    const base=latestBase(),key=`${grid.nx},${grid.ny},${base.base_date}${base.base_time}`;
    if(!forecastCache.has(key)){
      const pending=requestForecast({...base,...grid}).then(readItems);
      pending.catch(()=>forecastCache.delete(key));
      forecastCache.set(key,pending);
    }
    return forecastCache.get(key);
  }

  // 같은 구장·같은 날짜(시작 시각 포함) 요청은 메모리에 캐시해 재호출하지 않습니다. 실패한 요청은 캐시하지 않습니다.
  const gameCache=new Map();
  function getGameWeather(stadium,date){
    if(!stadium)return Promise.reject(new Error('구장 정보 없음'));
    const key=`${stadium.id}|${ymd(date)}|${pad(date.getHours())}${pad(date.getMinutes())}`;
    if(!gameCache.has(key)){
      const pending=loadForecast(toGrid(stadium.lat,stadium.lng)).then(items=>pickForecast(items,date));
      pending.catch(()=>gameCache.delete(key));
      gameCache.set(key,pending);
    }
    return gameCache.get(key);
  }

  window.WeatherService={config,toGrid,latestBase,pickForecast,getGameWeather};
})();
