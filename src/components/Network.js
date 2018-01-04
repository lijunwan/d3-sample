import React, { Component } from 'react';
import * as d3 from 'd3';
import DATA from '../data/network';
import './network.css';
import * as svgTools from '../helper';
import axios from 'axios';
import currencyFormat from 'lch-currency-format';
import { style } from 'd3-selection';
class Network extends Component {
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
        this.state = {
            layout: 'arc', // arc point none
        }

    }
    componentDidMount() {
        axios.get('/network/expand/init?companyName=深创新投资管理顾问（北京）有限公司')
        .then((resp)=>{
            this.network = resp.data;
            if (resp.data.currentNetwork) {
                this.nodesData = resp.data.currentNetwork.nodes;
                this.edgesData = resp.data.currentNetwork.links;
                this.addZoom();
                this.createGroups();
                this.createSimulation();
                this.reDraw();
            }
        })
        .catch((error)=>{
            console.log('---', error);
        })
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
    // 创建力学模型
    createSimulation() {
        const width = d3.select('svg').attr('width');
        const height = d3.select('svg').attr('height');
        this.simulation = d3.forceSimulation(this.nodesData, (data)=> {data.id})
        /*排斥力，strength大小和节点的半径成正比，节点半径越大，设置的力就要越大，这样才能保证节点不会重合*/
        .force('charge', d3.forceManyBody().strength((data)=>{
            return data.deleteFlag ? 0 : -300;
        }))
        .force('link', d3.forceLink(this.edgesData).id((data) => { return data.id; }).distance((data)=>{
            return data.deleteFlag ? 0 : 150;
        }))
        /*中心吸引力，值设置为width / 2和height / 2，才能保证整个布局位于正中*/
        .force('center', d3.forceCenter(width / 2, 300))
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
    deleteNode(type) {
        const newData = this[type].filter((item)=>{
            return !item.deleteFlag;
        });
        return newData;
    }
    addDeleFlag(data, type) {
        if (data) {
            this[type].forEach((item)=>{
                if(data.indexOf(item.id) >= 0) {
                    item.deleteFlag = true;
                }
            })
        }
    }
    collapseNode(node) {
        axios.get(`/network/expand/delete`, { params: {
            nodeId: node.id,
            uuid:this.network.uuid
        }})
        .then((resp)=>{
            const updateNetwork = resp.data.updateNetwork;
            const deleteNetwork = resp.data.deleteNetwork;
            node.fx = node.x;
            node.fy = node.y;
            node.expend = false;
            if (updateNetwork.nodes) {
                this.mergeData(resp.data.updateNetwork.nodes, 'nodesData');
            }
            if (updateNetwork.links) {
               this.mergeData(resp.data.updateNetwork.nodes, 'edgesData');
            }
            this.addDeleFlag(deleteNetwork.nodes, 'nodesData');
            this.addDeleFlag(deleteNetwork.links, 'edgesData');
            this.simulation.alpha(0.6)
            .force('charge', d3.forceManyBody().strength((data)=>{
                return data.deleteFlag ? 0 : -300;
            }))
            .force('link', d3.forceLink(this.edgesData).id((data) => { return data.id; }).distance((data)=>{
                return data.deleteFlag ? 0 : 150;
            })).restart();
            this.updateNetwork();
            setTimeout(()=>{
                this.nodesData = this.deleteNode('nodesData');
                this.edgesData = this.deleteNode('edgesData');
                this.reDraw();
                node.fx = null;
                node.fy = null;
            }, 250);
            
        })
    }
    addNodes(node) {
        axios.get(`/network/expand/add`, { params: {
                nodeId: node.id,
                uuid:this.network.uuid
            }  
        })
        .then((resp)=>{
            if (resp.data.updateNetwork) {
                node.expend = true;
                const network = resp.data.updateNetwork;
                const exetenNodes = this.mergeData(network.nodes, 'nodesData');
                const exetenLinks = this.mergeData(network.links, 'nodesData');
                this.mergeData(network.nodes.links, 'edgesData');
                this.initData(exetenNodes, node);
                this.nodesData = this.nodesData.concat(exetenNodes);
                this.edgesData = this.edgesData.concat(exetenLinks);
                this.reDraw();
                this.simulation.alpha(0.8).velocityDecay(0.7).restart();
            }
        })
    }
    getClickNodePre(node) {
        const preNodeId = node.preNodeId || this.network.source || '';
        const preNode = this.nodesData.find((nodeItem)=>{
            return nodeItem.id === preNodeId;
        });
        return preNode;
    }
    getAngle(x0, y0, x1, y1) {
        return Math.atan((y1 - y0) / (x1 - x0));
    }
    mergeData(data, type) {
        if (data) {
            const newData = data.filter((node, idx)=>{
                const resulst = this[type].find((oldNode)=>{
                    if (oldNode.id === node.id) {
                        node = Object.assign(oldNode, node);
                        return true;
                    }
                    return false;
                });
                return !resulst;
            });
            return newData;
        }
        return [];
    }
    initData(expendNodes, node) {

        const nodes = expendNodes;
        const preNode = this.getClickNodePre(node);
        if (preNode && this.state.layout === 'arc') {
            const angle = this.getAngle(preNode.x, preNode.y, node.x, node.y);
            const angleSingle = (Math.PI * 2 / 3) / nodes.length;
            let initAngle = angle - (Math.PI * 1 / 3);
            nodes.forEach(function(element, idx) {
                element.addFlag = true;
                const newAngle = node.x > preNode.x ? initAngle : initAngle + Math.PI;
                element.x = node.x + Math.cos(newAngle) * 50;
                element.y = node.y + Math.sin(newAngle) * 50;
                initAngle += angleSingle;
            });
        } else if(this.state.layout !== 'none'){
            nodes.forEach(function(element, idx) {
                element.addFlag = true;
                element.x = node.x;
                element.y = node.y;
            });
        }
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
    dbFocalHandle = (data) => {

    }
    modifySimulation = () => {
        this.simulation
          .alpha(1)
          .force('charge', d3.forceManyBody().strength((data) => {
            if (data.nodeStatus === -2) {
              return -60;
            }
            return -300;
          }))
          .force('link', d3.forceLink(this.edgesData).id((data) => { return data.name; }).distance((data) => {
            if (data.target.nodeStatus === -2 || data.source.nodeStatus === -2) {
              return 90;
            }
            return 150;
          }))
          .restart();
      }
    /**
     * 修改数据
     */
    modifyData = (data) => {
        console.log(data.oneLevelLinkedNodes);
        this.nodesData.map((node) => {
            if (node.id === data.id) {
              node.nodeStatus = 1;
            } else if (svgTools.findOneLevelNodes(node.id, data.oneLevelLinkedNodes)) {
              node.nodeStatus = 1;
            } else {
              node.nodeStatus = -2;
            }
          });
    }
    dragended = (data) => {
        if (!d3.event.active) this.simulation.alphaTarget(0);
        if (!this.isDragging) {
            if (this.clickTime) {// 双击
                if (this.timer) {
                    clearTimeout(this.timer);
                }
                this.clickTime = '';
                this.modifyData(data);
                this.updateNetwork();
               this.modifySimulation()
                data.fx = null;
                data.fx = null;
            } else {
            const date = new Date();
            this.clickTime = date;
            this.timer = setTimeout(() => {
                console.log('????')
                if (data.expend) {
                    this.collapseNode(data)
                } else {
                    this.addNodes(data);
                    data.fx = null;
                    data.fx = null;
                }
                // this.props.forceNetworkStore.focusNode(data);
                this.clickTime = '';
            }, 500);
            }
        } else {
            // console.log(data, '拖拽结束');
            data.fx = null;
            data.fx = null;
        }
        this.isDragging = false;
    }
    render() {
        const config = {
            arc: '扇形分布',
            point: ''
        }
        return (
            <div className="network">
                <a onClick={()=>{this.setState({layout: 'arc'})}} className={this.state.layout === 'arc' ? 'actLink' : ''}>扇形分布</a>
                <a onClick={()=>{this.setState({layout: 'none'})}} className={this.state.layout === 'none' ? 'actLink' : ''}>没有初始化</a>
                <a onClick={()=>{this.setState({layout: 'point'})}} className={this.state.layout === 'point' ? 'actLink' : ''}>位于一点</a>
                <div>
                    <svg width="1000" height="1000"></svg>  
                </div>
            </div>
        )
    }
}
export default Network;
