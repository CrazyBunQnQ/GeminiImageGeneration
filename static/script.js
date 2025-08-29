// 全局变量存储上传的图片文件
let uploadedFiles = [];

// DOM 元素
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const imagePreview = document.getElementById('image-preview');
const promptInput = document.getElementById('prompt');
const sendBtn = document.getElementById('send-btn');
const optimizeBtn = document.getElementById('optimize-btn');
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

    // 优化按钮事件
    optimizeBtn.addEventListener('click', handleOptimize);

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
    
    // 优化按钮只有在有提示词时才可用
    optimizeBtn.disabled = !hasPrompt;
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
    
    // 显示原始提示词
    if (result.original_prompt) {
        const promptSection = document.createElement('div');
        promptSection.style.marginBottom = '15px';
        promptSection.style.padding = '10px';
        promptSection.style.backgroundColor = '#f5f5f5';
        promptSection.style.borderRadius = '6px';
        promptSection.style.fontSize = '14px';
        
        const promptLabel = document.createElement('div');
        promptLabel.style.fontWeight = 'bold';
        promptLabel.style.marginBottom = '5px';
        promptLabel.style.color = '#666';
        promptLabel.textContent = '原始提示词:';
        
        const promptText = document.createElement('div');
        promptText.textContent = result.original_prompt;
        
        promptSection.appendChild(promptLabel);
        promptSection.appendChild(promptText);
        content.appendChild(promptSection);
    }
    
    // 显示上传的图片
    if (result.uploaded_images && result.uploaded_images.length > 0) {
        const uploadedSection = document.createElement('div');
        uploadedSection.style.marginBottom = '15px';
        
        const uploadedLabel = document.createElement('div');
        uploadedLabel.style.fontWeight = 'bold';
        uploadedLabel.style.marginBottom = '8px';
        uploadedLabel.style.color = '#666';
        uploadedLabel.textContent = `上传的图片 (${result.uploaded_images.length}张):`;
        
        const uploadedContainer = document.createElement('div');
        uploadedContainer.style.display = 'flex';
        uploadedContainer.style.flexWrap = 'wrap';
        uploadedContainer.style.gap = '8px';
        
        result.uploaded_images.forEach((imageData, index) => {
            const img = document.createElement('img');
            img.src = `data:${imageData.mime_type};base64,${imageData.data}`;
            img.alt = imageData.filename || `Uploaded Image ${index + 1}`;
            img.style.maxWidth = '120px';
            img.style.maxHeight = '120px';
            img.style.borderRadius = '6px';
            img.style.cursor = 'pointer';
            img.style.border = '2px solid #ddd';
            
            // 点击图片放大查看
            img.onclick = () => {
                const newWindow = window.open();
                newWindow.document.write(`<img src="${img.src}" style="max-width: 100%; max-height: 100vh;">`);
            };
            
            uploadedContainer.appendChild(img);
        });
        
        uploadedSection.appendChild(uploadedLabel);
        uploadedSection.appendChild(uploadedContainer);
        content.appendChild(uploadedSection);
    }
    
    // 显示生成的文本
    if (result.generated_text && result.generated_text.trim()) {
        const textSection = document.createElement('div');
        textSection.style.marginBottom = '15px';
        
        const textLabel = document.createElement('div');
        textLabel.style.fontWeight = 'bold';
        textLabel.style.marginBottom = '8px';
        textLabel.style.color = '#666';
        textLabel.textContent = '生成的文本:';
        
        const textDiv = document.createElement('div');
        textDiv.style.padding = '10px';
        textDiv.style.backgroundColor = '#f9f9f9';
        textDiv.style.borderRadius = '6px';
        textDiv.textContent = result.generated_text;
        
        textSection.appendChild(textLabel);
        textSection.appendChild(textDiv);
        content.appendChild(textSection);
    }
    
    // 显示生成的图片
    if (result.generated_images && result.generated_images.length > 0) {
        const generatedSection = document.createElement('div');
        
        const generatedLabel = document.createElement('div');
        generatedLabel.style.fontWeight = 'bold';
        generatedLabel.style.marginBottom = '8px';
        generatedLabel.style.color = '#666';
        generatedLabel.textContent = `生成的图片 (${result.generated_images.length}张):`;
        
        const imagesContainer = document.createElement('div');
        imagesContainer.style.display = 'flex';
        imagesContainer.style.flexDirection = 'column';
        imagesContainer.style.gap = '15px';
        
        result.generated_images.forEach((imageData, index) => {
            const imageWrapper = document.createElement('div');
            imageWrapper.style.border = '1px solid #ddd';
            imageWrapper.style.borderRadius = '8px';
            imageWrapper.style.padding = '10px';
            imageWrapper.style.backgroundColor = '#fff';
            
            const img = document.createElement('img');
            img.src = `data:${imageData.mime_type};base64,${imageData.data}`;
            img.alt = `Generated Image ${index + 1}`;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.borderRadius = '6px';
            img.style.cursor = 'pointer';
            img.style.display = 'block';
            img.style.marginBottom = '10px';
            
            // 点击图片放大查看
            img.onclick = () => {
                const newWindow = window.open();
                newWindow.document.write(`<img src="${img.src}" style="max-width: 100%; max-height: 100vh;">`);
            };
            
            // 创建操作按钮容器
            const buttonContainer = document.createElement('div');
            buttonContainer.style.display = 'flex';
            buttonContainer.style.gap = '10px';
            buttonContainer.style.justifyContent = 'center';
            
            // 复制图片按钮
            const copyBtn = document.createElement('button');
            copyBtn.className = 'action-btn copy-btn';
            copyBtn.textContent = '复制图片';
            copyBtn.onclick = () => copyImageToClipboard(imageData);
            
            // 下载图片按钮
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'action-btn download-btn';
            downloadBtn.textContent = '下载图片';
            downloadBtn.onclick = () => downloadImage(imageData, index);
            
            buttonContainer.appendChild(copyBtn);
            buttonContainer.appendChild(downloadBtn);
            
            imageWrapper.appendChild(img);
            imageWrapper.appendChild(buttonContainer);
            imagesContainer.appendChild(imageWrapper);
        });
        
        generatedSection.appendChild(generatedLabel);
        generatedSection.appendChild(imagesContainer);
        content.appendChild(generatedSection);
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

// 处理提示词优化
async function handleOptimize() {
    const prompt = promptInput.value.trim();
    if (!prompt) {
        return;
    }
    
    // 禁用优化按钮
    optimizeBtn.disabled = true;
    optimizeBtn.textContent = '优化中...';
    
    try {
        const response = await fetch('/optimize_prompt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: prompt })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // 将优化后的提示词填入输入框
            promptInput.value = result.optimized_prompt;
            
            // 显示优化结果
            displayOptimizationResult(result.original_prompt, result.optimized_prompt);
            
            showToast('提示词优化成功');
        } else {
            displayError(result.error || '优化失败');
            showToast('提示词优化失败', 'error');
        }
    } catch (error) {
        displayError('网络错误: ' + error.message);
        showToast('网络错误，请重试', 'error');
    } finally {
        // 恢复优化按钮
        optimizeBtn.disabled = false;
        optimizeBtn.textContent = '优化提示词';
        updateSendButtonState();
    }
}

// 显示优化结果
function displayOptimizationResult(originalPrompt, optimizedPrompt) {
    const optimizationResult = document.createElement('div');
    optimizationResult.className = 'ai-response';
    optimizationResult.style.borderLeftColor = '#2196f3';
    optimizationResult.style.backgroundColor = '#e3f2fd';
    
    const label = document.createElement('div');
    label.className = 'label';
    label.style.color = '#1976d2';
    label.textContent = '提示词优化:';
    
    const content = document.createElement('div');
    
    // 原始提示词
    const originalSection = document.createElement('div');
    originalSection.style.marginBottom = '15px';
    
    const originalLabel = document.createElement('div');
    originalLabel.style.fontWeight = 'bold';
    originalLabel.style.marginBottom = '5px';
    originalLabel.style.color = '#666';
    originalLabel.textContent = '原始提示词:';
    
    const originalText = document.createElement('div');
    originalText.style.padding = '8px';
    originalText.style.backgroundColor = '#f5f5f5';
    originalText.style.borderRadius = '4px';
    originalText.style.fontSize = '14px';
    originalText.textContent = originalPrompt;
    
    originalSection.appendChild(originalLabel);
    originalSection.appendChild(originalText);
    
    // 优化后提示词
    const optimizedSection = document.createElement('div');
    
    const optimizedLabel = document.createElement('div');
    optimizedLabel.style.fontWeight = 'bold';
    optimizedLabel.style.marginBottom = '5px';
    optimizedLabel.style.color = '#666';
    optimizedLabel.textContent = '优化后提示词:';
    
    const optimizedText = document.createElement('div');
    optimizedText.style.padding = '8px';
    optimizedText.style.backgroundColor = '#e8f5e8';
    optimizedText.style.borderRadius = '4px';
    optimizedText.style.fontSize = '14px';
    optimizedText.textContent = optimizedPrompt;
    
    optimizedSection.appendChild(optimizedLabel);
    optimizedSection.appendChild(optimizedText);
    
    content.appendChild(originalSection);
    content.appendChild(optimizedSection);
    
    optimizationResult.appendChild(label);
    optimizationResult.appendChild(content);
    resultContent.appendChild(optimizationResult);
    resultContent.scrollTop = resultContent.scrollHeight;
}

// 监听输入框变化
promptInput.addEventListener('input', updateSendButtonState);

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    updateSendButtonState();
});

