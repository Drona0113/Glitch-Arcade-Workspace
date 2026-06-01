// ==========================================
// 1. SELECTORS & CORE INTERFACE HOOKS
// ==========================================
const toggleModalBtn = document.querySelector('#toggle-modal');
const taskModal = document.querySelector('#task-modal');
const modalBg = document.querySelector('#task-modal .modal-bg');
const cancelTaskBtn = document.querySelector('#cancel-new-task');

const breakProtocolBtn = document.querySelector('#break-protocol-btn');
const engineModal = document.querySelector('#engine-modal');
const engineBg = document.querySelector('#engine-modal .modal-bg');
const closeEngineBtn = document.querySelector('#close-engine-btn');
const engineRoot = document.querySelector('#engine-root');

// ==========================================
// 2. MODAL CONTROLLER ENGINE LOGIC
// ==========================================

function openTaskForm() {
    document.querySelector('#task-title-input').value = '';
    document.querySelector('#task-desc-input').value = '';
    
    // 1. Target our task input form modal container and make it active
    const taskModal = document.querySelector('#task-modal');
    if (taskModal) {
        taskModal.classList.add('active');
        taskModal.style.zIndex = '250'; // ◄ Push form in front of the background mask layer
    }

    // 🛠️ 2. THE UX MASK FIX: Grab the engine background overlay element and dim the viewport!
    const engineModal = document.querySelector('#engine-modal');
    if (engineModal) {
        engineModal.classList.add('active');
    }

    // 💡 3. Ensure the game engine HTML elements are completely hidden so ONLY the form displays
    const engineRoot = document.querySelector('#engine-root');
    if (engineRoot) {
        engineRoot.style.display = 'none';
    }
}

function closeTaskForm() {
    const taskModal = document.querySelector('#task-modal');
    if (taskModal) {
        taskModal.classList.remove('active');
    }

    // 🛠️ REMOVE THE BACKDROP MASK: Shut off the background overlay entirely on close
    const engineModal = document.querySelector('#engine-modal');
    if (engineModal) {
        engineModal.classList.remove('active');
    }
}

function openEngineWindow(componentType) {
    const engineModal = document.querySelector('#engine-modal');
    if (!engineModal) return;

    engineModal.classList.add('active');
    
    const engineRoot = document.querySelector('#engine-root');
    if (engineRoot) {
        engineRoot.style.display = 'block';
    }

   if (componentType === 'game') {
        const taskWithImage = tasks.find(t => String(t.id) === String(activeEditingTaskId));
        const finalTarget = taskWithImage || tasks.find(t => t.image && t.image.trim() !== '');
        const backgroundImageSrc = finalTarget ? finalTarget.image : '';

        engineRoot.innerHTML = `
            <div class="arcade-wrapper" style="position: relative;">
                
                <div class="arcade-header">
                    <div class="arcade-stat-group">
                        <span class="stat-label">SCORE //</span>
                        <span id="arcade-score-val" class="arcade-stat-chip">00</span>
                    </div>
                    
                    <div class="arcade-stat-group main-stream">
                        <span class="stat-label">CORE DATA STREAM //</span>
                        <span id="system-status-readout" class="arcade-stat-chip text-pink">UNTOUCHED</span>
                    </div>
                    
                    <div class="arcade-stat-group">
                        <span class="stat-label">TIME //</span>
                        <span id="arcade-time-val" class="arcade-stat-chip">00-00</span>
                    </div>
                    
                    <button id="arcade-start-btn" class="cyber-action-btn save">INITIALIZE_GLITCH_CORE</button>
                    
                    <button class="close-engine-btn" onclick="closeEngineWindow()">✖ ESC</button>
                </div>
                
                <div class="arcade-board-frame">
                    <div class="canvas-layer-container" style="position: relative;">
                        <canvas id="arcade-glitch-canvas" style="position: absolute; top:0; left:0; z-index: 1;"></canvas>
                        <div id="arcade-grid-arena" style="position: relative; z-index: 2; background: transparent;"></div>
                    </div>
                </div>
            </div>
        `;
        
        preloadArcadeImageBuffer(backgroundImageSrc);
    }
}

function closeEngineWindow() {
    engineModal.classList.remove('active');
    engineRoot.innerHTML = ''; // Memory clear dump
}

// Event Listeners for layouts
toggleModalBtn.addEventListener('click', openTaskForm);
modalBg.addEventListener('click', closeTaskForm);
cancelTaskBtn.addEventListener('click', closeTaskForm);

