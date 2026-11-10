
/* =====================================
   1. SIGNUP
===================================== */

function signup() {
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const password = document.getElementById("signupPassword").value;

    if (!name || !email || !password) {
        alert("Please fill all fields");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.some(user => user.email === email)) {
        alert("User already exists");
        return;
    }

    users.push({
        name: name,
        email: email,
        password: password,
        income: 0,
        expenses: [],
        savingsGoal: 0
    });

    localStorage.setItem("users", JSON.stringify(users));

    alert("Signup successful!");
    window.location.href = "login.html";
}


/* =====================================
   2. LOGIN (USER AND ADMIN)
===================================== */

function login() {
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        alert("Please enter email and password");
        return;
    }

    // Demo admin login
    if (email === "admin@gmail.com" && password === "admin123") {
        localStorage.setItem("loggedInUser", "admin");
        window.location.href = "admin.html";
        return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(function (u) {
        return u.email === email && u.password === password;
    });

    if (!user) {
        alert("Invalid email or password");
        return;
    }

    localStorage.setItem("loggedInUser", user.email);

    alert("Login successful!");
    window.location.href = "dashboard.html";
}


/* =====================================
   3. GET CURRENT USER
===================================== */

function getCurrentUser() {
    const email = localStorage.getItem("loggedInUser");

    if (!email || email === "admin") {
        return null;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    return users.find(function (user) {
        return user.email === email;
    }) || null;
}


/* =====================================
   4. ADD INCOME
===================================== */

function addIncome() {
    const input = document.getElementById("incomeInput");
    const amount = Number(input.value);

    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Please enter a valid income amount.");
        return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const email = localStorage.getItem("loggedInUser");

    const user = users.find(function(u) {
        return u.email === email;
    });

    if (!user) {
        alert("User not found. Please log in again.");
        return;
    }

    // Update total income
    user.income = Number(user.income || 0) + amount;

    // Save income history with today's date
    if (!Array.isArray(user.incomeHistory)) {
        user.incomeHistory = [];
    }

    user.incomeHistory.push({
        amount: amount,
        date: new Date().toISOString().slice(0, 10)
    });

    localStorage.setItem("users", JSON.stringify(users));

    input.value = "";

    updateDashboard();

    alert("Income added successfully!");
}
/* =====================================
   5. ADD EXPENSE
===================================== */

function addExpense() {
    const nameInput = document.getElementById("expenseName");
    const amountInput = document.getElementById("expenseAmount");
    const categoryInput = document.getElementById("expenseCategory");

    const name = nameInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categoryInput.value;

    if (!name || amountInput.value.trim() === "" ||
        !Number.isFinite(amount) || amount <= 0) {
        alert("Please enter valid expense details");
        return;
    }

    const user = getCurrentUser();

    if (!user) {
        alert("Please login again");
        window.location.href = "login.html";
        return;
    }

    if (!Array.isArray(user.expenses)) {
        user.expenses = [];
    }

    user.expenses.push({
        id: Date.now(),
        name: name,
        amount: amount,
        category: category,
        date: new Date().toISOString().slice(0, 10)
    });

    saveCurrentUser(user);

    nameInput.value = "";
    amountInput.value = "";

    updateDashboard();

    alert("Expense added successfully!");
}


/* =====================================
   6. SET SAVINGS GOAL
===================================== */

function setSavingsGoal() {
    const input = document.getElementById("savingInput");
    const goal = Number(input.value);

    if (input.value.trim() === "" ||
        !Number.isFinite(goal) || goal <= 0) {
        alert("Please enter a valid savings goal");
        return;
    }

    const user = getCurrentUser();

    if (!user) {
        alert("Please login again");
        window.location.href = "login.html";
        return;
    }

    user.savingsGoal = goal;

    saveCurrentUser(user);
    input.value = "";

    updateDashboard();

    alert("Savings goal updated successfully!");
}


/* =====================================
   7. SAVE UPDATED USER DATA
===================================== */

function saveCurrentUser(updatedUser) {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const index = users.findIndex(function (user) {
        return user.email === updatedUser.email;
    });

    if (index === -1) {
        alert("Could not save user data");
        return;
    }

    users[index] = updatedUser;

    localStorage.setItem("users", JSON.stringify(users));
}


/* =====================================
   8. UPDATE USER DASHBOARD
===================================== */

function updateDashboard() {

    
    const user = getCurrentUser();

    if (!user) {
        return;
    }

    const expenses = Array.isArray(user.expenses) ? user.expenses : [];

    const totalIncome = Number(user.income) || 0;

    const totalExpenses = expenses.reduce(function (sum, expense) {
        return sum + (Number(expense.amount) || 0);
    }, 0);

    const balance = totalIncome - totalExpenses;

    const incomeElement = document.getElementById("totalIncome");
    const expenseElement = document.getElementById("totalExpense");
    const balanceElement = document.getElementById("balance");
    const goalElement = document.getElementById("goal");

    if (incomeElement) {
        incomeElement.textContent = "₹" + totalIncome.toLocaleString("en-IN");
    }

    if (expenseElement) {
        expenseElement.textContent = "₹" + totalExpenses.toLocaleString("en-IN");
    }

    if (balanceElement) {
        balanceElement.textContent = "₹" + balance.toLocaleString("en-IN");
    }

    if (goalElement) {
        goalElement.textContent =
            "₹" + (Number(user.savingsGoal) || 0).toLocaleString("en-IN");
    }

    displayExpenses(user);
    
    drawExpenseChart(user);
    updateMonthlySummary();

    const warning = document.getElementById("overspendingWarning");

    if (warning) {
        warning.textContent = balance < 0
            ? "Warning: Your expenses exceed your income!"
            : "";
    }
}

/* =====================================
   9. DISPLAY EXPENSE SUMMARY
===================================== */

function displayExpenses(user) {
    const list = document.getElementById("expenseList");

    if (!list) return;

    list.replaceChildren();

    const expenses = Array.isArray(user.expenses)
        ? user.expenses
        : [];

    if (expenses.length === 0) {
        list.textContent = "No expenses added yet.";
        return;
    }

    expenses.forEach(function(expense, index) {
        const item = document.createElement("div");
        item.className = "expense-item";

        const details = document.createElement("p");

        details.textContent =
            expense.name + " - ₹" +
            Number(expense.amount || 0).toLocaleString("en-IN") +
            " (" + (expense.category || "Other") + ")";

        const date = document.createElement("small");
        date.textContent = "Date: " + (expense.date || "Not available");

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", function() {
            deleteExpense(index);
        });

        item.append(details, date, deleteButton);
        list.appendChild(item);
    });
}


