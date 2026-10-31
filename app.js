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

// Function to move from follow-up questions to the tests
function goToCognitiveTests() {
    const form = document.getElementById("researchForm");
    
    // HTML5 check to make sure all visible required fields are filled out
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Transition smoothly to the cognitive section placeholder
    showSection("section-cognitive");
}

// Helper function to handle swapping screen sections cleanly
function showSection(sectionId) {
    // Hide every section container on the screen
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    // Display only the requested section
    document.getElementById(sectionId).classList.add('active');
}
// --- MENTAL ROTATION TEST VARIABLES & DATA ---
let currentRotationIndex = 0;
let rotationStartTime;
const rotationDataLog = []; // This array will hold your AP Research data results

// The Data Bank: Define the paths to your images and specify which option is correct
const rotationQuestions = [
    {
        target: "images/target1.png",
        optionA: "images/option1A.png", // Let's say this is the correct rotated one
        optionB: "images/option1B.png", // This is the distractor/wrong one
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

// Modify your existing goToCognitiveTests function or add this to trigger the start
// Ensure your older goToCognitiveTests() calls startMentalRotationTest() at the end!
function startMentalRotationTest() {
    currentRotationIndex = 0;
    loadRotationQuestion();
}

function loadRotationQuestion() {
    const currentQ = rotationQuestions[currentRotationIndex];
    
    // Update the progress number and images
    document.getElementById("rot-current-q").innerText = currentRotationIndex + 1;
    document.getElementById("rotation-target").src = currentQ.target;
    document.getElementById("rotation-optionA").src = currentQ.optionA;
    document.getElementById("rotation-optionB").src = currentQ.optionB;
    
    // Start the millisecond timer using performance.now() for high precision
    rotationStartTime = performance.now();
}

function submitRotationAnswer(chosenOption) {
    const endTime = performance.now();
    const reactionTimeMs = Math.round(endTime - rotationStartTime);
    const currentQ = rotationQuestions[currentRotationIndex];
    
    // Evaluate correctness
    const isCorrect = (chosenOption === currentQ.correctAnswer) ? 1 : 0;
    
    // Log data metrics for this question
    rotationDataLog.push({
        questionNumber: currentRotationIndex + 1,
        accuracy: isCorrect,
        reactionTime: reactionTimeMs
    });
    
    // Advance logic
    currentRotationIndex++;
    if (currentRotationIndex < rotationQuestions.length) {
        loadRotationQuestion();
    } else {
        finishMentalRotationTest();
    }
}

function finishMentalRotationTest() {
    console.log("Mental Rotation Data Collected:", rotationDataLog);
    alert("Mental Rotation test completed! Moving to the next test.");
    // In the future, this will change screens to your Corsi Block test section
}

// Ensure the screening phase triggers the start of the rotation test
// Update your older goToCognitiveTests function to look like this:
function goToCognitiveTests() {
    const form = document.getElementById("researchForm");
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    showSection("section-cognitive");
    startMentalRotationTest(); // This kicks off the image loading
}
