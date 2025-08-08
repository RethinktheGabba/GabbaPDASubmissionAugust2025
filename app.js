// Application state
let currentFormData = {};
let currentStep = 1;

// Built-in API configuration with rotation
// Replace these with your actual API keys when deploying
const API_CONFIG = {
    keys: [
        {
            provider: 'groq',
            apiKey: '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',
            name: 'Groq (Primary)',
            active: true
        },
        {
            provider: 'openrouter', 
            // apiKey: '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',
            apiKey: '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',
            name: 'OpenRouter AI',
            active: true
        },
        {
            provider: 'groq',
            apiKey: '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', 
            name: 'Groq (Backup)',
            active: true
        },
        {
            provider: 'google',
            apiKey: 'YAIzaSyAZw6MQex9Ks3wgHC4tQeNwuJKA6HKkUJc',
            name: 'Google AI Studio',
            active: true
        }
    ],
    currentIndex: 0
};

// Enhanced question templates for multiple concerns
const concernQuestions = {
    housing: {
        title: "Housing & Development",
        questions: [
            {
                question: "What specific housing concerns do you have?",
                type: "checkbox",
                options: [
                    { value: "affordability", label: "Housing affordability and access for different income levels" },
                    { value: "density", label: "Building density and heights in the area" },
                    { value: "social-housing", label: "Social and affordable housing provisions" },
                    { value: "displacement", label: "Potential displacement of existing residents" },
                    { value: "housing-types", label: "Mix and diversity of housing types needed" },
                    { value: "gentrification", label: "Concerns about gentrification" }
                ]
            }
        ]
    },
    infrastructure: {
        title: "Infrastructure & Services",
        questions: [
            {
                question: "Which infrastructure aspects concern you most?",
                type: "checkbox",
                options: [
                    { value: "charges", label: "Development charges and infrastructure costs" },
                    { value: "utilities", label: "Water, power, telecommunications capacity" },
                    { value: "schools", label: "Schools and educational facilities" },
                    { value: "healthcare", label: "Healthcare services and medical facilities" },
                    { value: "community-facilities", label: "Community centers, libraries, and public facilities" },
                    { value: "stormwater", label: "Stormwater and flood management" }
                ]
            }
        ]
    },
    transport: {
        title: "Transport & Traffic",
        questions: [
            {
                question: "What transport issues concern you?",
                type: "checkbox",
                options: [
                    { value: "traffic", label: "Increased traffic congestion on local roads" },
                    { value: "parking", label: "Parking availability and management" },
                    { value: "public-transport", label: "Public transport access and capacity" },
                    { value: "pedestrian", label: "Pedestrian safety and walkability" },
                    { value: "cycling", label: "Cycling infrastructure and bike paths" },
                    { value: "construction", label: "Construction traffic and disruption" }
                ]
            }
        ]
    },
    community: {
        title: "Community & Amenities",
        questions: [
            {
                question: "What community aspects are most important?",
                type: "checkbox",
                options: [
                    { value: "open-space", label: "Parks, public open spaces, and recreational areas" },
                    { value: "character", label: "Maintaining community character and identity" },
                    { value: "safety", label: "Community safety and security measures" },
                    { value: "cultural", label: "Cultural facilities and community programs" },
                    { value: "local-business", label: "Support for existing local businesses" },
                    { value: "social-cohesion", label: "Maintaining social connections and community networks" }
                ]
            }
        ]
    },
    environment: {
        title: "Environment & Sustainability",
        questions: [
            {
                question: "Which environmental concerns would you like to address?",
                type: "checkbox",
                options: [
                    { value: "green-space", label: "Preservation and creation of green spaces" },
                    { value: "sustainability", label: "Sustainable building and development practices" },
                    { value: "heritage", label: "Heritage conservation and protection" },
                    { value: "climate", label: "Climate resilience and adaptation measures" },
                    { value: "biodiversity", label: "Local biodiversity and habitat protection" },
                    { value: "air-quality", label: "Air quality and pollution concerns" }
                ]
            }
        ]
    },
    economic: {
        title: "Economic Development",
        questions: [
            {
                question: "What economic aspects interest you?",
                type: "checkbox",
                options: [
                    { value: "local-jobs", label: "Local employment opportunities and job creation" },
                    { value: "business-support", label: "Support for local and small businesses" },
                    { value: "tourism", label: "Tourism and entertainment opportunities" },
                    { value: "innovation", label: "Innovation, technology, and creative industries" },
                    { value: "affordability", label: "Economic accessibility and cost of living" },
                    { value: "investment", label: "Community benefits from development investment" }
                ]
            }
        ]
    },
    consultation: {
        title: "Consultation & Process",
        questions: [
            {
                question: "What aspects of the consultation process concern you?",
                type: "checkbox",
                options: [
                    { value: "transparency", label: "Transparency of planning decisions and processes" },
                    { value: "community-input", label: "Meaningful community input and feedback incorporation" },
                    { value: "information-access", label: "Access to clear, understandable information" },
                    { value: "ongoing-engagement", label: "Ongoing community engagement during implementation" },
                    { value: "accountability", label: "Accountability mechanisms and monitoring" },
                    { value: "representation", label: "Fair representation of diverse community views" }
                ]
            }
        ]
    },
    general: {
        title: "General Development",
        questions: [
            {
                question: "What general aspects would you like to comment on?",
                type: "checkbox",
                options: [
                    { value: "timeline", label: "Development timeline and staging" },
                    { value: "overall-vision", label: "Overall vision and strategic direction" },
                    { value: "implementation", label: "Implementation approach and governance" },
                    { value: "monitoring", label: "Monitoring and review mechanisms" },
                    { value: "coordination", label: "Coordination with other developments and planning" },
                    { value: "long-term-impact", label: "Long-term impacts on the broader region" }
                ]
            }
        ]
    }
};

