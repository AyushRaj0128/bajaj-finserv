# BFHL Challenge - Full Stack Solution

A complete full-stack implementation of the SRM BFHL (Bachelor Full Stack Engineering Challenge) hierarchy processor with REST API backend and interactive frontend.

## Project Structure

```
├── backend/
│   ├── server.js          # Express server with /bfhl endpoint
│   └── .env               # Environment variables
├── frontend/
│   └── index.html         # Single-page application
├── package.json           # Root dependencies
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Setup & Installation

### 1. Clone and Install

```bash
# Install dependencies
npm install
```

### 2. Configure User Details

Edit `backend/server.js` and update these constants:

```javascript
const USER_ID = "yourname_ddmmyyyy";      // e.g., "johndoe_17091999"
const EMAIL_ID = "your.email@college.edu";
const COLLEGE_ROLL = "21CS1001";
```

### 3. Run Locally

#### Start Backend Server
```bash
npm start
# Server runs on http://localhost:5000
```

#### Open Frontend
```bash
# In another terminal, open the frontend
open frontend/index.html
# Or open it directly in your browser
```

## API Specification

### Endpoint: POST /bfhl

**Request:**
```json
{
  "data": ["A->B", "A->C", "B->D", "X->Y", "Y->X"]
}
```

**Response:**
```json
{
  "user_id": "johndoe_17091999",
  "email_id": "john.doe@college.edu",
  "college_roll_number": "21CS1001",
  "hierarchies": [
    {
      "root": "A",
      "tree": { "A": { "B": { "D": {} }, "C": {} } },
      "depth": 3
    },
    {
      "root": "X",
      "tree": {},
      "has_cycle": true
    }
  ],
  "invalid_entries": [],
  "duplicate_edges": [],
  "summary": {
    "total_trees": 1,
    "total_cycles": 1,
    "largest_tree_root": "A"
  }
}
```

## Features

### Backend
- ✅ Full hierarchy validation and processing
- ✅ Cycle detection using DFS
- ✅ Multi-tree support
- ✅ Invalid entry tracking
- ✅ Duplicate edge detection
- ✅ CORS enabled for cross-origin requests
- ✅ <3 second response time

### Frontend
- ✅ Beautiful gradient UI
- ✅ Real-time validation feedback
- ✅ Structured result display
- ✅ Error handling
- ✅ Mobile-responsive design
- ✅ Clear hierarchy visualization

## Input Validation

### Valid Format
- Uppercase letters only: `A->B`, `Z->X`
- Single characters: Not `AB->C` or `A->CD`
- No self-loops: `A->A` is invalid
- Trim whitespace: ` A->B ` is valid

### Invalid Entries
- `hello` - Not a node format
- `1->2` - Numbers not allowed
- `AB->C` - Multi-character nodes
- `A-B` - Wrong separator
- `A->` - Missing child
- `A->A` - Self-loop
- Empty string

## Processing Rules

1. **Valid Node Format**: Single uppercase letter (A-Z)
2. **Duplicate Edges**: First occurrence kept, subsequent discarded
3. **Tree Construction**: Multiple independent trees supported
4. **Root Definition**: Node with no parents
5. **Cycle Detection**: Returns empty tree with `has_cycle: true`
6. **Depth**: Count of nodes on longest root-to-leaf path
7. **Multi-parent**: First parent wins, others discarded

## Deployment

### Option 1: Vercel (Recommended for Full-Stack)
```bash
npm install -g vercel
vercel
```

### Option 2: Railway
1. Connect GitHub repository
2. Railway auto-detects Node.js
3. Set environment variables
4. Deploy

### Option 3: Render
1. Create new Web Service
2. Connect GitHub repo
3. Set build command: `npm install`
4. Set start command: `node backend/server.js`
5. Deploy

## Environment Variables

```bash
PORT=5000  # Server port (default: 5000)
```

## Performance

- Response time: <3 seconds for 50 nodes
- Memory efficient cycle detection
- Optimized tree traversal

## Testing with cURL

```bash
curl -X POST http://localhost:5000/bfhl \
  -H "Content-Type: application/json" \
  -d '{"data":["A->B","B->C","X->Y","Y->X"]}'
```

## GitHub Submission

1. Initialize git repository
2. Push to GitHub
3. Share repository URL with evaluator

```bash
git init
git add .
git commit -m "BFHL Challenge Solution"
git remote add origin <your-repo-url>
git push -u origin main
```

## Example Walkthrough

**Input:**
```
A->B
A->C
B->D
C->E
E->F
X->Y
Y->Z
Z->X
P->Q
Q->R
G->H
G->H
G->I
hello
1->2
A->
```

**Processing:**
- Valid edges: A->B, A->C, B->D, C->E, E->F, X->Y, Y->Z, Z->X, P->Q, Q->R, G->H, G->I
- Duplicate edges: G->H
- Invalid entries: hello, 1->2, A->
- Cycle detected: X->Y->Z->X
- Trees: A (depth 4), P (depth 3), G (depth 2)

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### CORS Issues
The backend has CORS enabled by default. If issues persist, check:
- Frontend URL matches API origin
- API is running on correct port

### Large Input Handling
- Optimized for up to 50 nodes
- Linear time complexity for most operations
- Cycle detection uses DFS (optimal)

## Evaluation Criteria

✅ API responds in <3 seconds
✅ CORS enabled
✅ POST /bfhl endpoint
✅ Dynamic processing (no hardcoded responses)
✅ Beautiful, responsive UI
✅ Public GitHub repository
✅ Deployed and accessible URLs

## License

MIT