breakProtocolBtn.addEventListener('click', () =>{ 
    // Look across the live webpage DOM nodes to find the first card containing a saved canvas rendering string
    const visibleCards = document.querySelectorAll('.task');
    let dynamicSelectedId = null;

    for (let card of visibleCards) {
        // If a task card has an image preview thumbnail rendered inside it, target its index!
        const previewImg = card.querySelector('.card-image-preview img');
        if (previewImg && previewImg.src.startsWith('data:image')) {
            dynamicSelectedId = card.id;
            break;
        }
    }

    // Explicitly lock the tracking variable state pointers directly to the active node target
    if (dynamicSelectedId) {
        // Match string-to-number types safely depending on your internal ID structures
        activeEditingTaskId = isNaN(dynamicSelectedId) ? dynamicSelectedId : parseInt(dynamicSelectedId);
        openEngineWindow('game');
    } else {
        alert("Macha! Please upload and save an image to at least one Kanban card first!");
    }
});
engineBg.addEventListener('click', closeEngineWindow);
closeEngineBtn.addEventListener('click', closeEngineWindow);






// ==========================================
// 3. KANBAN DATA STATE & RENDERING ENGINE
// ==========================================

// This is our Single Source of Truth for all tasks
let tasks = JSON.parse(localStorage.getItem('glitchTasks')) || [
    {
        id: "task-" + Date.now(),
        title: "Initialize Glitch Loop Engine",
        desc: "Connect canvas render frame loops to filter object modifiers.",
        column: "todo",
        image:null,
        filters:null
    }
];

// Target the wrapper regions inside our HTML columns
const columnWrappers = {
    "todo": document.querySelector('#todo .cards-wrapper'),
    "progress": document.querySelector('#progress .cards-wrapper'),
    "done": document.querySelector('#done .cards-wrapper')
};

function renderKanban() {
    // 1. Clear out column HTML wrappers so we don't paint duplicates
    Object.keys(columnWrappers).forEach(colId => {
        if (columnWrappers[colId]) columnWrappers[colId].innerHTML = '';
    });

    // 2. Loop through our task state data array and create DOM elements
    tasks.forEach(task => {
        const card = document.createElement('div');
        card.classList.add('task'); 
        card.setAttribute('draggable', 'true');
        card.id = task.id;

        // NEW: Check if this specific task has a saved image attached to it
        const imagePreviewHTML = task.image 
            ? `<div class="card-image-preview"><img src="${task.image}" style="width:100%; border-radius:4px; margin-bottom:10px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));"></div>` 
            : '';

        // 🔍 Double-check the innerHTML block inside your renderKanban() function:
        card.innerHTML = `
            ${imagePreviewHTML}
            <h2>${task.title}</h2>
            <p>${task.desc}</p>
            <div class="card-actions" style="display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; gap: 10px; width: 100%;">
                    <button class="open-edit-btn"><i class="ri-edit-box-line"></i> Edit Image</button>
                    <button class="delete-task-btn"><i class="ri-delete-bin-line"></i> Delete</button>
                </div>
                ${task.image ? `<button class="play-arcade-btn" style="background: rgba(255, 0, 127, 0.1); border: 1px solid var(--neon-pink); color: var(--neon-pink); padding: 8px; border-radius: 4px; font-weight: 600; cursor: pointer; width: 100%; font-size: 0.75rem; font-family: 'Courier New', monospace;"><i class="ri-gamepad-line"></i> BREAK PROTOCOL ON THIS IMAGE</button>` : ''}
            </div>
        `;
        if (columnWrappers[task.column]) {
            columnWrappers[task.column].appendChild(card);
        }
    });

    // Update the counter badges at the top of each column
    updateTaskCounters();
    
    // Save to local storage automatically
    localStorage.setItem('glitchTasks', JSON.stringify(tasks));
}

function updateTaskCounters() {
    Object.keys(columnWrappers).forEach(colId => {
        const columnElement = document.getElementById(colId);
        if (columnElement) {
            const countBadge = columnElement.querySelector('.count-badge');
            const totalCards = columnElement.querySelectorAll('.task').length;
            if (countBadge) countBadge.innerText = totalCards;
        }
    });
}

// Dynamic Global Click Capturer for our new Card Game button
document.addEventListener('click', (e) => {
    const playBtn = e.target.closest('.play-arcade-btn');
    if (!playBtn) return;

    const targetCard = playBtn.closest('.task');
    if (!targetCard) return;

    // 💡 THE TRICK: Set our tracking pointer to the EXACT card id you just clicked!
    activeArcadeTaskId = targetCard.id;
    activeEditingTaskId = targetCard.id; // Secondary sync backup

    // Open the game window layout instantly
    openEngineWindow('game');
});


