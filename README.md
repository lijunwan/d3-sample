包含了一些的d3交互实例，例如力导向图双击节点聚焦、拓展节点......
## 力导向图-聚焦
### 效果描述
双击节点，节点以及节点一度关联的节点保持高亮状态，其余节点变灰，半径变小，文字消失，并且向内收缩。
### 关键代码描述
节点变化<br/>
激活节点保持高亮，其余节点应用noActive样式，半径变小<br/>
<pre>
    nodeUpdate
    .transition()
    .attr('class', (data) => {
        return (data.hide && 'hide') || (data.nodeStatus < 0 && 'noActive') || (data.cateType === 0 && 'mainCompany') || (data.cateType === 1 && 'relativeCompany') || (data.cateType === 2 && 'relativePerson');
    })
    .attr('r', (data) => {
        if (data.nodeStatus === -2) {
            return 5;
        }
        return data.cateType < 2 ? 20 : 10;
    });
</pre>
最重要的是，在双击节点后力导向模型的参数也要根据节点半径作出相应的变化。非激活状态的节点电荷力改为50。一条线有一端的节点为非激活状态，就将它的最短距离也就是distance设为50。这样就能达到一个收缩效果。
<pre>
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
        return 50;
    }
    return 150;
    }))
    .restart();
</pre>
