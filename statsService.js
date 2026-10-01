/* 선수 기록 서비스. 지금은 가상의 선수로 만든 mock 데이터를 돌려줍니다.
   실제 데이터 소스로 바꿀 때는 load()가 같은 모양의 객체를 돌려주도록만 맞추면 됩니다. */
(function(){
  const P=(name,team,era,war,wins,losses,saves,holds,games,qualified)=>({name,team,era,war,wins,losses,saves,holds,games,qualified});
  const B=(name,team,avg,war,hits,homeRuns,rbi,runs,stolenBases,qualified)=>({name,team,avg,war,hits,homeRuns,rbi,runs,stolenBases,qualified});
  // team은 index.html의 teams[].id와 같은 값을 씁니다. qualified는 규정이닝/규정타석 충족 여부입니다.
  const pitchers=[
    P('한도율','lotte',2.41,6.82,16,5,0,0,29,true),
    P('서이찬','hanwha',2.68,6.15,15,6,0,0,28,true),
    P('문태결','lg',2.85,5.74,14,7,0,0,29,true),
    P('권해솔','kia',3.02,5.31,13,8,0,0,28,true),
    P('노은겸','samsung',3.11,4.96,13,7,0,0,27,true),
    P('차우빈','ssg',3.24,4.52,12,9,0,0,28,true),
    P('방시후','kt',3.37,4.18,11,9,0,0,27,true),
    P('길도경','doosan',3.48,3.87,11,10,0,0,28,true),
    P('표민결','nc',3.59,3.55,10,10,0,0,27,true),
    P('설하준','kiwoom',3.72,3.21,9,11,0,0,27,true),
    P('옥재윤','lotte',3.81,3.02,10,8,0,0,26,true),
    P('탁건호','hanwha',3.95,2.76,9,9,0,0,26,true),
    P('예승민','lg',4.12,2.31,8,10,0,0,26,true),
    P('반지환','kia',4.35,1.84,7,11,0,0,25,true),
    P('감태오','lotte',1.92,3.48,4,2,36,0,61,false),
    P('마루한','hanwha',2.15,3.12,3,3,33,1,58,false),
    P('제갈윤','lg',2.34,2.65,5,2,28,3,60,false),
    P('남궁혁','ssg',2.56,2.41,4,4,2,31,68,false),
    P('선우담','samsung',2.71,2.18,6,3,1,27,66,false),
    P('황보결','kt',2.93,1.95,3,2,0,25,63,false),
    P('어진서','doosan',3.18,1.62,5,4,19,4,55,false),
    P('편도윤','nc',3.40,1.37,2,5,22,2,57,false)
  ];
  const batters=[
    B('강루빈','lotte',.341,7.12,192,28,104,109,21,true),
    B('은태성','hanwha',.329,6.58,181,34,118,98,8,true),
    B('진하람','kia',.325,6.03,178,22,91,103,32,true),
    B('채도윤','lg',.318,5.61,174,19,85,96,27,true),
    B('변시온','samsung',.312,5.24,169,31,109,88,5,true),
    B('석주원','ssg',.308,4.87,166,26,97,84,11,true),
    B('도건우','kt',.304,4.45,162,17,78,91,38,true),
    B('육현서','nc',.299,4.02,158,24,92,80,9,true),
    B('소준혁','doosan',.296,3.71,155,15,74,87,24,true),
    B('맹서진','kiwoom',.291,3.38,151,20,83,76,13,true),
    B('함지율','lotte',.288,3.09,147,12,66,82,41,true),
    B('봉태현','hanwha',.284,2.84,143,27,95,71,3,true),
    B('추민재','lg',.279,2.52,139,14,68,73,16,true),
    B('연우석','kia',.275,2.21,135,21,80,65,6,true),
    B('금하늘','ssg',.271,1.93,131,9,55,70,29,true),
    B('빈도현','kt',.266,1.58,127,16,71,61,7,true),
    B('왕재하','samsung',.352,2.47,81,9,44,41,6,false),
    B('명시율','nc',.338,1.86,68,5,31,36,12,false),
    B('태윤호','doosan',.331,1.42,59,11,39,28,2,false),
    B('경로운','kiwoom',.322,1.15,55,3,22,33,15,false),
    B('온규민','lotte',.257,1.04,118,18,69,54,4,true),
    B('국한결','hanwha',.249,.72,109,13,58,49,10,true)
  ];
  // 실제 연동 시 이 함수 안에서 fetch 등으로 데이터를 받아 같은 모양으로 돌려줍니다.
  function load(){
    return Promise.resolve({asOf:'2026-09-30',warSource:'가상 데이터(연습용)',pitchers,batters});
  }
  window.StatsService={load};
})();
