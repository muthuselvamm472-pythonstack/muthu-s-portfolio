import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const SectionSettingsTab = ({ data, toggleSection, showToast }) => {
  const sv = data.sectionVisibility || {};
  const isOn = (key) => sv[key] !== false;

  const sectionList = [
    { key: 'hero',           name: 'Hero / Introduction',     desc: 'Main landing view with name, title, and tagline' },
    { key: 'about',          name: 'About Me',                desc: 'Background summary, degree, core technologies' },
    { key: 'skills',         name: 'Skills',                  desc: 'Technical skills categories and icons grid' },
    { key: 'experience',     name: 'Experience',              desc: 'Work history, internships, and company details' },
    { key: 'certifications', name: 'Certifications',          desc: 'Certificates, verified credentials, and attachments' },
    { key: 'projects',       name: 'Projects / Work Showcase',desc: 'Project cards, live demo links, and GitHub links' },
    { key: 'contact',        name: 'Contact',                 desc: 'Contact form and direct email/phone details' },
    { key: 'footer',         name: 'Footer',                  desc: 'Bottom copyright bar and social links' },
  ];

  const handleToggle = async (key, name) => {
    const currentlyVisible = isOn(key);
    const res = await toggleSection(key);
    if (res && res.ok) {
      showToast(`${name} turned ${currentlyVisible ? 'OFF' : 'ON'} & synced to Cloud`, 'info');
    } else {
      showToast(`${name} turned ${currentlyVisible ? 'OFF' : 'ON'} locally`, 'warning');
    }
  };

  return (
    <div className="tab-pane">
      <div className="tab-header">
        <div>
          <h2>Section Visibility Settings</h2>
          <p className="tab-subtitle">Control which sections appear on the public website and navbar</p>
        </div>
      </div>

      <div className="admin-section-box">
        <p className="field-hint margin-bottom">
          Toggling a section OFF hides it from the public portfolio immediately. Stored data is never deleted.
        </p>

        <div className="sections-toggle-list">
          {sectionList.map((item) => {
            const visible = isOn(item.key);
            return (
              <div key={item.key} className="section-toggle-item">
                <div className="section-toggle-info">
                  <h4>{item.name}</h4>
                  <p>{item.desc}</p>
                </div>

                <div className="toggle-switch-wrapper">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={visible}
                      onChange={() => handleToggle(item.key, item.name)}
                    />
                    <span className="toggle-slider" />
                  </label>
                  <span className={`badge ${visible ? 'badge-success' : 'badge-disabled'}`}>
                    {visible ? <Eye size={12} /> : <EyeOff size={12} />}
                    {visible ? 'DISPLAYED' : 'HIDDEN'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