// ==========================================
// 4. KANBAN INTERACTION LISTENERS
// ==========================================

const addTaskBtn = document.querySelector('#add-new-task');
const taskTitleInput = document.querySelector('#task-title-input');
const taskDescInput = document.querySelector('#task-desc-input');

addTaskBtn.addEventListener('click', () => {
    const title = taskTitleInput.value.trim();
    const desc = taskDescInput.value.trim();

    // Guard clause: stop execution if inputs are blank
    if (!title && !desc) return;

    // Build the data object framework
    const newTask = {
        id: "task-" + Date.now(), // Creates a unique numeric timestamp ID string
        title: title,
        desc: desc,
        column: "todo", // Drops fresh items inside the to-do column by default
        image: null,
        filters: null
    };

    // Push into our state data tracking array
    tasks.push(newTask);
    
    // Trigger our layout update pipeline
    renderKanban();
    closeTaskForm();
});

// Event delegation pattern to process card deletions smoothly

// ... (Your addTask listener stays exactly the same)

// Updated delete listener with a persistent storage save hook
document.body.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.delete-task-btn');
    if (deleteBtn) {
        const cardId = deleteBtn.closest('.task').id;
        
        // 1. Remove it from the active JavaScript array state
        tasks = tasks.filter(t => t.id !== cardId);
        
        // 2. CRUCIAL FIX: Save this newly filtered array to localStorage immediately!
        localStorage.setItem('glitchTasks', JSON.stringify(tasks));
        
        // 3. Update the screen layout view
        renderKanban();
    }
});

// Run our initial render cycle on startup load loop
renderKanban();

// ==========================================
// 5. DRAG AND DROP STATE SYNC ENGINE
// ==========================================
let draggedCardId = null;

// 1. Hook up Drag Events on the Board Column Containers
Object.keys(columnWrappers).forEach(colId => {
    const columnElement = document.getElementById(colId);
    
    if (columnElement) {
        // Triggers visually when a card hovers into a column area
        columnElement.addEventListener('dragenter', (e) => {
            e.preventDefault();
            columnElement.classList.add('hover-over');
        });

        // Triggers visually when a card leaves a column area
        columnElement.addEventListener('dragleave', (e) => {
            e.preventDefault();
            columnElement.classList.remove('hover-over');
        });

        // Tells the browser engine that dropping elements here is allowed
        columnElement.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        // Handles the drop completion event sequence
        columnElement.addEventListener('drop', (e) => {
            e.preventDefault();
            columnElement.classList.remove('hover-over');

            if (draggedCardId) {
                // Find the targeted task object entry inside our memory state array
                const targetTask = tasks.find(t => t.id === draggedCardId);
                
                if (targetTask) {
                    // Sync state change: Update the column category property string
                    targetTask.column = colId;
                    
                    // Repaint the entire UI view to register positions, counters, and cache saves
                    renderKanban();
                }
            }
        });
    }
});

// 2. Catch the card initiation drag trigger using event bubbling
document.body.addEventListener('dragstart', (e) => {
    // Looks up the DOM tree to locate the card element wrapper matching our selector
    const card = e.target.closest('.task');
    if (card) {
        draggedCardId = card.id;
        card.style.opacity = '0.5'; // Visually dims the card being dragged
    }
});

document.body.addEventListener('dragend', (e) => {
    const card = e.target.closest('.task');
    if (card) {
        card.style.opacity = '1'; // Restores visual clarity on release
    }
    draggedCardId = null;
});


// ==========================================
// 6. IMAGE EDITOR COMPONENT PLUGIN
// ==========================================
let activeEditingTaskId = null;
let currentImage = null; // Holds the native Image() object instance

// Default filter values matching your original state object config
const defaultFilterSettings = {
    brightness: { value: 100, min: 0, max: 200, unit: '%' },
    contrast: { value: 100, min: 0, max: 200, unit: '%' },
    saturation: { value: 100, min: 0, max: 200, unit: '%' },
    hueRotation: { value: 0, min: 0, max: 360, unit: 'deg' },
    blur: { value: 0, min: 0, max: 20, unit: 'px' },
    grayscale: { value: 0, min: 0, max: 100, unit: '%' },
    sepia: { value: 0, min: 0, max: 100, unit: '%' },
    opacity: { value: 100, min: 0, max: 100, unit: '%' },
    invert: { value: 0, min: 0, max: 100, unit: '%' }
};

// Local working filters tracking object
let activeFilters = JSON.parse(JSON.stringify(defaultFilterSettings));

