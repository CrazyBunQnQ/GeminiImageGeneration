import os
import uuid
import datetime
import requests
import json
from google import genai
from google.genai import types
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from PIL import Image
import io
import base64

load_dotenv()

app = Flask(__name__)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# OpenAI API 配置
OPENAI_API_URL = os.getenv("OPENAI_API_URL", "https://api.openai.com/v1/chat/completions")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")

# 创建临时目录用于保存生成的图片
TEMP_DIR = os.path.join(os.getcwd(), 'temp_images')
if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    if 'prompt' not in request.form:
        return jsonify({'error': 'No prompt provided'}), 400
    
    prompt = request.form['prompt']
    
    # 获取上传的图片文件（可选）
    image_files = request.files.getlist('images') if 'images' in request.files else []
    
    # 处理上传的图片
    images = []
    uploaded_images_data = []  # 保存上传图片的base64数据
    for image_file in image_files:
        if image_file.filename:  # 确保文件不为空
            try:
                # 读取图片数据
                image_data = image_file.read()
                image_file.stream.seek(0)  # 重置流位置
                
                # 保存上传图片的base64数据
                uploaded_images_data.append({
                    'data': base64.b64encode(image_data).decode('utf-8'),
                    'filename': image_file.filename,
                    'mime_type': image_file.content_type or 'image/jpeg'
                })
                
                # 创建PIL图片对象用于API调用
                img = Image.open(image_file.stream)
                images.append(img)
            except Exception as e:
                return jsonify({'error': f'Invalid image file: {e}'}), 400

    try:
        # 根据是否有图片输入决定内容格式
        if len(images) == 0:
            # Text-to-Image: 纯文本生成图片
            contents = [prompt]
        elif len(images) == 1:
            # Image + Text-to-Image: 单图+文本生成图片
            contents = [images[0], prompt]
        else:
            # Multi-Image to Image: 多图融合生成图片
            # 按照示例格式：先传入所有图片，最后传入文本提示
            contents = images + [prompt]
        
        # 使用 gemini-2.5-flash-image-preview 模型生成图片
        response = client.models.generate_content(
            model="gemini-2.5-flash-image-preview",
            contents=contents,
        )
        
        # 处理响应，提取文本和图片
        result = {
            'generated_text': '', 
            'generated_images': [],
            'original_prompt': prompt,  # 保留原始prompt
            'uploaded_images': uploaded_images_data  # 保留上传的图片
        }
        
        for part in response.candidates[0].content.parts:
            if part.text is not None:
                result['generated_text'] += part.text
            elif part.inline_data is not None:
                # 生成唯一文件名
                timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
                unique_id = str(uuid.uuid4())[:8]
                filename = f'generated_{timestamp}_{unique_id}.png'
                filepath = os.path.join(TEMP_DIR, filename)
                
                # 保存生成的图片到临时目录
                try:
                    with open(filepath, 'wb') as f:
                        f.write(part.inline_data.data)
                except Exception as save_error:
                    print(f'Failed to save image: {save_error}')
                
                # 将生成的图片转换为 base64 编码
                image_data = base64.b64encode(part.inline_data.data).decode('utf-8')
                result['generated_images'].append({
                    'data': image_data,
                    'mime_type': part.inline_data.mime_type,
                    'filename': filename,  # 添加文件名信息
                    'filepath': filepath   # 添加文件路径信息
                })
        
        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/optimize_prompt', methods=['POST'])
def optimize_prompt():
    if 'prompt' not in request.json:
        return jsonify({'error': 'No prompt provided'}), 400
    
    original_prompt = request.json['prompt']
    
    if not OPENAI_API_KEY:
        return jsonify({'error': 'OpenAI API key not configured'}), 500
    
    try:
        # 构建优化提示词的请求
        optimization_request = {
            "model": OPENAI_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": "在不改变原始提示词的基础上，在后面简单补充一些视觉细节、风格描述、构图建议等。请直接返回优化后的提示词，不要添加额外的解释。"
                },
                {
                    "role": "user",
                    "content": f"请优化这个图像生成提示词：{original_prompt}"
                }
            ],
            "max_tokens": 500,
            "temperature": 0.7
        }
        
        # 发送请求到OpenAI API
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(OPENAI_API_URL, headers=headers, json=optimization_request, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            optimized_prompt = result['choices'][0]['message']['content'].strip()
            return jsonify({
                'original_prompt': original_prompt,
                'optimized_prompt': optimized_prompt
            })
        else:
            return jsonify({'error': f'OpenAI API error: {response.status_code} - {response.text}'}), 500
            
    except requests.exceptions.Timeout:
        return jsonify({'error': 'Request timeout. Please try again.'}), 500
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Request failed: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500


if __name__ == '__main__':
    app.run(debug=True)