// LLM Provider configurations
const llmConfigs = {
    groq: {
        name: 'Groq',
        apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
        model: 'llama3-70b-8192',
        headers: (apiKey) => ({
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        })
    },
    openrouter: {
        name: 'OpenRouter AI',
        apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        headers: (apiKey) => ({
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        })
    },
    google: {
        name: 'Google AI Studio',
        apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
        model: 'gemini-1.5-pro',
        headers: (apiKey) => ({
            'Content-Type': 'application/json'
        }),
        urlWithKey: (apiKey) => `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`
    }
};

// DOM elements
const form = document.getElementById('feedback-form');
const generateBtn = document.getElementById('generateBtn');
const btnText = document.getElementById('btnText');
const loadingSpinner = document.getElementById('loadingSpinner');
const outputSection = document.getElementById('outputSection');
const generatedSubmission = document.getElementById('generatedSubmission');
const wordCount = document.getElementById('wordCount');
const characterCount = document.getElementById('characterCount');
const additionalComments = document.getElementById('additionalComments');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const editBtn = document.getElementById('editBtn');
const usedProvider = document.getElementById('usedProvider');
const generationInfo = document.getElementById('generationInfo');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateCharacterCount();
    console.log('Woolloongabba PDA Feedback Generator loaded');
});

function initializeEventListeners() {
    // Form submission
    form.addEventListener('submit', handleFormSubmit);

    // Character counter
    if (additionalComments) {
        additionalComments.addEventListener('input', updateCharacterCount);
    }

    // Output section buttons
    if (copyBtn) copyBtn.addEventListener('click', copyToClipboard);
    if (downloadBtn) downloadBtn.addEventListener('click', downloadSubmission);
    if (editBtn) editBtn.addEventListener('click', toggleEditMode);

    // Update word count when submission is edited
    if (generatedSubmission) {
        generatedSubmission.addEventListener('input', updateWordCount);
    }
}

