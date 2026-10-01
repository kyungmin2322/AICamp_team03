/* 구역 SVG와 라벨 좌표. 실제 구장 좌표가 아닌 공통 연습용 배치입니다. */
(function(){
  const cx=450,cy=440;
  const point=(radius,angle)=>{const a=angle*Math.PI/180;return {x:cx+radius*Math.cos(a),y:cy+radius*Math.sin(a)};};
  function ringPath(inner,outer,start,end){
    const a=point(outer,start),b=point(outer,end),c=point(inner,end),d=point(inner,start);
    const sweep=end>start?1:0;
    return `M${a.x},${a.y} A${outer},${outer} 0 0 ${sweep} ${b.x},${b.y} L${c.x},${c.y} A${inner},${inner} 0 0 ${1-sweep} ${d.x},${d.y} Z`;
  }
  const sections=[];
  function ring(base,count,inner,outer,start,sweep,gradeId){
    for(let i=0;i<count;i++){
      const a=start+sweep*i/count,b=start+sweep*(i+1)/count;
      let grade=gradeId;
      if(base===101){
        if(i>=11&&i<=14)grade='premium';
        else if((i>=1&&i<=3)||(i>=22&&i<=24))grade='exciting';
      }
      const direction=Math.sign(sweep);
      sections.push({id:String(base+i),gradeId:grade,svgPath:ringPath(inner,outer,a+.26*direction,b-.26*direction),labelPosition:point((inner+outer)/2,(a+b)/2),totalSeats:0,remainingSeats:0,angle:(a+b)/2,ring:Math.floor(base/100)});
    }
  }
  // 1루 끝(-35°)부터 시계 방향: 홈 뒤(90°)를 지나 3루 끝(215°).
  ring(101,26,198,235,-35,250,'lower');
  ring(201,26,243,290,-35,250,'middle');
  ring(301,34,298,366,-35,250,'upper');
  // 외야는 우측(325°)에서 상단을 지나 좌측(215°)으로 번호가 증가합니다.
  // 411·412 사이에는 전광판을 위한 간격을 둡니다.
  ring(401,11,255,327,325,-49,'outfield');
  ring(412,11,255,327,264,-49,'outfield');
  window.TicketSections=sections;
  window.TicketMapGeometry={cx,cy,point};
})();
