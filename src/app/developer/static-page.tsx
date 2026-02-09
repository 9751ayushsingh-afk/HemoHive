export default function StaticDeveloperPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-hemohive-red/10 via-white to-hemohive-red/5 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-hemohive-red mb-8 text-center">
          Developer
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">About Me</h2>
          <p className="text-gray-700 mb-6">
            Passionate developer building the future of healthcare through technology.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-hemohive-red mb-2">Skills</h3>
              <ul className="space-y-1 text-gray-700">
                <li>React/Next.js</li>
                <li>TypeScript</li>
                <li>Three.js</li>
                <li>Node.js</li>
                <li>Python</li>
                <li>AI/ML</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-hemohive-red mb-2">Projects</h3>
              <ul className="space-y-1 text-gray-700">
                <li>HemoHive - Blood Management System</li>
                <li>3D Interactive Portfolio</li>
                <li>Fluid Simulation Engine</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <a href="#" className="text-hemohive-red hover:underline">GitHub</a>
            <span className="mx-4">•</span>
            <a href="#" className="text-hemohive-red hover:underline">LinkedIn</a>
            <span className="mx-4">•</span>
            <a href="#" className="text-hemohive-red hover:underline">Email</a>
          </div>
        </div>
      </div>
    </div>
  );
}


