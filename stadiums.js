/* 구장 설정. 구장 이름·위치와 외부 링크는 이 파일 한 곳에서 관리합니다.
   lat/lng: 날씨 조회 때 기상청 격자(nx, ny)로 바꿔 씁니다. 좌표는 대략값이라 확인이 필요합니다.
   seatViewUrl: 좌석 시야 확인용 외부 사이트(자리어때) 구장 페이지. 링크로만 연결하며, 없으면 기본 주소를 씁니다. */
window.SeatViewDefaultUrl='https://myseatcheck.com/';
window.Stadiums=[
  {id:'jamsil',name:'잠실야구장',city:'서울',lat:37.5122,lng:127.0719,seatViewUrl:'https://myseatcheck.com/%ec%84%9c%ec%9a%b8-%ec%9e%a0%ec%8b%a4%ec%95%bc%ea%b5%ac%ec%9e%a5/'},
  {id:'suwon',name:'수원 KT 위즈파크',city:'수원',lat:37.2997,lng:127.0097,seatViewUrl:'https://myseatcheck.com/%ec%88%98%ec%9b%90-kt%ec%9c%84%ec%a6%88%ed%8c%8c%ed%81%ac-2/'},
  {id:'incheon',name:'인천 SSG 랜더스필드',city:'인천',lat:37.4370,lng:126.6932,seatViewUrl:'https://myseatcheck.com/%ec%9d%b8%ec%b2%9c-ssg-%eb%9e%9c%eb%8d%94%ec%8a%a4%ed%95%84%eb%93%9c/'},
  {id:'changwon',name:'창원 NC 파크',city:'창원',lat:35.2225,lng:128.5822,seatViewUrl:'https://myseatcheck.com/%ec%b0%bd%ec%9b%90-nc%ed%8c%8c%ed%81%ac-2/'},
  {id:'gwangju',name:'광주 기아 챔피언스필드',city:'광주',lat:35.1682,lng:126.8891,seatViewUrl:'https://myseatcheck.com/%ea%b4%91%ec%a3%bc-kia-%ec%b1%94%ed%94%bc%ec%96%b8%ec%8a%a4%ed%95%84%eb%93%9c/'},
  {id:'sajik',name:'사직야구장',city:'부산',lat:35.1940,lng:129.0615,seatViewUrl:'https://myseatcheck.com/%eb%b6%80%ec%82%b0-%ec%82%ac%ec%a7%81%ec%95%bc%ea%b5%ac%ec%9e%a5/'},
  {id:'daegu',name:'대구 삼성 라이온즈파크',city:'대구',lat:35.8411,lng:128.6817,seatViewUrl:'https://myseatcheck.com/%eb%8c%80%ea%b5%ac-%ec%82%bc%ec%84%b1-%eb%9d%bc%ec%9d%b4%ec%98%a8%ec%a6%88%ed%8c%8c%ed%81%ac/'},
  {id:'daejeon',name:'대전 한화생명 볼파크',city:'대전',lat:36.3170,lng:127.4291,seatViewUrl:'https://myseatcheck.com/%eb%8c%80%ec%a0%84-%ed%95%9c%ed%99%94%ec%83%9d%eb%aa%85-%eb%b3%bc%ed%8c%8c%ed%81%ac/'},
  {id:'gocheok',name:'고척 스카이돔',city:'서울',lat:37.4982,lng:126.8671,seatViewUrl:'https://myseatcheck.com/%ea%b3%a0%ec%b2%99-%ec%8a%a4%ec%b9%b4%ec%9d%b4%eb%8f%94-2/'}
];
