import React, { Component } from 'react';
import * as d3 from 'd3';
import './network.css';
import * as svgTools from '../helper';
import axios from 'axios';
import currencyFormat from 'lch-currency-format';
import { style } from 'd3-selection';
import DATA from '../data/linkData';
class LinkNetwork extends Component {
    constructor(props) {
        super(props);
        this.svg = null;
        this.zoom = null;
        this.simulation = null; //力学模型

        this.nodesData = null; //节点数据
        this.edgesData = null; //线

        //分组
        this.group = null; //分组
        this.linkG = null;
        this.nodeG = null;
        this.textsG = null;
        this.edgepathsG = null;
        this.edgelabelsG = null;

        this.isDragging = false;
        this.clickTime = '';//第一次点击时间，用于模拟双击
        this.timer = null;// 模拟双击的时间期
        this.addFlag = false;
        this.clickNode = null;
        this.network = null;
    }
    componentDidMount() {
      this.network = DATA;
      console.log('-----', DATA);
      this.nodesData = DATA.currentNetwork.nodes;
      this.edgesData = DATA.currentNetwork.links;
      this.addZoom();
      this.createGroups();
      this.createSimulation();
      this.initData();
      this.reDraw();
    }
    componentWillUnmount() {
        if (this.simulation) {
          this.simulation.stop(); // 停止网络图计算
        }
    }
    // 创建分组
    createGroups() {
        this.group = this.svg.append('g').attr('id', 'whole');
        this.linkG = this.group.append('g').attr('id', 'lines');
        this.nodeG = this.group.append('g').attr('id', 'nodes');
        this.textsG = this.group.append('g').attr('id', 'texts');
        this.edgepathsG = this.group.append('g').attr('id', 'linePaths');
        this.edgelabelsG = this.group.append('g').attr('id', 'lineLabels');
    }
    // 添加平移、缩放
    addZoom() {
        this.zoom = d3.zoom();
        this.svg = d3.select('svg')
                    .call(this.zoom.on('zoom', ()=> {
                        this.group.attr('transform', `translate(${d3.event.transform.x}, ${d3.event.transform.y}) scale(${d3.event.transform.k})`);
                    }))
                    /**
                     * 取消zoom双击节点放大的效果
                     */
                    .on('dblclick.zoom', () => { });
    }
    initData = () => {
      const nodesNum = this.countLinkNodes();
      const { source, target } = this.network;
      const sourceX = 100;
      const targetX = 815;
      const distance = (targetX - sourceX - 24) / (nodesNum - 1);
      this.nodesData.forEach((dataItem) => {
        if (dataItem.id === source) {
          dataItem.fx = sourceX;
        } else if (dataItem.id === target) {
          dataItem.fx = targetX;
        } else {
          dataItem.fx = sourceX + distance * (dataItem.layer - 1);
        }
      });
    }
      // 统计出图中链条数，注意不能直接去path长度
  countPathCount = () => {
    const result = [];
    this.nodesData.forEach((node)=>{
      result.push(node.pathNum[0]);
    });
    return Math.max.apply(null, result);
  }
  // 统计出每条链路节点的个数，并返回最大值
  countLinkNodes = () => {
    const path = {};
    this.nodesData.forEach((node)=>{
      if (path[node.pathNum[0]]) {
        path[node.pathNum[0]]++;
      } else {
        path[node.pathNum[0]] = 1;
      }
    });
    return Math.max.apply(null, Object.values(path));
  }
    // 创建力学模型
    createSimulation = () => {
      const width = d3.select('svg').attr('width');
      const height = d3.select('svg').attr('height');
      const { source, target } = this.network;
      this.simulation = d3.forceSimulation(this.nodesData)
      .force('center', d3.forceCenter(width / 2, 300))
      .force('link', d3.forceLink(this.edgesData).distance(100).strength(0).id((data)=> {return data.id;}))
      .force('y', d3.forceY((data)=>{
        if (data.id === source || data.id === target) {
          const pathCount = this.countPathCount();
          const base = (pathCount + 1) / 2.0;
          return Math.min(base, 5) * 100;
        }
        return data.pathNum[0] * 100;
      }))
      .on('tick', this.ticked);
    }
    // 节点处理模板，添加、删除、更新
    nodeTempHandle() {
        var nodeUpdate = this.nodeG
                        .selectAll('circle')
                        .data(this.nodesData, (data) => data.id);
        var nodeEnter = nodeUpdate.enter();
        var nodeExit = nodeUpdate.exit();
        // 更新
        nodeUpdate
        .transition()
        .attr('class', (data) => {
            const nodeCss = (data.nodeStatus < 0 && 'noActive') || (data.cateType === 0 && 'mainCompany') || (data.cateType === 1 && 'relativeCompany') || (data.cateType === 2 && 'relativePerson');
            return data.deleteFlag ? `${nodeCss} hide` : nodeCss;
        })
        .attr('r', (data) => {
            if (data.nodeStatus === -2) {
                return 8;
            }
            return 15;
        });
        // 添加
        nodeEnter = nodeEnter
            .append('circle')
            .attr('class', (data) => {
                return (data.cateType === 0 && 'mainCompany') || (data.cateType === 1 && 'relativeCompany') || (data.cateType === 2 && 'relativePerson');
            })
            .attr('r', 15)
            .call(d3.drag()
            .on('start', this.dragstarted)
            .on('drag', this.dragged)
            .on('end', this.dragended));
        // 删除
        nodeExit.remove();
    }
    // 节点上的字
   
