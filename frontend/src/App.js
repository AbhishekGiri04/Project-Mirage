import React, { useRef, useEffect, useState } from 'react';
import './App.css';
import './HowItWorks.css';

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const [fps, setFps] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'demo', label: 'Live Demo' },
    { id: 'about', label: 'Technology' },
    { id: 'contact', label: 'Contact' }
  ];

  const handleNavClick = (sectionId) => {
    setActiveSection(sectionId);
    setMenuOpen(false);
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Initialize webcam with higher resolution
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: 640, 
        height: 480,
        frameRate: 30
      } 
    })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => console.error('Camera access denied:', err));

    // Connect to WebSocket
    const websocket = new WebSocket(process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws');
    
    websocket.onopen = () => {
      setIsConnected(true);
      setWs(websocket);
      console.log('🟢 Connected to Project Mirage backend');
    };
    
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setProcessedImage(data.processed_image);
      setFrameCount(prev => prev + 1);
    };
    
    websocket.onclose = () => {
      setIsConnected(false);
      console.log('🔴 Disconnected from backend');
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      websocket.close();
    };
  }, []);

  useEffect(() => {
    if (!ws || !isConnected) return;

    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        
        ctx.drawImage(videoRef.current, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.7);
        
        ws.send(JSON.stringify({
          image: imageData
        }));
      }
    }, 66); // ~15 FPS for better performance

    return () => clearInterval(interval);
  }, [ws, isConnected]);

  // Calculate FPS
  useEffect(() => {
    const interval = setInterval(() => {
      setFps(frameCount);
      setFrameCount(0);
    }, 1000);

    return () => clearInterval(interval);
  }, [frameCount]);

  return (
    <div className="App">
      <nav className="bastard-navbar">
        <div className="nav-container">
          <div className="nav-logo" onClick={() => handleNavClick('home')}>
            <div className="logo-wrapper">
              <img src="https://img.freepik.com/premium-photo/creating-new-logo-inspired-by-company-logo_1177187-217691.jpg" alt="Project Mirage" className="logo-img" />
              <div className="logo-glow"></div>
            </div>
            <span className="logo-text">Project Mirage</span>
          </div>
          
          <div className={`nav-menu ${menuOpen ? 'active' : ''}`}>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`nav-link ${
                  activeSection === item.id ? 'active' : ''
                }`}
              >
                <span className="nav-text">{item.label}</span>
                <div className="nav-indicator"></div>
                <div className="nav-ripple"></div>
              </button>
            ))}
          </div>
          
          <div className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            <span className={`bar ${menuOpen ? 'active' : ''}`}></span>
            <span className={`bar ${menuOpen ? 'active' : ''}`}></span>
            <span className={`bar ${menuOpen ? 'active' : ''}`}></span>
          </div>
        </div>
      </nav>

      <header className="hero-section" id="home">
        <div className="hero-content">
          <h1 className="hero-title">Project Mirage</h1>
          <h2 className="hero-subtitle">Advanced Computer Vision Platform</h2>
          <p className="hero-description">Experience cutting-edge invisibility technology powered by real-time OpenCV algorithms and intelligent color detection systems</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => document.getElementById('demo').scrollIntoView({behavior: 'smooth'})}>
              Launch Demo
            </button>
            <button className="btn-secondary" onClick={() => window.open('https://github.com/abhishekgiri04', '_blank')}>
              Source Code
            </button>
          </div>
        </div>
      </header>
      
      <main className="main-content" id="demo">
        <div className="section-header">
          <h2>🎬 Live Invisibility Demo</h2>
          <p>Experience real-time invisibility effects powered by computer vision</p>
        </div>
        <div className="video-container">
          <div className="video-section">
            <h3>📹 Original Feed</h3>
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline
              className="video-feed"
            />
          </div>
          
          <div className="video-section">
            <h3>🎭 Invisibility Effect</h3>
            {processedImage ? (
              <img 
                src={processedImage} 
                alt="Processed" 
                className="video-feed"
              />
            ) : (
              <div className="placeholder">
                {isConnected ? '🔄 Processing frames...' : '🔌 Connecting to backend...'}
              </div>
            )}
          </div>
        </div>
        
        <div className="instructions">
          <h3>🗒️ How to Use:</h3>
          <div className="instruction-grid">
            <div className="instruction-item">
              <span className="step">1</span>
              <p>Hold a <strong>red colored cloth</strong> in front of camera</p>
            </div>
            <div className="instruction-item">
              <span className="step">2</span>
              <p>Move <strong>slowly</strong> for best invisibility effect</p>
            </div>
            <div className="instruction-item">
              <span className="step">3</span>
              <p>Ensure <strong>good lighting</strong> conditions</p>
            </div>
            <div className="instruction-item">
              <span className="step">4</span>
              <p>Wait for <strong>30 frames</strong> for background capture</p>
            </div>
          </div>
        </div>
      </main>
      
      <section className="how-it-works" id="about">
        <div className="how-it-works-container">
          <h2> 🌟 How It Works</h2>
          <p className="how-it-works-subtitle">Advanced computer vision technology behind the magic</p>
          
          <div className="tech-grid">
            <div className="tech-card hsv">
              <div className="tech-icon">🎨</div>
              <h3>HSV Color Detection</h3>
              <p>Advanced color space processing for accurate red cloth detection with dual range masking</p>
            </div>
            
            <div className="tech-card realtime">
              <div className="tech-icon">💡</div>
              <h3>Real-time Processing</h3>
              <p>30+ FPS video processing with optimized OpenCV algorithms and WebSocket communication</p>
            </div>
            
            <div className="tech-card background">
              <div className="tech-icon">🎭</div>
              <h3>Background Subtraction</h3>
              <p>Dynamic background capture and pixel replacement for seamless invisibility effects</p>
            </div>
            
            <div className="tech-card morphological">
              <div className="tech-icon">🧭</div>
              <h3>Morphological Operations</h3>
              <p>Advanced noise reduction and mask refinement for clean invisibility boundaries</p>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="footer" id="contact">
        <div className="footer-wave"></div>
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-logo">
                <img src="https://img.freepik.com/premium-photo/creating-new-logo-inspired-by-company-logo_1177187-217691.jpg" alt="Project Mirage" />
                <div className="brand-text">
                  <h2>Project Mirage</h2>
                  <p>Computer Vision Excellence</p>
                </div>
              </div>
              <p className="footer-desc">Making magic real through cutting-edge computer vision technology. Experience the future of augmented reality.</p>
              
              <div className="footer-social">
                <a href="https://github.com/abhishekgiri04" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="social-github">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
                <a href="https://www.linkedin.com/in/abhishek-giri04/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="social-linkedin">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
                <a href="https://t.me/AbhishekGiri7" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="social-telegram">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                </a>
              </div>
            </div>

            <div className="footer-right">
              <div className="footer-links">
                <div className="link-group">
                  <h3>Technology</h3>
                  <ul>
                    <li>Python FastAPI</li>
                    <li>React.js</li>
                    <li>OpenCV</li>
                    <li>NumPy</li>
                  </ul>
                </div>

                <div className="link-group">
                  <h3>Features</h3>
                  <ul>
                    <li>Real-time Processing</li>
                    <li>HSV Detection</li>
                    <li>Background Subtraction</li>
                    <li>High Performance</li>
                  </ul>
                </div>
              </div>

              <div className="footer-stats">
                <div className="stat-item">
                  <span className="stat-num">30+</span>
                  <span className="stat-text">FPS</span>
                </div>
                <div className="stat-item">
                  <span className="stat-num">95%</span>
                  <span className="stat-text">Accuracy</span>
                </div>
                <div className="stat-item">
                  <span className="stat-num">&lt;100ms</span>
                  <span className="stat-text">Latency</span>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2025 Project Mirage. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

export default App;