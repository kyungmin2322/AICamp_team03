/* 날씨 프록시(서버리스 함수) 예시. 아직 배포·연동하지 않았습니다.
   브라우저 대신 기상청 단기예보를 호출해 API 키가 노출되지 않게 합니다.
   키는 코드에 적지 않고 환경변수 WEATHER_API_KEY로 읽습니다.
   (Firebase: firebase functions:secrets:set WEATHER_API_KEY) */
const {onRequest}=require('firebase-functions/v2/https');
const {defineSecret}=require('firebase-functions/params');

const WEATHER_API_KEY=defineSecret('WEATHER_API_KEY');
const KMA_URL='https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst';

exports.weather=onRequest({region:'asia-northeast3',secrets:[WEATHER_API_KEY]},async(req,res)=>{
  const {base_date,base_time,nx,ny}=req.query;
  // 정해진 형식의 값만 기상청으로 넘깁니다.
  if(!/^\d{8}$/.test(base_date)||!/^\d{4}$/.test(base_time)||!/^\d{1,3}$/.test(nx)||!/^\d{1,3}$/.test(ny)){
    res.status(400).json({error:'잘못된 요청입니다'});return;
  }
  // serviceKey에는 공공데이터포털의 "일반 인증키(Decoding)" 값을 넣습니다.
  const query=new URLSearchParams({serviceKey:process.env.WEATHER_API_KEY,pageNo:'1',numOfRows:'1000',dataType:'JSON',base_date,base_time,nx,ny});
  try{
    const response=await fetch(`${KMA_URL}?${query}`);
    if(!response.ok)throw new Error('기상청 응답 '+response.status);
    // 발표 시각 사이(최대 3시간)에는 같은 응답이므로 잠시 캐시합니다.
    res.set('Cache-Control','public, max-age=600');
    res.json(await response.json());
  }catch(error){
    console.error(error);
    res.status(502).json({error:'날씨 정보를 불러올 수 없습니다'});
  }
});
