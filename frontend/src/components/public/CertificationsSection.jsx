import React, { useState } from 'react';
import { Card } from '../common/Card';
import { ScrollReveal } from '../common/ScrollReveal';
import { usePortfolio } from '../../context/PortfolioContext';
import { Award, Image, X } from 'lucide-react';

export const CertificationsSection = () => {
  const { data } = usePortfolio();
  const rawCertifications = data?.certifications || [];
  const certifications = rawCertifications
    .filter(cert => cert.isVisible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const [lightboxImg, setLightboxImg] = useState(null);

  const openCertImage = (cert) => {
    const imgSrc = cert.certificateImg;
    if (!imgSrc) return;

    // If it's a data URL (uploaded file), open in a new tab via blob
    if (imgSrc.startsWith('data:')) {
      fetch(imgSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob);
          const win = window.open(blobUrl, '_blank');
          if (!win) {
            // Fallback: show lightbox if popup was blocked
            setLightboxImg(imgSrc);
          }
        })
        .catch(() => setLightboxImg(imgSrc));
      return;
    }

    // For regular image URLs, open in new tab
    window.open(imgSrc, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="certifications" className="portfolio-section">
      <div className="container">
        <ScrollReveal variant="fade-up" duration={600}>
          <h2 className="section-title">CERTIFICATIONS</h2>
        </ScrollReveal>

        <div className="certs-grid">
          {certifications.map((cert, idx) => {
            const hasCertImage = !!(cert.certificateImg);

            return (
              <ScrollReveal key={cert.id} variant="zoom-in" delay={80 + idx * 110} duration={650}>
                <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Award size={20} color="var(--primary-color)" />
                      <div className="cert-org">{cert.organization || cert.issuer}</div>
                    </div>
                    <div className="cert-name">{cert.name || cert.title}</div>
                    <div className="cert-meta">
                      Issued: {cert.issueDate || 'Verified'}
                    </div>

                  </div>

                  {/* View Certificate button — only appears when image is uploaded in admin */}
                  {hasCertImage && (
                    <div style={{ marginTop: '1rem' }}>
                      <button
                        onClick={() => openCertImage(cert)}
                        className="btn btn-primary"
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', cursor: 'pointer' }}
                      >
                        <Image size={14} /> View Certificate
                      </button>
                    </div>
                  )}
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </div>

      {/* Lightbox fallback for popup blockers */}
      {lightboxImg && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setLightboxImg(null)}
        >
          <button
            onClick={() => setLightboxImg(null)}
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              color: '#fff',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.2rem'
            }}
          >
            <X size={22} />
          </button>
          <img
            src={lightboxImg}
            alt="Certificate"
            style={{ maxWidth: '95vw', maxHeight: '90vh', borderRadius: '12px', boxShadow: '0 25px 60px rgba(0,0,0,0.7)', objectFit: 'contain' }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
};
