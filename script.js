// 角色创建的问题列表
const questions = [
    {
        id: 'greeting',
        question: '你好，我是桃桃子，可以帮你实现跟你的oc相处的愿望:P 请给我讲讲你的oc吧！',
        description: '开场白',
        isAIOnly: true
    },
    {
        id: 'name',
        question: '先从最基本的开始吧，ta叫什么名字？',
        description: '角色名称'
    },
    {
        id: 'gender',
        question: 'Ta在性别方面的设定是什么？是男孩子、女孩子、或者其他？',
        description: '性别'
    },
    {
        id: 'birthday',
        question: 'Ta的生日是什么时候（年/月/日），现在多大了？',
        description: '生日和年龄'
    },
    {
        id: 'mbti',
        question: 'Ta的MBTI是什么？',
        description: 'MBTI'
    },
    {
        id: 'alignment',
        question: 'Ta的行为立场符合阵营九宫格中的哪一种？（守序/中立/混乱+善良/中立/邪恶）',
        description: '阵营立场'
    },
    {
        id: 'personality',
        question: 'Ta是一个什么样的人呢？请用简单的话语描述一下Ta的性格、优缺点、兴趣爱好等信息吧！',
        description: '性格特点'
    },
    {
        id: 'appearance',
        question: '我很好奇Ta的外貌，你愿意给我描述一下吗，这样见面我就能认出ta了！可以告诉我ta外貌上的特点、穿搭的风格、常用的配饰……',
        description: '外貌特征'
    },
    {
        id: 'worldview',
        question: '好的，以上都是要把ta带来你的身边的基本的信息，我已经全部记住了> < 不过，如果你能告诉我更多的补充信息，ta就会更贴近你想象中的样子哦。\nTa生活在一个什么样的世界里？跟我们一样的现代城市，又或者古老的国度、未来的星际？给我讲讲ta所处的世界观吧！',
        description: '世界观',
        isAIOnly: false
    },
    {
        id: 'identity',
        question: '那么在ta的世界里，ta的身份是什么呢？',
        description: '身份'
    },
    {
        id: 'additional_info',
        question: '除此之外，你还有什么要补充的信息吗？Ta的经历、ta的生活习惯…',
        description: '补充信息'
    },
    {
        id: 'relationship',
        question: '当ta真的来到你身边，你希望你跟ta的关系是？',
        description: '关系'
    },
    {
        id: 'user_title',
        question: 'Ta应该怎么称呼你？',
        description: '用户称呼'
    },
    {
        id: 'first_meeting',
        question: '当你们第一次见面，你希望ta的开场白是？',
        description: '初次见面'
    },
    {
        id: 'speech_habits',
        question: 'Ta有没有什么特殊的说话习惯？口头禅，或者其他的口癖？',
        description: '说话习惯'
    },
    {
        id: 'final_check',
        question: '好了！按照你告诉我的这些信息，我已经给ta整理了一份档案。接下来请你亲自检查这份档案，并且自由地做出补全和修改——',
        description: '最终确认',
        isAIOnly: true
    }
];

let currentQuestionIndex = 0;
let characterInfo = {};
let isAnswering = false;

// 定义 MBTI 和阵营立场列表
const MBTI = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];
const STANCES = ['守序善良', '中立善良', '混乱善良', '守序中立', '绝对中立', '混乱中立', '守序邪恶', '中立邪恶', '混乱邪恶'];

// 全局辅助函数：更新 characterInfo 对象
function updateCharacterInfo(key, value) {
    if (Array.isArray(value)) {
        characterInfo[key] = value;
    } else {
        characterInfo[key] = [value];
    }
    // console.log('Updated characterInfo:', key, value, characterInfo);
}

// 全局辅助函数：获取输入框的初始值
function getInitialValue(key, defaultValue = '') {
    const value = characterInfo[key];
    return (value && value.length > 0 && value[0].trim() !== '') ? value[0] : defaultValue;
}

// 全局辅助函数：获取文本域的初始值 (处理换行)
function getTextAreaInitialValue(key) {
    const value = characterInfo[key];
    return (value && value.length > 0 && value[0].trim() !== '') ? value.join('\n') : '';
}

// 全局辅助函数：更新字符计数显示
function updateCharCount(elementId, text) {
    const charCountElement = document.getElementById(elementId);
    if (charCountElement) {
        charCountElement.textContent = `${text.length} 字`;
    }
}

// 全局辅助函数：为文件输入提供模拟的文件名显示
let avatarFileName = '';
let voiceFileName = '';