// Step navigation functions
function nextStep(stepNumber) {
    if (stepNumber === 2) {
        if (!validateStep1()) return;
    }

    // Hide current step
    const currentStepEl = document.querySelector(`#step-${currentStep}`);
    if (currentStepEl) currentStepEl.classList.add('hidden');

    // Show next step
    const nextStepEl = document.querySelector(`#step-${stepNumber}`);
    if (nextStepEl) nextStepEl.classList.remove('hidden');

    currentStep = stepNumber;

    // Scroll to top of form
    document.querySelector('.feedback-form').scrollIntoView({ behavior: 'smooth' });
}

function prevStep(stepNumber) {
    // Hide current step
    const currentStepEl = document.querySelector(`#step-${currentStep}`);
    if (currentStepEl) currentStepEl.classList.add('hidden');

    // Show previous step
    const prevStepEl = document.querySelector(`#step-${stepNumber}`);
    if (prevStepEl) prevStepEl.classList.remove('hidden');

    currentStep = stepNumber;

    // Scroll to top of form
    document.querySelector('.feedback-form').scrollIntoView({ behavior: 'smooth' });
}

function validateStep1() {
    const requiredFields = ['fullName', 'email'];
    removeStatusMessages();

    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            const label = field ? field.previousElementSibling.textContent.replace('*', '').trim() : fieldId;
            showErrorMessage(`Please fill in: ${label}`);
            if (field) field.focus();
            return false;
        }
    }

    const emailField = document.getElementById('email');
    if (emailField && !isValidEmail(emailField.value)) {
        showErrorMessage('Please enter a valid email address.');
        emailField.focus();
        return false;
    }

    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Dynamic questionnaire functions
function updateDynamicQuestions() {
    const selectedConcerns = Array.from(document.querySelectorAll('input[name="mainConcerns"]:checked'))
        .map(cb => cb.value);

    const dynamicContainer = document.getElementById('dynamicQuestions');
    if (!dynamicContainer) return;

    if (selectedConcerns.length === 0) {
        dynamicContainer.innerHTML = '';
        return;
    }

    let html = '<div class="dynamic-questions-container">';

    selectedConcerns.forEach(concern => {
        if (concernQuestions[concern]) {
            const concernData = concernQuestions[concern];
            html += `<div class="concern-section">
                <h4 class="concern-title">${concernData.title}</h4>`;

            concernData.questions.forEach((q, qIndex) => {
                const fieldName = `${concern}_q${qIndex}`;
                html += `<div class="question-group">
                    <p class="sub-question">${q.question}</p>`;

                if (q.type === 'checkbox') {
                    html += '<div class="checkbox-grid checkbox-grid--sub">';
                    q.options.forEach(option => {
                        html += `<label class="checkbox-label checkbox-label--sub">
                            <input type="checkbox" name="${fieldName}" value="${option.value}">
                            ${option.label}
                        </label>`;
                    });
                    html += '</div>';
                } else if (q.type === 'radio') {
                    html += '<div class="radio-group">';
                    q.options.forEach(option => {
                        html += `<label class="radio-label">
                            <input type="radio" name="${fieldName}" value="${option.value}">
                            ${option.label}
                        </label>`;
                    });
                    html += '</div>';
                }

                html += '</div>';
            });

            html += '</div>';
        }
    });

    html += '</div>';
    dynamicContainer.innerHTML = html;
}

function updateCharacterCount() {
    if (additionalComments && characterCount) {
        const count = additionalComments.value.length;
        characterCount.textContent = count.toLocaleString();
    }
}

// Form submission and LLM integration with fallback
async function handleFormSubmit(e) {
    e.preventDefault();
  const countRef = db.ref('submissions/count');
  await countRef.transaction(current => (current || 0) + 1);
  const snap = await countRef.get();
  const total = snap.val();
  document.getElementById('generationInfo').textContent = `Total submissions so far: ${total}`;

    if (!validateForm()) return;

    collectFormData();
    setLoadingState(true);

    try {
        const { submission, providerUsed } = await generateSubmissionWithFallback();
        displaySubmission(submission);
        showProviderUsed(providerUsed);
        showSuccessMessage('Submission generated successfully!');
    } catch (error) {
        showErrorMessage(`Unable to generate submission: ${error.message}`);
        console.error('Generation error:', error);
    } finally {
        setLoadingState(false);
    }
}

