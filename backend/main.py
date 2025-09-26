from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="NodusOS Builder Backend", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok", "service": "builder-backend", "version": "1.0.0"}

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "NodusOS Builder Backend",
        "version": "1.0.0",
        "status": "running"
    }

@app.post("/builder/describe")
async def describe(request: dict):
    """NodusOS Builder LLM Companion - Generate JSON Patch from natural language"""
    try:
        brief = request.get("brief", "")
        graph_spec = request.get("graph_spec", {})
        catalog = request.get("catalog", {})
        preferences = request.get("preferences", {})
        
        nodes = graph_spec.get("nodes", [])
        edges = graph_spec.get("edges", [])
        
        # Analyze the brief and generate appropriate JSON Patch
        brief_lower = brief.lower()
        
        if "add llm" in brief_lower or "llm" in brief_lower or "summarize" in brief_lower:
            patch = [
                {
                    "op": "add",
                    "path": "/nodes/-",
                    "value": {
                        "id": f"llm_{len(nodes) + 1}",
                        "type": "llm.structured",
                        "position": {"x": 300, "y": 200 + len(nodes) * 100},
                        "data": {
                            "label": "LLM Node",
                            "description": "Large Language Model for text processing"
                        }
                    }
                }
            ]
            rationale = "Added an LLM node for intelligent text processing based on your request"
            
        elif "add validation" in brief_lower or "validate" in brief_lower:
            patch = [
                {
                    "op": "add",
                    "path": "/nodes/-",
                    "value": {
                        "id": f"validator_{len(nodes) + 1}",
                        "type": "validation.schema",
                        "position": {"x": 400, "y": 200 + len(nodes) * 100},
                        "data": {
                            "label": "Schema Validator",
                            "description": "Validates data against JSON schema"
                        }
                    }
                }
            ]
            rationale = "Added schema validation node to ensure data integrity"
            
        elif "add transform" in brief_lower or "transform" in brief_lower or "map" in brief_lower:
            patch = [
                {
                    "op": "add",
                    "path": "/nodes/-",
                    "value": {
                        "id": f"transform_{len(nodes) + 1}",
                        "type": "data.transform",
                        "position": {"x": 500, "y": 200 + len(nodes) * 100},
                        "data": {
                            "label": "Data Transform",
                            "description": "Transforms data between formats"
                        }
                    }
                }
            ]
            rationale = "Added data transformation node for processing data"
            
        else:
            # Generic suggestion based on instruction
            patch = [
                {
                    "op": "add",
                    "path": "/nodes/-",
                    "value": {
                        "id": f"custom_{len(nodes) + 1}",
                        "type": "custom.node",
                        "position": {"x": 300, "y": 200 + len(nodes) * 100},
                        "data": {
                            "label": "Custom Node",
                            "description": f"Custom node for: {brief}"
                        }
                    }
                }
            ]
            rationale = f"Added intelligent node based on your request: {brief}"
        
        return {
            "rationale": rationale,
            "patch": patch,
            "risks": ["Cost LLM", "Complexity"],
            "diagnostics": []
        }
        
    except Exception as e:
        return {
            "rationale": f"Error processing request: {str(e)}",
            "patch": [],
            "risks": ["System Error"],
            "diagnostics": [{"severity": "high", "message": str(e)}]
        }

@app.post("/builder/validate")
async def validate_graph(graph: dict):
    """Validate graph with Builder-specific rules"""
    try:
        nodes = graph.get("nodes", [])
        edges = graph.get("edges", [])
        
        errors = []
        warnings = []
        
        # Check for required nodes
        if not nodes:
            errors.append({"field": "nodes", "message": "Graph must have at least one node"})
        
        # Check for input/output nodes
        has_input = any(node.get("type") == "input" for node in nodes)
        has_output = any(node.get("type") == "output" for node in nodes)
        
        if not has_input:
            warnings.append({"field": "nodes", "message": "Consider adding an input node"})
        if not has_output:
            warnings.append({"field": "nodes", "message": "Consider adding an output node"})
        
        # Check for orphaned nodes
        connected_nodes = set()
        for edge in edges:
            connected_nodes.add(edge.get("source"))
            connected_nodes.add(edge.get("target"))
        
        orphaned_nodes = [node for node in nodes if node.get("id") not in connected_nodes and len(nodes) > 1]
        if orphaned_nodes:
            warnings.append({
                "field": "nodes", 
                "message": f"Found {len(orphaned_nodes)} orphaned nodes that aren't connected"
            })
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings
        }
        
    except Exception as e:
        return {
            "valid": False,
            "errors": [{"field": "system", "message": f"Validation error: {str(e)}"}],
            "warnings": []
        }

