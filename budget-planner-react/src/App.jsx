
import { useState, useEffect } from "react";
import "./App.css";

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123";

function App() {
  const [page, setPage] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);

  const [users, setUsers] = useState(
    JSON.parse(localStorage.getItem("users") || "[]")
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [income, setIncome] = useState("");
  const [expense, setExpense] = useState("");
  const [category, setCategory] = useState("Food");
  const [goal, setGoal] = useState("");

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  // LOGIN
  function handleLogin(e) {
    e.preventDefault();

    const enteredEmail = email.trim().toLowerCase();
    const enteredPassword = password.trim();

    if (
      enteredEmail === ADMIN_EMAIL &&
      enteredPassword === ADMIN_PASSWORD
    ) {
      setCurrentUser({ role: "admin", name: "Admin" });
      setPage("admin");
      setEmail("");
      setPassword("");
      return;
    }

    const allUsers = JSON.parse(localStorage.getItem("users") || "[]");

    const user = allUsers.find(
      (u) =>
        u.email?.trim().toLowerCase() === enteredEmail &&
        u.password === enteredPassword
    );

    if (user) {
      setUsers(allUsers);
      setCurrentUser(user);
      setPage("dashboard");
      setEmail("");
      setPassword("");
    } else {
      alert("Invalid email or password!");
    }
  }

  // SIGNUP
  function handleSignup(e) {
    e.preventDefault();

    const allUsers = JSON.parse(localStorage.getItem("users") || "[]");

    if (
      email.trim().toLowerCase() === ADMIN_EMAIL ||
      allUsers.some(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      )
    ) {
      alert("This email is already registered!");
      return;
    }

    const newUser = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      income: 0,
      incomeEntries: [],
      expenses: [],
      savingsGoal: 0,
    };

    const updatedUsers = [...allUsers, newUser];

    localStorage.setItem("users", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);

    alert("Account created successfully!");

    setName("");
    setEmail("");
    setPassword("");
    setPage("login");
  }

  // UPDATE USER
  function updateUser(updatedUser) {
    const updatedUsers = users.map((u) =>
      u.email === updatedUser.email ? updatedUser : u
    );

    setUsers(updatedUsers);
    setCurrentUser(updatedUser);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
  }

  // ADD INCOME
  function addIncome(e) {
    e.preventDefault();

    const amount = Number(income);

    if (!amount || amount <= 0) {
      alert("Enter a valid income amount.");
      return;
    }

    const updatedUser = {
      ...currentUser,
      income: Number(currentUser.income || 0) + amount,
      incomeEntries: [
        ...(currentUser.incomeEntries || []),
        {
          amount,
          date: new Date().toISOString().slice(0, 10),
        },
      ],
    };

    updateUser(updatedUser);
    setIncome("");
    alert("Income added successfully!");
  }

  // ADD EXPENSE
  function addExpense(e) {
    e.preventDefault();

    const amount = Number(expense);

    if (!amount || amount <= 0) {
      alert("Enter a valid expense amount.");
      return;
    }

    const updatedUser = {
      ...currentUser,
      expenses: [
        ...(currentUser.expenses || []),
        {
          id: Date.now(),
          amount,
          category,
          date: new Date().toISOString().slice(0, 10),
        },
      ],
    };

    updateUser(updatedUser);
    setExpense("");
    alert("Expense added successfully!");
  }

  // DELETE EXPENSE
  function deleteExpense(id) {
    const updatedUser = {
      ...currentUser,
      expenses: currentUser.expenses.filter(
        (item) => item.id !== id
      ),
    };

    updateUser(updatedUser);
  }

  // SET SAVINGS GOAL
  function setSavingsGoal(e) {
    e.preventDefault();

    const amount = Number(goal);

    if (!amount || amount <= 0) {
      alert("Enter a valid savings goal.");
      return;
    }

    updateUser({
      ...currentUser,
      savingsGoal: amount,
    });

    setGoal("");
    alert("Savings goal updated!");
  }

  // LOGOUT
  function logout() {
    setCurrentUser(null);
    setPage("login");
    setEmail("");
    setPassword("");
  }

  // USER CALCULATIONS
  const totalIncome = Number(currentUser?.income || 0);

  const totalExpenses = (currentUser?.expenses || []).reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const balance = totalIncome - totalExpenses;

  // ADMIN CALCULATIONS
  const totalAdminIncome = users.reduce(
    (sum, user) => sum + Number(user.income || 0),
    0
  );

  const totalAdminExpenses = users.reduce(
    (sum, user) =>
      sum +
      (user.expenses || []).reduce(
        (total, item) => total + Number(item.amount || 0),
        0
      ),
    0
  );

  // MONTHLY SUMMARY
  const monthlyIncome = (currentUser?.incomeEntries || [])
    .filter((item) => item.date?.startsWith(selectedMonth))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const monthlyExpenses = (currentUser?.expenses || [])
    .filter((item) => item.date?.startsWith(selectedMonth))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  // EXPENSE CATEGORY CHART
  const categoryTotals = {};

  (currentUser?.expenses || []).forEach((item) => {
    categoryTotals[item.category] =
      (categoryTotals[item.category] || 0) +
      Number(item.amount || 0);
  });

  const chartData = Object.entries(categoryTotals);

  const chartTotal = chartData.reduce(
    (sum, item) => sum + item[1],
    0
  );

  const chartColors = [
    "#5145cd",
    "#16a34a",
    "#e05252",
    "#f59e0b",
    "#0891b2",
    "#9333ea",
  ];

  let currentAngle = 0;

  const chartGradient =
    chartTotal === 0
      ? "#e5e7eb"
      : `conic-gradient(${chartData
          .map(([label, amount], index) => {
            const start = currentAngle;
            currentAngle += (amount / chartTotal) * 360;

            return `${chartColors[index % chartColors.length]} ${start}deg ${currentAngle}deg`;
          })
          .join(", ")})`;

  return (
    <div className="bp-app">

      {/* LOGIN PAGE */}
      {page === "login" && (
        <div className="login-page">
          <div className="login-left">

            <div className="brand">
              <span className="brand-icon">₹</span>
              <span>Budget Planner</span>
            </div>

            <div className="welcome-content">
              <span className="welcome-tag">
                SMART MONEY MANAGEMENT
              </span>

              <h1>Take control of your money.</h1>

              <p>
                Plan your budget, track your expenses, and
                achieve your savings goals with ease.
              </p>

              <div className="feature-list">
                <div>✓ Track your daily expenses</div>
                <div>✓ Manage your monthly income</div>
                <div>✓ Reach your savings goals</div>
              </div>

              <div className="money-illustration">
                <div className="money-circle">₹</div>

                <div className="money-card">
                  <span>YOUR FINANCIAL FUTURE</span>
                  <h2>Save More. Spend Smart.</h2>
                  <div className="progress-track">
                    <div className="progress-fill"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="login-right">
            <div className="login-box">
              <div className="login-logo">₹</div>

              <h2>Welcome Back!</h2>

              <p className="login-subtitle">
                Please enter your details to sign in.
              </p>

              <form onSubmit={handleLogin}>
                <label>Email Address</label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <label>Password</label>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button type="submit" className="login-button">
                  Login to Dashboard →
                </button>
              </form>

              <p className="signup-text">
                Don't have an account?{" "}
                <span onClick={() => setPage("signup")}>
                  Create Account
                </span>
              </p>

              <div className="login-footer">
                Budget Planner · Smart Money Management
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIGNUP PAGE */}
      {page === "signup" && (
        <div className="signup-page">
          <div className="signup-card">
            <div className="login-logo">₹</div>

            <h1>Create Account</h1>
            <p>Start managing your money today.</p>

            <form onSubmit={handleSignup}>
              <label>Full Name</label>

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <label>Email Address</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label>Password</label>

              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button type="submit" className="login-button">
                Create Account →
              </button>
            </form>

            <p className="signup-text">
              Already have an account?{" "}
              <span onClick={() => setPage("login")}>
                Login
              </span>
            </p>
          </div>
        </div>
      )}

      {/* ADMIN DASHBOARD */}
      {page === "admin" && (
        <div className="dashboard-page">
          <div className="dashboard-header">
            <div>
              <h1>Budget Planner</h1>
              <p>Admin Dashboard</p>
            </div>

            <button onClick={logout}>Logout</button>
          </div>

          <h2>Welcome, Admin!</h2>

          <div className="bp-grid">
            <div className="bp-stat">
              <h3>Registered Users</h3>
              <h2>{users.length}</h2>
            </div>

            <div className="bp-stat">
              <h3>Total Income</h3>
              <h2 className="bp-income">
                ₹{totalAdminIncome.toLocaleString("en-IN")}
              </h2>
            </div>

            <div className="bp-stat">
              <h3>Total Expenses</h3>
              <h2 className="bp-expense">
                ₹{totalAdminExpenses.toLocaleString("en-IN")}
              </h2>
            </div>
          </div>

          <div className="bp-card">
            <h2>Registered User Details</h2>

            {users.length === 0 ? (
              <p>No registered users found.</p>
            ) : (
              <div className="table-scroll">
                <table className="bp-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Income</th>
                      <th>Expenses</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => {
                      const userExpenses = (user.expenses || []).reduce(
                        (sum, item) =>
                          sum + Number(item.amount || 0),
                        0
                      );

                      return (
                        <tr key={user.email}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>
                            ₹{Number(user.income || 0).toLocaleString("en-IN")}
                          </td>
                          <td>
                            ₹{userExpenses.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODERN USER DASHBOARD */}
      {page === "dashboard" && currentUser && (
        <div className="modern-dashboard">

          {/* SIDEBAR */}
          <aside className="dashboard-sidebar">
            <div className="sidebar-brand">
              <span className="sidebar-logo">₹</span>
              <span>Budget Planner</span>
            </div>

            <p className="sidebar-label">MAIN MENU</p>

            <a href="#overview" className="sidebar-link active">
              ▦ Dashboard
            </a>

            <a href="#income-expense" className="sidebar-link">
              ＋ Transactions
            </a>

            <a href="#expense-summary" className="sidebar-link">
              ▤ Expenses
            </a>

            <a href="#expense-chart" className="sidebar-link">
              ◔ Analytics
            </a>

            <a href="#monthly-summary" className="sidebar-link">
              ▣ Monthly Summary
            </a>

            <div className="sidebar-bottom">
              <div className="profile-box">
                <div className="profile-avatar">
                  {currentUser.name?.charAt(0).toUpperCase()}
                </div>

                <div>
                  <strong>{currentUser.name}</strong>
                  <small>User Account</small>
                </div>
              </div>

              <button className="sidebar-logout" onClick={logout}>
                ↪ Logout
              </button>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="dashboard-main">

            <header className="main-header" id="overview">
              <div>
                <p className="welcome-small">WELCOME BACK 👋</p>
                <h1>Hello, {currentUser.name}!</h1>
                <p className="header-description">
                  Here's your financial overview for today.
                </p>
              </div>

              <div className="today-date">
                📅 {new Date().toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </div>
            </header>

            {/* OVERVIEW CARDS */}
            <section className="overview-grid">
              <div className="overview-card income-card">
                <div className="overview-top">
                  <span>Total Income</span>
                  <span className="overview-icon">↗</span>
                </div>
                <h2>₹{totalIncome.toLocaleString("en-IN")}</h2>
                <p>Your total earnings</p>
              </div>

              <div className="overview-card expense-card">
                <div className="overview-top">
                  <span>Total Expenses</span>
                  <span className="overview-icon">↘</span>
                </div>
                <h2>₹{totalExpenses.toLocaleString("en-IN")}</h2>
                <p>Your total spending</p>
              </div>

              <div className="overview-card balance-card">
                <div className="overview-top">
                  <span>Remaining Balance</span>
                  <span className="overview-icon">₹</span>
                </div>
                <h2>₹{balance.toLocaleString("en-IN")}</h2>
                <p>Available balance</p>
              </div>

              <div className="overview-card savings-card">
                <div className="overview-top">
                  <span>Savings Goal</span>
                  <span className="overview-icon">◎</span>
                </div>
                <h2>
                  ₹{Number(currentUser.savingsGoal || 0).toLocaleString("en-IN")}
                </h2>
                <p>Your target savings</p>
              </div>
            </section>

            {totalExpenses > totalIncome && (
              <div className="dashboard-warning">
                ⚠ Your expenses are greater than your total income!
              </div>
            )}

            {/* ACTION FORMS */}
            <section className="action-grid" id="income-expense">

              <div className="dashboard-panel">
                <div className="panel-heading">
                  <div>
                    <span className="panel-icon green-icon">＋</span>
                    <h3>Add Income</h3>
                  </div>
                </div>

                <p className="panel-description">
                  Record your earnings.
                </p>

                <form onSubmit={addIncome}>
                  <label>Income Amount (₹)</label>

                  <input
                    type="number"
                    min="1"
                    placeholder="Enter amount"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    required
                  />

                  <button className="green-button" type="submit">
                    + Add Income
                  </button>
                </form>
              </div>

              <div className="dashboard-panel">
                <div className="panel-heading">
                  <div>
                    <span className="panel-icon red-icon">−</span>
                    <h3>Add Expense</h3>
                  </div>
                </div>

                <p className="panel-description">
                  Record your spending.
                </p>

                <form onSubmit={addExpense}>
                  <label>Expense Amount (₹)</label>

                  <input
                    type="number"
                    min="1"
                    placeholder="Enter amount"
                    value={expense}
                    onChange={(e) => setExpense(e.target.value)}
                    required
                  />

                  <label>Expense Category</label>

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option>Food</option>
                    <option>Travel</option>
                    <option>Shopping</option>
                    <option>Education</option>
                    <option>Bills</option>
                    <option>Other</option>
                  </select>

                  <button className="red-button" type="submit">
                    + Add Expense
                  </button>
                </form>
              </div>

              <div className="dashboard-panel">
                <div className="panel-heading">
                  <div>
                    <span className="panel-icon purple-icon">◎</span>
                    <h3>Savings Goal</h3>
                  </div>
                </div>

                <p className="panel-description">
                  Set your financial target.
                </p>

                <form onSubmit={setSavingsGoal}>
                  <label>Goal Amount (₹)</label>

                  <input
                    type="number"
                    min="1"
                    placeholder="Enter goal amount"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    required
                  />

                  <button className="purple-button" type="submit">
                    Update Goal
                  </button>
                </form>

                <p className="goal-current">
                  Current goal: ₹{Number(currentUser.savingsGoal || 0).toLocaleString("en-IN")}
                </p>
              </div>

            </section>

            {/* EXPENSE SUMMARY */}
            <section
              className="dashboard-panel transaction-panel"
              id="expense-summary"
            >
              <div className="section-heading">
                <div>
                  <h2>Recent Expenses</h2>
                  <p>Keep track of your spending.</p>
                </div>

                <span className="record-count">
                  {(currentUser.expenses || []).length} Records
                </span>
              </div>

              {(currentUser.expenses || []).length === 0 ? (
                <p className="empty-message">
                  No expenses added yet.
                </p>
              ) : (
                <div className="table-scroll">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {[...(currentUser.expenses || [])]
                        .reverse()
                        .map((item) => (
                          <tr key={item.id}>
                            <td>
                              <span className="category-badge">
                                {item.category}
                              </span>
                            </td>

                            <td className="table-amount">
                              ₹{Number(item.amount).toLocaleString("en-IN")}
                            </td>

                            <td>{item.date}</td>

                            <td>
                              <button
                                className="delete-button"
                                onClick={() => deleteExpense(item.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* ANALYTICS */}
            <section className="analytics-grid">

              <div
                className="dashboard-panel chart-panel"
                id="expense-chart"
              >
                <div className="section-heading">
                  <div>
                    <h2>Expense Analytics</h2>
                    <p>Spending by category</p>
                  </div>
                </div>

                {chartTotal === 0 ? (
                  <p className="empty-message">
                    No expense data available.
                  </p>
                ) : (
                  <div className="chart-content">
                    <div
                      className="bp-chart modern-pie"
                      style={{ background: chartGradient }}
                    >
                      <div className="pie-center">
                        <small>Total Spent</small>
                        <strong>
                          ₹{chartTotal.toLocaleString("en-IN")}
                        </strong>
                      </div>
                    </div>

                    <div className="chart-legend">
                      {chartData.map(([label, amount], index) => (
                        <div className="legend-row" key={label}>
                          <span
                            className="bp-dot"
                            style={{
                              background: chartColors[index % chartColors.length]
                            }}
                          />
                          <span>{label}</span>
                          <strong>
                            ₹{amount.toLocaleString("en-IN")}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* MONTHLY SUMMARY */}
              <div
                className="dashboard-panel monthly-panel"
                id="monthly-summary"
              >
                <div className="section-heading">
                  <div>
                    <h2>Monthly Summary</h2>
                    <p>Your monthly financial report</p>
                  </div>
                </div>

                <label>Select Month</label>

                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />

                <div className="monthly-row">
                  <span>Monthly Income</span>
                  <strong className="monthly-green">
                    ₹{monthlyIncome.toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className="monthly-row">
                  <span>Monthly Expenses</span>
                  <strong className="monthly-red">
                    ₹{monthlyExpenses.toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className="monthly-row monthly-total">
                  <span>Monthly Balance</span>
                  <strong>
                    ₹{(monthlyIncome - monthlyExpenses).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

            </section>

            <footer className="dashboard-footer">
              Budget Planner © 2026 · Manage your money wisely.
            </footer>

          </main>
        </div>
      )}

    </div>
  );
}

export default App;