function validateForm() {
    removeStatusMessages();

    // Check if at least one main concern is selected
    const selectedConcerns = document.querySelectorAll('input[name="mainConcerns"]:checked');
    if (selectedConcerns.length === 0) {
        showErrorMessage('Please select at least one area of concern or interest.');
        return false;
    }

    return true;
}

function collectFormData() {
    const formData = new FormData(form);

    // Collect main concerns
    const mainConcerns = Array.from(document.querySelectorAll('input[name="mainConcerns"]:checked'))
        .map(cb => cb.value);

    // Collect detailed answers for each concern
    const detailedAnswers = {};
    mainConcerns.forEach(concern => {
        detailedAnswers[concern] = [];

        // Find all questions for this concern
        document.querySelectorAll(`[name^="${concern}_q"]`).forEach(input => {
            if ((input.type === 'checkbox' || input.type === 'radio') && input.checked) {
                const questionIndex = input.name.split('_q')[1];
                if (!detailedAnswers[concern][questionIndex]) {
                    detailedAnswers[concern][questionIndex] = [];
                }
                detailedAnswers[concern][questionIndex].push({
                    value: input.value,
                    label: input.parentElement.textContent.trim()
                });
            }
        });
    });

    currentFormData = {
        personalDetails: {
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            phone: formData.get('phone') || '',
            address: formData.get('address') || '',
            organisation: formData.get('organisation') || ''
        },
        preferences: {
            mainConcerns: mainConcerns,
            detailedAnswers: detailedAnswers,
            perspective: formData.get('perspective'),
            tone: formData.get('tone')
        },
        additionalComments: formData.get('additionalComments') || ''
    };
}

