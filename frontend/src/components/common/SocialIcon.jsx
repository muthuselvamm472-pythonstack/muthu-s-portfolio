import React from 'react';
import {
  Github,
  Linkedin,
  Mail,
  Youtube,
  Twitter,
  Instagram,
  Globe,
  Code2,
  Terminal,
  ExternalLink,
  Share2
} from 'lucide-react';

export const SocialIcon = ({ platform = '', size = 18, className = '' }) => {
  const p = (platform || '').toLowerCase().trim();

  if (p.includes('github')) return <Github size={size} className={className} />;
  if (p.includes('linkedin')) return <Linkedin size={size} className={className} />;
  if (p.includes('email') || p.includes('mail')) return <Mail size={size} className={className} />;
  if (p.includes('youtube')) return <Youtube size={size} className={className} />;
  if (p.includes('twitter') || p.includes('x.com')) return <Twitter size={size} className={className} />;
  if (p.includes('instagram')) return <Instagram size={size} className={className} />;
  if (p.includes('leetcode')) return <Code2 size={size} className={className} />;
  if (p.includes('hackerrank')) return <Terminal size={size} className={className} />;
  if (p.includes('website') || p.includes('globe') || p.includes('portfolio')) return <Globe size={size} className={className} />;

  return <Share2 size={size} className={className} />;
};
