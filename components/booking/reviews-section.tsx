"use client";

import { motion } from "framer-motion";
import { Star, MessageSquare, Quote, ThumbsUp, Calendar, BadgeCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  patientName: string;
  date: string;
  rating: number;
  visitType: string;
  title: string;
  content: string;
  helpful: number;
  verified: boolean;
}

interface RatingBreakdown {
  stars: number;
  count: number;
  percentage: number;
}

interface ReviewsData {
  reviews: Review[];
  averageRating: number;
  totalCount: number;
  breakdown: RatingBreakdown[];
}

interface ReviewsSectionProps {
  doctorId: string;
  doctorName: string;
}

function computeBreakdown(reviews: Review[]): RatingBreakdown[] {
  const total = reviews.length;
  return [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    return {
      stars,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });
}

function EmptyReviews({ doctorName }: { doctorName: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/2 backdrop-blur-xl">
      <div className="border-b border-white/10 px-6 py-4">
        <h3 className="text-lg font-semibold text-foreground">Patient Reviews</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Verified reviews for {doctorName}
        </p>
      </div>
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <h4 className="mb-2 font-medium text-foreground">No reviews yet</h4>
        <p className="max-w-xs text-sm text-muted-foreground">
          Verified patient reviews will appear here after completed appointments.
        </p>
      </div>
    </div>
  );
}

export function ReviewsSection({ doctorId, doctorName }: ReviewsSectionProps) {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [helpfulReviews, setHelpfulReviews] = useState<string[]>([]);

  useEffect(() => {
    Promise.resolve().then(() => {
      setIsLoading(true);
      fetch(`/api/reviews?doctorId=${doctorId}`)
        .then((res) => {
          if (!res.ok) return null;
          return res.json() as Promise<Review[]>;
        })
        .then((reviews) => {
          if (!reviews || reviews.length === 0) {
            setData(null);
            return;
          }
          const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
          setData({
            reviews,
            averageRating: Math.round(avg * 10) / 10,
            totalCount: reviews.length,
            breakdown: computeBreakdown(reviews),
          });
        })
        .catch(() => setData(null))
        .finally(() => setIsLoading(false));
    });
  }, [doctorId]);

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/2 backdrop-blur-xl">
        <div className="border-b border-white/10 px-6 py-4">
          <h3 className="text-lg font-semibold text-foreground">Patient Reviews</h3>
        </div>
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!data || data.reviews.length === 0) {
    return <EmptyReviews doctorName={doctorName} />;
  }

  const displayedReviews = showAll ? data.reviews : data.reviews.slice(0, 3);

  const markHelpful = (reviewId: string) => {
    if (!helpfulReviews.includes(reviewId)) {
      setHelpfulReviews((prev) => [...prev, reviewId]);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/2 backdrop-blur-xl">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Patient Reviews</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Verified reviews for {doctorName}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 px-4 py-2">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            <span className="text-xl font-bold text-amber-400">{data.averageRating}</span>
          </div>
        </div>
      </div>

      {/* Rating breakdown */}
      <div className="border-b border-white/10 p-6">
        <div className="space-y-2">
          {data.breakdown.map((item) => (
            <div key={item.stars} className="flex items-center gap-3">
              <div className="flex w-12 items-center gap-1">
                <span className="text-sm font-medium text-muted-foreground">{item.stars}</span>
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              </div>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 0.8, delay: 0.1 * (6 - item.stars) }}
                  className="h-full rounded-full bg-linear-to-r from-amber-500 to-amber-400"
                />
              </div>
              <span className="w-12 text-right text-xs text-muted-foreground">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      <div className="divide-y divide-white/5">
        {displayedReviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="p-6"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-primary/20 to-cyan-500/20 text-sm font-semibold text-primary">
                  {review.patientName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{review.patientName}</span>
                    {review.verified && (
                      <BadgeCheck className="h-4 w-4 text-emerald-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{review.date}</span>
                    <span className="text-white/20">|</span>
                    <span>{review.visitType}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < review.rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-white/10 text-white/10"
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="relative mb-4 rounded-xl border border-white/5 bg-white/2 p-4">
              <Quote className="absolute -left-2 -top-2 h-6 w-6 rotate-180 text-primary/20" />
              <h4 className="mb-2 font-medium text-foreground">{review.title}</h4>
              <p className="leading-relaxed text-muted-foreground">{review.content}</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => markHelpful(review.id)}
              disabled={helpfulReviews.includes(review.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-all",
                helpfulReviews.includes(review.id)
                  ? "bg-primary/10 text-primary"
                  : "border border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
              )}
            >
              <ThumbsUp
                className={cn(
                  "h-4 w-4",
                  helpfulReviews.includes(review.id) && "fill-current"
                )}
              />
              <span>
                Helpful (
                {helpfulReviews.includes(review.id)
                  ? review.helpful + 1
                  : review.helpful}
                )
              </span>
            </motion.button>
          </motion.div>
        ))}
      </div>

      {!showAll && data.reviews.length > 3 && (
        <div className="border-t border-white/10 p-4">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setShowAll(true)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-foreground transition-all hover:border-white/20 hover:bg-white/10"
          >
            Show All {data.totalCount} Reviews
          </motion.button>
        </div>
      )}
    </div>
  );
}
