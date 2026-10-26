import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useToast } from '../../context/ToastContext';
import { UserCheck, UserPlus, BookOpen } from 'lucide-react';

export const AuthorCard = ({
  author,
  articlesCount = 12,
  followersCount = 384,
  className = '',
}) => {
  const toast = useToast();
  const [isFollowing, setIsFollowing] = useState(false);

  if (!author) return null;

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    if (!isFollowing) {
      toast.success(`You are now following ${author.name}`);
    } else {
      toast.info(`Unfollowed ${author.name}`);
    }
  };

  return (
    <Card className={`space-y-4 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <Link to={`/profile/${author._id || author.id || 'me'}`} className="flex items-center gap-3 group">
          <Avatar
            src={author.avatar}
            name={author.name}
            size="lg"
            className="group-hover:ring-2 group-hover:ring-brand-500/30 transition-all"
          />
          <div>
            <h4 className="text-sm font-bold font-display text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {author.name}
            </h4>
            <p className="text-xs text-slate-400">
              {author.role === 'admin' ? 'Staff Editor' : 'Contributing Author'}
            </p>
          </div>
        </Link>

        <Button
          variant={isFollowing ? 'outline' : 'subtle'}
          size="sm"
          onClick={handleFollow}
          startIcon={isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
        {author.bio || 'Author exploring distributed systems, cloud computing, and AI application engineering.'}
      </p>

      <div className="flex items-center gap-4 pt-3 border-t border-slate-100 dark:border-surface-borderDark/60 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span><strong className="text-slate-800 dark:text-slate-200">{articlesCount}</strong> articles</span>
        </div>
        <div>
          <span><strong className="text-slate-800 dark:text-slate-200">{followersCount}</strong> followers</span>
        </div>
      </div>
    </Card>
  );
};
