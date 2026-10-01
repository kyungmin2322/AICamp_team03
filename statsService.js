/* 선수 기록 서비스. 선수 명단은 실제 KBO 선수이지만 스탯 수치는 모두 예시 값입니다(실제 기록 아님).
   실제 데이터 소스로 바꿀 때는 load()가 같은 모양의 객체를 돌려주도록만 맞추면 됩니다. */
(function(){
  const P=(name,team,era,war,wins,losses,saves,holds,games,photoUrl)=>({name,team,era,war,wins,losses,saves,holds,games,qualified:true,photoUrl});
  const B=(name,team,avg,war,hits,homeRuns,rbi,runs,stolenBases,photoUrl)=>({name,team,avg,war,hits,homeRuns,rbi,runs,stolenBases,qualified:true,photoUrl});
  // team은 teams.js의 id와 같은 값을 씁니다. 배열 순서가 WAR 순위입니다.
  // photoUrl(선택)은 WAR 1~3위만 연결했습니다. 파일이 없거나 불러오지 못하면 화면에서 기본 실루엣으로 대신 표시합니다.
  const pitchers=[
    P('장유호','hanwha',2.12,6.40,15,4,0,0,28,'assets/players/jang-yuho.jpg'),
    P('김진욱','lotte',2.48,5.85,14,5,0,0,29,'assets/players/kim-jinuk.jpg'),
    P('문동주','hanwha',2.71,5.30,13,6,0,0,27,'assets/players/moon-dongju.jpg'),
    P('곽빈','doosan',2.95,4.75,12,7,0,0,28),
    P('올러','kia',3.08,4.30,12,6,0,0,27),
    P('임찬규','lg',3.21,3.90,11,7,0,0,27),
    P('고영표','kt',3.36,3.45,10,8,0,0,26),
    P('류현진','hanwha',3.52,3.05,10,8,0,0,26),
    P('김재윤','samsung',2.64,2.40,4,3,31,2,62),
    P('박영현','kt',2.39,2.10,5,4,34,1,66)
  ];
  const batters=[
    B('전민재','lotte',.331,6.90,172,12,71,88,14,'assets/players/jeon-minjae.jpg'),
    B('장두성','lotte',.318,6.25,165,5,48,97,38,'assets/players/jang-duseong.jpg'),
    B('이도윤','hanwha',.305,5.70,148,7,62,74,11,'assets/players/lee-doyun.jpg'),
    B('오스틴','lg',.312,5.20,163,32,108,91,9),
    B('김도영','kia',.336,4.85,178,34,104,100,36),
    B('구자욱','samsung',.322,4.40,169,26,96,93,10),
    B('레이예스','lotte',.329,3.95,180,15,102,85,5),
    B('문현빈','hanwha',.314,3.50,160,13,78,80,16),
    B('강백호','hanwha',.287,3.05,141,24,89,69,3),
    B('페라자','hanwha',.279,2.60,136,22,81,76,8)
  ];
  // 실제 연동 시 이 함수 안에서 fetch 등으로 데이터를 받아 같은 모양으로 돌려줍니다.
  // note는 표 하단에 그대로 표시되는 출처 문구입니다.
  function load(){
    return Promise.resolve({note:'※ 예시 데이터 (실제 기록 아님)',pitchers,batters});
  }
  window.StatsService={load};
})();