// Catch clicks on the "Edit Image" button inside task cards using Event Delegation
document.body.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.open-edit-btn');
    if (editBtn) {
        const card = editBtn.closest('.task');
        activeEditingTaskId = card.id;
        
        // Open the engine window modal and inject your original image editor HTML panels!
        openEngineWindow('editor');
        initializeImageEditorUI();
    }
});

function initializeImageEditorUI() {
    
    const targetTask = tasks.find(t => t.id === activeEditingTaskId);
    if (!targetTask) return;

    // Load custom saved filters if they exist, otherwise fall back to defaults
    activeFilters = targetTask.filters ? JSON.parse(JSON.stringify(targetTask.filters)) : JSON.parse(JSON.stringify(defaultFilterSettings));

    // Updated layout structure to hold your signature action bars and preset wrapper blocks!
    engineRoot.innerHTML = `
        <div class="editor-workspace">
            <div class="editor-left">
                <div class="editor-toolbar">
                    <label for="modal-image-input" class="cyber-action-btn">Choose Image</label>
                    <input type="file" accept="image/*" id="modal-image-input" style="display:none;">
                    <button id="modal-view-original-btn" class="cyber-action-btn info-btn">View Original</button>
                    <button id="modal-reset-btn" class="cyber-action-btn danger">Reset Filters</button>
                    <button id="modal-save-btn" class="cyber-action-btn save">Save to Card</button>
                </div>
                <div class="editor-canvas-frame">
                    <div class="editor-placeholder">
                        <i class="ri-image-line" style="font-size: 4rem; opacity: 0.3;"></i>
                        <p>No system media attached</p>
                    </div>
                    <canvas id="modal-image-canvas"></canvas>
                </div>
            </div>
            <div class="editor-right">
                <h3>FILTERS</h3>
                <div class="modal-sliders-container"></div>
                
                <h3 style="margin-top: 20px; border-top: 1px solid #2c354d; padding-top: 15px;">PRESETS</h3>
                <div class="modal-presets-container"></div>
            </div>
        </div>
    `;

    // Fire control generators
    generateEditorSliders();
    generateEditorPresets(); // ◄ Dynamic generator for your preset chips
    setupEditorEventListeners(targetTask);
}


function generateEditorSliders() {
    const container = document.querySelector('.modal-sliders-container');
    container.innerHTML = '';

    Object.keys(activeFilters).forEach(key => {
        const f = activeFilters[key];
        const filterDiv = document.createElement('div');
        filterDiv.className = 'editor-slider-wrapper';
        filterDiv.innerHTML = `
            <div class="slider-label-info">
                <span>${key}</span>
                <span class="slider-val-readout">${f.value}${f.unit}</span>
            </div>
            <input type="range" min="${f.min}" max="${f.max}" value="${f.value}" data-filter="${key}">
        `;
        container.appendChild(filterDiv);
    });
}

function applyModalFilters() {
    const canvas = document.querySelector('#modal-image-canvas');
    if (!canvas || !currentImage) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Your exact iconic canvas filter interpolation mechanics applied cleanly
    ctx.filter = `
        brightness(${activeFilters.brightness.value}${activeFilters.brightness.unit})
        contrast(${activeFilters.contrast.value}${activeFilters.contrast.unit})
        saturate(${activeFilters.saturation.value}${activeFilters.saturation.unit})
        hue-rotate(${activeFilters.hueRotation.value}${activeFilters.hueRotation.unit})
        blur(${activeFilters.blur.value}${activeFilters.blur.unit})
        grayscale(${activeFilters.grayscale.value}${activeFilters.grayscale.unit})
        sepia(${activeFilters.sepia.value}${activeFilters.sepia.unit})
        opacity(${activeFilters.opacity.value}${activeFilters.opacity.unit})
        invert(${activeFilters.invert.value}${activeFilters.invert.unit})
    `.trim();

    ctx.drawImage(currentImage, 0, 0);
}



