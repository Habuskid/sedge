document.addEventListener("DOMContentLoaded", () => {
    console.log("Sedge OS Interactivity Loaded.");

    // 1. Generic Form Interception (Simulate Loading)
    document.querySelectorAll("form").forEach(form => {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('button');
            if (submitBtn) {
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = `<span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Processing...`;
                submitBtn.disabled = true;
                
                // Simulate network request
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    
                    // Route if action exists
                    const action = form.getAttribute("action");
                    if (action) {
                        window.location.href = action;
                    } else {
                        // generic success toast if no action
                        alert("Action successful.");
                    }
                }, 1000);
            }
        });
    });

    // 2. Generic Tab Switching Logic
    document.addEventListener("click", (e) => {
        const target = e.target.closest("button, a");
        if (!target) return;

        // "Execute" Command simulation
        if (target.textContent.toLowerCase().includes("execute")) {
            e.preventDefault();
            const originalText = target.innerHTML;
            target.innerHTML = `<span class="animate-pulse">Running...</span>`;
            setTimeout(() => {
                target.innerHTML = `<span class="material-symbols-outlined text-[16px]">check</span> Done`;
                setTimeout(() => target.innerHTML = originalText, 2000);
            }, 1500);
            return;
        }

        // Generic Dropdown Toggling
        const nextElem = target.nextElementSibling;
        if (nextElem && nextElem.classList.contains("absolute") && nextElem.classList.contains("hidden")) {
            e.preventDefault();
            nextElem.classList.remove("hidden");
            
            // Auto close when clicking outside
            const closeDropdown = (evt) => {
                if (!nextElem.contains(evt.target) && target !== evt.target) {
                    nextElem.classList.add("hidden");
                    document.removeEventListener("click", closeDropdown);
                }
            };
            setTimeout(() => document.addEventListener("click", closeDropdown), 10);
        }
    });

    // 3. Simulated Data Loading
    const skeletonLoaders = document.querySelectorAll('.animate-pulse');
    setTimeout(() => {
        skeletonLoaders.forEach(el => {
            el.classList.remove('animate-pulse');
        });
    }, 1200);
});