function handleFileSelect(event, type) {
    const file = event.target.files?.[0];
    if (file) {
        const fileName = file.name;
        if (type === 'avatar') {
            avatarFileName = fileName;
            const avatarPreview = document.getElementById('avatar-preview-text');
            if(avatarPreview) avatarPreview.textContent = fileName;
            // 如果需要显示图片预览，需要处理URL.createObjectURL
            const avatarImg = document.getElementById('avatar-display-img');
            if (avatarImg) {
                if (avatarImg.src) URL.revokeObjectURL(avatarImg.src);
                avatarImg.src = URL.createObjectURL(file);
                avatarImg.style.display = 'block';
                document.getElementById('avatar-placeholder-text').style.display = 'none';
            }
        } else if (type === 'voice') {
            voiceFileName = fileName;
            const voiceInfo = document.getElementById('voice-info-text');
            if(voiceInfo) voiceInfo.innerHTML = `已选择文件：${fileName}<br/><span class="text-xs text-gray-400 mt-1">支持 MP3/WAV，时长 ≤15 秒</span>`;
        }
    } else {
        if (type === 'avatar') {
            avatarFileName = '';
            const avatarPreview = document.getElementById('avatar-preview-text');
            if(avatarPreview) avatarPreview.textContent = '未选择任何文件';
            const avatarImg = document.getElementById('avatar-display-img');
            if (avatarImg) {
                if (avatarImg.src) URL.revokeObjectURL(avatarImg.src);
                avatarImg.src = '';
                avatarImg.style.display = 'none';
                document.getElementById('avatar-placeholder-text').style.display = 'flex';
            }
        } else if (type === 'voice') {
            voiceFileName = '';
            const voiceInfo = document.getElementById('voice-info-text');
            if(voiceInfo) voiceInfo.innerHTML = `未选择任何文件<br/><span class="text-xs text-gray-400 mt-1">支持 MP3/WAV，时长 ≤15 秒</span>`;
        }
    }
}