    textTempHandle() {
        var textUpdate = this.textsG
                        .selectAll('text')
                        .data(this.nodesData, (data) => data.id);
        var textEnter = textUpdate.enter();
        var textExit = textUpdate.exit();
        // 更新
        textUpdate
        .transition()
        .attr('class', (data) => {
            return data.deleteFlag || data.nodeStatus === -2  ? 'hideText' : 'nodeText';
        })
        // 添加
        textEnter.append('text')
        .attr('class', (data) => {
            return 'nodeText';
        })
        .attr('text-anchor', 'middle')
        .attr('dy', (data) => {
            return '3em';
        })
        .text((data) => {
            return data.name;
        })
        // 删除
        textExit.remove();
    };
        
    // 线条模板
    lineTempHandle() {
        var lineUpdate = this.linkG
                        .selectAll('line')
                        .data(this.edgesData, (data) => data.id);
        var lineEnter = lineUpdate.enter();
        var lineExit = lineUpdate.exit();
        // 更新
        lineUpdate
        .transition()
        .attr('class', (data) => {
            return  (data.deleteFlag &&  `links hide`) ||  ((data.source.nodeStatus === -2 || data.target.nodeStatus === -2) &&  `links lineNoActive`) || 'links';
        });
        // 添加
        lineEnter.append('line')
        .attr('class', (data) => (data.hide && 'hide') || (data.lineType === 1 && 'links') || 'dashLinks')
        .attr('marker-end', () => 'url(#cArrow)');
        // 删除
        lineExit.remove();
    }
    // path
    pathTempHandle() {
        var pathUpdate = this.lineG
                        .selectAll('.edgepath')
                        .data(this.edgesData, (data) => data.id);
        var pathEnter = pathUpdate.enter();
        var pathExit = pathUpdate.exit();
        // 添加
        pathEnter
        .enter()
        .append('path')
        .attr('class', 'edgepath')
        .attr('id', (data, idx) => { return 'edgepath' + idx; })
        .style('pointer-events', 'none');
        // 删除
        pathExit.remove();
        
    }
    // pathLabel
    pathLabelTempHandle() {
        var labelsUpdate = this.edgelabelsG
        .selectAll('edgelabel')
        .data(this.edgesData, (data) => data.id);
        var labelsEnter = labelsUpdate.enter();
        var labelsExit = labelsUpdate.exit();
        // 更新
        labelsUpdate
        .attr('class', (data) => {return data.hide ? '.hide' : '.linkLabel';})
        // 添加
        labelsEnter
        .enter()
        .append('text')
        .style('pointer-events', 'none')
        .attr('class', (data) => {
          return data.hide ? '.hide' : '.linkLabel';
        })
        .attr('dx', 60)
        .attr('dy', -2)
        .attr('id', (data, idx) => { return 'edgelabel' + idx; })
        .append('textPath')
        .attr('xlink:href', (data, idx) => { return '#edgepath' + idx; })
        .style('pointer-events', 'none')
        .text((data) => data.lineName);
        // 删除
        labelsExit.remove();
    }
    reDraw() {
        this.simulation.nodes(this.nodesData);
        this.simulation.force('link').links(this.edgesData).id((data)=> data.id);
        this.nodeTempHandle();
        this.textTempHandle();
        this.lineTempHandle();
    }
    updateNetwork() {
        this.nodeTempHandle();
        this.textTempHandle();
        this.lineTempHandle(); 
    }
    ticked = ()=>{
        d3.selectAll('circle')
        .attr('cx', (data)=>{return data.x})
        .attr('cy', (data)=>{return data.y});
        
        d3.selectAll('line')
        .attr('x1', (data) => { return data.source.x; })
        .attr('y1', (data) => { return data.source.y; })
        .attr('x2', (data) => { return data.target.x; })
        .attr('y2', (data) => { return data.target.y; });
        
        d3.selectAll('#texts text')
        .attr('x', (data) => { return data.x; })
        .attr('y', (data) => { return data.y; });

    }
    dragstarted = (data) => {
        if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
        // console.log(data, '开始拖拽');
        data.fx = data.x;
        data.fy = data.y;
    }
    dragged = (data) => {
        this.isDragging = true;
        // console.log(data, '拖拽。。。');
        data.fx = d3.event.x;
        data.fy = d3.event.y;
    }
    dragended = (data) => {
        if (!d3.event.active) this.simulation.alphaTarget(0);
        if (!this.isDragging) {
          data.fx = null;
          data.fx = null;
        }
        this.isDragging = false;
    }
    render() {
        return (
            <div className="network">
                <div>
                    <svg width="1000" height="1000"></svg>  
                </div>
            </div>
        )
    }
}
export default LinkNetwork;
