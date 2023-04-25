
export function toGeoJson(inpFile) {
  const epanetData= {
    currentFunction: "",
    nodeIndex: 0,
    linkIndex: 0,
    errors: [],
    nodes: {},
    links: {},
  };

  const lines = inpFile.split("\n");
  
  const data = lines.reduce((previousValue, currentValue, currentIndex) => {
    return readLine(previousValue, currentValue, currentIndex);
  }, epanetData);

  const links = (Object.keys(data.links)).reduce(
    (acc, l) => {
      const link = data.links[l];
      const { usNodeId, dsNodeId } = link.properties;
      const usGeometry = data.nodes[usNodeId].geometry.coordinates;
      const dsGeometry = data.nodes[dsNodeId].geometry.coordinates;

      link.geometry.coordinates = [
        usGeometry,
        ...link.geometry.coordinates,
        dsGeometry,
      ];

      return acc.concat(link);
    },
    []
  );

  if (data.linkIndex === 0 && data.nodeIndex === 0) {
    throw "Reading INP Failed, no link or nodes found";
  }
  if (data.errors.length > 0) {
    console.log(data.errors);
  }

  const model = {
    type: "FeatureCollection",
    features: [...links, ...Object.values(data.nodes)],
  };
  console.log({model});
  const networkLayers = getNetworkLayers(model.features).map(i=>{
    return {
      type: "FeatureCollection",
      features: i.features,
      layerName:i.layerName
    }
  });
console.log({networkLayers});
  return networkLayers;
}
function getNetworkLayers(features){
console.log({features});
  let pipeLayer = {layerName:'pipe',features:features.filter(i=>(i.properties.category)?.toLowerCase()==='pipe')};
  let junctionLayer = {layerName:'junction',features:features.filter(i=>(i.properties.category)?.toLowerCase()==='junction')};
  let tankLayer = {layerName:'tank',features:features.filter(i=>(i.properties.category)?.toLowerCase()==='tank')};
  let valveLayer = {layerName:'valve',features:features.filter(i=>(i.properties.category)?.toLowerCase()==='valve')};
  let pumpLayer = {layerName:'pump',features:features.filter(i=>(i.properties.category)?.toLowerCase()==='pump')};
  let resevoirLayer = {layerName:'resevoir',features:features.filter(i=>(i.properties.category)?.toLowerCase()==='reservior')};
  return [pipeLayer, junctionLayer, tankLayer, valveLayer, pumpLayer, resevoirLayer]
}

function readLine(
  epanetData, //prev value
  unTrimmedCurrentLine,   //current value
  lineNumber    //index
) {
  // Removing comments from string and any extra spacing/tabs
  // From:  "J-1952A	   311.450000	   ; Comment"
  // To:    "J-1952A 311.450000"
  const commentStart = unTrimmedCurrentLine.indexOf(";");
  const trimTo =
    commentStart === -1 ? unTrimmedCurrentLine.length : commentStart;
  const currLine = unTrimmedCurrentLine
    .substring(0, trimTo)
    .replace(/\s+/g, " ")
    .trim();

  // if line starts with ; or is blank skip
  if (currLine[0] === ";" || currLine[0] === "" || currLine[0] === undefined) {
    return epanetData;
  }

  // if line starts with [ then new section
  if (currLine[0] === "[" || currLine[currLine.length - 1] === "]") {
    epanetData.currentFunction = currLine;
    return epanetData;
  }

  switch (epanetData.currentFunction) {
    case "[JUNCTIONS]":
      return junctions(epanetData, currLine, lineNumber);
    case "[RESERVOIRS]":
      return reservoirs(epanetData, currLine, lineNumber);
    case "[PIPES]":
      return pipes(epanetData, currLine, lineNumber);
    case "[VALVES]":
      return valves(epanetData, currLine, lineNumber);
    case "[COORDINATES]":
      return coordinates(epanetData, currLine, lineNumber);
    case "[VERTICES]":
      return vertices(epanetData, currLine, lineNumber);
    case "[PUMPS]":
      return pumps(epanetData, currLine, lineNumber);
    case "[TANKS]":
      return tanks(epanetData, currLine, lineNumber);
    default:
      return epanetData;
  }
}

function junctions(
  epanetData,
  currLine,
  lineNumber
) {
  const data = currLine.split(" ");
  if (data.length < 2 || data.length > 4) {
    return {
      ...epanetData,
      errors: epanetData.errors.concat(`Error Reading Line ${lineNumber}`),
    };
  }
  const [id] = data;

  const junction = {
    type: "Feature",
    id: epanetData.nodeIndex,
    geometry: {
      type: "Point",
      coordinates: [0, 0],
    },
    properties: {
      type: "Node",
      category: "Junction",
      id,
      elevation: parseFloat(data[1]),
      demand: parseFloat(data[2]),
      pattern: data[3],
    },
  };

  epanetData.nodes[id] = junction;
  epanetData.nodeIndex++;

  return epanetData;
}

function reservoirs(
  epanetData,
  currLine,
  lineNumber
) {
  const data = currLine.split(" ");
  if (data.length < 2 || data.length > 3) {
    return {
      ...epanetData,
      errors: epanetData.errors.concat(`Error Reading Line ${lineNumber}`),
    };
  }
  const [id] = data;

  const reservior = {
    type: "Feature",
    id: epanetData.nodeIndex,
    geometry: {
      type: "Point",
      coordinates: [0, 0],
    },
    properties: {
      type: "Node",
      category: "Reservior",
      id,
      head: parseFloat(data[1]),
      pattern: data[2],
    },
  };

  epanetData.nodes[id] = reservior;
  epanetData.nodeIndex++;
  return epanetData;
}

