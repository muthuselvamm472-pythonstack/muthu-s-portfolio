import React, { useState, useEffect } from 'react';
import { Save, ShieldCheck, Lock, User, KeyRound, FileText, Upload, ExternalLink, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { getApiUrl, resolveResumeUrl } from '../../../apiConfig';

export const ProfileTab = ({ data, updateProfile, showToast }) => {
  const { user, changeCredentials } = useAuth();

  const [form, setForm] = useState({
    fullName: data.profile?.fullName || '',
    title:    data.profile?.title    || '',
    email:    data.profile?.email    || '',
    phone:    data.profile?.phone    || '',
    location: data.profile?.location || '',
    resumeUrl: data.profile?.resumeUrl || '/Muthu_Selvam_Resume.pdf',
  });

  const [pendingResumeFile, setPendingResumeFile] = useState(null);
  const [pendingResumeBase64, setPendingResumeBase64] = useState(null);

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
        resumeUrl: data.profile.resumeUrl || prev.resumeUrl,
      }));
    }
  }, [data.profile?.fullName, data.profile?.title, data.profile?.email, data.profile?.resumeUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleResumeFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      showToast('Please upload a valid PDF document file (.pdf)', 'warning');
      return;
    }

    setPendingResumeFile(file);
    setForm(prev => ({ ...prev, resumeUrl: `/api/resume/` }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setPendingResumeBase64(reader.result);
      showToast(`📄 Selected "${file.name}"! Click "Save Profile & Resume Changes" below to activate.`, 'info');
    };
    reader.readAsDataURL(file);
  };

  const handlePreviewResume = (e) => {
    e.preventDefault();
    if (pendingResumeFile) {
      const blobUrl = URL.createObjectURL(pendingResumeFile);
      window.open(blobUrl, '_blank');
      return;
    }
    const targetUrl = resolveResumeUrl(form.resumeUrl || '/api/resume/');
    window.open(targetUrl, '_blank');
  };

  const handleClearResume = () => {
    setPendingResumeFile(null);
    setPendingResumeBase64(null);
    setForm(prev => ({ ...prev, resumeUrl: '/Muthu_Selvam_Resume.pdf' }));
    showToast('Reset to default resume. Click "Save Profile & Resume Changes" to activate.', 'info');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      resumeUrl: pendingResumeBase64 || form.resumeUrl,
      resumeFilename: pendingResumeFile?.name || 'Muthu_Selvam_Resume.pdf',
    };
    updateProfile(payload);
    setPendingResumeBase64(null);
    setPendingResumeFile(null);
    showToast('✅ Profile & Resume settings updated! Changes are live on the website.', 'success');
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

            <div className="form-group span-2">
              <label className="flex-center gap-2">
                <FileText size={16} style={{ color: 'var(--admin-accent)' }} /> Resume File & Document Link
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  type="text"
                  name="resumeUrl"
                  value={form.resumeUrl}
                  onChange={handleChange}
                  placeholder="/api/resume/ or https://drive.google.com/..."
                  style={{ flex: '1 1 240px' }}
                />
                <label className="btn btn-secondary flex-center gap-2" style={{ cursor: 'pointer', margin: 0, padding: '0.6rem 1rem' }}>
                  <Upload size={16} /> Upload New PDF
                  <input type="file" accept=".pdf,application/pdf" onChange={handleResumeFileUpload} style={{ display: 'none' }} />
                </label>
                {form.resumeUrl && (
                  <>
                    <button
                      type="button"
                      onClick={handlePreviewResume}
                      className="btn btn-outline flex-center gap-1"
                      style={{ padding: '0.6rem 1rem', cursor: 'pointer' }}
                    >
                      <ExternalLink size={15} /> Preview
                    </button>
                    <button
                      type="button"
                      onClick={handleClearResume}
                      className="btn btn-outline flex-center gap-1"
                      style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)', padding: '0.6rem 1rem' }}
                      title="Clear resume link"
                    >
                      <Trash2 size={15} /> Clear
                    </button>
                  </>
                )}
              </div>
              {pendingResumeFile && (
                <div style={{ marginTop: '0.4rem', color: '#10b981', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle2 size={14} /> Selected local PDF: <strong>{pendingResumeFile.name}</strong> ({Math.round(pendingResumeFile.size / 1024)} KB) — Click "Save Profile & Resume Changes" below to activate.
                </div>
              )}
              <p className="field-hint" style={{ marginTop: '0.4rem', fontSize: '0.85rem' }}>
                Upload a new PDF file from your computer or enter a URL. Visitors can view/download this file when clicking "Download Resume".
              </p>
            </div>
          </div>

          <div className="form-actions margin-top">
            <button type="submit" className="btn btn-primary flex-center gap-2">
              <Save size={18} /> Save Profile & Resume Changes
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
