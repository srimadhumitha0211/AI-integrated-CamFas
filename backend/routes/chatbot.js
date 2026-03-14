const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ========== PREDEFINED RESPONSES DATABASE ==========

const responses = {
    // GREETINGS
    'hello': {
        keywords: ['hello', 'hi', 'hey', 'greetings'],
        response: (user) => `👋 Hello ${user.name}! How can I help you with your studies today?`
    },
    
    // POLYMORPHISM
    'polymorphism': {
        keywords: ['polymorphism', 'poly morphism', 'oop polymorphism'],
        response: `**Polymorphism in OOP** 

Polymorphism means "many forms". It allows objects of different classes to be treated as objects of a common parent class.

**Types:**
1. **Compile-time Polymorphism** (Method Overloading)
2. **Run-time Polymorphism** (Method Overriding)

**Example in Java:**
\`\`\`java
// Parent class
class Animal {
    void sound() {
        System.out.println("Animal makes sound");
    }
}

// Child class 1
class Dog extends Animal {
    @Override
    void sound() {
        System.out.println("Dog barks");
    }
}

// Child class 2
class Cat extends Animal {
    @Override
    void sound() {
        System.out.println("Cat meows");
    }
}

// Polymorphism in action
public class Main {
    public static void main(String[] args) {
        Animal myAnimal;
        
        myAnimal = new Dog();
        myAnimal.sound();  // Output: Dog barks
        
        myAnimal = new Cat();
        myAnimal.sound();  // Output: Cat meows
    }
}
\`\`\`

**Key Benefits:**
- ✅ Code reusability
- ✅ Flexibility
- ✅ Easy maintenance
- ✅ Clean architecture`
    },
    
    // RECURSION
    'recursion': {
        keywords: ['recursion', 'recursive', 'base case'],
        response: `**Recursion Explained** 🔄

Recursion is when a function calls itself to solve a smaller version of the same problem.

**Key Components:**
1. **Base Case** - Stops the recursion
2. **Recursive Case** - Function calls itself

**Example: Factorial**
\`\`\`javascript
function factorial(n) {
    // Base case
    if (n === 0 || n === 1) {
        return 1;
    }
    // Recursive case
    return n * factorial(n - 1);
}

console.log(factorial(5)); // Output: 120
\`\`\`

**Common Examples:**
- 📂 Directory traversal
- 🌳 Tree traversal
- 🧮 Fibonacci series
- 🔍 Binary search

**Visualization:**
\`\`\`
factorial(5)
    = 5 * factorial(4)
    = 5 * (4 * factorial(3))
    = 5 * (4 * (3 * factorial(2)))
    = 5 * (4 * (3 * (2 * factorial(1))))
    = 5 * (4 * (3 * (2 * 1)))
    = 5 * (4 * (3 * 2))
    = 5 * (4 * 6)
    = 5 * 24
    = 120
\`\`\``
    },
    
    // TIME COMPLEXITY
    'time complexity': {
        keywords: ['time complexity', 'big o', 'algorithm analysis', 'performance'],
        response: `**Time Complexity & Big O Notation** ⏱️

Time complexity measures how runtime grows with input size.

**Common Complexities:**

| Notation | Name | Example |
|----------|------|---------|
| **O(1)** | Constant | Array access |
| **O(log n)** | Logarithmic | Binary search |
| **O(n)** | Linear | Simple loop |
| **O(n log n)** | Linearithmic | Merge sort |
| **O(n²)** | Quadratic | Nested loops |
| **O(2ⁿ)** | Exponential | Recursive Fibonacci |

**Examples:**
\`\`\`javascript
// O(1) - Constant time
function getFirst(arr) {
    return arr[0];  // Always 1 operation
}

// O(n) - Linear time
function findMax(arr) {
    let max = arr[0];
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
    }
    return max;  // n operations
}

// O(n²) - Quadratic time
function bubbleSort(arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;  // n² operations
}
\`\`\`

**Quick Tips:**
- ✅ Always consider worst case
- ✅ Drop constants (O(2n) → O(n))
- ✅ Focus on largest term (O(n² + n) → O(n²))`
    },
    
    // STUDY PLAN
    'study plan': {
        keywords: ['study plan', 'study schedule', 'how to study', 'preparation'],
        response: (user) => `**📚 Personalized Study Plan for ${user.department} Student**

Based on your department, here's an effective study plan:

**Daily Schedule (Weekdays):**
\`\`\`
🌅 Morning (2 hours): Theory subjects (new concepts)
☀️ Afternoon (1 hour): Practice problems
🌆 Evening (1.5 hours): Coding/Programming practice
🌙 Night (1 hour): Revision of the day
\`\`\`

**Weekly Plan:**

| Day | Focus Area | Activities |
|-----|------------|------------|
| **Monday** | Core Subjects | Read textbook, make notes |
| **Tuesday** | Problem Solving | Solve 10-15 problems |
| **Wednesday** | Programming | Code 2-3 programs |
| **Thursday** | Revision | Review week's topics |
| **Friday** | Practice Test | Take a mock test |
| **Saturday** | Projects | Work on mini projects |
| **Sunday** | Rest & Plan | Relax and plan next week |

**Tips for Success:**
1. 📝 **Active Recall** - Test yourself, don't just read
2. ⏰ **Pomodoro Technique** - 25 min study, 5 min break
3. 📊 **Track Progress** - Maintain a study log
4. 👥 **Group Study** - Discuss with peers once a week
5. 🎯 **Set Goals** - Daily, weekly, monthly targets

**Recommended Resources:**
- 📖 Textbooks recommended by your professors
- 💻 Online platforms: NPTEL, Coursera, YouTube
- 📝 Previous year question papers`
    },
    
    // INTERNSHIP TIPS
    'internship tips': {
        keywords: ['internship', 'placement', 'interview', 'job'],
        response: `**💼 Internship & Placement Preparation Guide**

**Resume Tips:**
1. Keep it to 1 page
2. Highlight projects and skills
3. Use action verbs
4. Include GitHub/LinkedIn links

**Technical Preparation:**
\`\`\`
📊 Core Subjects:
- Data Structures & Algorithms
- Database Management
- Operating Systems
- Computer Networks
- OOP Concepts

💻 Programming Languages:
- Master at least 2 languages
- Practice daily on LeetCode/HackerRank
- Focus on problem-solving

🛠️ Projects:
- Build 2-3 strong projects
- Host on GitHub
- Be ready to explain architecture
\`\`\`

**Common Interview Questions:**

**Technical:**
- "Reverse a linked list"
- "Explain polymorphism"
- "What's the difference between HTTP and HTTPS?"
- "Design a URL shortener"

**HR:**
- "Tell me about yourself"
- "Why do you want to join our company?"
- "Where do you see yourself in 5 years?"
- "What are your strengths and weaknesses?"

**Before Interview:**
✅ Research the company
✅ Prepare questions to ask
✅ Practice mock interviews
✅ Review your projects
✅ Get a good night's sleep

**During Interview:**
- Be confident but humble
- Think aloud while solving problems
- Ask clarifying questions
- Thank the interviewer`
    },
    
    // DEFAULT RESPONSE
    'default': {
        response: `I'm here to help with your studies! You can ask me about:

**📚 Computer Science Topics:**
• Programming languages (C, C++, Java, Python, JavaScript)
• Data Structures & Algorithms
• Database Management
• Operating Systems
• Computer Networks
• OOP Concepts

**💡 Study Related:**
• Creating study plans
• Exam preparation tips
• Time management
• Note-taking strategies

**🎯 Career Guidance:**
• Internship preparation
• Resume tips
• Interview questions
• Project ideas

**Try asking:**
• "Explain polymorphism"
• "What is recursion?"
• "Create a study plan"
• "Time complexity explained"
• "Internship tips"

What would you like to learn about?`
    }
};