function setupEditorEventListeners(task) {
    const fileInput = document.querySelector('#modal-image-input');
    const canvas = document.querySelector('#modal-image-canvas');
    const placeholder = document.querySelector('.editor-placeholder');
    const saveBtn = document.querySelector('#modal-save-btn');
    const slidersContainer = document.querySelector('.modal-sliders-container');

    // Load existing image state onto the canvas wrapper if it was previously saved
    if (task.image) {
        const img = new Image();
        img.src = task.image;
        img.onload = () => {
            currentImage = img;
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.style.display = 'block';
            placeholder.style.display = 'none';
            applyModalFilters();
        };
    }

    // Handle chosen file changes
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            currentImage = img;
            // ◄ CRUCIAL CAPTURE: Save the pure raw source string to the task structure state
            task.originalImageBackup = img.src;
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.style.display = 'block';
            placeholder.style.display = 'none';
            applyModalFilters();
        };
    });

    // Capture dynamic range slider updates
    slidersContainer.addEventListener('input', (e) => {
        const filterKey = e.target.dataset.filter;
        if (!filterKey) return;

        activeFilters[filterKey].value = e.target.value;
        e.target.previousElementSibling.querySelector('.slider-val-readout').innerText = `${e.target.value}${activeFilters[filterKey].unit}`;
        applyModalFilters();
    });

    // Save functionality: Commits changes to the master data structure array
    saveBtn.addEventListener('click', () => {
        if (currentImage && canvas) {
            // Take an optimized screenshot capture snapshot data string of the canvas layout context
            task.image = canvas.toDataURL('image/jpeg', 0.7);
        }
        task.filters = JSON.parse(JSON.stringify(activeFilters));

        // Sync and push changes into localStorage persistent layers
        localStorage.setItem('glitchTasks', JSON.stringify(tasks));
        renderKanban();
        closeEngineWindow();
    });
    // 1. Reset Action Click Event Handler
    const resetBtn = document.querySelector('#modal-reset-btn');
    resetBtn.addEventListener('click', () => {
        // Deep copy default parameters straight back into the working object pointer cache
        activeFilters = JSON.parse(JSON.stringify(defaultFilterSettings));
        
        // Refresh range slider position layouts and repaint canvas pixels
        generateEditorSliders();
        applyModalFilters();
    });

    // 2. Preset Chip Button Selector Handler using clean event targeting
    const presetsWrapper = document.querySelector('.modal-presets-container');
    presetsWrapper.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('.preset-chip-btn');
        if (!targetBtn) return;

        const presetKey = targetBtn.dataset.preset;
        const configurationValues = editorPresetsConfig[presetKey];

        // Override custom parameter states based on chosen profile matrices
        Object.keys(configurationValues).forEach(filterName => {
            if (activeFilters[filterName]) {
                activeFilters[filterName].value = configurationValues[filterName];
            }
        });



        // Re-sync input track handles on screen and re-run canvas pipelines!
        generateEditorSliders();
        applyModalFilters();
    });


    const viewOriginalBtn = document.querySelector('#modal-view-original-btn');
    
    // When the mouse clicks and holds down on the button
    viewOriginalBtn.addEventListener('mousedown', () => {
        if (!currentImage || !canvas) return;
        const ctx = canvas.getContext('2d');

        // 1. Clear out the active canvas board surface entirely
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 2. TEMPORARILY drop the CSS filter matrix back to standard zero baseline defaults
        ctx.filter = 'none';
        
        // 3. Draw the starting source state back on the frame layout context
        ctx.drawImage(currentImage, 0, 0);
    });

    // The instant the mouse button is released, snap the active filter designs right back!
    viewOriginalBtn.addEventListener('mouseup', applyModalFilters);
    
    // Safety check: if the cursor slides off the button area while clicking, restore filters
    viewOriginalBtn.addEventListener('mouseleave', applyModalFilters);
}

// Your signature filter style configurations preserved completely!
const editorPresetsConfig = {
    vintage: { brightness: 105, contrast: 90, saturation: 85, hueRotation: 15, blur: 0, grayscale: 0, sepia: 40, opacity: 100, invert: 0 },
    oldSchool: { brightness: 95, contrast: 85, saturation: 60, hueRotation: 0, blur: 1, grayscale: 15, sepia: 25, opacity: 100, invert: 0 },
    drama: { brightness: 110, contrast: 140, saturation: 130, hueRotation: 0, blur: 0, grayscale: 0, sepia: 0, opacity: 100, invert: 0 },
    cyberpunk: { brightness: 110, contrast: 120, saturation: 160, hueRotation: 310, blur: 0, grayscale: 0, sepia: 0, opacity: 100, invert: 0 },
    noir: { brightness: 90, contrast: 140, saturation: 0, hueRotation: 0, blur: 0, grayscale: 100, sepia: 0, opacity: 100, invert: 0 },
    warmSunset: { brightness: 100, contrast: 110, saturation: 125, hueRotation: 10, blur: 0, grayscale: 0, sepia: 30, opacity: 100, invert: 0 },
    coolIce: { brightness: 105, contrast: 105, saturation: 80, hueRotation: 190, blur: 0, grayscale: 0, sepia: 0, opacity: 100, invert: 0 },
    xRay: { brightness: 120, contrast: 130, saturation: 10, hueRotation: 180, blur: 0, grayscale: 100, sepia: 0, opacity: 100, invert: 100 },
    fade: { brightness: 115, contrast: 75, saturation: 75, hueRotation: 0, blur: 0, grayscale: 0, sepia: 10, opacity: 100, invert: 0 },
    dreamy: { brightness: 110, contrast: 95, saturation: 110, hueRotation: 0, blur: 2, grayscale: 0, sepia: 5, opacity: 100, invert: 0 }
};

