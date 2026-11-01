// Function to evaluate the first two screening questions
function evaluateScreening() {
    // 1. Grab the values of the selected radio buttons
    const ageGroup = document.querySelector('input[name="age"]:checked');
    const instrumentStatus = document.querySelector('input[name="instrument_status"]:checked');

    // Validation check: Make sure they actually selected an answer for both
    if (!ageGroup || !instrumentStatus) {
        alert("Please answer both questions before proceeding.");
        return;
    }

    // 2. APPLY CRITERIA RULES
    // RULE A: Check age constraint (Example: Change "under_18" if your target is adults, or vice-versa)
    if (ageGroup.value === "under_12") {
        showSection("section-disqualified");
        return; 
    }

    if (ageGroup.value === "19_or_older") {
        showSection("section-disqualified");
        return; 
    }

    // RULE B: Check instrument requirement 
    // (If "never_played" doesn't fit your methodology criteria, fail them here)
    if (instrumentStatus.value === "never_played") {
        showSection("section-disqualified");
        return;
    }

    // 3. DYNAMIC ROUTING TO FOLLOW-UP QUESTIONS
    // Hide both conditional blocks first to reset the view
    document.getElementById("block-past-player").classList.add("hidden");
    document.getElementById("block-current-player").classList.add("hidden");
    
    // Remove 'required' tags to prevent form errors on hidden fields
    document.querySelectorAll('#block-past-player input').forEach(el => el.removeAttribute('required'));
    document.querySelectorAll('#block-current-player input').forEach(el => el.removeAttribute('required'));

    if (instrumentStatus.value === "used_to_play") {
        // Show past player question and make it mandatory
        document.getElementById("block-past-player").classList.remove("hidden");
        document.querySelectorAll('#block-past-player input').forEach(el => el.setAttribute('required', true));
    } else if (instrumentStatus.value === "currently_play") {
        // Show current player question and make it mandatory
        document.getElementById("block-current-player").classList.remove("hidden");
        document.querySelectorAll('#block-current-player input').forEach(el => el.setAttribute('required', true));
    }

    // Advance to the follow-up section
    showSection("section-followup");
}

// ==========================================
// TRANSITION TO TESTING PHASE
// ==========================================

function goToCognitiveTests() {
    const form = document.getElementById("researchForm");
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    showSection("section-cognitive");
    startMentalRotationTest(); // This kicks off the image loading
}

// ==========================================
// MENTAL ROTATION TEST ENGINE
// ==========================================

let currentRotationIndex = 0;
let rotationStartTime;
const rotationDataLog = []; // Holds AP Research results for Mental Rotation

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

function startMentalRotationTest() {
    currentRotationIndex = 0;
    loadRotationQuestion();
}

function loadRotationQuestion() {
    const currentQ = rotationQuestions[currentRotationIndex];
    
    // Update the progress number and image sources
    document.getElementById("rot-current-q").innerText = currentRotationIndex + 1;
    document.getElementById("rotation-target").src = currentQ.target;
    document.getElementById("rotation-optionA").src = currentQ.optionA;
    document.getElementById("rotation-optionB").src = currentQ.optionB;
    
    // High-precision millisecond timer
    rotationStartTime = performance.now();
}

function submitRotationAnswer(chosenOption) {
    const endTime = performance.now();
    const reactionTimeMs = Math.round(endTime - rotationStartTime);
    const currentQ = rotationQuestions[currentRotationIndex];
    
    // Evaluate if choice matches data criteria
    const isCorrect = (chosenOption === currentQ.correctAnswer) ? 1 : 0;
    
    // Log metrics
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
    
    // Transition to the Corsi block test section container
    showSection("section-corsi");
    initCorsiTest();
}

// ==========================================
// CORSI BLOCK TAPPING TEST ENGINE
// ==========================================

let corsiRound = 0;
let corsiSequence = [];
let userSequence = [];
let corsiIsFlashing = false;
const corsiDataLog = []; // Holds AP Research metrics for Corsi

// Pre-defined sequence routes utilizing your grid block IDs 1 through 9
const corsiRoundsConfig = [,       // Round 1: Sequence Length 3,    // Round 2: Sequence Length 4
    [9, 4, 2, 7, 6]  // Round 3: Sequence Length 5
];

function initCorsiTest() {
    corsiRound = 0;
    setupCorsiRound();
}

function setupCorsiRound() {
    userSequence = [];
    corsiIsFlashing = false;
    document.getElementById("corsi-round").innerText = corsiRound + 1;
    document.getElementById("corsi-instructions").innerText = "Tap the 'Start Sequence' button below when you are ready to memorize.";
    document.getElementById("corsi-start-btn").style.display = "inline-block";
    document.getElementById("corsi-grid-container").style.pointerEvents = "none"; // Lock interactions during idle state
}

function playCorsiSequence() {
    document.getElementById("corsi-start-btn").style.display = "none";
    document.getElementById("corsi-instructions").innerText = "Watch carefully...";
    corsiIsFlashing = true;
    
    corsiSequence = corsiRoundsConfig[corsiRound];
    let delay = 500;

    corsiSequence.forEach((blockId, index) => {
        // Step A: Illuminate block
        setTimeout(() => {
            const block = document.querySelector(`.corsi-block[data-id="${blockId}"]`);
            if (block) block.classList.add("flash");
        }, delay);

        delay += 600; // Duration block remains lit

        // Step B: Extinguish block
        setTimeout(() => {
            const block = document.querySelector(`.corsi-block[data-id="${blockId}"]`);
            if (block) block.classList.remove("flash");
            
            // Release inputs to the participant if this is the final block in the current sequence
            if (index === corsiSequence.length - 1) {
                setTimeout(() => {
                    document.getElementById("corsi-instructions").innerText = "Repeat the sequence now!";
                    document.getElementById("corsi-grid-container").style.pointerEvents = "auto"; // Unlock input tracking
                    corsiIsFlashing = false;
                }, 300);
            }
        }, delay);

        delay += 300; // Inter-stimulus interval gap
    });
}

function handleCorsiBlockClick(blockId) {
    if (corsiIsFlashing) return; // Hard fail-safe protection

    // Haptic touch visual mimicry feedback
    const block = document.querySelector(`.corsi-block[data-id="${blockId}"]`);
    if (block) {
        block.classList.add("user-tap");
        setTimeout(() => block.classList.remove("user-tap"), 200);
    }

    userSequence.push(blockId);

    // Track matching values step-by-step
    const currentTapIndex = userSequence.length - 1;
    if (userSequence[currentTapIndex] !== corsiSequence[currentTapIndex]) {
        endCorsiRound(false);
        return;
    }

    // Verify if player successfully finished the chain sequence
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
    // In our next step, we will trigger your final Rhythm Tapping setup here
}