// Helper function to find best matching response
function findResponse(message, user) {
    const lowerMessage = message.toLowerCase();
    
    // Check each category
    for (const [key, data] of Object.entries(responses)) {
        if (key === 'default') continue;
        
        // Check if any keyword matches
        if (data.keywords && data.keywords.some(keyword => 
            lowerMessage.includes(keyword.toLowerCase())
        )) {
            // If response is a function, call it with user data
            if (typeof data.response === 'function') {
                return data.response(user);
            }
            return data.response;
        }
    }
    
    // Return default response
    return responses.default.response;
}

// ========== CHATBOT PAGE ==========
router.get('/assistant', async (req, res) => {
    if (!req.session || !req.session.userId || req.session.role !== 'student') {
        return res.redirect('/');
    }
    
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.redirect('/auth/logout');
        }
        
        res.render('student/chatbot-assistant', { 
            user: user
        });
        
    } catch (error) {
        console.error('Error loading chatbot:', error);
        res.status(500).send('Server error: ' + error.message);
    }
});

// ========== CHAT ENDPOINT ==========
router.post('/chat', async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    
    try {
        const { message } = req.body;
        
        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        // Get user for personalized responses
        const user = await User.findById(req.session.userId);
        
        // Find best matching response
        const response = findResponse(message, user);
        
        // Add small delay to simulate AI thinking (optional)
        setTimeout(() => {
            res.json({ 
                response: response,
                timestamp: new Date().toISOString()
            });
        }, 500); // 500ms delay feels natural
        
    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({ 
            error: 'Failed to process message',
            details: error.message
        });
    }
});

