export function findOneLevelNodes(nodeId, ary) {
  const idx = ary.indexOf(nodeId);
  return idx > -1;
}
export function initNodeX(nodesData, centerX) {
  nodesData.forEach(nodeItem => {
    nodeItem.fx = centerX + nodeItem.layer * 150;
  });
  return nodesData;
}
// export function deletNodesAndLinks(node, nodesData, edgesData) {
//   nodesData.forEach()
// }

export function getPointAXY(xS, yS, xT, yT, r) {
  // 直线斜率lineK,常数lineB
  const lineK = (xT - xS) / (yT - yS);
  const lineB = yS - lineK * xS;
  // 圆的圆心
  const x0 = xT;
  const yO = yT;
  // 求A点，先求直线和圆的交点，在选择S和T点之间的交点作为A点
  // 联合　(x-x0)^2+(y-yO)^2=r^2和y=kx+c，最终消y，化成一个只x含的一元二次方程
  // 化成的一元二次方程为：（k^2 + 1）x^2+[2k(c-yO)-2xO]x+(c-b)^2+a^2-r^2
  // constantA constantB constantC分别对应一元二次方程的系数a b c
  const constantA = lineK*lineK + 1;
  const constantB = 2*lineK*(lineB-yO)-2*x0;
  const constantC = (lineB - yO) * (lineB - yO)+ x0 - r*r
  // 再根据一元二次方程求解公式求解x:
  let xA = (-constantB + Math.sqrt(constantB * constantB - 4 * constantA * constantC))/(2*constantA);
　const maxX = Math.max(xS, yS);
  const minX = Math.min(xS, yS);
  if (xA < minX || xA > maxX) {
    xA = (-constantB - Math.sqrt(constantB * constantB - 4 * constantA * constantC))/(2*constantA);
  }
  // 最后根据xA求出yA
  const yA = lineK * xA + lineB;
  return { xA, yA} 
}
export function getPointXYonLine(lineK, lineB, pointX, pointY, len, type) {
  // 求直线上的一点
  // 根据直角三角形的边长定理　(x-x1)^2+(y-y1)^2 = len^2　以及　直线的函数 y = kx+b
  // 联合两个方程消除y,最终得到一个一元二次方程
  // constantA，constantB，constantC代表了一元二次方程化为形如ax^2+bx+c=0的常数a、b、c;
  const constantA = lineK*lineK + 1;
  const constantB = 2*lineK*(lineB - pointY)-2 * pointX;
  const constantC = (lineB - pointY) * (lineB - pointY)+ pointX - len*len
  // 再根据一元二次方程求解公式求解resultX:
  const resX1 = (-constantB + Math.sqrt(constantB * constantB - 4 * constantA * constantC))/(2*constantA);
  const resX2 = (-constantB - Math.sqrt(constantB * constantB - 4 * constantA * constantC))/(2*constantA);
  // 最后根据resX求出resY
  const resY1 = lineK * resX1 + lineB;
  const resY2 = lineK * resX2 + lineB;
  console.log('===', type, lineK,  constantB, constantA, constantC)
  return { resX1, resY1, resX2, resY2};
}
// 多个结果去点S和点之间的点
export function getLineInnerPoint(lineK, lineB, pointX, pointY, len , maxX, minX, type) {
  const point = getPointXYonLine(lineK, lineB, pointX, pointY, len, type);
  if (point.resX1 < maxX && point.resX1 > minX) {
    return {resX: point.resX1, resY: point.resY1};
  }
  return {resX: point.resX2, resY: point.resY2};

}
export function getArrowPoint(xS, yS, xT, yT, r) {
   // 直线(连线)斜率lineK,常数lineB
  const lineK = (xT - xS) / (yT - yS);
  const lineB = yS - lineK * xS;
  // 箭头角度的一半
  const angle = Math.PI / 3;
  // 箭头的腰长
  const len = 15;
  // 箭头的高
  const lenH = Math.abs(Math.cos(angle) * len);

  const maxX = Math.max(xS, xT);
  const minX = Math.min(xS, xT);
  const pointA = getLineInnerPoint(lineK, lineB, xT, yT, r, maxX, minX, 'A');
  const pointC = getLineInnerPoint(lineK, lineB, xT, yT, lenH, maxX, minX, 'C');

  // 垂直直线(箭头的底边所在的直线)斜率lineK,常数lineB
  const lineVK = -1/lineK;
  const lineVB = pointC.resY - lineVK * pointC.resX;
  console.log(lineVK,lineK, '===???');
  const pointBandD = getPointXYonLine(lineVK, lineVB, pointC.resX, pointC.resY, len/2, true);
  const pointB = {resX: pointBandD.resX1, resY:  pointBandD.resY1};
  const pointD = {resX: pointBandD.resX2, resY:  pointBandD.resY2};
  
  return {pointA, pointB, pointC, pointD};
}