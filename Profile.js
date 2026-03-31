import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import profile from '../profile.jpg';

function Profile() {
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
    }, 3000);

    e.target.reset();
  };

  return (
    <div className="profile-container">
      {/* Navigation Bar */}
      <nav className="profile-nav">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h2>My Profile</h2>
      </nav>

      {/* Profile Card */}
      <div className="profile-card">
        <img src={profile} alt="profile" className="profile-img" />
        <h2>Marisha Ragavi</h2>
        <p>Frontend Developer | React Enthusiast</p>
      </div>

      {/* Education Section */}
      <div className="education-section">
        <h3>Education</h3>
        <div className="education-cards">
          <div className="education-card">
            <div className="edu-icon">🎓</div>
            <h4>Post Graduate (PG)</h4>
            <p>Kamaraj College, Thoothukudi</p>
          </div>
          <div className="education-card">
            <div className="edu-icon">🎓</div>
            <h4>Under Graduate (UG)</h4>
            <p>Govindammal Aditanar College</p>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="skills-section">
        <h3>My Skills</h3>
        <div className="skill">
          <span>React</span>
          <div className="skill-bar">
            <div className="skill-progress react"></div>
          </div>
        </div>
        <div className="skill">
          <span>JavaScript</span>
          <div className="skill-bar">
            <div className="skill-progress js"></div>
          </div>
        </div>
        <div className="skill">
          <span>CSS</span>
          <div className="skill-bar">
            <div className="skill-progress css"></div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="projects-section">
        <h3>Projects</h3>
        <div className="projects">
          <div className="project-card">Habit Tracker App</div>
          <div className="project-card">Loan Approval Prediction System</div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="contact-section">
        <h3>Contact Me</h3>
        <form onSubmit={handleSubmit} className="contact-form">
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />
          <textarea placeholder="Your Message" required></textarea>
          <button type="submit">Send Message</button>
        </form>
        {success && (
          <p className="success-message">✅ Message sent successfully!</p>
        )}
      </div>
    </div>
  );
}

export default Profile;