/* =====================================
   10. DELETE EXPENSE
===================================== */

function deleteExpense(index) {
    const user = getCurrentUser();

    if (!user || !Array.isArray(user.expenses)) {
        alert("Unable to find your expenses.");
        return;
    }

    if (index < 0 || index >= user.expenses.length) {
        return;
    }

    if (!confirm("Are you sure you want to delete this expense?")) {
        return;
    }

    user.expenses.splice(index, 1);

    saveCurrentUser(user);
    updateDashboard();
}


/* =====================================
   11. ADMIN DASHBOARD
===================================== */

function loadAdminDashboard() {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    let totalIncome = 0;
    let totalExpenses = 0;

    const userList = document.getElementById("userList");

    if (userList) {
        userList.replaceChildren();
    }

    users.forEach(function(user) {
        totalIncome += Number(user.income) || 0;

        const expenses = Array.isArray(user.expenses)
            ? user.expenses
            : [];

        const userExpenses = expenses.reduce(function(sum, expense) {
            return sum + (Number(expense.amount) || 0);
        }, 0);

        totalExpenses += userExpenses;

        if (userList) {
            const card = document.createElement("div");
            card.className = "admin-user-card";

            const name = document.createElement("p");
            name.textContent = "Name: " + user.name;

            const email = document.createElement("p");
            email.textContent = "Email: " + user.email;

            const income = document.createElement("p");
            income.textContent = "Income: ₹" +
                (Number(user.income) || 0).toLocaleString("en-IN");

            const expense = document.createElement("p");
            expense.textContent = "Expenses: ₹" +
                userExpenses.toLocaleString("en-IN");

            card.append(name, email, income, expense);
            userList.appendChild(card);
        }
    });

    const countElement = document.getElementById("userCount");
    const incomeElement = document.getElementById("adminIncome");
    const expenseElement = document.getElementById("adminExpenses");

    if (countElement) countElement.textContent = users.length;

    if (incomeElement) {
        incomeElement.textContent =
            "₹" + totalIncome.toLocaleString("en-IN");
    }

    if (expenseElement) {
        expenseElement.textContent =
            "₹" + totalExpenses.toLocaleString("en-IN");
    }
}


/* =====================================
   12. FORMAT RUPEES
===================================== */

function formatRupees(amount) {
    return "₹" + Number(amount || 0).toLocaleString("en-IN");
}


/* =====================================
   13. DYNAMIC EXPENSE CATEGORY CHART
===================================== */


