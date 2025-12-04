import React, { useState } from 'react';

// Individual Card Component
const FamilyCard = ({ icon, title, description, children, buttonText, onButtonClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`content-card ${isHovered ? 'hover' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="card-header">
        <h2>
          <i className={`fas ${icon}`}></i> {title}
        </h2>
      </div>
      <div className="card-content">
        <p>{description}</p>
        {children}
        {buttonText && (
          <button className="btn-modern" onClick={onButtonClick}>
            <i className="fas fa-plus"></i> {buttonText}
          </button>
        )}
      </div>
    </div>
  );
};

// Main Family Dashboard Component
const FamilyDashboard = () => {
  const [activeSection, setActiveSection] = useState('all');
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [familyUpdates, setFamilyUpdates] = useState([
    { id: 1, text: "Add your family updates here", icon: "fa-chevron-right" },
    { id: 2, text: "Share important dates and events", icon: "fa-chevron-right" },
    { id: 3, text: "Keep everyone in the loop", icon: "fa-chevron-right" }
  ]);

  const handlePhotoUpload = () => {
    // In a real app, this would open a file picker
    alert('Photo upload feature coming soon! This will allow family members to share memories.');
  };

  const handleAddUpdate = () => {
    const update = prompt('Enter your family update:');
    if (update) {
      setFamilyUpdates([
        { id: Date.now(), text: update, icon: "fa-star", date: new Date().toLocaleDateString() },
        ...familyUpdates
      ]);
    }
  };

  const sections = [
    {
      id: 'photos',
      icon: 'fa-images',
      title: 'Family Photos',
      description: 'Our latest family photos and memories.',
      content: (
        <div className="photo-grid">
          {uploadedPhotos.length > 0 ? (
            uploadedPhotos.map((photo, index) => (
              <div key={index} className="uploaded-photo">
                <img src={photo} alt={`Family photo ${index + 1}`} />
              </div>
            ))
          ) : (
            <>
              {[1, 2, 3, 4].map(num => (
                <div key={num} className="photo-placeholder">
                  <i className="fas fa-image"></i>
                  <span>Photo {num}</span>
                </div>
              ))}
            </>
          )}
        </div>
      ),
      buttonText: 'Upload Photos',
      onButtonClick: handlePhotoUpload
    },
    {
      id: 'updates',
      icon: 'fa-newspaper',
      title: 'Family Updates',
      description: 'Latest news and updates from the family.',
      content: (
        <div className="updates-list">
          {familyUpdates.map(update => (
            <div key={update.id} className="update-item">
              <i className={`fas ${update.icon}`}></i>
              <span>{update.text}</span>
              {update.date && <small style={{ marginLeft: 'auto', color: '#6c757d' }}>{update.date}</small>}
            </div>
          ))}
        </div>
      ),
      buttonText: 'Post Update',
      onButtonClick: handleAddUpdate
    },
    {
      id: 'documents',
      icon: 'fa-file-alt',
      title: 'Private Documents',
      description: 'Important family documents and information.',
      content: (
        <div className="document-list">
          <div className="document-item">
            <i className="fas fa-address-book"></i>
            <span>Family contact information</span>
          </div>
          <div className="document-item">
            <i className="fas fa-phone-alt"></i>
            <span>Emergency contacts</span>
          </div>
          <div className="document-item">
            <i className="fas fa-calendar"></i>
            <span>Important dates to remember</span>
          </div>
        </div>
      ),
      buttonText: 'View Documents',
      onButtonClick: () => alert('Document management coming soon!')
    },
    {
      id: 'calendar',
      icon: 'fa-calendar-alt',
      title: 'Family Calendar',
      description: 'Upcoming family events and birthdays.',
      content: (
        <div className="calendar-preview">
          <div className="event-item">
            <i className="fas fa-birthday-cake"></i>
            <span>Birthday reminders</span>
          </div>
          <div className="event-item">
            <i className="fas fa-users"></i>
            <span>Family gatherings</span>
          </div>
          <div className="event-item">
            <i className="fas fa-star"></i>
            <span>Special occasions</span>
          </div>
        </div>
      ),
      buttonText: 'Add Event',
      onButtonClick: () => alert('Calendar feature coming soon!')
    },
    {
      id: 'chat',
      icon: 'fa-comments',
      title: 'Family Chat',
      description: 'Stay connected with family members.',
      content: (
        <div className="chat-preview">
          <div className="chat-message">
            <i className="fas fa-comment-dots"></i>
            <span>Private family messaging coming soon!</span>
          </div>
        </div>
      ),
      buttonText: 'Open Chat',
      onButtonClick: () => alert('Chat feature coming soon!')
    },
    {
      id: 'tree',
      icon: 'fa-tree',
      title: 'Family Tree',
      description: 'Explore our family genealogy.',
      content: (
        <div className="tree-preview">
          <i className="fas fa-sitemap fa-3x"></i>
        </div>
      ),
      buttonText: 'View Family Tree',
      onButtonClick: () => alert('Family tree feature coming soon!')
    }
  ];

  // Filter sections based on active selection
  const displayedSections = activeSection === 'all' 
    ? sections 
    : sections.filter(s => s.id === activeSection);

  return (
    <div className="family-dashboard">
      {/* Filter Tabs */}
      <div className="filter-tabs" style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        padding: '1rem',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        overflowX: 'auto'
      }}>
        <button 
          className={`tab-btn ${activeSection === 'all' ? 'active' : ''}`}
          onClick={() => setActiveSection('all')}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '8px',
            background: activeSection === 'all' ? '#617140' : '#f8f9fa',
            color: activeSection === 'all' ? 'white' : '#495057',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          All Sections
        </button>
        {sections.map(section => (
          <button 
            key={section.id}
            className={`tab-btn ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '8px',
              background: activeSection === section.id ? '#617140' : '#f8f9fa',
              color: activeSection === section.id ? 'white' : '#495057',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <i className={`fas ${section.icon}`} style={{ marginRight: '0.5rem' }}></i>
            {section.title}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="family-content-grid">
        {displayedSections.map(section => (
          <FamilyCard
            key={section.id}
            icon={section.icon}
            title={section.title}
            description={section.description}
            buttonText={section.buttonText}
            onButtonClick={section.onButtonClick}
          >
            {section.content}
          </FamilyCard>
        ))}
      </div>

      {/* Info Section */}
      <section className="info-section">
        <h2><i className="fas fa-rocket"></i> More Features Coming Soon</h2>
        <p>
          We're working on adding more features to make this space even better for our family.
          If you have ideas or suggestions, please let me know!
        </p>
      </section>
    </div>
  );
};

export default FamilyDashboard;