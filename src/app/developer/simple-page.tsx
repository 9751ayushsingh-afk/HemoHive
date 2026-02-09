"use client";

import React, { useState } from "react";

const SimpleDeveloperPage = () => {
  const [activeTab, setActiveTab] = useState("about");

  const skills = [
    { name: "React/Next.js", level: 95, color: "bg-blue-500" },
    { name: "TypeScript", level: 90, color: "bg-blue-600" },
    { name: "Three.js", level: 85, color: "bg-purple-500" },
    { name: "Node.js", level: 80, color: "bg-green-500" },
    { name: "Python", level: 75, color: "bg-yellow-500" },
    { name: "AI/ML", level: 70, color: "bg-pink-500" },
  ];

  const projects = [
    {
      title: "HemoHive",
      description: "AI-driven blood bank management system",
      tech: ["Next.js", "Three.js", "TypeScript", "AI/ML"],
      status: "In Development"
    },
    {
      title: "Interactive 3D Portfolio",
      description: "Physics-based 3D lanyard animation",
      tech: ["React Three Fiber", "Rapier Physics", "WebGL"],
      status: "Completed"
    },
    {
      title: "Fluid Simulation Engine",
      description: "Real-time WebGL fluid dynamics",
      tech: ["WebGL", "GLSL", "Three.js"],
      status: "Completed"
    }
  ];

  const achievements = [
    { icon: "🏆", title: "Innovation Award", description: "Best Healthcare Tech Solution 2024" },
    { icon: "🚀", title: "Fastest Delivery", description: "Sub-60 minute blood delivery system" },
    { icon: "💡", title: "AI Innovation", description: "Predictive blood demand forecasting" },
    { icon: "❤️", title: "Lives Saved", description: "1000+ lives impacted through technology" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-hemohive-red/10 via-white to-hemohive-red/5">
      {/* Header */}
      <div className="pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-black font-accent tracking-wider text-hemohive-red mb-2">
            Developer
          </h1>
          <p className="text-lg text-gray-700">
            Building the future of healthcare through technology
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-hemohive-red/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-1">
            {[
              { id: "about", label: "About" },
              { id: "skills", label: "Skills" },
              { id: "projects", label: "Projects" },
              { id: "achievements", label: "Achievements" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "text-hemohive-red border-b-2 border-hemohive-red"
                    : "text-gray-600 hover:text-hemohive-red"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === "about" && (
          <div className="text-gray-800 space-y-8">
            <h3 className="text-4xl font-bold mb-6 text-hemohive-red">About Me</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-lg text-gray-700 leading-relaxed">
                  I'm a passionate developer with a mission to use technology for social good. 
                  My journey in healthcare technology began with a simple question: "How can we 
                  save more lives through better systems?"
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  With expertise in full-stack development, 3D graphics, and AI/ML, I create 
                  solutions that bridge the gap between cutting-edge technology and real-world 
                  healthcare challenges.
                </p>
              </div>
              <div className="space-y-4">
                <div className="bg-white/50 rounded-lg p-6 border border-hemohive-red/20">
                  <h4 className="text-xl font-semibold mb-3 text-hemohive-red">Mission</h4>
                  <p className="text-gray-700">Creating technology that saves lives and improves healthcare accessibility.</p>
                </div>
                <div className="bg-white/50 rounded-lg p-6 border border-hemohive-red/20">
                  <h4 className="text-xl font-semibold mb-3 text-hemohive-red">Vision</h4>
                  <p className="text-gray-700">A world where technology eliminates preventable deaths through better healthcare systems.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "skills" && (
          <div className="text-gray-800 space-y-8">
            <h3 className="text-4xl font-bold mb-6 text-hemohive-red">Technical Skills</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {skills.map((skill, index) => (
                <div
                  key={skill.name}
                  className="bg-white/50 rounded-lg p-6 border border-hemohive-red/20"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{skill.name}</span>
                    <span className="text-hemohive-red">{skill.level}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${skill.color} transition-all duration-1000`}
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "projects" && (
          <div className="text-gray-800 space-y-8">
            <h3 className="text-4xl font-bold mb-6 text-hemohive-red">Featured Projects</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <div
                  key={project.title}
                  className="bg-white/50 rounded-lg p-6 border border-hemohive-red/20 hover:bg-white/70 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-xl font-semibold">{project.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      project.status === "Completed" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-hemohive-red/20 text-hemohive-red"
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech) => (
                      <span key={tech} className="px-3 py-1 bg-hemohive-red/20 text-hemohive-red rounded-full text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "achievements" && (
          <div className="text-gray-800 space-y-8">
            <h3 className="text-4xl font-bold mb-6 text-hemohive-red">Achievements & Impact</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {achievements.map((achievement, index) => (
                <div
                  key={achievement.title}
                  className="bg-white/50 rounded-lg p-6 border border-hemohive-red/20 hover:bg-white/70 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{achievement.icon}</div>
                    <div>
                      <h4 className="text-xl font-semibold text-hemohive-red">{achievement.title}</h4>
                      <p className="text-gray-700">{achievement.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-md border-t border-hemohive-red/20 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-hemohive-red hover:text-hemohive-red/80 transition-colors">GitHub</a>
            <a href="#" className="text-hemohive-red hover:text-hemohive-red/80 transition-colors">LinkedIn</a>
            <a href="#" className="text-hemohive-red hover:text-hemohive-red/80 transition-colors">Email</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SimpleDeveloperPage;


