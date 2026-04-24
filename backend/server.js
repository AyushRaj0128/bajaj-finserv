const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Configuration - PLEASE UPDATE THESE
const USER_ID = "user_17042026"; // Format: fullname_ddmmyyyy
const EMAIL_ID = "user@college.edu";
const COLLEGE_ROLL = "21CS1001";

// Helper function to validate node format
function isValidNode(node) {
  return /^[A-Z]$/.test(node);
}

// Helper function to validate edge format
function isValidEdge(edge) {
  const trimmed = edge.trim();
  const parts = trimmed.split('->');

  if (parts.length !== 2) return false;

  const [parent, child] = parts;

  // Both must be single uppercase letters
  if (!isValidNode(parent) || !isValidNode(child)) return false;

  // Self-loop is invalid
  if (parent === child) return false;

  return true;
}

// Process edges and build hierarchy
function processHierarchy(data) {
  const validEdges = [];
  const invalidEntries = [];
  const duplicateEdges = [];
  const seenEdges = new Set();

  // Validate and separate edges
  for (let entry of data) {
    if (!isValidEdge(entry)) {
      invalidEntries.push(entry);
    } else {
      const trimmed = entry.trim();
      if (seenEdges.has(trimmed)) {
        duplicateEdges.push(trimmed);
      } else {
        validEdges.push(trimmed);
        seenEdges.add(trimmed);
      }
    }
  }

  // Build graph and find roots
  const graph = {};
  const children = new Set();
  const allNodes = new Set();

  for (let edge of validEdges) {
    const [parent, child] = edge.split('->');

    if (!graph[parent]) graph[parent] = [];
    graph[parent].push(child);

    children.add(child);
    allNodes.add(parent);
    allNodes.add(child);
  }

  // Find roots (nodes that are never children)
  const roots = [];
  for (let node of allNodes) {
    if (!children.has(node)) {
      roots.push(node);
    }
  }

  // Build trees and detect cycles
  const hierarchies = [];
  const visited = new Set();

  // Process all roots
  for (let root of roots.sort()) {
    if (visited.has(root)) continue;

    const { childrenMap, hasCycle, nodesList } = buildTree(root, graph);
    nodesList.forEach(n => visited.add(n));

    const tree = hasCycle ? {} : childrenMap;

    const hierarchy = {
      root,
      tree
    };

    if (hasCycle) {
      hierarchy.has_cycle = true;
    } else {
      const depth = calculateDepth(root, childrenMap);
      hierarchy.depth = depth;
    }

    hierarchies.push(hierarchy);
  }

  // Handle unvisited nodes (cycles with no traditional root)
  const unvisitedNodes = [...allNodes].filter(n => !visited.has(n)).sort();
  for (let node of unvisitedNodes) {
    if (visited.has(node)) continue;

    const { childrenMap, hasCycle, nodesList } = buildTree(node, graph);
    nodesList.forEach(n => visited.add(n));

    const tree = hasCycle ? {} : childrenMap;

    const hierarchy = {
      root: node,
      tree
    };

    if (hasCycle) {
      hierarchy.has_cycle = true;
    } else {
      const depth = calculateDepth(node, childrenMap);
      hierarchy.depth = depth;
    }

    hierarchies.push(hierarchy);
  }

  // Calculate summary
  const totalTrees = hierarchies.filter(h => !h.has_cycle).length;
  const totalCycles = hierarchies.filter(h => h.has_cycle).length;

  let largestTreeRoot = null;
  let maxDepth = -1;

  for (let h of hierarchies) {
    if (!h.has_cycle && h.depth > maxDepth) {
      maxDepth = h.depth;
      largestTreeRoot = h.root;
    } else if (!h.has_cycle && h.depth === maxDepth && largestTreeRoot) {
      // Tiebreaker: lexicographically smaller
      if (h.root < largestTreeRoot) {
        largestTreeRoot = h.root;
      }
    }
  }

  const summary = {
    total_trees: totalTrees,
    total_cycles: totalCycles,
    largest_tree_root: largestTreeRoot
  };

  return {
    hierarchies,
    invalidEntries,
    duplicateEdges: [...new Set(duplicateEdges)],
    summary
  };
}

// Build tree recursively with cycle detection
function buildTree(root, graph, visited = new Set(), recursionStack = new Set()) {
  function dfs(node) {
    if (recursionStack.has(node)) {
      return { tree: {}, hasCycle: true };
    }

    if (visited.has(node)) {
      return { tree: {}, hasCycle: false };
    }

    visited.add(node);
    recursionStack.add(node);

    const childrenList = graph[node] || [];
    const tree = {};
    let hasCycle = false;

    for (let child of childrenList) {
      const { tree: childTree, hasCycle: childHasCycle } = dfs(child);
      tree[child] = childTree;

      if (childHasCycle) {
        hasCycle = true;
      }
    }

    recursionStack.delete(node);

    return { tree, hasCycle };
  }

  const { tree: childrenOfRoot, hasCycle } = dfs(root);
  const nodesList = [...visited];

  return {
    childrenMap: { [root]: childrenOfRoot },
    hasCycle,
    nodesList
  };
}

// Calculate depth (longest path)
function calculateDepth(root, tree) {
  function dfs(node, obj) {
    if (!obj[node]) return 1;

    const children = obj[node];
    if (Object.keys(children).length === 0) return 1;

    let maxChildDepth = 0;
    for (let child of Object.keys(children)) {
      maxChildDepth = Math.max(maxChildDepth, dfs(child, children));
    }

    return maxChildDepth + 1;
  }

  return dfs(root, tree);
}

app.post('/bfhl', (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data)) {
      return res.status(400).json({ error: 'data must be an array' });
    }

    const { hierarchies, invalidEntries, duplicateEdges, summary } = processHierarchy(data);

    const response = {
      user_id: USER_ID,
      email_id: EMAIL_ID,
      college_roll_number: COLLEGE_ROLL,
      hierarchies,
      invalid_entries: invalidEntries,
      duplicate_edges: duplicateEdges,
      summary
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
