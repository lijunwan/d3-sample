import React, { Component } from 'react';
import * as d3 from 'd3';
import DATA from '../data/cluster';
import './cluster.css';
class Cluster extends Component {
  constructor(props) {
    super(props);
    this.root = null;
    this.nodeCount = 38;
    this.g = null;
    this.svg = null;
    this.tree = null;
  }
  componentDidMount() {
    const width = 960;
    const height = 1060;
    this.svg = d3.select('svg')
    this.g = this.svg.append('g')
            .attr('transform', `translate(${width / 2}, ${300})`);
    this.tree = d3.tree()
    // 设置或获取布局的尺寸。节点的x属性是弧度，y是半径。
    // 此处将以400为半径的一个圆里画出一颗树。需要注意的是画布的高度宽度的设置要大于这个园的直径。
    .size([2 * Math.PI, 400])
    // 设置同一个值除了设置０其他值都不会影响布局
    // 布局只和两个值的比例有关；
    // 这个函数只用于同一层级,相邻叶子节点
    // 设第一层同父相邻的节点距离为ds,不同父相邻的距离为dd
    // 第二层的d2s = 2ds　d2d = 2dd 第三层　d３s = ３ds　d3d = 3dd
    // 所以除以a.depth可以修正间距，让每一层的间距都相等。
    .separation(function(a, b){
      return  (a.parent === b.parent ? 1 : 2) / a.depth;
    });
    this.draw();
  }
  getPath = (node) =>{
    const path = [];
    (function getPath(node) {
      if(node.parent) {
        const idx = node.parent.children.findIndex((nodeInfo)=>{
          return node.data.name === nodeInfo.data.name;
        })
        path.push(idx);
        getPath(node.parent);
      }
      return path;
    })(node)
    return path;
  }
  setData = (path)=>{
    const firPaht = path.pop();
    const newPath = path.reverse();
    const sum = this.nodeCount;
    let node = DATA.children[firPaht];
    newPath.forEach((idx)=>{
      node = node.children[idx];
    });
    node.children = [{name: `${node.name}_1`, id: sum + 1}, {name: `${node.name}_2`, id: sum + 2}];
    this.nodeCount += node.children.length;
    return node;
  }
  removeData = (path)=>{
    const firPaht = path.pop();
    const newPath = path.reverse();
    let node = DATA.children[firPaht];
    newPath.forEach((idx)=>{
      node = node.children[idx];
    });
    node.children = null;
  }
  drawLink = ()=>{
    var link = this.g.selectAll('.link');
    //root.links() 返回以当前节点为根节点的子树中所有的连接的边,每个连接都由source和target属性组成
    // 每个节点都由x, y属性，在此用的是极坐标，代表的是角度和半径。
    var linkUpdate = link.data(this.root.links(), function(d){
      return d.target.data.id;
    });
    var linkEnter = linkUpdate.enter();
    var linkExit = linkUpdate.exit();
    linkUpdate
      .transition()
      .duration(350)
      .delay(100)
      .attr('d', // link形状生产器，可以生成平滑的连接两点的曲线，切线可以是水平、垂直或者径向的（我猜是切线是圆的半径）
                d3.linkRadial()
                .angle(function(d){return d.x;})// 设置访问器
                .radius(function(d){return d.y;}));
    linkEnter
      .append('path')
      .attr('class', 'link link-hide')
      .attr('d', (d)=>{ // 初始化d路径，让连线看起来是从父节点延展而来
        if (d.source) {
          const xy = this.radialPoint(d.source.x, d.source.y);
          return `M${xy[0]} ${xy[1]} C${xy[0] + 1} ${xy[1] + 1}, ${xy[0] + 2} ${xy[1]}, ${xy[0]} ${xy[1]}`
        }
      })
      .transition()
      .duration(300)
      .delay(450)
      .attr("class", "link link-show")
      .attr('d', // link形状生产器，可以生成平滑的连接两点的曲线，切线可以是水平、垂直或者径向的（我猜是切线是圆的半径）
                d3.linkRadial()
                .angle(function(d){return d.x;})// 设置访问器
                .radius(function(d){return d.y;}));
    linkExit
      .transition()
      .duration(300)
      .attr('d', (d)=>{ // 初始化d路径，让连线看起来是从父节点延展而来
        if (d.source) {
          const xy = this.radialPoint(d.source.x, d.source.y);
          const xy1 = this.radialPoint(d.target.x, d.target.y);
          return `M${xy[0]} ${xy[1]} C${xy[0] + 1} ${xy[1] + 1}, ${xy[0] + 2} ${xy[1]}, ${xy[0]} ${xy[1]}`
        }
      })
      .attr('class', 'link link-hide')
      .remove();
  }
  clickNode = (d)=>{
    if (d.height < 1) {
        const path = this.getPath(d);
        this.setData(path, root);
        this.draw();
    } else {
      const path = this.getPath(d);
      this.removeData(path);
      this.draw();
    }
  }
  drawNode = ()=>{
    var node = this.g.selectAll('.node');
    // root.descendants() 返回当前节点所有的后代节点，包含根节点
    var nodeUpdate = node.data(this.root.descendants(), function(d){
      return d.data.id
    });
    var nodeEnter = nodeUpdate.enter();
    var nodeExit = nodeUpdate.exit();
    nodeUpdate
      .transition()
      .duration(350)
      .delay(100)
      .attr('class', (d) => {return `node ${d.children ? 'node-internal' : 'node-leaf'}`})
      .attr('transform', (d)=>{
        return `translate(${this.radialPoint(d.x, d.y)})`}// 将极坐标转为直角坐标
      )
    nodeUpdate.select('text') // nodeUpdate.select('text'),每一项是text节点, nodeUpdate.selectAll('text')每一项是一组nodeList;
      .transition()
      .duration(350)
      .attr('x', function(d){return  d.x < Math.PI === !d.children ? 6 : -6})
      //start 文字的第一个字符位于起始位置的右方，end　文字的最后一个字符靠近起始位置
      .attr('text-anchor', function(d) {return d.x < Math.PI === !d.children ? 'start' : 'end';})
      .attr('transform', function(d){
        const radian = +(d.x < Math.PI ? d.x - Math.PI / 2 : d.x + Math.PI / 2);
        const angle = radian * 180 / Math.PI;
        return `rotate(${angle})`
        }
      )
      .text(function(d) {
        return d.data.name;
      })
    nodeUpdate.select('circle')
    .on('click', this.clickNode);
    const nodeEn = nodeEnter.append('g');
    nodeEn
      .attr('transform', (d)=>{ // 节点从父节点开始滑出
        if (d.parent) {
          return `translate(${this.radialPoint(d.parent.x, d.parent.y)})`
        }
        return `translate(${this.radialPoint(d.x, d.y)})`
      })
      .attr('class', 'node node-hide')
      .transition()
      .delay(450)
      .duration(300)
      .attr('class', function(d){return `node node-show ${d.children ? 'node-internal' : 'node-leaf'}`})
      .attr('transform', (d)=>{
        return `translate(${this.radialPoint(d.x, d.y)})`}
      )
    nodeEn.append('circle')
    .attr('r', 5)
    .on('click', this.clickNode);
    nodeEn.append('text')
    .attr('dy', '0.31em')
    //小于180度且是叶子节点值为６,小于180度且不是叶子节点的为-6;大于180度且是叶子节点的值为-６;大于180度且不是叶子节点的值为6;
    .attr('x', function(d){return  d.x < Math.PI === !d.children ? 6 : -6})
    //start 文字的第一个字符位于起始位置的右方，end　文字的最后一个字符靠近起始位置
    .attr('text-anchor', function(d) {return d.x < Math.PI === !d.children ? 'start' : 'end';})
    .attr('transform', function(d){
      const radian = +(d.x < Math.PI ? d.x - Math.PI / 2 : d.x + Math.PI / 2);
      // const radian = d.x;
      const angle = radian * 180 / Math.PI;
      return `rotate(${angle})`
      }
    )
    .text(function(d) {
      return d.data.name;
    });
    nodeExit
      .transition()
      .duration(400)
      .attr('transform', (d)=>{ // 滑入父节点
        if (d.parent) {
          return `translate(${this.radialPoint(d.parent.x, d.parent.y)})`
        }
        return `translate(${this.radialPoint(d.x, d.y)})`
      })
      .attr('class', 'node node-hide')
      .remove();
  }
  draw = ()=>{
    // 在计算层级结构布局之前，需要一个根节点
    // 你可以将已格式化为层级结构的数据直径传递给d3.hierarchy创建一个根节点
    this.root = this.tree(d3.hierarchy(DATA));
    this.drawLink();
    this.drawNode();
  }
  // 是d3的源码。。。
  // d3源码在将极坐标系转为直角坐标系，每一个角度都减去了90度，不知道为什么。
  // 可能是因为tree布局的极坐标系是以y轴开始顺时针排布的
  radialPoint = (x, y)=>{
    const x1 = y * Math.cos(x -= Math.PI / 2);
    const y1 = y * Math.sin(x);
    return [x1, y1];
  }
  render() {
    return (
      <div>
        <svg width="960" height="1060"></svg>
      </div>
    )
  }
}
export default Cluster;