@app.post("/builder/dry-run")
async def dry_run(request: dict):
    """Execute dry-run with mock providers"""
    try:
        graph = request.get("graph", {})
        fixtures = request.get("fixtures", {})
        nodes = graph.get("nodes", [])
        edges = graph.get("edges", [])
        
        # Mock execution timeline
        timeline = []
        current_time = "2024-01-01T10:00:00Z"
        
        # Start with input nodes
        input_nodes = [node for node in nodes if node.get("type") == "input"]
        for i, node in enumerate(input_nodes):
            timeline.append({
                "timestamp": current_time,
                "node_id": node.get("id"),
                "event": "start",
                "data": {"input": fixtures or {"mock": "data"}}
            })
            timeline.append({
                "timestamp": f"2024-01-01T10:00:{i+1:02d}Z",
                "node_id": node.get("id"),
                "event": "complete",
                "data": {"output": {"processed": "input data"}}
            })
        
        # Process other nodes
        for i, node in enumerate(nodes):
            if node.get("type") not in ["input", "output"]:
                timeline.append({
                    "timestamp": f"2024-01-01T10:00:{i+2:02d}Z",
                    "node_id": node.get("id"),
                    "event": "start",
                    "data": {"processing": f"Node {node.get('id')}"}
                })
                timeline.append({
                    "timestamp": f"2024-01-01T10:00:{i+3:02d}Z",
                    "node_id": node.get("id"),
                    "event": "complete",
                    "data": {"output": {"result": f"Processed by {node.get('id')}"}}
                })
        
        # End with output nodes
        output_nodes = [node for node in nodes if node.get("type") == "output"]
        for node in output_nodes:
            timeline.append({
                "timestamp": "2024-01-01T10:00:10Z",
                "node_id": node.get("id"),
                "event": "complete",
                "data": {"final_result": "Graph execution completed successfully"}
            })
        
        return {
            "timeline": timeline,
            "result": {"status": "success", "output": "Mock execution completed"},
            "success": True
        }
        
    except Exception as e:
        return {
            "timeline": [],
            "result": {"status": "error", "message": str(e)},
            "success": False
        }

@app.get("/builder/minigrafs")
async def get_minigrafs():
    """Get available minigrafs for Builder palette"""
    return [
        {
            "id": "finance.budget_builder",
            "version": "1.0.0",
            "io": {
                "input": {"brief": "object"},
                "output": {"budget": "object"}
            },
            "tags": ["finance", "budget", "planning"],
            "description": "Build comprehensive budgets from business briefs"
        },
        {
            "id": "data.contract_extractor",
            "version": "2.1.0",
            "io": {
                "input": {"document": "string"},
                "output": {"entities": "array"}
            },
            "tags": ["data", "extraction", "nlp"],
            "description": "Extract structured data from contracts and documents"
        },
        {
            "id": "validation.schema_validator",
            "version": "1.5.0",
            "io": {
                "input": {"data": "object", "schema": "object"},
                "output": {"valid": "boolean", "errors": "array"}
            },
            "tags": ["validation", "schema", "data"],
            "description": "Validate data against JSON schemas"
        },
        {
            "id": "llm.structured_output",
            "version": "1.2.0",
            "io": {
                "input": {"prompt": "string", "schema": "object"},
                "output": {"result": "object"}
            },
            "tags": ["llm", "structured", "output"],
            "description": "Generate structured output using LLM with schema validation"
        },
        {
            "id": "data.json_patch",
            "version": "1.0.0",
            "io": {
                "input": {"document": "object", "patch": "array"},
                "output": {"result": "object"}
            },
            "tags": ["data", "transform", "patch"],
            "description": "Apply JSON Patch operations to documents"
        }
    ]

@app.post("/builder/refine")
async def refine(request: dict):
    """Refine graph based on validation diagnostics"""
    try:
        graph_spec = request.get("graph_spec", {})
        diagnostics = request.get("diagnostics", [])
        
        # Mock refinement logic
        patch = []
        for diag in diagnostics:
            if diag.get("severity") == "high":
                # Add error handling node
                patch.append({
                    "op": "add",
                    "path": "/nodes/-",
                    "value": {
                        "id": f"error_handler_{len(graph_spec.get('nodes', [])) + 1}",
                        "type": "error.handler",
                        "position": {"x": 400, "y": 300},
                        "data": {
                            "label": "Error Handler",
                            "description": "Handles validation errors"
                        }
                    }
                })
        
        return {
            "patch": patch,
            "rationale": "Added error handling based on diagnostics"
        }
    except Exception as e:
        return {
            "patch": [],
            "rationale": f"Refinement error: {str(e)}"
        }

@app.post("/builder/explain")
async def explain(request: dict):
    """Explain graph in natural language"""
    try:
        graph_spec = request.get("graph_spec", {})
        nodes = graph_spec.get("nodes", [])
        edges = graph_spec.get("edges", [])
        
        explanation = f"This graph has {len(nodes)} nodes and {len(edges)} connections. "
        
        if nodes:
            node_types = [node.get("type", "unknown") for node in nodes]
            explanation += f"Node types: {', '.join(set(node_types))}. "
        
        explanation += "The workflow processes data through these steps and produces structured output."
        
        return {
            "explanation": explanation
        }
    except Exception as e:
        return {
            "explanation": f"Error explaining graph: {str(e)}"
        }

@app.post("/builder/migrate")
async def migrate(request: dict):
    """Migrate graph to target version"""
    try:
        graph_spec = request.get("graph_spec", {})
        target_version = request.get("target_version", "1.0.0")
        
        # Mock migration logic
        patch = [
            {
                "op": "replace",
                "path": "/meta/version",
                "value": target_version
            }
        ]
        
        return {
            "patch": patch,
            "rationale": f"Migrated to version {target_version}"
        }
    except Exception as e:
        return {
            "patch": [],
            "rationale": f"Migration error: {str(e)}"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)