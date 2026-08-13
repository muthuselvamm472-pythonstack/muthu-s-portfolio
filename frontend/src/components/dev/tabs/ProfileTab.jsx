import React, { useState, useEffect } from 'react';
import { Save, ShieldCheck, Lock, User, KeyRound } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export const ProfileTab = ({ data, updateProfile, showToast }) => {
  const { user, changeCredentials } = useAuth();

  const [form, setForm] = useState({
    fullName: data.profile?.fullName || '',
    title:    data.profile?.title    || '',
    email:    data.profile?.email    || '',
    phone:    data.profile?.phone    || '',
    location: data.profile?.location || '',
  });

  // Admin Account Credentials form state
  const [credForm, setCredForm] = useState({
    newUsername: user?.username || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isUpdatingCreds, setIsUpdatingCreds] = useState(false);

  useEffect(() => {
    if (user?.username) {
      setCredForm(prev => ({ ...prev, newUsername: user.username }));
    }
  }, [user?.username]);

  // Keep profile form in sync if parent data changes externally
  useEffect(() => {
    if (data.profile) {
      setForm(prev => ({
        ...prev,
        fullName: data.profile.fullName || prev.fullName,
        title:    data.profile.title    || prev.title,
        email:    data.profile.email    || prev.email,
        phone:    data.profile.phone    || prev.phone,
        location: data.profile.location || prev.location,
      }));
    }
  }, [data.profile?.fullName, data.profile?.title, data.profile?.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(form);
    showToast('✅ Profile updated! Changes are live on the website.', 'success');
  };

  const handleCredsSubmit = async (e) => {
    e.preventDefault();
    if (!credForm.currentPassword) {
      showToast('Please enter your current password to confirm.', 'danger');
      return;
    }
    if (credForm.newPassword && credForm.newPassword !== credForm.confirmPassword) {
      showToast('New passwords do not match!', 'danger');
      return;
    }

    setIsUpdatingCreds(true);
    const result = await changeCredentials(
      credForm.newUsername,
      credForm.currentPassword,
      credForm.newPassword
    );

    setIsUpdatingCreds(false);
    if (result.success) {
      showToast('🎉 Admin Username & Password updated successfully!', 'success');
      setCredForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } else {
      showToast(result.error || 'Failed to update credentials', 'danger');
    }
  };

  return (
    <div className="tab-pane">
      <div className="tab-header">
        <div>
          <h2>Profile Management & Security</h2>
          <p className="tab-subtitle">Update portfolio profile details and admin login credentials</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-section-box">
          <h3>Personal Contact Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="fullName" value={form.fullName} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Professional Title</label>
              <input type="text" name="title" value={form.title} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} />
            </div>

            <div className="form-group span-2">
              <label>Location</label>
              <input type="text" name="location" value={form.location} onChange={handleChange} />
            </div>
          </div>

          <div className="form-actions margin-top">
            <button type="submit" className="btn btn-primary flex-center gap-2">
              <Save size={18} /> Save Profile Changes
            </button>
          </div>
        </div>
      </form>

      {/* Admin Login Credentials & Password Update Box */}
      <form onSubmit={handleCredsSubmit} className="admin-form margin-top">
        <div className="admin-section-box">
          <div className="flex-center gap-2 margin-bottom">
            <ShieldCheck size={22} style={{ color: 'var(--admin-accent)' }} />
            <h3>Set Admin Name & Password</h3>
          </div>
          <p className="field-hint margin-bottom">
            Update your private admin dashboard username and password. You will use these credentials to log in.
          </p>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Admin Username</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  value={credForm.newUsername}
                  onChange={(e) => setCredForm({ ...credForm, newUsername: e.target.value })}
                  placeholder="New Admin Username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Current Password (Required to authorize change)</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  value={credForm.currentPassword}
                  onChange={(e) => setCredForm({ ...credForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>New Password (Optional, leave blank to keep current)</label>
              <div className="input-with-icon">
                <KeyRound size={18} className="input-icon" />
                <input
                  type="password"
                  value={credForm.newPassword}
                  onChange={(e) => setCredForm({ ...credForm, newPassword: e.target.value })}
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="input-with-icon">
                <KeyRound size={18} className="input-icon" />
                <input
                  type="password"
                  value={credForm.confirmPassword}
                  onChange={(e) => setCredForm({ ...credForm, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>

          <div className="form-actions margin-top">
            <button type="submit" className="btn btn-primary flex-center gap-2" disabled={isUpdatingCreds}>
              <ShieldCheck size={18} /> {isUpdatingCreds ? 'Updating Credentials...' : 'Update Admin Credentials'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
