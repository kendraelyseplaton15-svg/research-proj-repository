// ==========================================
// SECTION 1: GLOBAL CONSTANTS & DATA LOGS
// ==========================================
const rotationDataLog = []; // Holds Mental Rotation metrics
const corsiDataLog = [];   // Holds Corsi Block metrics
const rhythmDataLog = [];  // Will hold Rhythm Tapping metrics

// Data Bank for the 5 Mental Rotation questions
const rotationQuestions = [
    {
        target: "images/target1.png",
        optionA: "images/option1A.png", 
        optionB: "images/option1B.png", 
        correctAnswer: "A"
    },
    {
        target: "images/target2.png",
        optionA: "images/option2A.png",
        optionB: "images/option2B.png",
        correctAnswer: "B"
    },
    {
        target: "images/target3.png",
        optionA: "images/option3A.png",
        optionB: "images/option3B.png",
        correctAnswer: "A"
    },
    {
        target: "images/target4.png",
        optionA: "images/option4A.png",
        optionB: "images/option4B.png",
        correctAnswer: "B"
    },
    {
        target: "images/target5.png",
        optionA: "images/option5A.png",
        optionB: "images/option5B.png",
        correctAnswer: "A"
    }
];

// Pre-defined sequence routes utilizing your grid block IDs 1 through 9
const corsiRoundsConfig = [[1, 5, 3],    // Round 1: Sequence Length 3
    [2, 8, 4, 6], // Round 2: Sequence Length 4
    [9, 4, 2, 7, 6] // Round 3: Sequence Length 5
];

// State tracking variables
let currentRotationIndex = 0;
let rotationStartTime;
let corsiRound = 0;
let corsiSequence = [];
let userSequence = [];
let corsiIsFlashing = false;

