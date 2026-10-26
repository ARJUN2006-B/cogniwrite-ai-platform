import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useBookmarks } from '../context/BookmarkContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import { articleService } from '../services/articleService';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Dialog } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { ArticleCard } from '../components/common/ArticleCard';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { formatDate } from '../utils/formatDate';
import {
  User,
  BookOpen,
  Bookmark,
  Calendar,
  Edit3,
  UserPlus,
  UserCheck,
  ShieldCheck,
  Users,
  PenTool,
  CheckCircle2
} from 'lucide-react';

export const UserProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { bookmarks } = useBookmarks();
  const toast = useToast();

  const currentUserId = currentUser?._id || currentUser?.id;
  const isSelf = !id || id === 'me' || id === currentUserId;

  const [author, setAuthor] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('articles'); // 'articles' | 'bookmarks'
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Edit Profile Dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [bioInput, setBioInput] = useState('');
  const [avatarInput, setAvatarInput] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      setLoading(true);
      try {
        if (isSelf) {
          if (currentUser) {
            setAuthor(currentUser);
            setNameInput(currentUser.name || '');
            setBioInput(currentUser.bio || '');
            setAvatarInput(currentUser.avatar || '');
            const res = await articleService.getArticles({ authorId: currentUserId });
            if (mounted) setArticles(res.articles || []);
          }
        } else {
          // Fetch public profile from real backend
          const profileData = await authService.getPublicProfile(id);
          if (mounted) {
            setAuthor(profileData);
            setIsFollowing(profileData.isFollowing || false);
          }
          const res = await articleService.getArticles({ authorId: id });
          if (mounted) setArticles(res.articles || []);
        }
      } catch (err) {
        console.error('Error loading profile', err);
        toast.error('Failed to load profile details');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      mounted = false;
    };
  }, [id, isSelf, currentUserId]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      toast.warning('Please sign in to follow authors');
      return;
    }
    if (!author?._id && !author?.id) return;
    const targetId = author._id || author.id;

    setFollowLoading(true);
    try {
      const res = await authService.toggleFollow(targetId);
      setIsFollowing(res.following);
      setAuthor((prev) => ({
        ...prev,
        followersCount: res.followersCount
      }));
      toast.success(res.message || (res.following ? `Following ${author.name}` : `Unfollowed ${author.name}`));
    } catch (err) {
      toast.error(err.message || 'Follow action failed');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setUpdatingProfile(true);
    try {
      const updated = await authService.updateProfile({
        name: nameInput.trim(),
        bio: bioInput.trim(),
        avatar: avatarInput.trim()
      });
      setAuthor(updated);
      setEditDialogOpen(false);
      toast.success('Profile details updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-8 animate-pulse">
        <div className="h-32 bg-slate-200 dark:bg-surface-darkMuted rounded-2xl" />
        <div className="h-8 w-48 bg-slate-200 dark:bg-surface-darkMuted rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LoadingSkeleton.ArticleCard />
          <LoadingSkeleton.ArticleCard />
        </div>
      </div>
    );
  }

  const authorName = author?.name || 'Author';
  const authorAvatar =
    author?.avatar ||
    `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(authorName)}`;

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Profile Header Card */}
      <Card className="space-y-6 shadow-subtle">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar
              src={authorAvatar}
              name={authorName}
              size="xl"
              className="ring-4 ring-brand-500/10"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
                  {authorName}
                </h1>
                <Badge variant={author?.role === 'admin' ? 'brand' : 'default'} size="sm">
                  {author?.role === 'admin' ? 'Staff Editor / Admin' : 'Author'}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Joined {formatDate(author?.createdAt || new Date())}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {isSelf ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditDialogOpen(true)}
                startIcon={<Edit3 className="w-3.5 h-3.5" />}
              >
                Edit Profile
              </Button>
            ) : (
              <Button
                variant={isFollowing ? 'outline' : 'primary'}
                size="sm"
                loading={followLoading}
                onClick={handleFollowToggle}
                startIcon={
                  isFollowing ? (
                    <UserCheck className="w-3.5 h-3.5 text-brand-600" />
                  ) : (
                    <UserPlus className="w-3.5 h-3.5" />
                  )
                }
              >
                {isFollowing ? 'Following' : 'Follow Author'}
              </Button>
            )}
          </div>
        </div>

        {/* Bio */}
        {author?.bio && (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans max-w-2xl">
            {author.bio}
          </p>
        )}

        {/* Metrics Row */}
        <div className="flex items-center gap-6 pt-4 border-t border-slate-100 dark:border-surface-borderDark/60 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <BookOpen className="w-4 h-4 text-brand-600" />
            <span className="font-bold">{articles.length}</span>
            <span className="text-slate-400">Essays</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <Users className="w-4 h-4 text-emerald-500" />
            <span className="font-bold">{author?.followersCount || author?.followers?.length || 0}</span>
            <span className="text-slate-400">Followers</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <Users className="w-4 h-4 text-accent-cyan" />
            <span className="font-bold">{author?.followingCount || author?.following?.length || 0}</span>
            <span className="text-slate-400">Following</span>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-surface-borderDark">
        <button
          onClick={() => setActiveTab('articles')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'articles'
              ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Authored Essays ({articles.length})
        </button>

        {isSelf && (
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`pb-3 text-xs font-bold transition-all relative ${
              activeTab === 'bookmarks'
                ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Saved Bookmarks ({bookmarks.length})
          </button>
        )}
      </div>

      {/* Articles Feed Tab */}
      {activeTab === 'articles' && (
        <div>
          {articles.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No essays published yet"
              description={`${authorName} has not published any technical articles on CogniWrite.`}
              action={
                isSelf ? (
                  <Link to="/write">
                    <Button variant="primary" size="sm" startIcon={<PenTool className="w-3.5 h-3.5" />}>
                      Compose Essay
                    </Button>
                  </Link>
                ) : null
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((art) => (
                <ArticleCard key={art._id || art.id} article={art} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bookmarks Tab */}
      {activeTab === 'bookmarks' && (
        <div>
          {bookmarks.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="No bookmarks yet"
              description="Save technical articles from the Explore feed to curate your reading list."
              action={
                <Link to="/explore">
                  <Button variant="outline" size="sm">
                    Explore Articles
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookmarks.map((bm) => (
                <ArticleCard key={bm._id || bm.id} article={bm} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-surface-borderDark">
            <h3 className="text-base font-bold font-display text-slate-900 dark:text-slate-100">
              Edit Author Profile
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Display Name *
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                required
                className="w-full text-xs rounded-xl p-2.5 bg-white dark:bg-surface-darkCard border border-slate-300 dark:border-surface-borderDark text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Bio / Engineering Focus
              </label>
              <textarea
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                rows={3}
                maxLength={300}
                placeholder="Systems architect, database specialist, distributed consensus enthusiast..."
                className="w-full text-xs rounded-xl p-2.5 bg-white dark:bg-surface-darkCard border border-slate-300 dark:border-surface-borderDark text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
              <span className="text-[10px] text-slate-400">{bioInput.length}/300 chars</span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Avatar Image URL (Optional)
              </label>
              <input
                type="url"
                value={avatarInput}
                onChange={(e) => setAvatarInput(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full text-xs rounded-xl p-2.5 bg-white dark:bg-surface-darkCard border border-slate-300 dark:border-surface-borderDark text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-surface-borderDark">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={updatingProfile}
            >
              Save Profile
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