// 复制图片到剪贴板
async function copyImageToClipboard(imageData) {
    try {
        // 将base64转换为blob
        const response = await fetch(`data:${imageData.mime_type};base64,${imageData.data}`);
        const blob = await response.blob();
        
        // 复制到剪贴板
        await navigator.clipboard.write([
            new ClipboardItem({ [imageData.mime_type]: blob })
        ]);
        
        // 显示成功提示
        showToast('图片已复制到剪贴板');
    } catch (error) {
        console.error('复制失败:', error);
        showToast('复制失败，请手动保存图片', 'error');
    }
}

// 下载图片
function downloadImage(imageData, index) {
    try {
        const link = document.createElement('a');
        link.href = `data:${imageData.mime_type};base64,${imageData.data}`;
        
        // 生成文件名
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
        const extension = imageData.mime_type.split('/')[1] || 'png';
        link.download = imageData.filename || `generated_image_${timestamp}_${index + 1}.${extension}`;
        
        // 触发下载
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('图片下载已开始');
    } catch (error) {
        console.error('下载失败:', error);
        showToast('下载失败，请手动保存图片', 'error');
    }
}

// 显示提示消息
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '6px';
    toast.style.color = 'white';
    toast.style.fontSize = '14px';
    toast.style.zIndex = '10000';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    
    if (type === 'success') {
        toast.style.backgroundColor = '#4caf50';
    } else if (type === 'error') {
        toast.style.backgroundColor = '#f44336';
    }
    
    document.body.appendChild(toast);
    
    // 显示动画
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 100);
    
    // 自动隐藏
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// 防止页面默认的拖拽行为
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());