// ==========================================
// SECTION 2: UTILITY SCREEN ROUTER
// ==========================================
function showSection(sectionId) {
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// ==========================================
// SECTION 3: PRELIMINARY SCREENING RULES
// ==========================================
function evaluateScreening() {
    const ageGroup = document.querySelector('input[name="age"]:checked');
    const instrumentStatus = document.querySelector('input[name="instrument_status"]:checked');

    if (!ageGroup || !instrumentStatus) {
        alert("Please answer both questions before proceeding.");
        return;
    }

    // Rule A: Under 12 or 19 and older gets disqualified
    if (ageGroup.value === "under_12" || ageGroup.value === "19_or_older") {
        showSection("section-disqualified");
        return; 
    }

    // Rule B: Never played gets disqualified
    if (instrumentStatus.value === "never_played") {
        showSection("section-disqualified");
        return;
    }

    // Reset conditional elements and remove HTML5 validation locks
    document.getElementById("block-past-player").classList.add("hidden");
    document.getElementById("block-current-player").classList.add("hidden");
    document.querySelectorAll('#block-past-player input').forEach(el => el.removeAttribute('required'));
    document.querySelectorAll('#block-current-player input').forEach(el => el.removeAttribute('required'));

    // Dynamic question branch injection
    if (instrumentStatus.value === "used_to_play") {
        document.getElementById("block-past-player").classList.remove("hidden");
        document.querySelectorAll('#block-past-player input').forEach(el => el.setAttribute('required', true));
    } else if (instrumentStatus.value === "currently_play") {
        document.getElementById("block-current-player").classList.remove("hidden");
        document.querySelectorAll('#block-current-player input').forEach(el => el.setAttribute('required', true));
    }

    showSection("section-followup");
}

function goToCognitiveTests() {
    const form = document.getElementById("researchForm");
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    showSection("section-cognitive");
    startMentalRotationTest();
}

// ==========================================
// SECTION 4: MENTAL ROTATION ENGINE
// ==========================================
function startMentalRotationTest() {
    currentRotationIndex = 0;
    loadRotationQuestion();
}

function loadRotationQuestion() {
    const currentQ = rotationQuestions[currentRotationIndex];
    
    document.getElementById("rot-current-q").innerText = currentRotationIndex + 1;
    document.getElementById("rotation-target").src = currentQ.target;
    document.getElementById("rotation-optionA").src = currentQ.optionA;
    document.getElementById("rotation-optionB").src = currentQ.optionB;
    
    rotationStartTime = performance.now();
}

function submitRotationAnswer(chosenOption) {
    const endTime = performance.now();
    const reactionTimeMs = Math.round(endTime - rotationStartTime);
    const currentQ = rotationQuestions[currentRotationIndex];
    
    const isCorrect = (chosenOption === currentQ.correctAnswer) ? 1 : 0;
    
    rotationDataLog.push({
        questionNumber: currentRotationIndex + 1,
        accuracy: isCorrect,
        reactionTime: reactionTimeMs
    });
    
    currentRotationIndex++;
    if (currentRotationIndex < rotationQuestions.length) {
        loadRotationQuestion();
    } else {
        finishMentalRotationTest();
    }
}

function finishMentalRotationTest() {
    console.log("Mental Rotation Data Collected:", rotationDataLog);
    alert("Mental Rotation test completed! Moving to the Corsi Block test.");
    showSection("section-corsi");
    initCorsiTest();
}

// ==========================================
// SECTION 5: CORSI BLOCK ENGINE
// ==========================================
function initCorsiTest() {
    corsiRound = 0;
    setupCorsiRound();
}

function setupCorsiRound() {
    userSequence = [];
    corsiIsFlashing = false;
    document.getElementById("corsi-round").innerText = corsiRound + 1;
    document.getElementById("corsi-instructions").innerText = "Watch a grid of blocks light up in a random sequence, then recreate the pattern from memory. Tap the 'Start Sequence' button below when you are ready to memorize.";
    document.getElementById("corsi-start-btn").style.display = "inline-block";
    document.getElementById("corsi-grid-container").style.pointerEvents = "none";
}

function playCorsiSequence() {
    document.getElementById("corsi-start-btn").style.display = "none";
    document.getElementById("corsi-instructions").innerText = "Watch carefully...";
    corsiIsFlashing = true;
    
    corsiSequence = corsiRoundsConfig[corsiRound];
    let delay = 500;

    corsiSequence.forEach((blockId, index) => {
        setTimeout(() => {
            const block = document.querySelector(`.corsi-block[data-id="${blockId}"]`);
            if (block) block.classList.add("flash");
        }, delay);

        delay += 600;

        setTimeout(() => {
            const block = document.querySelector(`.corsi-block[data-id="${blockId}"]`);
            if (block) block.classList.remove("flash");
            
            if (index === corsiSequence.length - 1) {
                setTimeout(() => {
                    document.getElementById("corsi-instructions").innerText = "Repeat the sequence now!";
                    document.getElementById("corsi-grid-container").style.pointerEvents = "auto";
                    corsiIsFlashing = false;
                }, 300);
            }
        }, delay);

        delay += 300;
    });
}

function handleCorsiBlockClick(blockId) {
    if (corsiIsFlashing) return;

    const block = document.querySelector(`.corsi-block[data-id="${blockId}"]`);
    if (block) {
        block.classList.add("user-tap");
        setTimeout(() => block.classList.remove("user-tap"), 200);
    }

    userSequence.push(blockId);

    const currentTapIndex = userSequence.length - 1;
    if (userSequence[currentTapIndex] !== corsiSequence[currentTapIndex]) {
        endCorsiRound(false);
        return;
    }

    if (userSequence.length === corsiSequence.length) {
        endCorsiRound(true);
    }
}

function endCorsiRound(isCorrect) {
    corsiDataLog.push({
        round: corsiRound + 1,
        sequenceLength: corsiSequence.length,
        success: isCorrect ? 1 : 0
    });

    if (isCorrect) {
        alert("Correct choice! Moving to the next round.");
    } else {
        alert("Incorrect sequence.");
    }

    corsiRound++;
    if (corsiRound < corsiRoundsConfig.length) {
        setupCorsiRound();
    } else {
        finishCorsiTest();
    }
}

function finishCorsiTest() {
    console.log("Corsi Test Data Collected:", corsiDataLog);
    alert("Corsi Block test completed! Moving to the final test.");
    showSection("section-rhythm");
    // Rhythm test initiation hooks will be inserted here next
}

// ==========================================
// SECTION 6: RHYTHM TAPPING ENGINE
// ==========================================
const targetInterval = 600; // 100 BPM translates to exactly 600ms per beat
let flashCount = 0;
let flashIntervalId = null;
let userTapTimestamps = [];
const maxRequiredTaps = 10;

function startRhythmTest() {
    document.getElementById("rhythm-start-btn").style.display = "none";
    document.getElementById("rhythm-instructions").innerText = "Internalizing rhythm... count the flashes.";
    
    flashCount = 0;
    userTapTimestamps = [];
    
    // Start visual metronome loop running every 600ms (100 BPM)
    flashIntervalId = setInterval(executeVisualFlash, targetInterval);
}

function executeVisualFlash() {
    flashCount++;
    const visualCue = document.getElementById("rhythm-visual-cue");
    
    // Trigger visual illumination flash
    visualCue.classList.add("lit");
    setTimeout(() => {
        visualCue.classList.remove("lit");
    }, 150); // Flash stays on screen for 150ms

    // Once it has flashed exactly 8 times, terminate the guide phase
    if (flashCount >= 8) {
        clearInterval(flashIntervalId);
        
        // Transition immediately to Continuation Phase
        setTimeout(() => {
            document.getElementById("rhythm-instructions").innerText = "START TAPPING! Keep that exact same speed for 10 counts.";
            visualCue.style.display = "none"; // Hide metronome entirely so they rely purely on mental memory
            document.getElementById("rhythm-tap-pad").classList.remove("hidden"); // Reveal big tapping pad
        }, targetInterval);
    }
}

function handleRhythmTap(event) {
    // Prevent double-triggering on mobile screens that recognize both touch and click events
    event.preventDefault(); 
    
    const tapTime = performance.now();
    
    // Quick haptic-style color flicker for user confirmation
    const pad = document.getElementById("rhythm-tap-pad");
    pad.classList.add("pad-active");
    setTimeout(() => pad.classList.remove("pad-active"), 80);

    userTapTimestamps.push(tapTime);
    
    // Keep user updated on progress count
    document.getElementById("rhythm-instructions").innerText = `Taps recorded: ${userTapTimestamps.length} / ${maxRequiredTaps}`;

    if (userTapTimestamps.length >= maxRequiredTaps) {
        processRhythmData();
    }
}

function processRhythmData() {
    // Calculate variations between consecutive taps
    // Tap 2 time minus Tap 1 time = user's actual interval speed
    for (let i = 1; i < userTapTimestamps.length; i++) {
        const actualInterval = userTapTimestamps[i] - userTapTimestamps[i-1];
        const varianceMs = actualInterval - targetInterval; // Negative = too fast, Positive = too slow
        
        rhythmDataLog.push({
            tapIndex: i,
            actualIntervalMs: Math.round(actualInterval),
            deviationFromTargetMs: Math.round(varianceMs)
        });
    }

    console.log("Rhythm Test Data Collected:", rhythmDataLog);
    alert("Rhythm Test complete!");
    showSection("section-complete");
}

// ==========================================
// SECTION 0 & 8: CONSENT & TERMINAL FLOWS
// ==========================================

function validateConsentAndBegin() {
    const consentBox = document.getElementById("consent-checkbox");
    
    // Strict HTML5 validation check
    if (!consentBox.checked) {
        alert("You must read the overview and check the consent box to participate in this study.");
        return;
    }
    
    // Advance to your preliminary questionnaire questions layout safely
    showSection("section-screening");
}

// Modify your existing submitFinalData() function inside app.js or place this over it:
function submitFinalData() {
    // Collect all data elements into one structural bucket
    const fullDataset = {
        mentalRotation: rotationDataLog,
        corsiBlocks: corsiDataLog,
        rhythmTapping: rhythmDataLog
    };
    
    console.log("FINAL FULL DATASET COMPILED FOR EXPORT:", fullDataset);
    
    // Transition immediately to the final confirmation screen
    // (Note: In the next step, we will insert the web service call right here before the screen switch)
    showSection("section-thankyou");
}
