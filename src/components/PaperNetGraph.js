import vis from 'vis';
import uuid from 'uuid';
import React from 'react';

class PaperNetGraph extends React.Component {
  constructor(props) {
    super(props);
    const { identifier } = this.props;
    this.updateGraph = this.updateGraph.bind(this);
    this.state = {
      hierarchicalLayout: false,
      identifier: uuid.v4(),
    };
  }

  componentDidMount() {
    this.updateGraph();
  }

//  componentWillReceiveProps() {
//   this.updateGraph();
//  }

  changeMode() {
    this.setState({ hierarchicalLayout: !this.state.hierarchicalLayout });
    this.updateGraph();
  }

  updateGraph() {
    const container = document.getElementById(this.state.identifier);
    let options = {
      // manipulation: false,
      edges: {
        color: '#000000',
        // width: 0.5,
        // arrowScaleFactor: 0.5,
        arrows: 'to',
      },
      layout: {
        hierarchical: {
          enabled: false,
          levelSeparation: 300,
          // blockShifting: true,
          // edgeMinimization: true,
          // parentCentralization: true,
          direction: 'UD',        // UD, DU, LR, RL
          sortMethod: 'hubsize'   // hubsize, directed
        },
      },
      physics: {
        hierarchicalRepulsion: {
          nodeDistance: 300,
        },
        barnesHut: {
          avoidOverlap: 0.6,
          damping: 0.7,
        },
      },
    };

    if (this.state.hierarchicalLayout) {
      options.layout.hierarchical.enabled=true;
    } else {
      options.layout.hierarchical.enabled=false;
    }

    new vis.Network(container, this.props.graph, options);
  }

  render() {
    const { identifier } = this.state;
    const { style } = this.props;
    return React.createElement('div', { onDoubleClick: this.changeMode.bind(this), id: identifier, style }, identifier);
  }
}

PaperNetGraph.defaultProps = {
  graph: {},
  style: { width: '900px', height: '850px' },
};

export default PaperNetGraph;
// module.exports = Graph;
