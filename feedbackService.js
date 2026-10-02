/* 피드백 전송 서비스(mock). 실제 전송 API 연동 시 이 파일만 교체하면 됩니다.
   지금은 서버로 보내지 않고, 검사만 한 뒤 이 탭의 메모리에 보관합니다(새로고침하면 사라짐).
   스크린샷은 파일 이름·크기·형식만 기록하고 내용은 어디에도 올리지 않습니다. */
(function(){
  const categories=[{id:'bug',name:'버그 신고'},{id:'idea',name:'기능 제안'},{id:'etc',name:'기타'}];
  const limits={minLength:10,maxLength:1000,maxImageBytes:5*1024*1024};
  const config={sendDelay:600};
  const sent=[];
  const fail=code=>Object.assign(new Error(code),{code});
  window.FeedbackService={
    categories,limits,config,
    // 보내기 전 검사. 문제가 없으면 빈 문자열, 있으면 오류 코드를 돌려줍니다.
    validate({category,message,email,screenshot}){
      const text=String(message||'').trim();
      if(!categories.some(c=>c.id===category))return 'feedback/category';
      if(text.length<limits.minLength)return 'feedback/too-short';
      if(text.length>limits.maxLength)return 'feedback/too-long';
      if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return 'feedback/email';
      if(screenshot&&!String(screenshot.type||'').startsWith('image/'))return 'feedback/not-image';
      if(screenshot&&screenshot.size>limits.maxImageBytes)return 'feedback/image-too-large';
      return '';
    },
    // 전송(mock). 실제 연동 시 여기서 서버로 내용과 첨부 파일을 보냅니다.
    sendFeedback(data){
      const problem=this.validate(data);
      if(problem)return Promise.reject(fail(problem));
      return new Promise(resolve=>setTimeout(()=>{
        const record={id:'fb-'+Date.now(),category:data.category,message:String(data.message).trim(),email:data.email||'',screenshot:data.screenshot?{name:data.screenshot.name,size:data.screenshot.size,type:data.screenshot.type}:null,sentAt:new Date().toISOString()};
        sent.push(record);
        resolve({...record});
      },config.sendDelay));
    },
    listSent:()=>sent.map(record=>({...record}))
  };
})();
