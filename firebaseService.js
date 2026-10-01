/* Firebase 연결 서비스. 이메일/비밀번호 로그인(Authentication)과 내 예매 내역(Firestore tickets)만 다룹니다.
   Firebase JS SDK(모듈러)를 CDN에서 import()로 불러오고, 화면 코드는 window.TicketCloud만 씁니다.
   설정값은 firebase-config.js에 있습니다. */
(function(){
  const VERSION='10.14.1',base=`https://www.gstatic.com/firebasejs/${VERSION}/`;
  const config=window.FirebaseConfig||{};
  const configured=['apiKey','authDomain','projectId','appId'].every(key=>typeof config[key]==='string'&&config[key].trim());
  const fail=code=>Object.assign(new Error(code),{code});
  const toUser=user=>user?{uid:user.uid,email:user.email,emailPrefix:String(user.email||'').split('@')[0]}:null;

  // 로그인 상태가 바뀔 때마다 등록된 함수에 알려 줍니다. 새로고침 뒤에도 SDK가 이전 로그인을 복원해 알려 줍니다.
  const listeners=[];
  let user=null,authKnown=false;
  const notify=()=>listeners.forEach(listener=>listener(user));

  // 설정이 비어 있으면 SDK를 불러오지 않고, 모든 요청을 app/not-configured로 거절합니다.
  const sdk=configured
    ?Promise.all([import(base+'firebase-app.js'),import(base+'firebase-auth.js'),import(base+'firebase-firestore.js')]).then(([app,auth,store])=>{
      const instance=app.initializeApp(config),context={auth,store,authInstance:auth.getAuth(instance),db:store.getFirestore(instance)};
      auth.onAuthStateChanged(context.authInstance,current=>{user=toUser(current);authKnown=true;notify();});
      return context;
    })
    :Promise.reject(fail('app/not-configured'));
  sdk.catch(()=>{authKnown=true;notify();});
  const withSdk=run=>sdk.then(run,error=>{throw error&&error.code?error:fail('app/sdk-load-failed');});

  window.TicketCloud={
    configured,
    onAuth(listener){listeners.push(listener);if(authKnown)listener(user);},
    signUp:(email,password)=>withSdk(c=>c.auth.createUserWithEmailAndPassword(c.authInstance,email,password)).then(()=>{}),
    signIn:(email,password)=>withSdk(c=>c.auth.signInWithEmailAndPassword(c.authInstance,email,password)).then(()=>{}),
    signOut:()=>withSdk(c=>c.auth.signOut(c.authInstance)),
    // tickets/{autoId} 문서를 만들고 문서 id를 돌려줍니다. createdAt은 서버 시각으로 기록합니다.
    saveTicket:data=>withSdk(c=>c.store.addDoc(c.store.collection(c.db,'tickets'),{...data,createdAt:c.store.serverTimestamp()})).then(ref=>ref.id),
    // 보안 규칙이 본인 티켓만 읽게 하므로, 반드시 uid 조건을 붙여 조회합니다.
    loadMyTickets:uid=>withSdk(c=>c.store.getDocs(c.store.query(c.store.collection(c.db,'tickets'),c.store.where('uid','==',uid)))).then(snapshot=>snapshot.docs.map(item=>{
      const data=item.data();
      return {...data,id:item.id,createdAt:data.createdAt&&data.createdAt.toDate?data.createdAt.toDate():null};
    })),
    deleteTicket:id=>withSdk(c=>c.store.deleteDoc(c.store.doc(c.db,'tickets',id))),

    // ----- 응원 한마디(cheers) -----
    addCheer:data=>withSdk(c=>c.store.addDoc(c.store.collection(c.db,'cheers'),{...data,createdAt:c.store.serverTimestamp()})).then(ref=>ref.id),
    // 한 경기의 응원을 최신순으로 실시간 구독합니다. 돌려주는 함수를 부르면 구독을 해제합니다.
    // (gameId 조건 + createdAt 정렬이라 firestore.indexes.json의 복합 색인이 필요합니다.)
    watchCheers(gameId,onData,onError){
      let stop=null,cancelled=false;
      withSdk(c=>{
        if(cancelled)return;
        const cheers=c.store.query(c.store.collection(c.db,'cheers'),c.store.where('gameId','==',gameId),c.store.orderBy('createdAt','desc'),c.store.limit(50));
        stop=c.store.onSnapshot(cheers,snapshot=>onData(snapshot.docs.map(item=>{
          // 방금 쓴 글은 서버 시각이 아직 없으므로 추정 시각을 씁니다.
          const data=item.data({serverTimestamps:'estimate'});
          return {id:item.id,gameId:data.gameId,team:data.team,text:data.text,authorName:data.authorName,createdAt:data.createdAt&&data.createdAt.toDate?data.createdAt.toDate():null};
        })),onError);
      }).catch(onError);
      return ()=>{cancelled=true;if(stop)stop();};
    },
    // cheers가 완전히 비어 있을 때만 샘플을 한 번 넣습니다(넣었으면 true).
    // 샘플은 문서 id를 고정해 두어, 여러 번 실행되거나 동시에 실행돼도 중복으로 쌓이지 않습니다.
    seedCheers:samples=>withSdk(c=>c.store.getDocs(c.store.query(c.store.collection(c.db,'cheers'),c.store.limit(1))).then(snapshot=>{
      if(!snapshot.empty||!samples.length)return false;
      const batch=c.store.writeBatch(c.db);
      samples.forEach(({id,minutesAgo,...data})=>batch.set(c.store.doc(c.db,'cheers',id),{...data,createdAt:c.store.Timestamp.fromMillis(Date.now()-minutesAgo*60000)}));
      return batch.commit().then(()=>true);
    }))
  };
})();
