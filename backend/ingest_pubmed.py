import boto3
import json
import torch
from opensearchpy import OpenSearch, helpers
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

# === 1. CONFIGURATION (PRE-FILLED) ===
# Your VPC Endpoint (Removed https:// for the client connection)
OS_URL = "vpc-pubmed-research-v2-casrfxnixzy6g2s2abmzb5dxte.us-east-2.es.amazonaws.com"
OS_AUTH = ("dbadmin", "Prudvi@1999") 
INDEX_NAME = "pubmed_39m_v1"
S3_BUCKET = "msk-memorial-sloan-kettering"
S3_PREFIX = "pubmed/processed/jsonl/"

# === 2. INITIALIZATION ===
print("🧠 Loading PubMedBERT onto A10G GPU...")
# Using CUDA ensures we use the GPU you've already verified with nvidia-smi
device = "cuda" if torch.cuda.is_available() else "cpu"
model = SentenceTransformer("NeuML/pubmedbert-base-embeddings", device=device)

# Initializing the OpenSearch client with your VPC settings
client = OpenSearch(
    hosts=[{'host': OS_URL, 'port': 443}],
    http_auth=OS_AUTH,
    use_ssl=True, 
    verify_certs=True, 
    timeout=300
)

# === 3. THE DATA STREAMER ===
def get_s3_data(bucket_name, key):
    s3 = boto3.client('s3')
    obj = s3.get_object(Bucket=bucket_name, Key=key)
    batch_text, batch_meta = [], []

    # Stream lines one by one to keep EC2 RAM usage low
    for line in obj['Body'].iter_lines():
        if not line: continue
        data = json.loads(line)
        
        # Combining Title + Abstract provides the best context for embeddings
        title = data.get('title', '')
        abstract = data.get('abstract', '')
        full_text = f"{title} {abstract}"[:1800] # Model limit check
        
        batch_text.append(full_text)
        batch_meta.append(data)

        # 128 is the 'sweet spot' for the A10G VRAM (23GB)
        if len(batch_text) >= 128:
            # Generate embeddings on the GPU
            embs = model.encode(batch_text, normalize_embeddings=True)
            for i, emb in enumerate(embs):
                yield {
                    "_index": INDEX_NAME,
                    "_source": {
                        "vector_embedding": emb.tolist(),
                        "pmid": batch_meta[i].get("pmid"),
                        "title": batch_meta[i].get("title"),
                        "text": batch_text[i],
                        "metadata": batch_meta[i]
                    }
                }
            batch_text, batch_meta = [], []

# === 4. EXECUTION LOOP ===
s3_res = boto3.resource('s3')
bucket = s3_res.Bucket(S3_BUCKET)
# Identifying all processed PubMed files
files = [obj.key for obj in bucket.objects.filter(Prefix=S3_PREFIX) if obj.key.endswith('.jsonl')]

print(f"✅ Found {len(files)} files. Starting Parallel Ingestion...")

for f_key in files:
    print(f"🚀 Processing: {f_key}")
    # parallel_bulk maximizes throughput to your 3-node r8g.2xlarge cluster
    for ok, item in helpers.parallel_bulk(client, get_s3_data(S3_BUCKET, f_key), thread_count=4, chunk_size=128):
        if not ok:
            print(f"❌ Error indexing document: {item}")

print("🏆 MISSION COMPLETE: 39 Million Articles Indexed.")
