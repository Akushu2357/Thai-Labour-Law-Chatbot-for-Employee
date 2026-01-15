import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()

llm = ChatOpenAI(
    base_url=os.getenv("TYPHOON_BASE_URL"), # https://api.opentyphoon.ai/v1
    api_key=os.getenv("TYPHOON_API_KEY"),
    model="typhoon-v2.5-30b-a3b-instruct",      # โมเดลตัวเก่งสุด
    temperature=0.3,                         # ความคิดสร้างสรรค์ต่ำหน่อย เพื่อความแม่นยำทางกฎหมาย
    max_tokens=4096                          # เพิ่มพื้นที่ให้ AI ตอบยาวๆ ได้ ไม่ error
)