function tanks(
  epanetData,
  currLine,
  lineNumber
) {
  const data = currLine.split(" ");
  if (data.length < 7 || data.length > 9) {
    return {
      ...epanetData,
      errors: epanetData.errors.concat(`Error Reading Line ${lineNumber}`),
    };
  }

  const [id] = data;

  const tank = {
    type: "Feature",
    id: epanetData.nodeIndex,
    geometry: {
      type: "Point",
      coordinates: [0, 0],
    },
    properties: {
      type: "Node",
      category: "Tank",
      id,
      elevation: parseFloat(data[1]),
      initLevel: parseFloat(data[2]),
      minLevel: parseFloat(data[3]),
      maxLevel: parseFloat(data[4]),
      diameter: parseFloat(data[5]),
      minVolume: parseFloat(data[6]),
      volCurve: data[7],
      overflow: data[8] ? data[8].toLowerCase() === "true" : undefined,
    },
  };

  return {
    ...epanetData,
    nodes: {
      ...epanetData.nodes,
      [id]: tank,
    },
    nodeIndex: epanetData.nodeIndex + 1,
  };
}

function pipes(
  epanetData,
  currLine,
  lineNumber
) {
  const data = currLine.split(" ");
  if (data.length < 6 || data.length > 8) {
    return {
      ...epanetData,
      errors: epanetData.errors.concat(`Error Reading Line ${lineNumber}`),
    };
  }

  const [
    id,
    usNodeId,
    dsNodeId,
    length,
    diameter,
    roughness,
    minorLoss,
    statusAsString,
  ] = data;

  let status= undefined;

  switch (statusAsString && statusAsString.toLowerCase()) {
    case "open":
      status = "Open";
      break;

    case "closed":
      status = "Closed";
      break;

    case "cv":
      status = "CV";
      break;

    default:
      break;
  }

  const pipe = {
    type: "Feature",
    id: epanetData.linkIndex,
    geometry: {
      type: "LineString",
      coordinates: [],
    },
    properties: {
      type: "Link",
      category: "Pipe",
      id,
      usNodeId,
      dsNodeId,
      length: parseFloat(length),
      diameter: parseFloat(diameter),
      roughness: parseFloat(roughness),
      minorLoss: parseFloat(minorLoss),
      status,
    },
  };

  epanetData.links[id] = pipe;
  epanetData.linkIndex++;

  return epanetData;
}

function pumps(
  epanetData,
  currLine,
  lineNumber
) {
  const data = currLine.split(" ");
  if (
    data.length < 5 ||
    data.length === 6 ||
    data.length === 8 ||
    data.length > 9
  ) {
    return {
      ...epanetData,
      errors: epanetData.errors.concat(`Error Reading Line ${lineNumber}`),
    };
  }

  const [id, usNodeId, dsNodeId] = data;

  const pump = {
    type: "Feature",
    id: epanetData.linkIndex,
    geometry: {
      type: "LineString",
      coordinates: [],
    },
    properties: {
      type: "Link",
      category: "Pump",
      id,
      usNodeId,
      dsNodeId,
      mode: "Power",
      power: 2,
      speed: 1,
      pattern: "dummy",
    },
  };

  return {
    ...epanetData,
    links: {
      ...epanetData.links,
      [id]: pump,
    },
    linkIndex: epanetData.linkIndex + 1,
  };
}

function valves(
  epanetData,
  currLine,
  lineNumber
) {
  const data = currLine.split(" ");

  const [id, usNodeId, dsNodeId] = data;

  const valve = {
    type: "Feature",
    id: epanetData.linkIndex,
    geometry: {
      type: "LineString",
      coordinates: [],
    },
    properties: {
      type: "Link",
      category: "Valve",
      id,
      usNodeId,
      dsNodeId,
      diameter: 100,
      valveType: "TCV",
      setting: 100,
      minorLoss: 0,
    },
  };

  epanetData.links[id] = valve;
  epanetData.linkIndex++;

  return epanetData;
}

function coordinates(
  epanetData,
  currLine,
  lineNumber
) {
  const data = currLine.split(" ");
  if (epanetData.nodes[data[0]] === undefined) {
    return {
      ...epanetData,
      errors: epanetData.errors.concat(`Error Reading Line ${lineNumber}`),
    };
  }

  const node = epanetData.nodes[data[0]];
  const x = parseFloat(data[1]);
  const y = parseFloat(data[2]);

  epanetData.nodes[data[0]] = {
    ...node,
    geometry: {
      ...node.geometry,
      coordinates: [x, y],
    },
  };

  return epanetData;
}

function vertices(
  epanetData,
  currLine,
  lineNumber
) {
  const data = currLine.split(" ");

  const link = epanetData.links[data[0]];

  const existingBends = link.geometry.coordinates;
  const newBend = [parseFloat(data[1]), parseFloat(data[2])];

  const bends = existingBends ? existingBends.concat([newBend]) : [newBend];

  epanetData.links[data[0]] = {
    ...link,
    geometry: {
      ...link.geometry,
      coordinates: bends,
    },
  };

  return epanetData;
}