function buildPrompt() {
    const { personalDetails, preferences, additionalComments } = currentFormData;

    // Build comprehensive prompt for LLM
    let prompt = `You are helping to write a professional submission for the Woolloongabba Priority Development Area (PDA) public consultation.

CONTEXT:
The Economic Development Queensland (EDQ) is updating the Woolloongabba Priority Development Area Development Scheme to better reflect community expectations, industry feedback and government priorities. Changes focus on improving clarity, removing barriers to housing delivery and responding to technical feedback. A draft Development Charges and Offset Plan (DCOP) has been prepared.

The submission deadline is 29 August 2025. This is a 106-hectare area covering parts of Woolloongabba, Kangaroo Point, East Brisbane, and South Brisbane.

SUBMITTER INFORMATION:
- Name: ${personalDetails.fullName}
- Email: ${personalDetails.email}`;

    if (personalDetails.address) {
        prompt += `\n- Location: ${personalDetails.address}`;
    }

    if (personalDetails.organisation) {
        prompt += `\n- Organisation: ${personalDetails.organisation}`;
    }

    // Add perspective
    const perspectiveLabels = {
        resident: "Local resident",
        business: "Business owner/operator in the area",
        worker: "Works in the area",
        interested: "Interested in living/working in the area",
        community: "Community organization representative",
        other: "Community stakeholder"
    };

    prompt += `\n- Perspective: ${perspectiveLabels[preferences.perspective]}`;

    // Add main concerns
    const concernLabels = {
        housing: "Housing and development impacts",
        infrastructure: "Infrastructure and services", 
        transport: "Transport and traffic",
        community: "Community facilities and amenities",
        environment: "Environment and sustainability",
        economic: "Economic development",
        consultation: "Consultation process and transparency",
        general: "General development planning"
    };

    prompt += `\n\nMAIN AREAS OF CONCERN:`;
    preferences.mainConcerns.forEach(concern => {
        prompt += `\n- ${concernLabels[concern]}`;
    });

    // Add detailed concerns
    if (Object.keys(preferences.detailedAnswers).length > 0) {
        prompt += `\n\nSPECIFIC CONCERNS AND INTERESTS:`;
        Object.entries(preferences.detailedAnswers).forEach(([concern, questions]) => {
            const concernTitle = concernQuestions[concern]?.title || concern;
            prompt += `\n\n${concernTitle.toUpperCase()}:`;
            questions.forEach(questionAnswers => {
                if (questionAnswers && questionAnswers.length > 0) {
                    questionAnswers.forEach(answer => {
                        prompt += `\n- ${answer.label}`;
                    });
                }
            });
        });
    }

    // Add tone instruction
    const toneInstructions = {
        professional: "Write in a professional, formal tone suitable for government correspondence.",
        concerned: "Write from the perspective of a concerned community member, showing genuine care for the area while remaining respectful and constructive.",
        supportive: "Write in a supportive and constructive tone, acknowledging positive aspects of the development while offering helpful suggestions.",
        critical: "Write with critical analysis, providing detailed examination of potential issues and robust alternatives, while maintaining a respectful tone."
    };

    prompt += `\n\nTONE: ${toneInstructions[preferences.tone]}`;

    // Add additional comments if provided
    if (additionalComments.trim()) {
        prompt += `\n\nADDITIONAL CONTEXT FROM SUBMITTER:
"${additionalComments}"`;
    }

    prompt += `\n\nTASK:
Write a comprehensive, well-structured submission letter that:

1. Follows proper formal letter format (date, salutation, body, closing, signature)
2. Addresses the Minister for Economic Development Queensland
3. References the Woolloongabba PDA Development Scheme Amendment and DCOP specifically
4. Incorporates the submitter's specific concerns and interests naturally into the narrative
5. Provides substantive, thoughtful feedback relevant to the consultation
6. Maintains the requested tone throughout
7. Includes specific suggestions or recommendations where appropriate
8. Shows understanding of the area's context and the consultation process
9. Concludes with appropriate contact details

The submission should be approximately 500-800 words, feel authentic to the submitter's perspective, and flow naturally. Avoid formulaic language and make it sound genuinely thoughtful and engaged.

Format the response as a complete letter ready to be submitted to EDQ.`;

    return prompt;
}

async function generateSubmissionWithFallback() {
    const prompt = buildPrompt();
    let lastError = null;
    let attemptCount = 0;

    // Try each API key in sequence
    for (let i = 0; i < API_CONFIG.keys.length; i++) {
        const keyConfig = API_CONFIG.keys[(API_CONFIG.currentIndex + i) % API_CONFIG.keys.length];

        if (!keyConfig.active) continue;

        attemptCount++;

        try {
            console.log(`Attempting generation with ${keyConfig.name} (attempt ${attemptCount})`);

            const submission = await callLLM(prompt, keyConfig);

            // Update current index for next time
            API_CONFIG.currentIndex = (API_CONFIG.currentIndex + i) % API_CONFIG.keys.length;

            return {
                submission: submission,
                providerUsed: keyConfig.name
            };

        } catch (error) {
            console.error(`Failed with ${keyConfig.name}:`, error.message);
            lastError = error;

            // Mark as inactive if it's a permanent error (like invalid key)
            if (error.message.includes('401') || error.message.includes('invalid') || error.message.includes('unauthorized')) {
                keyConfig.active = false;
                console.log(`Deactivated ${keyConfig.name} due to authentication error`);
            }

            // Continue to next API key
            continue;
        }
    }

    // If all APIs failed
    throw new Error(`All API services are currently unavailable. Last error: ${lastError?.message || 'Unknown error'}. Please try again later.`);
}

async function callLLM(prompt, keyConfig) {
    const config = llmConfigs[keyConfig.provider];

    if (keyConfig.provider === 'google') {
        return await callGoogleAI(prompt, keyConfig, config);
    } else {
        return await callOpenAIFormat(prompt, keyConfig, config);
    }
}