// ========== SUBJECT-SPECIFIC HELP ==========
router.post('/subject-help', async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    
    try {
        const { subject, topic } = req.body;
        
        const responses = {
            'Computer Science': `**📚 Computer Science - ${topic || 'General'}**

**Key Topics:**
1. Data Structures (Arrays, Linked Lists, Trees, Graphs)
2. Algorithms (Sorting, Searching, Dynamic Programming)
3. Database Management (SQL, Normalization, Transactions)
4. Operating Systems (Process Management, Memory Management)
5. Computer Networks (OSI Model, TCP/IP, Protocols)

**Practice Resources:**
- LeetCode for coding problems
- GeeksforGeeks for theory
- YouTube for video explanations
- Previous year question papers

**Need specific help?** Ask me about any CS topic!`,
            
            'Programming': `**💻 Programming - ${topic || 'General'}**

**Popular Languages:**
• **C** - System programming, embedded systems
• **C++** - Game development, performance-critical apps
• **Java** - Enterprise applications, Android
• **Python** - Data science, AI, web development
• **JavaScript** - Web development, frontend/backend

**Best Practices:**
1. Write clean, readable code
2. Use meaningful variable names
3. Add comments for complex logic
4. Test edge cases
5. Practice daily coding

**Example Structure:**
\`\`\`javascript
// Good code example
function calculateAverage(numbers) {
    if (!numbers || numbers.length === 0) {
        return 0;
    }
    
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
}
\`\`\`

Want to learn a specific language? Just ask!`,
            
            'Mathematics': `**📐 Mathematics - ${topic || 'General'}**

**Core Topics:**
1. Calculus (Limits, Derivatives, Integrals)
2. Linear Algebra (Matrices, Vectors)
3. Probability & Statistics
4. Discrete Mathematics
5. Numerical Methods

**Study Tips:**
✅ Practice daily problems
✅ Understand concepts, not just formulas
✅ Use visualization tools
✅ Group study for problem-solving

**Need help with a specific math problem?** Type it out!`
        };
        
        res.json({ 
            response: responses[subject] || `I'll help you with ${subject} - ${topic}. What specific aspect would you like to learn about?`
        });
        
    } catch (error) {
        console.error('Subject help error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== GENERATE QUIZ ==========
router.post('/generate-quiz', async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    
    try {
        const { subject, topic } = req.body;
        
        // Predefined quizzes
        const quizzes = {
            'Data Structures': [
                {
                    question: "What is the time complexity of accessing an element in an array by index?",
                    options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
                    correct: 0,
                    explanation: "Array access by index is O(1) because it uses direct memory addressing."
                },
                {
                    question: "Which data structure uses LIFO (Last In First Out)?",
                    options: ["Queue", "Stack", "Tree", "Graph"],
                    correct: 1,
                    explanation: "Stack uses LIFO - the last element added is the first to be removed."
                },
                {
                    question: "What is a linked list?",
                    options: [
                        "A linear data structure where elements are stored in contiguous memory",
                        "A linear data structure where elements are linked using pointers",
                        "A hierarchical data structure",
                        "A non-linear data structure"
                    ],
                    correct: 1,
                    explanation: "Linked lists store elements in nodes that are connected via pointers."
                }
            ],
            'JavaScript': [
                {
                    question: "What is closure in JavaScript?",
                    options: [
                        "A function that closes the browser",
                        "A function with access to its outer scope",
                        "A way to close variables",
                        "A type of loop"
                    ],
                    correct: 1,
                    explanation: "A closure is a function that remembers its outer variables even after the outer function returns."
                },
                {
                    question: "What does '=== ' operator do?",
                    options: [
                        "Assigns value",
                        "Compares value only",
                        "Compares value and type",
                        "Checks equality"
                    ],
                    correct: 2,
                    explanation: "=== compares both value and type without type coercion."
                }
            ]
        };
        
        const quiz = quizzes[topic] || quizzes['Data Structures'];
        
        res.json({ 
            success: true, 
            quiz: quiz,
            message: `Here's a quick quiz on ${topic || subject}!`
        });
        
    } catch (error) {
        console.error('Quiz generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== STUDY PLAN GENERATOR ==========
router.post('/study-plan', async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    
    try {
        const { subject, hours, days } = req.body;
        
        const plan = `**📚 Study Plan for ${subject || 'your course'}**

**Daily Schedule (${hours || 2} hours/day for ${days || 7} days):**

**Day 1: Foundation**
- 📖 Read theory (45 min)
- ✍️ Take notes (30 min)
- 💡 Practice basic problems (45 min)

**Day 2: Core Concepts**
- 🔍 Deep dive into main topics (1 hour)
- 📝 Solve examples (45 min)
- 🔄 Review Day 1 (15 min)

**Day 3: Practice**
- 💻 Hands-on exercises (1.5 hours)
- ⚡ Quick revision (30 min)

**Day 4: Advanced Topics**
- 📚 Advanced concepts (1 hour)
- 🎯 Complex problems (1 hour)

**Day 5: Application**
- 🏗️ Mini project/small application (2 hours)

**Day 6: Revision**
- 📖 Review all topics (1 hour)
- ✅ Self-test (1 hour)

**Day 7: Assessment**
- 📝 Mock test (1 hour)
- 📊 Identify weak areas (30 min)
- 📅 Plan next week (30 min)

**Pro Tips:**
✅ Take 5-min breaks every 25 min (Pomodoro)
✅ Revise previous day's topics for 10 min
✅ Stay hydrated and get enough sleep
✅ Discuss doubts with classmates

**Need adjustments?** Tell me your preferences!`;
        
        res.json({ response: plan });
        
    } catch (error) {
        console.error('Study plan error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== TEST ENDPOINT ==========
router.get('/test', (req, res) => {
    res.json({
        status: 'Chatbot routes are working',
        session: req.session ? 'active' : 'inactive',
        userId: req.session?.userId || null
    });
});

module.exports = router;