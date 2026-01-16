import json
# LangChain Imports
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from fastapi.responses import StreamingResponse

from llm.chatbot_structure import ChatRequest, ChatResponse
from llm.chatbot_functions import retrieve_data, rewrite_question, preprocess_thai_text
from llm.chatbot_prompts import chat_prompt_template

from llm.chatbot_llm import get_llm

def chat_service(request: ChatRequest) -> ChatResponse:
    """
    ฟังก์ชันหลักของ Chatbot Service
    รับคำถาม + ประวัติการคุย แล้วส่งกลับคำตอบ + แหล่งอ้างอิง
    """
    # --- [NEW] Step 0: Text Preprocessing (PyThaiNLP) ---
    # ตรงตาม Proposal เรื่องการทำความสะอาดและจัดการภาษาธรรมชาติ [cite: 45, 201]
    processed_question = preprocess_thai_text(request.question)
    print(f"    Cleaned Input: {processed_question}") # เช็ค Log ดูว่ามันตัดคำให้ไหม

    # Step 1: Context Awareness (Query Rewriting)
    # เช็คประวัติ แล้วเขียนคำถามใหม่ให้ชัดเจน
    search_query = rewrite_question(request.question, request.history)
    print(f"    Search Query: {search_query}")
    
    # Step 2: Retrieval (ค้นหาข้อมูลจากคำถามใหม่)
    retrieved_docs = retrieve_data(search_query)
    print(f"    Retrieved {len(retrieved_docs)} documents from database.")
    
    # ถ้าหาไม่เจอเลย
    if not retrieved_docs:
        return ChatResponse(answer="ขออภัยครับ ไม่พบข้อมูลกฎหมายที่เกี่ยวข้องกับเรื่องนี้ในฐานข้อมูล", sources=[])

    # Step 3: Prepare Context (เตรียมข้อมูลใส่ Prompt)
    # --- Step 3: Prepare Context (เตรียมข้อมูลใส่ Prompt) ---
    context_text = ""
    sources_set = set() # ใช้ set เพื่อกันซ้ำ
    
    for doc in retrieved_docs:
        sec_num = doc.get('section_number', '?')
        text = doc.get('text_original', '')
        # เก็บเนื้อหาไว้ตอบ (ยังคงเอามาทั้งหมดเพื่อให้ AI อ่าน)
        context_text += f"- มาตรา {sec_num}: {text}\n\n"
        # เก็บเลขมาตราลง set (ถ้ามีอยู่แล้ว มันจะไม่เพิ่มซ้ำ)
        sources_set.add(f"มาตรา {sec_num}")
    # แปลงกลับเป็น list และเรียงลำดับให้สวยงาม (เช่น มาตรา 9, 76, 118)
    # ใช้ lambda เพื่อดึงเลขมาเรียง (ป้องกันการเรียงแบบ string เช่น 1, 10, 2)
    try:
        sources_list = sorted(list(sources_set), key=lambda x: int(x.split()[-1]) if x.split()[-1].isdigit() else 9999)
    except:
        sources_list = sorted(list(sources_set)) # ถ้าเรียงไม่ได้ก็เรียงตามตัวอักษรปกติ
    
    prompt = PromptTemplate(template=chat_prompt_template(), input_variables=["context", "question"])
    llm = get_llm()  # Lazy load LLM
    chain = prompt | llm | StrOutputParser()
    
    # ส่ง search_query (ที่แก้แล้ว) + context ไปให้ AI
    ai_answer = chain.invoke({"context": context_text, "question": search_query})
    
    # Step 5: Return Result (ส่งคำตอบ + แหล่งอ้างอิงกลับไป)
    return ChatResponse(answer=ai_answer, sources=sources_list)

def chat_stream_service(request: ChatRequest) -> StreamingResponse:
    # Step 1: Preprocessing & Rewriting (เหมือนเดิม)
    processed_question = preprocess_thai_text(request.question)
    search_query = rewrite_question(processed_question, request.history)
    print(f"    Search Query: {search_query}")
    
    # Step 2: Retrieval (ค้นหาข้อมูล)
    retrieved_docs = retrieve_data(search_query)
    print(f"    Retrieved {len(retrieved_docs)} documents from database.")

    # เตรียม Context และ Sources
    context_text = ""
    sources_set = set()
    
    # ถ้าหาข้อมูลไม่เจอเลย
    if not retrieved_docs:
        async def empty_generator():
            yield json.dumps({
                "type": "error", 
                "message": "ขออภัยครับ ไม่พบข้อมูลกฎหมายที่เกี่ยวข้องกับเรื่องนี้"
            }) + "\n"
        return StreamingResponse(empty_generator(), media_type="application/x-ndjson")

    # จัดการข้อมูลที่เจอ (Context Building)
    for doc in retrieved_docs:
        sec_num = doc.get('section_number', '?')
        text = doc.get('text_original', '')
        context_text += f"- มาตรา {sec_num}: {text}\n\n"
        sources_set.add(f"มาตรา {sec_num}")
    
    # เรียงลำดับ Sources ให้สวยงาม
    try:
        sources_list = sorted(list(sources_set), key=lambda x: int(x.split()[-1]) if x.split()[-1].isdigit() else 9999)
    except:
        sources_list = sorted(list(sources_set))

    # --- Step 3: Generator Function (หัวใจของ Streaming) ---
    async def event_generator():
        # 3.1 ส่ง "รายการมาตรา" (Sources) ไปให้ Frontend ก่อนเลย (เร็วมาก)
        yield json.dumps({
            "type": "sources", 
            "data": sources_list
        }) + "\n"

        prompt = PromptTemplate(template=chat_prompt_template(), input_variables=["context", "question"])
        llm = get_llm()  # Lazy load LLM
        chain = prompt | llm | StrOutputParser()

        # 3.3 สั่ง AI ตอบแบบ Stream (ทีละคำ)
        # ใช้ .astream แทน .invoke เพื่อรับข้อมูลทีละชิ้น
        async for chunk in chain.astream({"context": context_text, "question": search_query}):
            # ส่งเนื้อหาทีละนิดไปให้ Frontend
            yield json.dumps({
                "type": "content", 
                "data": chunk
            }) + "\n"

    # ส่งคืนเป็น StreamingResponse
    return StreamingResponse(event_generator(), media_type="application/x-ndjson")