async function callOpenAIFormat(prompt, keyConfig, config) {
    const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: config.headers(keyConfig.apiKey),
        body: JSON.stringify({
            model: config.model,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 2000,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

async function callGoogleAI(prompt, keyConfig, config) {
    const url = config.urlWithKey ? config.urlWithKey(keyConfig.apiKey) : config.apiUrl;

    const response = await fetch(url, {
        method: 'POST',
        headers: config.headers(keyConfig.apiKey),
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2000
            }
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

// Display and utility functions
function displaySubmission(submission) {
    if (generatedSubmission) {
        generatedSubmission.value = submission;
        updateWordCount();
    }

    if (outputSection) {
        outputSection.classList.remove('hidden');

        // Scroll to output
        setTimeout(() => {
            outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

function showProviderUsed(providerName) {
    if (usedProvider && generationInfo) {
        usedProvider.textContent = providerName;
        generationInfo.classList.remove('hidden');
    }
}

function updateWordCount() {
    if (generatedSubmission && wordCount) {
        const text = generatedSubmission.value.trim();
        const words = text ? text.split(/\s+/).length : 0;
        wordCount.textContent = words.toLocaleString();
    }
}

function setLoadingState(isLoading) {
    if (generateBtn && btnText && loadingSpinner) {
        if (isLoading) {
            generateBtn.disabled = true;
            btnText.classList.add('hidden');
            loadingSpinner.classList.remove('hidden');
        } else {
            generateBtn.disabled = false;
            btnText.classList.remove('hidden');
            loadingSpinner.classList.add('hidden');
        }
    }
}

function showErrorMessage(message) {
    removeStatusMessages();
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;

    if (generateBtn && generateBtn.parentNode) {
        generateBtn.parentNode.insertBefore(errorDiv, generateBtn);
    }

    setTimeout(() => {
        if (errorDiv && errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 10000);
}

function showSuccessMessage(message) {
    removeStatusMessages();
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;

    if (outputSection && !outputSection.classList.contains('hidden')) {
        outputSection.insertBefore(successDiv, outputSection.firstChild);
    } else if (generateBtn && generateBtn.parentNode) {
        generateBtn.parentNode.insertBefore(successDiv, generateBtn);
    }

    setTimeout(() => {
        if (successDiv && successDiv.parentNode) {
            successDiv.parentNode.removeChild(successDiv);
        }
    }, 5000);
}

function removeStatusMessages() {
    const messages = document.querySelectorAll('.error-message, .success-message');
    messages.forEach(msg => {
        if (msg && msg.parentNode) {
            msg.parentNode.removeChild(msg);
        }
    });
}

async function copyToClipboard() {
    if (!generatedSubmission) return;

    try {
        await navigator.clipboard.writeText(generatedSubmission.value);
        showSuccessMessage('Submission copied to clipboard!');
    } catch (error) {
        generatedSubmission.select();
        document.execCommand('copy');
        showSuccessMessage('Submission copied to clipboard!');
    }
}

function downloadSubmission() {
    if (!generatedSubmission || !currentFormData) return;

    const text = generatedSubmission.value;
    const safeName = currentFormData.personalDetails.fullName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Woolloongabba_PDA_Submission_${safeName}.txt`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    showSuccessMessage('Submission downloaded successfully!');
}

function toggleEditMode() {
    if (!generatedSubmission || !editBtn) return;

    const isReadonly = generatedSubmission.hasAttribute('readonly');

    if (isReadonly) {
        generatedSubmission.removeAttribute('readonly');
        generatedSubmission.focus();
        editBtn.textContent = 'Finish Editing';
        editBtn.classList.remove('btn--outline');
        editBtn.classList.add('btn--primary');
    } else {
        generatedSubmission.setAttribute('readonly', '');
        editBtn.textContent = 'Edit Submission';
        editBtn.classList.remove('btn--primary');
        editBtn.classList.add('btn--outline');
        showSuccessMessage('Submission updated!');
        updateWordCount();
    }
}