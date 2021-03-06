import React, { Component } from 'react';
import * as d3 from 'd3';
import DATA from '../data/network';
import './shape.css';
import * as svgTools from '../helper';
import user from '../img/user.jpg';
import { Prompt } from 'react-router';
class RectNetwork extends Component {
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

    }
    componentDidMount() {
        this.nodesData = DATA.currentNetwork.nodes;
        this.edgesData = DATA.currentNetwork.links;
        console.log(DATA.currentNetwork);
        this.addZoom();
        this.createGroups();
        this.createSimulation();
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
    // 创建力学模型
    createSimulation() {
        const width = d3.select('svg').attr('width');
        const height = d3.select('svg').attr('height');
        this.simulation = d3.forceSimulation(this.nodesData)
        /*排斥力，strength大小和节点的半径成正比，只有这样节点才不会重叠*/
        .force('charge', d3.forceManyBody().strength(-200))
         /*中心吸引力，值设置为width / 2和height / 2，才能保证整个布局位于正中*/
        .force('center', d3.forceCenter(width / 2, 400))
        .force('link', d3.forceLink(this.edgesData).id((data) => { return data.id; }).distance(150))
        .on('tick', this.ticked);

    }
    nodeTempHandle() {
        var nodeUpdate = this.nodeG
                        .selectAll('rect')
                        .data(this.nodesData, (data) => data.id);
        var nodeEnter = nodeUpdate.enter();
        var nodeExit = nodeUpdate.exit();
        // 更新
        nodeUpdate
        .transition()
        .attr('class', (data) => {
            return (data.hide && 'hide') || (data.nodeStatus < 0 && 'noActive') || (data.cateType === 0 && 'mainCompany') || (data.cateType === 1 && 'relativeCompany') || (data.cateType === 2 && 'relativePerson');
        })
        .attr('r', (data)=>{
            return data.nodeStatus === -2 ? 10 : 20;
        })
        .attr('fill', (data)=>{
            return data.cateType === 2 ? 'url(#person)' : '';
        });
        // 添加
        nodeEnter
        .append('rect')
        .attr('class', (data) => {
          return (data.hide && '.hide') || (data.cateType === 0 && 'mainCompany') || (data.cateType === 1 && 'relativeCompany') || (data.cateType === 2 && 'relativePerson');
        })
        .attr('stroke', d3.rgb('#7FBBA1').darker(0.5))
        .attr('width', 20)
        .attr('height', 20)
        .call(d3.drag()
          .on('start', this.dragstarted)
          .on('drag', this.dragged)
          .on('end', this.dragended));
        // 删除
        nodeExit.remove();
    }
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
            return data.nodeStatus === -2 ? 'hideText' : 'nodeText';
        })
        // 添加
        textEnter.append('text')
        .attr('class', (data) => {
            return data.nodeStatus === -2 ? 'hideText' : 'nodeText';
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
    }
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
            return (data.hide && 'hide') || ((data.source.nodeStatus < 0 || data.target.nodeStatus < 0) && 'lineNoActive') || (data.lineType === 1 && 'links') || 'dashLinks';
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
        this.simulation.force('link').links(this.edgesData);
        this.nodeTempHandle();
        this.textTempHandle();
        this.lineTempHandle();
    }
    updateNetwork() {
        this.nodeTempHandle();
        this.textTempHandle();
        this.lineTempHandle(); 
    }
    ticked() {
        d3.selectAll('rect')
        .attr('x', (data) => { return data.x - 10; })
        .attr('y', (data) => { return data.y - 10; });
        
        d3.selectAll('line')
        .attr('x1', (data) => { return data.source.x; })
        .attr('y1', (data) => { return data.source.y; })
        .attr('x2', (data) => { return data.target.x; })
        .attr('y2', (data) => { return data.target.y; });
        
        d3.selectAll('#texts text')
        .attr('x', (data) => { return data.x; })
        .attr('y', (data) => { return data.y; });
        
        d3.selectAll('.edgepath')
        .attr('d', (data) => {
          return 'M ' + data.source.x + ' ' + data.source.y + ' L ' + data.target.x + ' ' + data.target.y;
        });
  
        d3.selectAll('#lineLabels text')
        .attr('transform', function autoRotate(data) {
          if (data.target.x < data.source.x) {// 边上的文字自动转向
            const bbox = this.getBBox();
            const rx = bbox.x + bbox.width / 2;
            const ry = bbox.y + bbox.height / 2;
            return 'rotate(180 ' + rx + ' ' + ry + ')';
          }
          return 'rotate(0)';
        });

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
          .alpha(0.3)
          .force('charge', d3.forceManyBody().strength((data) => {
            if (data.nodeStatus === -2) {
              return -50;
            }
            return -200;
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
                this.modifySimulation();
                data.fx = null;
                data.fx = null;
            } else {
            const date = new Date();
            this.clickTime = date;
            this.timer = setTimeout(() => {
                // this.props.forceNetworkStore.focusNode(data);
                this.clickTime = '';
            }, 300);
            }
        } else {
            // console.log(data, '拖拽结束');
        }
        this.isDragging = false;
        // data.fx = null;
        // data.fx = null;;
    }
    render() {
        return (
            <div>
                <i className="fa fa-user-circle-o" aria-hidden="true"></i>
                <svg width="1000" height="1000">
                    <defs>
                        {/* <pattern id="person" patternUnits="objectBoundingBox" width="1" height="1">
                            <rect x="10" y="10" width="20" height="20" fill="#7FBBA1" stroke="#5CA083"/>
                        </pattern> */}
                         <pattern id="person" patternUnits="objectBoundingBox" width="1" height="1">
                            <image href={user} width="20" height="20" x="10" y="10"/>
                        </pattern>
                    </defs>
                </svg>
                <Prompt message="你要离开吗？" when={true}/>
            </div>
        )
    }
}
export default RectNetwork;
