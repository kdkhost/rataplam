import sys, json, glob
from pathlib import Path
from graphify.extract import collect_files, extract
from graphify.build import build_from_json
from graphify.cluster import cluster, score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from graphify.export import to_json, to_html

INPUT_PATH = "."

# Part A - AST extraction
detect = json.loads(Path("graphify-out/.graphify_detect.json").read_text())
code_files = []
for f in detect.get("files", {}).get("code", []):
    p = Path(f)
    if p.is_dir():
        code_files.extend(collect_files(p))
    else:
        code_files.append(p)

if code_files:
    print(f"Extracting AST from {len(code_files)} code files...")
    ast_result = extract(code_files)
    Path("graphify-out/.graphify_ast.json").write_text(json.dumps(ast_result, indent=2))
    print(f"AST: {len(ast_result['nodes'])} nodes, {len(ast_result['edges'])} edges")
else:
    ast_result = {"nodes": [], "edges": [], "input_tokens": 0, "output_tokens": 0}
    Path("graphify-out/.graphify_ast.json").write_text(json.dumps(ast_result, indent=2))
    print("No code files found")

# Since we have no docs/papers (AGENTS.md/CLAUDE.md are configs), skip semantic
# Create empty semantic
sem_result = {"nodes": [], "edges": [], "hyperedges": [], "input_tokens": 0, "output_tokens": 0}
Path("graphify-out/.graphify_semantic.json").write_text(json.dumps(sem_result, indent=2))

# Part C - Merge
ast = json.loads(Path("graphify-out/.graphify_ast.json").read_text())
sem = json.loads(Path("graphify-out/.graphify_semantic.json").read_text())

seen = {n["id"] for n in ast["nodes"]}
merged_nodes = list(ast["nodes"])
for n in sem["nodes"]:
    if n["id"] not in seen:
        merged_nodes.append(n)
        seen.add(n["id"])

merged_edges = ast["edges"] + sem["edges"]
merged_hyperedges = sem.get("hyperedges", [])
merged = {
    "nodes": merged_nodes,
    "edges": merged_edges,
    "hyperedges": merged_hyperedges,
    "input_tokens": sem.get("input_tokens", 0),
    "output_tokens": sem.get("output_tokens", 0),
}
Path("graphify-out/.graphify_extract.json").write_text(json.dumps(merged, indent=2))
print(f"Merged: {len(merged_nodes)} nodes, {len(merged_edges)} edges ({len(ast['nodes'])} AST + {len(sem['nodes'])} semantic)")

# Step 4 - Build graph, cluster, analyze
print("\nBuilding graph...")
extraction = json.loads(Path("graphify-out/.graphify_extract.json").read_text())
detection = json.loads(Path("graphify-out/.graphify_detect.json").read_text())

G = build_from_json(extraction)
print(f"Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")

if G.number_of_nodes() == 0:
    print("ERROR: Graph is empty")
    sys.exit(1)

communities = cluster(G)
cohesion = score_all(G, communities)
tokens = {"input": extraction.get("input_tokens", 0), "output": extraction.get("output_tokens", 0)}
gods = god_nodes(G)
surprises = surprising_connections(G, communities)
labels = {cid: "Comunidade " + str(cid) for cid in communities}
questions = suggest_questions(G, communities, labels)

report = generate(G, communities, cohesion, labels, gods, surprises, detection, tokens, INPUT_PATH, suggested_questions=questions)
Path("graphify-out/GRAPH_REPORT.md").write_text(report)
to_json(G, communities, "graphify-out/graph.json")

analysis = {
    "communities": {str(k): v for k, v in communities.items()},
    "cohesion": {str(k): v for k, v in cohesion.items()},
    "gods": gods,
    "surprises": surprises,
    "questions": questions,
}
Path("graphify-out/.graphify_analysis.json").write_text(json.dumps(analysis, indent=2))
print(f"Communities: {len(communities)}, Cohesion scores computed")

# Step 5 - Label communities (manually chosen based on analysis)
# Read the analysis to understand community contents
for cid, members in communities.items():
    node_labels = []
    for nid in members[:5]:
        if nid in G.nodes:
            node_labels.append(G.nodes[nid].get("label", nid))
    print(f"Community {cid}: {', '.join(node_labels)}")

# Regenerate with proper labels
labels_final = {}
for cid, members in communities.items():
    # Auto-label based on most connected node
    node_labels = []
    for nid in members:
        if nid in G.nodes:
            node_labels.append(G.nodes[nid].get("label", nid))
    
    # Simple heuristic labeling
    all_text = " ".join(node_labels).lower()
    if any(w in all_text for w in ["database", "db", "sql", "pdo", "mariadb"]):
        labels_final[cid] = "Banco de Dados"
    elif any(w in all_text for w in ["email", "smtp", "mail", "template"]):
        labels_final[cid] = "Sistema de Email"
    elif any(w in all_text for w in ["payment", "pagamento", "stripe", "mercadopago"]):
        labels_final[cid] = "Pagamentos"
    elif any(w in all_text for w in ["seo", "og", "twitter", "meta"]):
        labels_final[cid] = "SEO & Redes Sociais"
    elif any(w in all_text for w in ["visita", "visitor", "analytics", "kpi"]):
        labels_final[cid] = "Analytics & Visitas"
    elif any(w in all_text for w in ["auth", "token", "login", "senha"]):
        labels_final[cid] = "Autenticação"
    elif any(w in all_text for w in ["cep", "address", "endereco"]):
        labels_final[cid] = "Serviços Externos"
    else:
        labels_final[cid] = f"Componentes {cid}"

print(f"\nCommunity Labels:")
for cid, label in labels_final.items():
    print(f"  {cid}: {label}")

# Regenerate report with labels
questions_labeled = suggest_questions(G, communities, labels_final)
report = generate(G, communities, cohesion, labels_final, gods, surprises, detection, tokens, INPUT_PATH, suggested_questions=questions_labeled)
Path("graphify-out/GRAPH_REPORT.md").write_text(report)
Path("graphify-out/.graphify_labels.json").write_text(json.dumps({str(k): v for k, v in labels_final.items()}))
print("\nReport updated with community labels")

# Step 6 - Generate HTML visualization
print("\nGenerating HTML visualization...")
to_html(G, communities, "graphify-out/graph.html", community_labels=labels_final or None)
print("graph.html written")

# Step 9 - Save manifest and cost tracker
from graphify.detect import save_manifest
save_manifest(detect["files"])

extract = json.loads(Path("graphify-out/.graphify_extract.json").read_text())
input_tok = extract.get("input_tokens", 0)
output_tok = extract.get("output_tokens", 0)

cost_path = Path("graphify-out/cost.json")
cost = {"runs": [], "total_input_tokens": 0, "total_output_tokens": 0}
cost["runs"].append({
    "date": "2026-06-28",
    "input_tokens": input_tok,
    "output_tokens": output_tok,
    "files": detect.get("total_files", 0),
})
cost["total_input_tokens"] += input_tok
cost["total_output_tokens"] += output_tok
cost_path.write_text(json.dumps(cost, indent=2))

print(f"\nDone! This run: {input_tok:,} input tokens, {output_tok:,} output tokens")
print(f"Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges, {len(communities)} communities")