function generateEditorPresets() {
    const container = document.querySelector('.modal-presets-container');
    if (!container) return;
    container.innerHTML = '';

    // Loop through your configuration mappings and build physical selector elements
    Object.keys(editorPresetsConfig).forEach(presetName => {
        const btn = document.createElement('button');
        btn.className = 'preset-chip-btn';
        btn.innerText = presetName;
        btn.dataset.preset = presetName;
        container.appendChild(btn);
    });
}

// ==========================================
// 7. INTEGRATED SANKAE ARCADE CORE ENGINE
// ==========================================
let arcadeIntervalId = null;
let arcadeTimerIntervalId = null;
let arcadeScore = 0;
let arcadeTime = '00-00';
let arcadeDirection = 'down';
let arcadeSnake = [];
let arcadeFood = { x: 0, y: 0 };
let activeArcadeTaskId = null; // Tracks which card context is being processed
const arcadeBlockSize = 30; // Grid dimensions matching custom panels
let arcadeRows = 0;
let arcadeCols = 0;
const arcadeGridBlocks = {}; // Coordinates mapper cache array

function initializeArcadeGrid() {
    const arena = document.querySelector('#arcade-grid-arena');
    const frame = document.querySelector('.arcade-board-frame');
    if (!arena || !frame) return;

    // Clear dynamic mapper caches entirely
    Object.keys(arcadeGridBlocks).forEach(key => delete arcadeGridBlocks[key]);
    arena.innerHTML = '';

    // Calculate maximum available boundary bounds dynamically
    arcadeCols = Math.floor(frame.clientWidth / arcadeBlockSize);
    arcadeRows = Math.floor(frame.clientHeight / arcadeBlockSize);

    // Apply strict sizing restrictions to grid template rows/columns engines
    arena.style.gridTemplateColumns = `repeat(${arcadeCols}, ${arcadeBlockSize}px)`;
    arena.style.gridTemplateRows = `repeat(${arcadeRows}, ${arcadeBlockSize}px)`;

    // Outer grid rendering double loop wrapper execution
    for (let r = 0; r < arcadeRows; r++) {
        for (let c = 0; c < arcadeCols; c++) {
            const blockCell = document.createElement('div');
            blockCell.className = 'arcade-grid-cell';
            arena.appendChild(blockCell);
            
            // Lock string coordinate tags straight into memory pointers
            arcadeGridBlocks[`${r}-${c}`] = blockCell;
        }
    }

    // 🛠️ FIX: Wipe out any duplicate click handlers before binding the game loop execution track
    const startBtn = document.querySelector('#arcade-start-btn');
    if (startBtn) {
        const clonedBtn = startBtn.cloneNode(true);
        startBtn.parentNode.replaceChild(clonedBtn, startBtn);
        clonedBtn.addEventListener('click', startArcadeGameLoop);
    }
}



function startArcadeGameLoop() {
    // Stop any active clock systems or intervals currently ticking in the background
    clearInterval(arcadeIntervalId);
    clearInterval(arcadeTimerIntervalId);

    Object.keys(arcadeGridBlocks).forEach(key => {
        arcadeGridBlocks[key].classList.remove('arcade-snake-node');
        arcadeGridBlocks[key].classList.remove('arcade-food-node');
    });

    // =================================================================
    //  FIX: RESTORE ORIGINAL IMAGE BUFFER STATE ON EACH NEW GAME RUN
    // =================================================================
    const canvas = document.getElementById('arcade-glitch-canvas');
    if (canvas && arcadeImageInstance) {
        const ctx = canvas.getContext('2d');
        // Clear out all mutated pixel arrays completely
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Repaint the raw, pure original picture back onto the buffer workbench!
        ctx.drawImage(arcadeImageInstance, 0, 0, canvas.width, canvas.height);
    }

    // Reset values to safe game starting baselines
    arcadeScore = 0;
    arcadeTime = '00-00';
    arcadeDirection = 'down';
    arcadeSnake = [{ x: 2, y: 5 }, { x: 1, y: 5 }]; // Starting coordinates matching loop
    
    document.querySelector('#arcade-score-val').innerText = '00';
    document.querySelector('#arcade-time-val').innerText = '00-00';
    document.querySelector('#arcade-start-btn').style.display = 'none';

    // Spawn starting meal components inside bounds safely
    generateArcadeFood();

    // Fire core ticker thread execution loops
    arcadeIntervalId = setInterval(renderArcadeFrameUpdate, 300);
    
    // Fire stopwatch logic updater clock
    arcadeTimerIntervalId = setInterval(() => {
        let [min, sec] = arcadeTime.split("-").map(Number);
        sec == 59 ? (min += 1, sec = 0) : sec += 1;
        arcadeTime = `${String(min).padStart(2, '0')}-${String(sec).padStart(2, '0')}`;
        document.querySelector('#arcade-time-val').innerText = arcadeTime;
    }, 1000);
}

