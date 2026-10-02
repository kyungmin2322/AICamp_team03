/* 구장별 식음료 매장 데이터(mock). 키는 stadiums.js의 구장 id입니다.
   잠실야구장의 매장명과 위치, 보영만두의 메뉴·가격은 전달받은 값이고,
   그 외 매장의 메뉴명·가격·대기시간·영업 상태는 예시 값입니다(실제와 다를 수 있음).
   매장이 없는 구장은 빈 배열로 두면 "아직 원격 주문을 지원하지 않습니다"로 표시됩니다. */
(function(){
  const menu=(id,name,price,extra={})=>({id,name,price,soldOut:false,...extra});
  const store=(key,brand,zone,locationDetail,waitMinutes,menus,isOpen=true)=>({id:'jamsil-'+key,stadiumId:'jamsil',brand,name:brand+' 잠실야구장점',zone,locationDetail,isOpen,waitMinutes,menus});
  const spicy={name:'맵기 선택',choices:['안매운맛','중간맛','매운맛']};
  window.StadiumStores={
    jamsil:[
      store('boyoung','보영만두','3루','3루 2층 내야',10,[menu('boyoung-jjolmyeon','쫄면',8500,{options:[spicy]}),menu('boyoung-mandu','군만두',8500)]),
      store('mrpizza','미스터피자','3루','3루 2층 내야',12,[menu('mrpizza-potato','포테이토 피자(조각)',6500),menu('mrpizza-pepperoni','페퍼로니 피자(조각)',6500)]),
      store('tacoeat','타코잇','3루','3루 2층 내야',8,[menu('tacoeat-beef','비프 타코 2P',9000),menu('tacoeat-nacho','나초 & 살사',7000)]),
      store('xoxo','XOXO핫도그','3루','3루 2층 내야',6,[menu('xoxo-classic','클래식 핫도그',6000),menu('xoxo-cheese','치즈 핫도그',7000)]),
      store('bbq','BBQ치킨','3루','3루 2층 내야',20,[menu('bbq-half','후라이드 반마리',13000),menu('bbq-tender','치킨텐더',9000)]),
      store('yoajung','요아정','3루','3루 2층 내야',5,[menu('yoajung-plain','요거트 아이스크림',5500),menu('yoajung-honey','벌집꿀 요거트 아이스크림',7500)],false),
      store('sunae','수내닭꼬치','3루','3루 2층 내야',9,[menu('sunae-skewer','닭꼬치 2개',7000,{options:[{name:'맛 선택',choices:['소금','데리야끼','매운맛']}]}),menu('sunae-green','파닭꼬치',4500)]),
      store('igane','이가네떡볶이','3루','3루 2층 내야',7,[menu('igane-tteok','떡볶이',6000,{options:[spicy]}),menu('igane-fried','튀김 모둠',6000)]),
      store('jaws','죠스떡볶이','3루','3루 2층 내야',7,[menu('jaws-tteok','매운 떡볶이',5500),menu('jaws-sundae','수제 순대',5000,{soldOut:true})]),
      store('pizzahut','피자헛','3루','3루 2층 내야',15,[menu('pizzahut-cheese','치즈 피자(조각)',6000),menu('pizzahut-combi','콤비네이션 피자(조각)',6500)]),
      store('bhc','BHC치킨','3루','3루 2층 내야',18,[menu('bhc-half','순살치킨 반마리',14000),menu('bhc-cheeseball','치즈볼 5개',6000)]),
      store('chojang','초장집','1루','1루 내야',14,[menu('chojang-mulhoe','물회',15000),menu('chojang-bowl','회덮밥',12000)])
    ],
    suwon:[],incheon:[],changwon:[],gwangju:[],sajik:[],daegu:[],daejeon:[],gocheok:[]
  };
})();
