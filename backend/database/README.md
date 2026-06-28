# Database Module

This module handles all database-related operations for the Thai Labour Law Chatbot, including schema management, Supabase client configuration, and data input/processing pipelines.

## 📁 Folder Structure

```
database/
├── __init__.py
├── schema.py                          # Pydantic models for database entities
├── schema.sql                         # SQL schema definitions
├── schema_supabase.sql               # Supabase-specific schema
├── supabase_client.py                # Supabase client initialization & utilities
└── input_process/                    # Data input & preprocessing pipeline
    ├── input.robot                   # Robot Framework script for scraping acts
    ├── preprocess.py                 # Text preprocessing & Thai text handling
    ├── tag.py                        # Tag definition & AI-powered tag generation
    ├── upload.py                     # Main upload script with embeddings
    ├── act/                          # Thai Labour Act documents
    ├── judgments/                    # Court judgment documents
    └── preprocess/                   # Preprocessed text outputs
```

## 🗄️ Core Components

### `schema.py`
Defines Pydantic data models for database entities:
- **ActSection** — Represents a section of a Thai Labour Act with:
  - Section metadata (id, act_id, book_id, group_id, super_id)
  - Section number and paragraph details
  - Processed text content
  - Cross-references and citations

### `supabase_client.py`
- Initializes Supabase PostgreSQL client
- Manages authentication and connection pooling
- Provides utility functions for database operations

### `schema.sql` & `schema_supabase.sql`
- Define table structures for acts, sections, judgments, tags, and relationships
- Support full-text search and vector embeddings

---

## 📥 Input Process Pipeline

The **input_process** folder handles the workflow for importing Thai labour law documents and court judgments into the database. This is a multi-stage ETL (Extract, Transform, Load) process.

### Pipeline Stages

```
1. Extract → 2. Preprocess → 3. Tag & Analyze → 4. Generate Embeddings → 5. Upload
```

---

## 🔄 Detailed Workflow

### 1. **Extract** — `input.robot`

**Purpose:** Automated web scraping of Thai labour acts from the Council of State website.

**Technology:** Robot Framework with Selenium

**Process:**
- Opens Thai labour act URLs from the Council of State database
- Extracts article/section text from HTML elements
- Saves raw text to `act/act_*.txt` files

**Output Files:**
- `act_พระราชบัญญัติคุ้มครองแรงงาน พ.ศ. 2541.txt` — Labour Protection Act
- `act_พระราชบัญญัติเงินทดแทน พ.ศ. 2537.txt` — Compensation Act
- `act_พระราชบัญญัติประกันสังคม พ.ศ. 2533.txt` — Social Security Act
- `act_พระราชบัญญัติความปลอดภัย อาชีวอนามัย และสภาพแวดล้อมในการทำงาน พ.ศ. 2554.txt` — Workplace Safety Act

**How to Run:**
```bash
cd backend/database/input_process
robot input.robot
```

---

### 2. **Preprocess** — `preprocess.py`

**Purpose:** Clean and normalize Thai text for further processing.

**Key Functions:**
- **Text Cleaning**
  - Converts Thai numerals (๑๒๓...) to Arabic numerals (123...)
  - Removes extra whitespace and standardizes text formatting
  
- **Reference Detection** (Advanced)
  - Identifies cross-references to other sections like:
    - "มาตรา 41" (Section 41)
    - "มาตรา 100/1" (Section 100, subsection 1)
    - "มาตรา 47 ทวิ" (Section 47 with ordinal suffix)
    - "มาตรา 50 วรรค 2" (Section 50, paragraph 2)
    - "วรรค 3" (Paragraph 3)
    - "(ก)" (Item reference)

- **Thai Text Recognition**
  - Maps Thai word numbers (หนึ่ง, สอง, สาม, etc.) to digits
  - Handles Thai ordinal suffixes (ทวิ, ตรี, จัตวา, เบญจ, etc.)

**Input:** Raw act text files from `act/`

**Output:** Preprocessed files saved to `preprocess/preprocess_*.txt`

**Key Classes/Functions:**
```python
clean_text(text)                    # Convert Thai numerals & normalize
find_references_in_text(text, key)  # Extract section references
```

---

### 3. **Tag & Analyze** — `tag.py`

**Purpose:** Generate AI-powered tag descriptions for labour law concepts using LLM.

**Process:**
1. Defines core labour law tags (45+ tags) including:
   - Compensation terms: "เงินทดแทน", "ค่ารักษา", "ค่าฟื้นฟู", "ค่าทำศพ"
   - Employee relations: "นายจ้าง", "ลูกจ้าง", "การจ้างเหมาช่วง"
   - Benefits: "เงินชราภาพ", "สวัสดิการ", "สิทธิประโยชน์"
   - Safety/Health: "ความปลอดภัย", "อาชีวอนามัย", "สภาพแวดล้อม"
   - And many more...

2. Uses Typhoon LLM (via OpenAI-compatible API) to generate detailed Thai descriptions
3. Inserts tags into database `tags` table with descriptions

**API Used:** OpenAI-compatible endpoint (Typhoon v2.1)

**Output:** Database entries in `tags` table with:
- Tag name
- AI-generated description in Thai

**Run:**
```bash
cd backend/database/input_process
python tag.py
```

---

### 4. **Generate Embeddings & Upload** — `upload.py`

**Purpose:** The main data pipeline that processes acts/judgments and uploads them with AI-generated embeddings and smart tagging.