function addMessage(content, isUser = false) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;
    
    messageDiv.appendChild(messageContent);
    
    // 如果是用户消息，添加操作按钮
    if (isUser) {
        const actionDiv = document.createElement('div');
        actionDiv.className = 'message-actions';
        
        const continueBtn = document.createElement('button');
        continueBtn.className = 'continue-btn';
        continueBtn.textContent = '继续补充';
        continueBtn.onclick = function() {
            continueAnswer();
            actionDiv.remove();
        };
        
        const finishBtn = document.createElement('button');
        finishBtn.className = 'finish-btn';
        finishBtn.textContent = '回答完了';
        finishBtn.onclick = function() {
            finishAnswer();
            actionDiv.remove();
        };
        
        actionDiv.appendChild(continueBtn);
        actionDiv.appendChild(finishBtn);
        messageDiv.appendChild(actionDiv);
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function askNextQuestion() {
    if (currentQuestionIndex < questions.length) {
        const question = questions[currentQuestionIndex];
        addMessage(question.question);
        isAnswering = !question.isAIOnly;
        
        // 如果是AI专用消息，自动进入下一个问题
        if (question.isAIOnly) {
            // 检查是否是最终确认问题，如果是则显示表单
            if (question.id === 'final_check') {
                showCharacterFormDisplay();
            } else {
                currentQuestionIndex++;
                setTimeout(askNextQuestion, 1000);
            }
        }
    } else {
        // 所有问题都回答完毕，显示表单
        showCharacterFormDisplay();
    }
}

// 数据转换和匹配函数
function processUserAnswer(questionId, answer) {
    switch (questionId) {
        case 'birthday':
            // 尝试从文本中提取日期
            const dateMatch = answer.match(/(\d{4})[年/-](\d{1,2})[月/-](\d{1,2})/);
            if (dateMatch) {
                const [_, year, month, day] = dateMatch;
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
            return answer;

        case 'mbti':
            // 尝试匹配MBTI格式
            const mbtiMatch = answer.toUpperCase().match(/[EI][NS][TF][JP]/);
            if (mbtiMatch) {
                return mbtiMatch[0];
            }
            // 如果用户输入了"其他"，返回"其他"
            if (answer.includes('其他')) {
                return '其他';
            }
            return answer;

        case 'alignment':
            // 尝试匹配阵营格式
            const alignmentMatch = answer.match(/(守序|中立|混乱)(善良|中立|邪恶)/);
            if (alignmentMatch) {
                return alignmentMatch[0];
            }
            // 如果用户输入了"其他"，返回"其他"
            if (answer.includes('其他')) {
                return '其他';
            }
            return answer;

        case 'gender':
            // 处理性别选项
            if (answer.includes('男')) return '男';
            if (answer.includes('女')) return '女';
            if (answer.includes('其他')) return '其他';
            return answer;

        case 'age':
            // 尝试提取数字
            const ageMatch = answer.match(/\d+/);
            if (ageMatch) {
                return ageMatch[0];
            }
            return answer;

        default:
            return answer;
    }
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (message && isAnswering) {
        addMessage(message, true);
        input.value = '';
        
        // 保存回答
        const currentQuestion = questions[currentQuestionIndex];
        if (!characterInfo[currentQuestion.id]) {
            characterInfo[currentQuestion.id] = [];
        }
        
        // 处理用户回答
        const processedAnswer = processUserAnswer(currentQuestion.id, message);
        characterInfo[currentQuestion.id].push(processedAnswer);
        
        // 如果是特殊字段，可能需要额外处理
        if (currentQuestion.id === 'birthday' && processedAnswer) {
            // 尝试从生日计算年龄
            const birthDate = new Date(processedAnswer);
            if (!isNaN(birthDate)) {
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                characterInfo['age'] = [age.toString()];
            }
        }
        
        console.log(`sendMessage: characterInfo[${currentQuestion.id}] updated to`, characterInfo[currentQuestion.id]);
        
        // 不自动进入下一个问题，等待用户点击"回答完了"按钮
    }
}

function skipQuestion() {
    if (currentQuestionIndex < questions.length) {
        addMessage('（跳过）', true);
        const currentQuestion = questions[currentQuestionIndex];
        // 如果跳过，确保该字段在 characterInfo 中至少存在一个空数组，以便表单显示"未填写"
        if (!characterInfo[currentQuestion.id]) {
            characterInfo[currentQuestion.id] = [];
        }
        console.log(`skipQuestion: characterInfo[${currentQuestion.id}] set to`, characterInfo[currentQuestion.id]);
        currentQuestionIndex++;
        setTimeout(askNextQuestion, 1000);
    }
}

function continueAnswer() {
    const input = document.getElementById('messageInput');
    input.focus();
}

function finishAnswer() {
    if (currentQuestionIndex < questions.length) {
        // 保存当前回答（如果存在）
        const input = document.getElementById('messageInput');
        const message = input.value.trim();
        if (message && isAnswering) {
            addMessage(message, true);
            input.value = '';
            const currentQuestion = questions[currentQuestionIndex];
            if (!characterInfo[currentQuestion.id]) {
                characterInfo[currentQuestion.id] = [];
            }
            characterInfo[currentQuestion.id].push(message);
            console.log(`finishAnswer: characterInfo[${currentQuestion.id}] updated to`, characterInfo[currentQuestion.id]);
        }

        // 只有当用户确实回答了问题（有内容）或者明确跳过时，才进入下一个问题
        const currentQuestion = questions[currentQuestionIndex];
        if (characterInfo[currentQuestion.id] && characterInfo[currentQuestion.id].length > 0) {
            currentQuestionIndex++;
            setTimeout(askNextQuestion, 1000);
        } else {
            // 如果用户没有回答就点击"回答完了"，提示用户
            addMessage('你还没有回答这个问题哦，请先回答或选择跳过。', false);
        }
    }
}

// ====================================
// 新增：模仿 RoleCreationForm 的表单展示逻辑
// ====================================

// 辅助函数：生成表单字段组的 HTML 结构
function generateFieldGroupStart(label, isRequired = false) {
    const requiredSpan = isRequired ? '<span class="text-pink-400">*</span>' : '';
    return `
        <div class="field-group">
            <label class="field-label">${label} ${requiredSpan}</label>
    `;
}

function generateFieldGroupEnd() {
    return `
        </div>
    `;
}

function generateBorderedFieldGroupStart() {
    return `
        <div class="field-group bordered-top">
    `;
}

function generateBorderedFieldGroupEnd() {
    return `
        </div>
    `;
}

// 显示角色信息表单（模仿 React 组件）
function showCharacterFormDisplay() {
    console.log('showCharacterFormDisplay called. Final characterInfo:', characterInfo);
    const displayForm = document.getElementById('characterDisplayForm');
    const formContainer = displayForm.querySelector('.character-form-container');

    // 构建完整的 HTML 内容作为一个字符串
    let fullFormHtml = `
        <div class="form-header">
            <h1>桃桃子</h1>
            <p class="subtitle">我想了解你的oc!</p>
        </div>
        <div class="tabs-list" id="formTabsList">
            <div class="tab-trigger active" data-tab="basic">基本设定</div>
            <div class="tab-trigger" data-tab="supplement">补充设定</div>
            <div class="tab-trigger" data-tab="language-habit">语言习惯</div>
        </div>
        <div class="form-content-area">
            <div class="tab-content active" id="basic-content"></div>
            <div class="tab-content" id="supplement-content"></div>
            <div class="tab-content" id="language-habit-content"></div>
        </div>
        <div class="flex-none pt-6 text-center">
            <button onclick="downloadCharacterInfo()" class="full-width-button">下载角色信息</button>
        </div>
    `;

    // 一次性设置 innerHTML
    formContainer.innerHTML = fullFormHtml;

    // 现在所有元素都在 DOM 中，填充它们的内容并添加事件监听器
    populateBasicSettingContent();
    populateSupplementSettingContent();
    populateLanguageHabitContent();

    // 在所有元素都已存在于 DOM 中后，添加 Tab 切换逻辑
    setTimeout(() => {
        addTabSwitchingLogic();
    }, 0); // 使用 0ms 延迟，确保 DOM 已完全渲染

    // 显示表单容器
    displayForm.style.display = 'flex';

    // 确保在显示表单时，文件输入框的文件名显示是正确的初始状态
    handleFileSelect({target: {files: []}}, 'avatar'); // Reset avatar display
    handleFileSelect({target: {files: []}}, 'voice'); // Reset voice display

    // 确保字符计数在初始加载时正确显示
    updateCharCount('nameCharCount', getInitialValue('name'));
    updateCharCount('personalityCharCount', getTextAreaInitialValue('personality'));
    updateCharCount('appearanceCharCount', getTextAreaInitialValue('appearance'));
    updateCharCount('worldviewCharCount', getTextAreaInitialValue('worldview'));
    updateCharCount('identityCharCount', getTextAreaInitialValue('identity'));
    updateCharCount('additionalInfoCharCount', getTextAreaInitialValue('additional_info'));
    updateCharCount('relationshipCharCount', getInitialValue('relationship'));
    updateCharCount('userTitleCharCount', getInitialValue('user_title'));
    updateCharCount('firstMeetingCharCount', getInitialValue('first_meeting'));
    updateCharCount('speechHabitsCharCount', getInitialValue('speech_habits'));
    // Examples char counts will be handled dynamically within populateLanguageHabitContent
}

// 填充"基本设定" Tab 的内容
function populateBasicSettingContent() {
    const basicContentDiv = document.getElementById('basic-content');
    let html = '';

    // 角色头像
    html += generateFieldGroupStart('角色头像', true);
    html += `
        <input type="file" id="avatarInput" accept="image/*" class="w-full text-sm py-2 px-3 border border-pink-200 rounded-xl bg-white transition-all duration-200 ease-in-out hover:border-pink-300" onchange="handleFileSelect(event, 'avatar')" />
        <div class="flex items-center gap-4 mt-2">
            <img id="avatar-display-img" src="" class="avatar-preview" style="display:none;" />
            <div id="avatar-placeholder-text" class="avatar-preview flex items-center justify-center text-gray-400 text-sm">未选择任何文件</div>
        </div>
    `;
    html += generateFieldGroupEnd();

    // 角色常用语言
    html += generateFieldGroupStart('角色常用语言', true);
    html += `
        <select id="languageSelect" class="w-full p-2 rounded-xl border border-pink-200 bg-white focus:ring-pink-400 focus:border-pink-400 text-sm py-2 px-3" onchange="updateCharacterInfo('language', this.value)">
            <option value="">请选择语言</option>
            ${['中文', '英文', '日语', '其他'].map(l => `<option value="${l}" ${getInitialValue('language') === l ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
    `;
    html += generateFieldGroupEnd();

    // 角色语音
    html += generateFieldGroupStart('角色语音 (≤15s)');
    html += `
        <input type="file" id="voiceInput" accept="audio/mp3,audio/wav" class="w-full text-sm py-2 px-3 border border-pink-200 rounded-xl bg-white transition-all duration-200 ease-in-out hover:border-pink-300" onchange="handleFileSelect(event, 'voice')" />
        <span id="voice-info-text" class="text-xs text-gray-400 mt-1">支持 MP3/WAV，时长 ≤15 秒</span>
    `;
    html += generateFieldGroupEnd();

    // 角色名称
    html += generateFieldGroupStart('角色名称', true);
    html += `
        <div class="relative w-full">
            <input type="text" id="nameInput" value="${getInitialValue('name')}" placeholder="角色名称"
                   class="w-full text-sm py-2 px-3 border border-pink-200 rounded-xl bg-white transition-all duration-200 ease-in-out hover:border-pink-300" 
                   oninput="updateCharacterInfo('name', this.value); updateCharCount('nameCharCount', this.value);" />
            <div id="nameCharCount" class="input-char-count">${getInitialValue('name').length} 字</div>
        </div>
    `;
    html += generateFieldGroupEnd();

    // 性别
    html += generateFieldGroupStart('性别', true);
    html += `
        <div class="gender-options" id="genderOptions">
            ${['男', '女', '其他'].map(g => `
                <button type="button" class="gender-button ${getInitialValue('gender') === g ? '' : 'outline'}" data-gender="${g}">
                    ${g}
                </button>
            `).join('')}
        </div>
        <input type="text" id="otherGenderInput" value="${getInitialValue('otherGender')}" placeholder="自定义性别"
               class="w-full text-sm py-2 px-3 border border-pink-200 rounded-xl bg-white transition-all duration-200 ease-in-out hover:border-pink-300 mt-2 ${getInitialValue('gender') === '其他' ? '' : 'hidden'}"
               oninput="updateCharacterInfo('otherGender', this.value)" />
    `;
    html += generateFieldGroupEnd();

    // 年龄 & 生日
    html += generateFieldGroupStart('年龄');
    html += `
        <input type="number" id="ageInput" value="${getInitialValue('age')}" min="0" max="100" placeholder="年龄"
               class="w-full text-sm py-2 px-3 border border-pink-200 rounded-xl bg-white transition-all duration-200 ease-in-out hover:border-pink-300" 
               oninput="updateCharacterInfo('age', this.value)" />
    `;
    html += generateFieldGroupEnd();

    html += generateFieldGroupStart('生日');
    html += `
        <input type="date" id="birthdayInput" value="${getInitialValue('birthday')}" 
               class="w-full text-sm py-2 px-3 border border-pink-200 rounded-xl bg-white transition-all duration-200 ease-in-out hover:border-pink-300" 
               oninput="updateCharacterInfo('birthday', this.value)" />
    `;
    html += generateFieldGroupEnd();

    // MBTI
    html += generateFieldGroupStart('MBTI');
    html += `
        <select id="mbtiSelect" class="w-full p-2 rounded-xl border border-pink-200 bg-white focus:ring-pink-400 focus:border-pink-400 text-sm py-2 px-3" onchange="updateCharacterInfo('mbti', this.value); document.getElementById('otherMbtiInput').classList.toggle('hidden', this.value !== '其他');">
            <option value="">选择 MBTI</option>
            ${MBTI.map(t => `<option value="${t}" ${getInitialValue('mbti') === t ? 'selected' : ''}>${t}</option>`).join('')}
            <option value="其他" ${getInitialValue('mbti') === '其他' ? 'selected' : ''}>其他</option>
        </select>
        <input type="text" id="otherMbtiInput" value="${getInitialValue('otherMbti')}" placeholder="自定义 MBTI"
               class="w-full text-sm py-2 px-3 border border-pink-200 rounded-xl bg-white transition-all duration-200 ease-in-out hover:border-pink-300 mt-2 ${getInitialValue('mbti') === '其他' ? '' : 'hidden'}"
               oninput="updateCharacterInfo('otherMbti', this.value)" />
    `;
    html += generateFieldGroupEnd();

    // 立场
    html += generateFieldGroupStart('立场');
    html += `
        <select id="stanceSelect" class="w-full p-2 rounded-xl border border-pink-200 bg-white focus:ring-pink-400 focus:border-pink-400 text-sm py-2 px-3" onchange="updateCharacterInfo('alignment', this.value); document.getElementById('otherStanceInput').classList.toggle('hidden', this.value !== '其他');">
            <option value="">选择立场</option>
            ${STANCES.map(s => `<option value="${s}" ${getInitialValue('alignment') === s ? 'selected' : ''}>${s}</option>`).join('')}
            <option value="其他" ${getInitialValue('alignment') === '其他' ? 'selected' : ''}>其他</option>
        </select>
        <input type="text" id="otherStanceInput" value="${getInitialValue('otherStance')}" placeholder="自定义立场"
               class="w-full text-sm py-2 px-3 border border-pink-200 rounded-xl bg-white transition-all duration-200 ease-in-out hover:border-pink-300 mt-2 ${getInitialValue('alignment') === '其他' ? '' : 'hidden'}"
               oninput="updateCharacterInfo('otherStance', this.value)" />
    `;
    html += generateFieldGroupEnd();

    // 核心必填：性格 / 外貌
    html += generateBorderedFieldGroupStart();
    html += generateFieldGroupStart('性格', true);
    html += `
        <div class="relative w-full">
            <textarea id="personalityInput" placeholder="性格、优缺点、兴趣爱好…" 
                      class="w-full text-sm py-2 px-3 border border-pink-200 rounded-xl bg-white transition-all duration-200 ease-in-out hover:border-pink-300 min-h-[100px] max-h-[300px] overflow-y-auto" 
                      oninput="updateCharacterInfo('personality', this.value); updateCharCount('personalityCharCount', this.value);">${getTextAreaInitialValue('personality')}</textarea>
            <div id="personalityCharCount" class="textarea-char-count">${getTextAreaInitialValue('personality').length} 字</div>
        </div>
    `;
    html += generateFieldGroupEnd();

    html += generateFieldGroupStart('外貌', true);
    html += `
        <div class="relative w-full">
            <textarea id="appearanceInput" placeholder="身高体型、发型发色、瞳色…" 
                      class="w-full text-sm py-2 px-3 border border-pink-200 rounded-xl bg-white transition-all duration-200 ease-in-out hover:border-pink-300 min-h-[100px] max-h-[300px] overflow-y-auto" 
                      oninput="updateCharacterInfo('appearance', this.value); updateCharCount('appearanceCharCount', this.value);">${getTextAreaInitialValue('appearance')}</textarea>
            <div id="appearanceCharCount" class="textarea-char-count">${getTextAreaInitialValue('appearance').length} 字</div>
        </div>
    `;
    html += generateFieldGroupEnd();
    html += generateBorderedFieldGroupEnd();

    basicContentDiv.innerHTML = html;

    // Add event listeners for buttons that are created dynamically
    const genderButtons = basicContentDiv.querySelectorAll('#genderOptions .gender-button');
    genderButtons.forEach(button => {
        button.addEventListener('click', function() {
            const selectedGender = this.dataset.gender;
            updateCharacterInfo('gender', selectedGender);
            genderButtons.forEach(btn => btn.classList.toggle('outline', btn.dataset.gender !== selectedGender));
            document.getElementById('otherGenderInput').classList.toggle('hidden', selectedGender !== '其他');
        });
    });
}

// 填充"补充设定" Tab 的内容
function populateSupplementSettingContent() {
    const supplementContentDiv = document.getElementById('supplement-content');
    let html = '';

    html += generateFieldGroupStart('世界观');
    html += `
        <div class="relative w-full">
            <textarea id="worldviewInput" placeholder="时代背景、文化冲突…" 
                      class="w-full text-sm py-2 px-3 border border-pink-200 rounded-xl bg-white transition-all duration-200 ease-in-out hover:border-pink-300 min-h-[100px] max-h-[300px] overflow-y-auto" 
                      oninput="updateCharacterInfo('worldview', this.value); updateCharCount('worldviewCharCount', this.value);">${getTextAreaInitialValue('worldview')}</textarea>
            <div id="worldviewCharCount" class="textarea-char-count">${getTextAreaInitialValue('worldview').length} 字</div>
        </div>
    `;
    html += generateFieldGroupEnd();

    html += generateFieldGroupStart('身份');
    html += `
        <div class="relative w-full">
            <textarea id="identityInput" placeholder="种族、职业、阶层…" 
                      class="w-full text-sm py-2 px-3 border border-pink-200 rounded-xl bg-white transition-all duration-200 ease-in-out hover:border-pink-300 min-h-[100px] max-h-[300px] overflow-y-auto" 
                      oninput="updateCharacterInfo('identity', this.value); updateCharCount('identityCharCount', this.value);">${getTextAreaInitialValue('identity')}</textarea>
            <div id="identityCharCount" class="textarea-char-count">${getTextAreaInitialValue('identity').length} 字</div>
        </div>
    `;
    html += generateFieldGroupEnd();

    html += generateFieldGroupStart('补充设定');
    html += `
        <div class="relative w-full">
            <textarea id="additionalInfoInput" placeholder="角色经历、生活习惯…" 
                      class="w-full text-sm py-2 px-3 border border-pink-200 rounded-xl bg-white transition-all duration-200 ease-in-out hover:border-pink-300 min-h-[100px] max-h-[300px] overflow-y-auto" 
                      oninput="updateCharacterInfo('additional_info', this.value); updateCharCount('additionalInfoCharCount', this.value);">${getTextAreaInitialValue('additional_info')}</textarea>
            <div id="additionalInfoCharCount" class="textarea-char-count">${getTextAreaInitialValue('additional_info').length} 字</div>
        </div>
    `;
    html += generateFieldGroupEnd();

    html += generateFieldGroupStart('与用户的关系');
    html += `
        <div class="relative w-full">
            <input type="text" id="relationshipInput" value="${getInitialValue('relationship')}" placeholder="如：挚友 / 上下级 / 主仆…"
                   class="w-full text-sm py-2 px-3 border border-pink-200 rounded-xl bg-white transition-all duration-200 ease-in-out hover:border-pink-300" 
                   oninput="updateCharacterInfo('relationship', this.value); updateCharCount('relationshipCharCount', this.value);" />
            <div id="relationshipCharCount" class="input-char-count">${getInitialValue('relationship').length} 字</div>
        </div>
    `;
    html += generateFieldGroupEnd();

    supplementContentDiv.innerHTML = html;
}

// 填充"语言习惯" Tab 的内容
function populateLanguageHabitContent() {
    const languageContentDiv = document.getElementById('language-habit-content');
    let html = '';

    console.log('--- Populating Language Habit Content Debug ---');
    console.log('Initial user_title:', getInitialValue('user_title'));
    console.log('Initial first_meeting:', getInitialValue('first_meeting'));
    console.log('Initial speech_habits:', getInitialValue('speech_habits'));
    console.log('Current characterInfo.examples (before initialization check):', characterInfo.examples);

    html += generateFieldGroupStart('如何称呼用户');
    html += `
        <div class="relative w-full">
            <input type="text" id="userTitleInput" value="${getInitialValue('user_title')}" placeholder="如：主人 / 挚友 / 阁下…"
                   class="w-full text-sm py-2 px-3 border border-pink-200 rounded-xl bg-white transition-all duration-200 ease-in-out hover:border-pink-300" 
                   oninput="updateCharacterInfo('user_title', this.value); updateCharCount('userTitleCharCount', this.value);" />
            <div id="userTitleCharCount" class="input-char-count">${getInitialValue('user_title').length} 字</div>
        </div>
    `;
    html += generateFieldGroupEnd();

    html += generateFieldGroupStart('开场白');
    html += `
        <div class="relative w-full">
            <input type="text" id="firstMeetingInput" value="${getInitialValue('first_meeting')}" placeholder="角色见面时的第一句问候"
                   class="w-full text-sm py-2 px-3 border border-pink-200 rounded-xl bg-white transition-all duration-200 ease-in-out hover:border-pink-300" 
                   oninput="updateCharacterInfo('first_meeting', this.value); updateCharCount('firstMeetingCharCount', this.value);" />
            <div id="firstMeetingCharCount" class="input-char-count">${getInitialValue('first_meeting').length} 字</div>
        </div>
    `;
    html += generateFieldGroupEnd();

    html += generateFieldGroupStart('口癖');
    html += `
        <div class="relative w-full">
            <input type="text" id="speechHabitsInput" value="${getInitialValue('speech_habits')}" placeholder="角色常挂在嘴边的话"
                   class="w-full text-sm py-2 px-3 border border-pink-200 rounded-xl bg-white transition-all duration-200 ease-in-out hover:border-pink-300" 
                   oninput="updateCharacterInfo('speech_habits', this.value); updateCharCount('speechHabitsCharCount', this.value);" />
            <div id="speechHabitsCharCount" class="input-char-count">${getInitialValue('speech_habits').length} 字</div>
        </div>
    `;
    html += generateFieldGroupEnd();

    // 【示例对话】 - 动态生成
    html += generateFieldGroupStart('【示例对话】');
    html += `<p class="text-xs text-gray-400 mb-2">可用作角色说话风格参考的代表性话语或台词摘录，不超过三条</p>`;
    
    // Ensure characterInfo.examples is an array, and if empty, initialize with one empty string
    if (!characterInfo.examples || characterInfo.examples.length === 0) {
        characterInfo.examples = ['']; // Initialize with one empty string to show one input field by default
        console.log('characterInfo.examples initialized to:', characterInfo.examples);
    }
    // Limit to max 3 examples, although current logic prevents more than 3 from being added
    characterInfo.examples = characterInfo.examples.slice(0, 3);
    console.log('characterInfo.examples after slice (final for loop):', characterInfo.examples);

    for (let i = 0; i < characterInfo.examples.length; i++) {
        console.log(`Rendering example ${i}:`, characterInfo.examples[i]);
        html += `
            <div class="flex gap-2 mt-2 input-wrapper">
                <div class="relative flex-1 min-w-0 w-full">
                    <input type="text" id="exampleInput_${i}" value="${characterInfo.examples[i]}" placeholder="示例 ${i + 1}"
                           class="w-full text-sm py-2 px-3 border border-pink-200 rounded-xl bg-white transition-all duration-200 ease-in-out hover:border-pink-300"
                           oninput="updateExampleField(${i}, this.value); updateCharCount('exampleCharCount_${i}', this.value);" />
                    <div id="exampleCharCount_${i}" class="input-char-count">${characterInfo.examples[i].length} 字</div>
                </div>
                <button type="button" class="bg-pink-200 hover:bg-pink-300 active:bg-pink-400 text-pink-600 text-sm sm:text-base rounded-xl px-4 py-2" onclick="removeExampleField(${i})">删除</button>
            </div>
        `;
    }

    if (characterInfo.examples.length < 3) {
        html += `
            <button type="button" class="bg-white text-pink-400 border border-pink-400 hover:bg-pink-500 active:bg-pink-600 hover:text-white rounded-xl mt-3 px-4 py-2" onclick="addExampleField()">
                + 添加
            </button>
        `;
    }
    html += generateFieldGroupEnd();

    languageContentDiv.innerHTML = html;
    console.log('Language content div innerHTML:', languageContentDiv.innerHTML); // Log the final HTML

    // Initial character count for examples after they are rendered
    for (let i = 0; i < characterInfo.examples.length; i++) {
        updateCharCount(`exampleCharCount_${i}`, characterInfo.examples[i]);
    }

    // Direct query to confirm input values and placeholders after rendering
    console.log('--- Direct Input Element Check ---');
    const userTitleInput = document.getElementById('userTitleInput');
    if (userTitleInput) console.log('userTitleInput value:', userTitleInput.value, 'placeholder:', userTitleInput.placeholder);
    const firstMeetingInput = document.getElementById('firstMeetingInput');
    if (firstMeetingInput) console.log('firstMeetingInput value:', firstMeetingInput.value, 'placeholder:', firstMeetingInput.placeholder);
    const speechHabitsInput = document.getElementById('speechHabitsInput');
    if (speechHabitsInput) console.log('speechHabitsInput value:', speechHabitsInput.value, 'placeholder:', speechHabitsInput.placeholder);
    const exampleInput_0 = document.getElementById('exampleInput_0');
    if (exampleInput_0) console.log('exampleInput_0 value:', exampleInput_0.value, 'placeholder:', exampleInput_0.placeholder);
}

// 示例对话动态操作函数
function addExampleField() {
    if (characterInfo.examples.length < 3) {
        characterInfo.examples.push('');
        // Re-render the language habit content to show new input field
        populateLanguageHabitContent();
    }
}

function removeExampleField(index) {
    characterInfo.examples.splice(index, 1);
    // Re-render the language habit content to remove input field
    populateLanguageHabitContent();
}

function updateExampleField(index, value) {
    if (characterInfo.examples[index] !== undefined) {
        characterInfo.examples[index] = value;
    }
}

// Tab 切换逻辑
function addTabSwitchingLogic() {
    const tabTriggers = document.querySelectorAll('.tab-trigger');
    const tabContents = document.querySelectorAll('.tab-content');

    tabTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            tabTriggers.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => {
                if (c) { // 添加空值检查
                    c.classList.remove('active');
                }
            });

            trigger.classList.add('active');
            const targetTab = trigger.getAttribute('data-tab');
            const targetContent = document.getElementById(`${targetTab}-content`);
            if (targetContent) { // 添加空值检查
                targetContent.classList.add('active');
            }
        });
    });
}

function downloadCharacterInfo() {
    const content = JSON.stringify(characterInfo, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'character_info.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 添加回车键发送消息的功能
document.getElementById('messageInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// 开始对话
window.onload = function() {
    // 重置状态
    currentQuestionIndex = 0;
    characterInfo = {};
    isAnswering = false;
    
    // 清空聊天记录
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';
    
    // 开始对话
    addMessage('你好呀！我是桃桃子，让我们一起来创建你的角色吧！');
    setTimeout(askNextQuestion, 1000);
}; 