function drawExpenseChart(user) {
    const chart = document.getElementById("expenseChart");
    if (!chart) return;

    chart.replaceChildren();

    const totals = {};

    (user.expenses || []).forEach(function(expense) {
        const category = expense.category || "Other";
        totals[category] =
            (totals[category] || 0) + Number(expense.amount || 0);
    });

    const categories = Object.keys(totals);
    const grandTotal = Object.values(totals).reduce(
        (sum, amount) => sum + amount, 0
    );

    if (grandTotal <= 0) {
        chart.textContent = "Add an expense to see your chart.";
        return;
    }

    const colors = [
        "#4f46e5", "#16a34a", "#f59e0b",
        "#ef4444", "#0891b2", "#9333ea",
        "#ec4899", "#64748b"
    ];

    let currentAngle = 0;
    const slices = [];

    categories.forEach(function(category, index) {
        const percentage = totals[category] / grandTotal * 100;
        const nextAngle = currentAngle + percentage * 3.6;

        slices.push(
            colors[index % colors.length] +
            " " + currentAngle + "deg " + nextAngle + "deg"
        );

        currentAngle = nextAngle;
    });

    const layout = document.createElement("div");
    layout.className = "pie-chart-layout";

    const pie = document.createElement("div");
    pie.className = "pie-chart";
    pie.style.background =
        "conic-gradient(" + slices.join(", ") + ")";

    const center = document.createElement("div");
    center.className = "pie-chart-center";

    const label = document.createElement("span");
    label.textContent = "Total Expenses";

    const amount = document.createElement("strong");
    amount.textContent = formatRupees(grandTotal);

    center.append(label, amount);
    pie.appendChild(center);

    const legend = document.createElement("div");
    legend.className = "chart-legend";

    categories.forEach(function(category, index) {
        const row = document.createElement("div");
        row.className = "chart-legend-row";

        const name = document.createElement("span");
        name.className = "chart-legend-label";

        const dot = document.createElement("span");
        dot.className = "chart-legend-dot";
        dot.style.backgroundColor = colors[index % colors.length];

        const text = document.createElement("span");
        text.textContent = category;

        name.append(dot, text);

        const details = document.createElement("div");
        details.className = "chart-legend-details";

        const value = document.createElement("strong");
        value.textContent = formatRupees(totals[category]);

        const percent = document.createElement("span");
        percent.textContent =
            (totals[category] / grandTotal * 100).toFixed(1) + "%";

        details.append(value, percent);
        row.append(name, details);
        legend.appendChild(row);
    });

    layout.append(pie, legend);
    chart.appendChild(layout);
}



/* =====================================
   14. MONTHLY SUMMARY
===================================== */

function updateMonthlySummary() {
    const monthInput = document.getElementById("summaryMonth");

    if (!monthInput) return;

    if (!monthInput.value) {
        monthInput.value = new Date().toISOString().slice(0, 7);
    }

    const user = getCurrentUser();

    if (!user) return;

    const selectedMonth = monthInput.value;

    const monthlyIncome = (user.incomeHistory || [])
        .filter(function(item) {
            return item.date &&
                item.date.slice(0, 7) === selectedMonth;
        })
        .reduce(function(sum, item) {
            return sum + Number(item.amount || 0);
        }, 0);

    const monthlyExpenses = (user.expenses || [])
        .filter(function(item) {
            if (!item.date) return false;

            let date = item.date;

            // Support older dates stored as MM/DD/YYYY.
            if (date.includes("/")) {
                const parts = date.split("/");

                if (parts.length === 3) {
                    date = parts[2] + "-" +
                        parts[0].padStart(2, "0") + "-" +
                        parts[1].padStart(2, "0");
                }
            }

            return date.slice(0, 7) === selectedMonth;
        })
        .reduce(function(sum, item) {
            return sum + Number(item.amount || 0);
        }, 0);

    document.getElementById("monthlyIncome").textContent =
        formatRupees(monthlyIncome);

    document.getElementById("monthlyExpenses").textContent =
        formatRupees(monthlyExpenses);

    document.getElementById("monthlyBalance").textContent =
        formatRupees(monthlyIncome - monthlyExpenses);
}


/* =====================================
   15. INITIALIZE PAGE
===================================== */

document.addEventListener("DOMContentLoaded", function() {
    const page = window.location.pathname.split("/").pop().toLowerCase();

    if (page === "dashboard.html") {
        const loggedInUser = localStorage.getItem("loggedInUser");

        if (!loggedInUser || loggedInUser === "admin" ||
            !getCurrentUser()) {
            localStorage.removeItem("loggedInUser");
            window.location.href = "login.html";
            return;
        }

        updateDashboard();

        const monthInput = document.getElementById("summaryMonth");

        if (monthInput) {
            monthInput.addEventListener("change", updateMonthlySummary);
        }
    }

    if (page === "admin.html") {
        if (localStorage.getItem("loggedInUser") !== "admin") {
            window.location.href = "login.html";
            return;
        }

        loadAdminDashboard();
    }
});

/* Dark Mode Toggle */
const darkModeToggle = document.getElementById("darkModeToggle");

// Apply the saved theme
if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
    if (darkModeToggle) {
        darkModeToggle.textContent = "☀️ Light Mode";
    }
}

// Toggle between Light and Dark Mode
if (darkModeToggle) {
    darkModeToggle.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("darkMode", "enabled");
            darkModeToggle.textContent = "☀️ Light Mode";
        } else {
            localStorage.setItem("darkMode", "disabled");
            darkModeToggle.textContent = "🌙 Dark Mode";
        }
    });
}

function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}
