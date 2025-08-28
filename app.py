import os
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
    for image_file in image_files:
        if image_file.filename:  # 确保文件不为空
            try:
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
        result = {'generated_text': '', 'generated_images': []}
        
        for part in response.candidates[0].content.parts:
            if part.text is not None:
                result['generated_text'] += part.text
            elif part.inline_data is not None:
                # 将生成的图片转换为 base64 编码
                image_data = base64.b64encode(part.inline_data.data).decode('utf-8')
                result['generated_images'].append({
                    'data': image_data,
                    'mime_type': part.inline_data.mime_type
                })
        
        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)