function generateArcadeFood() {
    // Clear old positioning anchors off the board layout wrapper
    Object.keys(arcadeGridBlocks).forEach(key => arcadeGridBlocks[key].classList.remove('arcade-food-node'));

    let foodPlacedSuccessfully = false;

    while (!foodPlacedSuccessfully) {
        // Generate random test coordinates
        let testX = Math.floor(Math.random() * arcadeRows);
        let testY = Math.floor(Math.random() * arcadeCols);

        // Check if this test spot matches any part of the snake's body array
        const sitsOnSnake = arcadeSnake.some(segment => segment.x === testX && segment.y === testY);

        if (!sitsOnSnake) {
            // Safe spot found! Lock it in
            arcadeFood = { x: testX, y: testY };
            foodPlacedSuccessfully = true;
        }
    }

    // Light up the food cell node on screen
    const targetCell = arcadeGridBlocks[`${arcadeFood.x}-${arcadeFood.y}`];
    if (targetCell) targetCell.classList.add('arcade-food-node');
}

function renderArcadeFrameUpdate() {
    let head = null;
    
    // Match head tracking changes exactly based on direction parameters
    if (arcadeDirection === 'left') head = { x: arcadeSnake[0].x, y: arcadeSnake[0].y - 1 };
    else if (arcadeDirection === 'right') head = { x: arcadeSnake[0].x, y: arcadeSnake[0].y + 1 };
    else if (arcadeDirection === 'down') head = { x: arcadeSnake[0].x + 1, y: arcadeSnake[0].y };
    else if (arcadeDirection === 'up') head = { x: arcadeSnake[0].x - 1, y: arcadeSnake[0].y };

    // 1. Wall Boundary Collision Detection
    const hitWall = head.x < 0 || head.x >= arcadeRows || head.y < 0 || head.y >= arcadeCols;

    // 2. 🛠️ SELF-COLLISION CHECK: Scans if the head's next coordinate matches any existing body segment
    const hitBody = arcadeSnake.some(segment => segment.x === head.x && segment.y === head.y);

    if (hitWall || hitBody) {
        handleArcadeGameOver();
        return;
    }

    // Clean historical cell tail indicators from screen layout areas entirely
    arcadeSnake.forEach(segment => {
        const cell = arcadeGridBlocks[`${segment.x}-${segment.y}`];
        if (cell) cell.classList.remove('arcade-snake-node');
    });

    // 3. Check if Food is Consumed
    if (head.x === arcadeFood.x && head.y === arcadeFood.y) {
        arcadeScore += 10;
        const scoreVal = document.querySelector('#arcade-score-val');
        if (scoreVal) scoreVal.innerText = String(arcadeScore).padStart(2, '0');
        
        // Grow snake: Add new head, but DO NOT drop the tail!
        arcadeSnake.unshift(head);
        generateArcadeFood();
    } else {
        // Normal movement: Add new head, drop the trailing tail block
        arcadeSnake.unshift(head);
        arcadeSnake.pop();
    }

    // Draw updated positional values back onto display cell surfaces
    arcadeSnake.forEach(segment => {
        const cell = arcadeGridBlocks[`${segment.x}-${segment.y}`];
        if (cell) cell.classList.add('arcade-snake-node');
    });

    // ==========================================
    // RECRUITER-GRADE REAL-TIME PIXEL CORRUPTOR
    // ==========================================
    const statusReadout = document.querySelector('#system-status-readout');
    
    if (arcadeScore > 0) {
        // Grab the exact row where the snake head is navigating right now
        const snakeHeadRow = arcadeSnake[0].x;
        
        // Compute an execution intensity factor that scales up with the player's active score
        const glitchIntensity = Math.min(arcadeScore * 3, 255);
        
        // Execute a direct binary data buffer override right under the snake's head path!
        corruptPixelDataBuffer(snakeHeadRow, glitchIntensity);
        
        if (statusReadout) {
            statusReadout.innerText = `MUTATING_MEMORY_BUFFER // BYTES_SHIFTED_${glitchIntensity}`;
            statusReadout.style.color = 'var(--neon-pink)';
        }
    }
}

