// 全局变量存储上传的图片文件
let uploadedFiles = [];

// DOM 元素
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const imagePreview = document.getElementById('image-preview');
const promptInput = document.getElementById('prompt');
const sendBtn = document.getElementById('send-btn');
const resultContent = document.getElementById('result-content');

// 初始化事件监听器
function initEventListeners() {
    // 点击上传区域触发文件选择
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // 文件选择事件
    fileInput.addEventListener('change', handleFileSelect);

    // 拖拽事件
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    // 粘贴事件
    document.addEventListener('paste', handlePaste);

    // 发送按钮事件
    sendBtn.addEventListener('click', handleSend);

    // 回车键发送
    promptInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });
}

// 处理文件选择
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    addFiles(files);
}

// 处理拖拽悬停
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

// 处理拖拽离开
function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

// 处理拖拽放下
function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
        addFiles(files);
    }
}

// 处理粘贴事件
function handlePaste(e) {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter(item => item.type.startsWith('image/'));
    
    if (imageItems.length > 0) {
        e.preventDefault();
        const files = imageItems.map(item => item.getAsFile()).filter(file => file);
        addFiles(files);
    }
}

// 添加文件到列表
function addFiles(files) {
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            uploadedFiles.push(file);
            createImagePreview(file);
        }
    });
    
    updateSendButtonState();
}

// 创建图片预览
function createImagePreview(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        
        const img = document.createElement('img');
        img.src = e.target.result;
        img.alt = file.name;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = () => removeImage(file, imageItem);
        
        imageItem.appendChild(img);
        imageItem.appendChild(removeBtn);
        imagePreview.appendChild(imageItem);
    };
    
    reader.readAsDataURL(file);
}

// 移除图片
function removeImage(file, imageItem) {
    const index = uploadedFiles.indexOf(file);
    if (index > -1) {
        uploadedFiles.splice(index, 1);
    }
    
    imageItem.remove();
    updateSendButtonState();
}

// 更新发送按钮状态
function updateSendButtonState() {
    const hasPrompt = promptInput.value.trim().length > 0;
    
    // 只要有提示词就可以发送（支持 Text-to-Image 模式）
    sendBtn.disabled = !hasPrompt;
}

// 处理发送
async function handleSend() {
    if (!promptInput.value.trim()) {
        return;
    }
    
    const prompt = promptInput.value.trim();
    
    // 显示用户发送的内容
    displayUserMessage(prompt, uploadedFiles);
    
    // 禁用发送按钮
    sendBtn.disabled = true;
    sendBtn.textContent = '发送中...';
    
    try {
        const formData = new FormData();
        formData.append('prompt', prompt);
        
        // 只有当有图片时才添加图片到表单
        if (uploadedFiles.length > 0) {
            uploadedFiles.forEach((file, index) => {
                formData.append('images', file);
            });
        }
        
        const response = await fetch('/generate', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            displayAIResponse(result);
            // 清空输入和上传的文件
            clearInputs();
        } else {
            displayError(result.error || '请求失败');
        }
    } catch (error) {
        displayError('网络错误: ' + error.message);
    } finally {
        // 恢复发送按钮
        sendBtn.disabled = false;
        sendBtn.textContent = '发送';
        updateSendButtonState();
    }
}

// 显示用户消息
function displayUserMessage(prompt, files) {
    const userMessage = document.createElement('div');
    userMessage.className = 'user-message';
    
    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = '您的提示词:';
    
    const promptText = document.createElement('div');
    promptText.textContent = prompt;
    
    userMessage.appendChild(label);
    userMessage.appendChild(promptText);
    
    if (files.length > 0) {
        const imageInfo = document.createElement('div');
        imageInfo.style.marginTop = '8px';
        imageInfo.style.fontSize = '14px';
        imageInfo.style.color = '#666';
        imageInfo.textContent = `已上传 ${files.length} 张图片`;
        userMessage.appendChild(imageInfo);
    }
    
    resultContent.appendChild(userMessage);
    resultContent.scrollTop = resultContent.scrollHeight;
}

// 显示AI响应
function displayAIResponse(result) {
    const aiResponse = document.createElement('div');
    aiResponse.className = 'ai-response';
    
    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = 'AI 响应:';
    
    const content = document.createElement('div');
    
    // 显示生成的文本
    if (result.generated_text && result.generated_text.trim()) {
        const textDiv = document.createElement('div');
        textDiv.style.marginBottom = '10px';
        textDiv.textContent = result.generated_text;
        content.appendChild(textDiv);
    }
    
    // 显示生成的图片
    if (result.generated_images && result.generated_images.length > 0) {
        const imagesContainer = document.createElement('div');
        imagesContainer.style.display = 'flex';
        imagesContainer.style.flexWrap = 'wrap';
        imagesContainer.style.gap = '10px';
        
        result.generated_images.forEach((imageData, index) => {
            const img = document.createElement('img');
            img.src = `data:${imageData.mime_type};base64,${imageData.data}`;
            img.alt = `Generated Image ${index + 1}`;
            img.style.maxWidth = '300px';
            img.style.maxHeight = '300px';
            img.style.borderRadius = '8px';
            img.style.cursor = 'pointer';
            
            // 点击图片放大查看
            img.onclick = () => {
                const newWindow = window.open();
                newWindow.document.write(`<img src="${img.src}" style="max-width: 100%; max-height: 100vh;">`);
            };
            
            imagesContainer.appendChild(img);
        });
        
        content.appendChild(imagesContainer);
    }
    
    // 如果既没有文本也没有图片
    if ((!result.generated_text || !result.generated_text.trim()) && 
        (!result.generated_images || result.generated_images.length === 0)) {
        content.textContent = '没有生成内容';
    }
    
    aiResponse.appendChild(label);
    aiResponse.appendChild(content);
    resultContent.appendChild(aiResponse);
    resultContent.scrollTop = resultContent.scrollHeight;
}

// 显示错误
function displayError(errorMessage) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'ai-response';
    errorDiv.style.borderLeftColor = '#f44336';
    errorDiv.style.backgroundColor = '#ffebee';
    
    const label = document.createElement('div');
    label.className = 'label';
    label.style.color = '#d32f2f';
    label.textContent = '错误:';
    
    const content = document.createElement('div');
    content.textContent = errorMessage;
    
    errorDiv.appendChild(label);
    errorDiv.appendChild(content);
    resultContent.appendChild(errorDiv);
    resultContent.scrollTop = resultContent.scrollHeight;
}

// 清空输入和文件
function clearInputs() {
    promptInput.value = '';
    uploadedFiles = [];
    imagePreview.innerHTML = '';
    updateSendButtonState();
}

// 监听输入框变化
promptInput.addEventListener('input', updateSendButtonState);

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    updateSendButtonState();
});

// 防止页面默认的拖拽行为
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());