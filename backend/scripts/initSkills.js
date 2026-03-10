// Run this once to populate skills
const mongoose = require('mongoose');
require('dotenv').config();
const Skill = require('../models/Skill');

const skills = [
    // Technical Skills
    { name: 'JavaScript', category: 'technical', icon: '🟨' },
    { name: 'Python', category: 'technical', icon: '🐍' },
    { name: 'Java', category: 'technical', icon: '☕' },
    { name: 'C++', category: 'technical', icon: '⚙️' },
    { name: 'React', category: 'technical', icon: '⚛️' },
    { name: 'Node.js', category: 'technical', icon: '🟢' },
    { name: 'HTML/CSS', category: 'technical', icon: '🌐' },
    { name: 'SQL', category: 'technical', icon: '🗄️' },
    { name: 'MongoDB', category: 'technical', icon: '🍃' },
    { name: 'Git', category: 'technical', icon: '📦' },
    
    // Soft Skills
    { name: 'Communication', category: 'soft', icon: '💬' },
    { name: 'Leadership', category: 'soft', icon: '👑' },
    { name: 'Teamwork', category: 'soft', icon: '🤝' },
    { name: 'Problem Solving', category: 'soft', icon: '🧩' },
    { name: 'Time Management', category: 'soft', icon: '⏰' },
    
    // Languages
    { name: 'English', category: 'language', icon: '🇬🇧' },
    { name: 'Tamil', category: 'language', icon: '🇮🇳' },
    { name: 'Hindi', category: 'language', icon: '🇮🇳' },
    
    // Tools
    { name: 'VS Code', category: 'tool', icon: '📝' },
    { name: 'Figma', category: 'tool', icon: '🎨' },
    { name: 'Excel', category: 'tool', icon: '📊' },
    { name: 'Photoshop', category: 'tool', icon: '🖼️' }
];

async function initSkills() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        await Skill.deleteMany({}); // Clear existing
        await Skill.insertMany(skills);
        
        console.log('Skills initialized successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

initSkills();