function handleArcadeGameOver() {
    clearInterval(arcadeIntervalId);
    clearInterval(arcadeTimerIntervalId);
    
    const startBtn = document.querySelector('#arcade-start-btn');
    if (startBtn) {
        startBtn.innerText = 'PROTOCOL_FAILED // TRY_AGAIN';
        startBtn.style.display = 'block';
    }
}

// Bind technical key registers straight to keyboard input streams
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && arcadeDirection !== 'down') arcadeDirection = 'up';
    else if (e.key === 'ArrowDown' && arcadeDirection !== 'up') arcadeDirection = 'down';
    else if (e.key === 'ArrowLeft' && arcadeDirection !== 'right') arcadeDirection = 'left';
    else if (e.key === 'ArrowRight' && arcadeDirection !== 'left') arcadeDirection = 'right';
});




let arcadeImageInstance = null;

function preloadArcadeImageBuffer(imageSrc) {
    const canvas = document.getElementById('arcade-glitch-canvas');
    if (!canvas || !imageSrc) {
        initializeArcadeGrid();
        return;
    }

    arcadeImageInstance = new Image();
    arcadeImageInstance.src = imageSrc;
    arcadeImageInstance.onload = () => {
        const frame = document.querySelector('.arcade-board-frame');
        
        // Calculate grid size allocations matching our block dimensions
        arcadeCols = Math.floor(frame.clientWidth / arcadeBlockSize);
        arcadeRows = Math.floor(frame.clientHeight / arcadeBlockSize);
        
        // Lock both canvas buffer and element grid coordinates to identical pixel bounds
        canvas.width = arcadeCols * arcadeBlockSize;
        canvas.height = arcadeRows * arcadeBlockSize;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // =================================================================
        // 🛠️ SMART ASPECT RATIO CALCULATION (PREVENTS COMPRESSION/SQUISHING)
        // =================================================================
        const imageRatio = arcadeImageInstance.width / arcadeImageInstance.height;
        const canvasRatio = canvas.width / canvas.height;
        
        let sourceX = 0, sourceY = 0;
        let sourceWidth = arcadeImageInstance.width;
        let sourceHeight = arcadeImageInstance.height;

        if (imageRatio > canvasRatio) {
            // Image is wider than the canvas -> crop the sides
            sourceWidth = arcadeImageInstance.height * canvasRatio;
            sourceX = (arcadeImageInstance.width - sourceWidth) / 2;
        } else {
            // Image is taller than the canvas -> crop the top and bottom
            sourceHeight = arcadeImageInstance.width / canvasRatio;
            sourceY = (arcadeImageInstance.height - sourceHeight) / 2;
        }

        // Draw the image cleanly by cropping from the center out to the boundaries
        ctx.drawImage(
            arcadeImageInstance, 
            sourceX, sourceY, sourceWidth, sourceHeight, // Where to crop from the original picture
            0, 0, canvas.width, canvas.height            // Where to place it on our game board
        );
        
        // Now build the transparent tile cells directly over the loaded picture
        initializeArcadeGrid();
    };
}


function corruptPixelDataBuffer(targetRow, intensity) {
    const canvas = document.getElementById('arcade-glitch-canvas');
    if (!canvas || !arcadeImageInstance) return;
    const ctx = canvas.getContext('2d');

    // 1. Extract the raw structural pixel buffer data block from the canvas context
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data; // ◄ Massive 1D Uint8ClampedArray buffer stream

    const startPixelY = targetRow * arcadeBlockSize;
    const endPixelY = Math.min(startPixelY + arcadeBlockSize, canvas.height);

    // 2. Compute the exact byte array offsets matching our snake grid coordinates position
    const startByteIndex = startPixelY * canvas.width * 4;
    const endByteIndex = endPixelY * canvas.width * 4;

    // 3. Run direct low-level memory channel byte mutations across the targeted buffer segment
    for (let i = startByteIndex; i < endByteIndex; i += 4) {
        // Swap channel arrays and overdrive saturation thresholds live
        let r = data[i];
        let g = data[i+1];
        let b = data[i+2];

        // Binary bitwise XOR shifts to scramble channel data when intensity scales high
        data[i]     = b ^ intensity;             // Red Channel gets Blue channel byte XOR mask
        data[i+1]   = (g + intensity * 2) % 256;  // Green Channel gets pushed into clipping states
        data[i+2]   = r;                         // Blue Channel captures original Red value
    }

    // 4. Forcefully push the mutated binary data buffer stream straight back onto the rendering frame
    ctx.putImageData(imgData, 0, 0);
}