**Key Technologies:**
- **Embedding Model:** BAAI/bge-m3 (BGE-M3) — multilingual 1024-dim embeddings
- **LLM:** Typhoon v2.1 for text analysis and tag classification
- **Database:** Supabase (PostgreSQL) with vector similarity search

**Main Functions:**

#### `get_sturctured_params(text)`
Robustly parses structured data (JSON/Python literals) from text, handling:
- JSON format
- Python dict literals
- Nested structures
- Common formatting errors

#### `text_with_cross_references(text, self_params, references)`
Enriches document text with clickable/linked references to related sections. For example, when a section references "มาตรา 41", it embeds link metadata.

#### Judgment Upload Workflow
For each judgment document in `judgments/text/`:

1. **Parse judgment structure:**
   - Extract case number from structured format
   - Separate summary vs. detail sections
   - Split by "ตัดสินเกี่ยวกับปัญหาข้อกฎหมาย" (legal issue verdict)

2. **Generate embeddings:**
   - Encode summary using BGE-M3 model
   - Dense vectors (1024 dimensions) for semantic similarity search

3. **Generate tags:**
   - Use LLM to analyze judgment text
   - Classify relevant tags (compensation, safety, etc.)
   - Link judgment to tagged concepts

4. **Upload to database:**
   - Insert into `judgments` table with:
     - Title, case number
     - Summary + embedding
     - Full detail text
     - Relevant tags

**Run:**
```bash
cd backend/database/input_process
python upload.py
```

---

## 📊 Data Models (From `schema.py`)

### ActSection Model
```python
class ActSection(BaseModel):
    id: int
    act_id: int
    book_id: int | None          # Book grouping (for multi-book acts)
    group_id: int | None         # Section grouping
    super_id: int | None         # Parent section (for sub-sections)
    section_number: int          # Main section number
    sub_section: str | None      # Sub-section identifier (e.g., "100/1")
    paragraph_number: int        # Paragraph number within section
    item_order: str | None       # Item reference (e.g., "(ก)", "(1)")
    text_processed: str          # Cleaned Thai text
    cross_references: dict | None # Links to other sections
    external_citations: dict | None # Links to external documents
```

---

## 🛠️ Setup & Configuration

### Prerequisites
1. Python 3.9+
2. Supabase account & database credentials
3. OpenAI API key (or compatible LLM endpoint like Typhoon)
4. Robot Framework (for web scraping)
5. Selenium WebDriver for Chrome

### Environment Variables (`.env`)
```
SUPABASE_URL=https://your-supabase-instance.supabase.co
SUPABASE_KEY=your-anon-key
OPENAI_API_KEY=your-api-key
```

### Installation
```bash
# Install Python dependencies
pip install -r requirements.txt

# Key packages:
# - supabase (Supabase client)
# - FlagEmbedding (BGE-M3 embeddings)
# - openai (LLM API)
# - pydantic (Data validation)
# - python-dotenv (Environment config)
# - robotframework
# - selenium
```

### Running the Full Pipeline

**Step 1: Extract acts (one-time setup)**
```bash
cd backend/database/input_process
robot input.robot
```

**Step 2: Generate tag definitions**
```bash
python tag.py
```

**Step 3: Upload judgments and acts with embeddings**
```bash
python upload.py
```

---

## 📝 Input File Formats

### Acts (`act/act_*.txt`)
Raw text from web scraping, organized as:
```
พระราชบัญญัติ... [Act title]

มาตรา 1 [Section 1 text]
...
มาตรา 2 [Section 2 text]
...
```

### Judgments (`judgments/text/*.txt`)
Court judgments with structured sections:
```
[Case name]
[Summary paragraphs]
...
ตัดสินเกี่ยวกับปัญหาข้อกฎหมาย [legal issue verdict]
[Case number line]
[Detailed reasoning/judgment]
```

Example: `1211-2564-2541.txt`, `3100-2563.txt`

---

## 🔍 Database Tables (Created by Schema)

The pipeline populates the following tables:

| Table | Purpose |
|-------|---------|
| `acts` | Thai labour act metadata |
| `sections` | Individual sections with embeddings |
| `judgments` | Court judgments with embeddings |
| `tags` | Labour law concept tags with descriptions |
| `judgment_tags` | Junction table linking judgments to tags |
| `section_references` | Cross-reference relationships between sections |

---

## ⚙️ Troubleshooting

### Web Scraping Issues (`input.robot`)
- Ensure Selenium WebDriver for Chrome is up-to-date
- Check that URLs in `input.robot` are still valid
- Browser must be Chrome

### Embedding Generation Slow
- BGE-M3 model loads ~1GB into memory
- Use GPU acceleration if available (CUDA)
- Process in batches to manage memory

### LLM API Rate Limits
- Tag generation and judgment tagging calls are rate-limited
- Add retry logic if hitting quota
- Consider batching tag.py calls

### Supabase Connection Errors
- Verify `.env` credentials
- Check IP allowlist in Supabase console
- Ensure database tables exist (run schema migrations first)

---

## 📚 Related Documentation

- [Backend README](../README.md) — Overall backend architecture
- [Supabase Schema](schema_supabase.sql) — Full database schema
- [Data Models](schema.py) — Pydantic validation models

---

## 🚀 Future Enhancements

- [ ] Incremental updates (only process new/modified documents)
- [ ] Parallel embedding generation for large batches
- [ ] Automatic reference resolution between sections
- [ ] Multi-language support (English translations)
- [ ] Document versioning & change tracking
- [ ] Real-time document indexing pipeline

