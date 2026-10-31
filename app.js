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
    if (ageGroup.value === "under_18") {
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
