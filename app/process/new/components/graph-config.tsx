import React from 'react';

const GraphConfig = {
  NodeTypes: {
    empty: {
      typeText: "None",
      shapeId: "#empty",
      shape: (
        <symbol viewBox="0 0 100 100" id="empty" key="0">
          <circle cx="50" cy="50" r="45"></circle>
        </symbol>
      )
    },
    custom: {
      typeText: "Custom",
      shapeId: "#custom",
      shape: (
        <symbol viewBox="0 0 50 25" id="custom" key="1">
          <ellipse cx="50" cy="25" rx="50" ry="25"></ellipse>
        </symbol>
      )
    }
    // You can add more node types as needed
  },
  NodeSubtypes: {},  // You can define subtypes if needed
  EdgeTypes: {
    customer: {
      shapeId: "#customer",
      shape: (
        <symbol viewBox="0 0 50 50" id="customer" key="0">
          <circle cx="25" cy="25" r="10" fill="blue"></circle>
        </symbol>
      )
    },
    provider: {
      shapeId: "#provider",
      shape: (
        <symbol viewBox="0 0 50 50" id="provider" key="1">
          <circle cx="25" cy="25" r="10" fill="green"></circle>
        </symbol>
      )
    },
    marketplaceOperator: {
      shapeId: "#marketplaceOperator",
      shape: (
        <symbol viewBox="0 0 50 50" id="marketplaceOperator" key="2">
          <circle cx="25" cy="25" r="10" fill="yellow"></circle>
        </symbol>
      )
    },
    automatic: {
      shapeId: "#automatic",
      shape: (
        <symbol viewBox="0 0 50 50" id="automatic" key="3">
          <circle cx="25" cy="25" r="10" fill="red"></circle>
        </symbol>
      )
    }
  }
};

export default GraphConfig;
