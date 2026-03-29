// frontend/src/pages/Admin/Overview.jsx
import React, { useEffect, useState } from 'react';
import { Users, Play, CheckCircle2, Activity, Sparkles, Clock3, Shield } from 'lucide-react';
import { API_URL, getAuthToken } from '../../utils/apiClient';
import { toast } from '../../utils/toast';
import '../../styles/AdminOverview.css';

const Overview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');
    return `${mins}:${secs}`;
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Session expired');

      const res = await fetch(`${API_URL}/admin/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load overview');
      }

      setStats(data.data);
    } catch (err) {
      console.error('[Overview] load error:', err.message);
      toast.error(err.message || 'Failed to load overview');
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      label: 'Users',
      value: stats?.totalUsers ?? '—',
      delta: stats ? `${Math.round(((stats.activeUsers || 0) / Math.max(stats.totalUsers || 1, 1)) * 100)}% active` : '—',
      icon: Users,
      tone: 'teal',
    },
    {
      label: 'Active Users',
      value: stats?.activeUsers ?? '—',
      delta: stats?.verifiedUsers ? `${stats.verifiedUsers} verified` : '—',
      icon: Activity,
      tone: 'green',
    },
    {
      label: 'Videos',
      value: stats?.totalVideos ?? '—',
      delta: stats?.publishedVideos ? `${stats.publishedVideos} published` : '—',
      icon: Play,
      tone: 'amber',
    },
    {
      label: 'Verification',
      value: stats?.verifiedUsers ?? '—',
      delta: stats?.totalUsers ? `${Math.round(((stats.verifiedUsers || 0) / Math.max(stats.totalUsers || 1, 1)) * 100)}% verified` : '—',
      icon: Shield,
      tone: 'blue',
    },
  ];

  return (
    <div className="overview-shell">
      <div className="overview-hero">
        <div>
          <p className="eyebrow">Operations Pulse</p>
          <h1>Overview</h1>
          <p className="muted">Quick signal on people and videos; refreshed live.</p>
        </div>
        <div className="spark">
          <Sparkles size={18} />
          <span>Live</span>
        </div>
      </div>

      {loading ? (
        <div className="panel loading-panel">
          <div className="spinner" />
          <p className="muted">Fetching overview...</p>
        </div>
      ) : (
        <>
          <div className="metric-grid">
            {cards.map((card) => (
              <article key={card.label} className={`metric-card tone-${card.tone}`}>
                <div className="metric-icon">
                  <card.icon size={18} />
                </div>
                <div className="metric-body">
                  <p className="metric-label">{card.label}</p>
                  <div className="metric-value">{card.value}</div>
                  <p className="metric-delta">{card.delta}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="panels">
            <section className="panel">
              <header className="panel-header">
                <div className="panel-title">
                  <CheckCircle2 size={16} />
                  <span>Latest Videos</span>
                </div>
                <div className="panel-meta">Last 5 uploaded</div>
              </header>
              {stats?.latestVideos?.length ? (
                <div className="video-list">
                  {stats.latestVideos.map((video) => (
                    <div key={video._id || video.id} className="video-chip">
                      <div
                        className="thumb"
                        style={{
                          backgroundImage: video.thumbnail
                            ? `url(${video.thumbnail})`
                            : 'linear-gradient(135deg, rgba(158,252,255,0.15), rgba(255,154,211,0.15))',
                        }}
                      />
                      <div className="chip-body">
                        <div className="chip-title">{video.title}</div>
                        <div className="chip-meta">
                          <span className="muted">{video.createdAt ? new Date(video.createdAt).toLocaleDateString() : '—'}</span>
                          <span className="muted">• {formatDuration(video.duration)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted">No videos yet.</p>
              )}
            </section>

            <section className="panel compact">
              <header className="panel-header">
                <div className="panel-title">
                  <Clock3 size={16} />
                  <span>Engagement</span>
                </div>
                <div className="panel-meta">Realtime ratios</div>
              </header>
              <div className="mini-metrics">
                <div>
                  <p className="muted">Active / Total</p>
                  <div className="mini-value">
                    {stats?.totalUsers ? (
                      `${stats.activeUsers}/${stats.totalUsers}`
                    ) : (
                      '—'
                    )}
                  </div>
                </div>
                <div>
                  <p className="muted">Verified Rate</p>
                  <div className="mini-value">
                    {stats?.totalUsers ? (
                      `${Math.round(((stats.verifiedUsers || 0) / Math.max(stats.totalUsers || 1, 1)) * 100)}%`
                    ) : (
                      '—'
                    )}
                  </div>
                </div>
                <div>
                  <p className="muted">Published Share</p>
                  <div className="mini-value">
                    {stats?.totalVideos ? (
                      `${Math.round(((stats.publishedVideos || 0) / Math.max(stats.totalVideos || 1, 1)) * 100)}%`
                    ) : (
                      '—'
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default Overview;
